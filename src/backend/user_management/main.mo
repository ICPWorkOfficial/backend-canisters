// src/backend/user_management/main.mo
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Iter "mo:base/Iter";

actor UserManagement {
    // User data structure
    public type User = {
        id: Principal;
        username: Text;
        email: Text;
        skills: [Text];
        bio: Text;
        rating: Float;
        created_at: Int;
        is_verified: Bool;
    };

    // Error types
    public type UserError = {
        #UserNotFound;
        #UserAlreadyExists;
        #InvalidData;
    };

    // Stable storage for persistence
    private stable var users_entries: [(Principal, User)] = [];
    private var users = HashMap.HashMap<Principal, User>(0, Principal.equal, Principal.hash);

    // System upgrade hooks
    system func preupgrade() {
        users_entries := Iter.toArray(users.entries());
    };

    system func postupgrade() {
        users := HashMap.fromIter<Principal, User>(
            Iter.fromArray(users_entries), 
            users_entries.size(), 
            Principal.equal, 
            Principal.hash
        );
        users_entries := [];
    };

    // Create user profile
    public shared(msg) func createUser(
        username: Text, 
        email: Text, 
        skills: [Text], 
        bio: Text
    ) : async Result.Result<User, UserError> {
        let caller = msg.caller;
        
        switch (users.get(caller)) {
            case (?existing) { #err(#UserAlreadyExists) };
            case null {
                let user: User = {
                    id = caller;
                    username = username;
                    email = email;
                    skills = skills;
                    bio = bio;
                    rating = 0.0;
                    created_at = Time.now();
                    is_verified = false;
                };
                users.put(caller, user);
                #ok(user)
            };
        };
    };

    // Get user profile
    public query func getUser(user_id: Principal) : async Result.Result<User, UserError> {
        switch (users.get(user_id)) {
            case (?user) { #ok(user) };
            case null { #err(#UserNotFound) };
        };
    };

    // Update user profile
    public shared(msg) func updateUser(
        username: Text, 
        email: Text, 
        skills: [Text], 
        bio: Text
    ) : async Result.Result<User, UserError> {
        let caller = msg.caller;
        
        switch (users.get(caller)) {
            case null { #err(#UserNotFound) };
            case (?existing) {
                let updated_user: User = {
                    id = existing.id;
                    username = username;
                    email = email;
                    skills = skills;
                    bio = bio;
                    rating = existing.rating;
                    created_at = existing.created_at;
                    is_verified = existing.is_verified;
                };
                users.put(caller, updated_user);
                #ok(updated_user)
            };
        };
    };

    // Get all users (for admin/search functionality)
    public query func getAllUsers() : async [User] {
        Iter.toArray(Iter.map(users.vals(), func (user: User) : User { user }))
    };

    // Update user rating
    public shared(msg) func updateRating(user_id: Principal, new_rating: Float) : async Result.Result<User, UserError> {
        // In a real system, you'd check if msg.caller has permission to update ratings
        switch (users.get(user_id)) {
            case null { #err(#UserNotFound) };
            case (?existing) {
                let updated_user: User = {
                    id = existing.id;
                    username = existing.username;
                    email = existing.email;
                    skills = existing.skills;
                    bio = existing.bio;
                    rating = new_rating;
                    created_at = existing.created_at;
                    is_verified = existing.is_verified;
                };
                users.put(user_id, updated_user);
                #ok(updated_user)
            };
        };
    };

    // Verify user
    public shared(msg) func verifyUser(user_id: Principal) : async Result.Result<User, UserError> {
        // In a real system, you'd check if msg.caller has admin permissions
        switch (users.get(user_id)) {
            case null { #err(#UserNotFound) };
            case (?existing) {
                let updated_user: User = {
                    id = existing.id;
                    username = existing.username;
                    email = existing.email;
                    skills = existing.skills;
                    bio = existing.bio;
                    rating = existing.rating;
                    created_at = existing.created_at;
                    is_verified = true;
                };
                users.put(user_id, updated_user);
                #ok(updated_user)
            };
        };
    };
}
