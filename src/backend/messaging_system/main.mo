// src/backend/messaging_system/main.mo
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Order "mo:base/Order";
import Hash "mo:base/Hash";
import Nat32 "mo:base/Nat32";

actor MessagingSystem {
    public type Message = {
        id: Nat;
        sender_id: Principal;
        receiver_id: Principal;
        content: Text;
        read: Bool;
        thread_id: Nat;
        timestamp: Int;
    };

    public type Thread = {
        id: Nat;
        user1_id: Principal;
        user2_id: Principal;
        last_message_time: Int;
    };

    public type MessageResult = Result.Result<Message, Text>;
    public type ThreadResult = Result.Result<Thread, Text>;
    public type MessagesResult = Result.Result<[Message], Text>;

    private var next_message_id: Nat = 1;
    private var next_thread_id: Nat = 1;

    // Simple hash function for Nat
    private func natHash(n : Nat) : Hash.Hash {
        Nat32.fromNat(n)
    };

    private var messages = HashMap.HashMap<Nat, Message>(0, Nat.equal, natHash);
    private var threads = HashMap.HashMap<Nat, Thread>(0, Nat.equal, natHash);

    // Thread management
    private func findThread(user1_id: Principal, user2_id: Principal) : ?Thread {
        for (thread in threads.vals()) {
            if ((thread.user1_id == user1_id and thread.user2_id == user2_id) or 
                (thread.user1_id == user2_id and thread.user2_id == user1_id)) {
                return ?thread;
            }
        };
        null
    };

    public shared(msg) func createThread(other_user_id: Principal) : async ThreadResult {
        let caller = msg.caller;
        
        if (Principal.equal(caller, other_user_id)) {
            return #err("Cannot create thread with yourself");
        };

        switch (findThread(caller, other_user_id)) {
            case (?thread) { #ok(thread) };
            case (null) {
                let thread : Thread = {
                    id = next_thread_id;
                    user1_id = caller;
                    user2_id = other_user_id;
                    last_message_time = Time.now();
                };

                threads.put(next_thread_id, thread);
                next_thread_id += 1;
                
                #ok(thread)
            };
        }
    };

    // Message management
    public shared(msg) func sendMessage(receiver_id: Principal, content: Text) : async MessageResult {
        let caller = msg.caller;
        
        if (Principal.equal(caller, receiver_id)) {
            return #err("Cannot send message to yourself");
        };

        var thread_id : Nat = 0;
        
        switch (findThread(caller, receiver_id)) {
            case (?thread) {
                thread_id := thread.id;
                
                // Update last message time
                let updated_thread : Thread = {
                    id = thread.id;
                    user1_id = thread.user1_id;
                    user2_id = thread.user2_id;
                    last_message_time = Time.now();
                };
                threads.put(thread.id, updated_thread);
            };
            case (null) {
                // Create new thread
                let thread : Thread = {
                    id = next_thread_id;
                    user1_id = caller;
                    user2_id = receiver_id;
                    last_message_time = Time.now();
                };

                threads.put(next_thread_id, thread);
                thread_id := next_thread_id;
                next_thread_id += 1;
            };
        };

        let message : Message = {
            id = next_message_id;
            sender_id = caller;
            receiver_id = receiver_id;
            content = content;
            read = false;
            thread_id = thread_id;
            timestamp = Time.now();
        };

        messages.put(next_message_id, message);
        next_message_id += 1;
        
        #ok(message)
    };

    public query func getMessage(message_id: Nat) : async MessageResult {
        switch (messages.get(message_id)) {
            case (null) { #err("Message not found") };
            case (?message) { #ok(message) };
        }
    };

    public shared(msg) func markMessageAsRead(message_id: Nat) : async MessageResult {
        let caller = msg.caller;
        
        switch (messages.get(message_id)) {
            case (null) { #err("Message not found") };
            case (?message) {
                if (message.receiver_id != caller) {
                    return #err("Not authorized");
                };

                let updated_message : Message = {
                    id = message.id;
                    sender_id = message.sender_id;
                    receiver_id = message.receiver_id;
                    content = message.content;
                    read = true;
                    thread_id = message.thread_id;
                    timestamp = message.timestamp;
                };

                messages.put(message_id, updated_message);
                #ok(updated_message)
            };
        }
    };

    public query func getThreadMessages(thread_id: Nat) : async MessagesResult {
        switch (threads.get(thread_id)) {
            case (null) { #err("Thread not found") };
            case (?thread) {
                let thread_messages = Iter.filter<Message>(
                    messages.vals(), 
                    func(message: Message) : Bool {
                        message.thread_id == thread_id
                    }
                );
                
                let result = Iter.toArray(thread_messages);
                
                // Sort by timestamp (from oldest to newest)
                let sorted = Array.sort<Message>(result, func(a: Message, b: Message) : Order.Order {
                    if (a.timestamp < b.timestamp) { #less }
                    else if (a.timestamp == b.timestamp) { #equal }
                    else { #greater }
                });
                
                #ok(sorted)
            };
        }
    };

    public query func getUserThreads(user_id: Principal) : async [Thread] {
        Array.filter<Thread>(
            Iter.toArray(threads.vals()), 
            func(thread: Thread) : Bool {
                Principal.equal(thread.user1_id, user_id) or Principal.equal(thread.user2_id, user_id)
            }
        )
    };

    public query func getUnreadMessageCount(user_id: Principal) : async Nat {
        var count : Nat = 0;
        
        for (message in messages.vals()) {
            if (Principal.equal(message.receiver_id, user_id) and not message.read) {
                count += 1;
            }
        };
        
        count
    };
};
