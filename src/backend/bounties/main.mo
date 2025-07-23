// src/backend/bounties/main.mo
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Hash "mo:base/Hash";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
import Order "mo:base/Order";

actor BountySystem {
    public type Bounty = {
        id: Nat;
        title: Text;
        description: Text;
        reward: Nat;
        creator_id: Principal;
        category: Text;
        status: BountyStatus;
        deadline: Int;
        created_at: Int;
        updated_at: Int;
    };

    public type BountyStatus = {
        #Open;
        #Closed;
        #Awarded;
        #Expired;
    };

    public type BountySubmission = {
        id: Nat;
        bounty_id: Nat;
        submitter_id: Principal;
        description: Text;
        solution_link: Text;
        status: SubmissionStatus;
        created_at: Int;
    };

    public type SubmissionStatus = {
        #Pending;
        #Accepted;
        #Rejected;
    };

    public type BountyResult = Result.Result<Bounty, Text>;
    public type SubmissionResult = Result.Result<BountySubmission, Text>;

    private var next_bounty_id: Nat = 1;
    private var next_submission_id: Nat = 1;

    // Simple hash function for Nat
    private func natHash(n : Nat) : Hash.Hash {
        Nat32.fromNat(n)
    };

    private var bounties = HashMap.HashMap<Nat, Bounty>(0, Nat.equal, natHash);
    private var submissions = HashMap.HashMap<Nat, BountySubmission>(0, Nat.equal, natHash);
    
    // Bounty management functions
    public shared(msg) func createBounty(
        title: Text, 
        description: Text, 
        reward: Nat, 
        category: Text,
        deadline: Int
    ) : async BountyResult {
        let caller = msg.caller;
        
        let bounty : Bounty = {
            id = next_bounty_id;
            title = title;
            description = description;
            reward = reward;
            category = category;
            creator_id = caller;
            status = #Open;
            deadline = deadline;
            created_at = Time.now();
            updated_at = Time.now();
        };

        bounties.put(next_bounty_id, bounty);
        next_bounty_id += 1;
        
        #ok(bounty)
    };

    public query func getBounty(bounty_id: Nat) : async BountyResult {
        switch (bounties.get(bounty_id)) {
            case (null) { #err("Bounty not found") };
            case (?bounty) { #ok(bounty) };
        }
    };

    public query func getAllBounties() : async [Bounty] {
        Iter.toArray(bounties.vals())
    };

    public query func getOpenBounties() : async [Bounty] {
        Array.filter<Bounty>(
            Iter.toArray(bounties.vals()), 
            func(bounty: Bounty) : Bool {
                bounty.status == #Open
            }
        )
    };

    public query func getBountiesByCategory(category: Text) : async [Bounty] {
        Array.filter<Bounty>(
            Iter.toArray(bounties.vals()), 
            func(bounty: Bounty) : Bool {
                Text.equal(bounty.category, category)
            }
        )
    };

    public query func getCreatorBounties(creator_id: Principal) : async [Bounty] {
        Array.filter<Bounty>(
            Iter.toArray(bounties.vals()), 
            func(bounty: Bounty) : Bool {
                Principal.equal(bounty.creator_id, creator_id)
            }
        )
    };

    public shared(msg) func updateBountyStatus(bounty_id: Nat, status: BountyStatus) : async BountyResult {
        let caller = msg.caller;
        
        switch (bounties.get(bounty_id)) {
            case (null) { #err("Bounty not found") };
            case (?bounty) {
                if (bounty.creator_id != caller) {
                    return #err("Not authorized");
                };

                let updated_bounty : Bounty = {
                    id = bounty.id;
                    title = bounty.title;
                    description = bounty.description;
                    reward = bounty.reward;
                    category = bounty.category;
                    creator_id = bounty.creator_id;
                    status = status;
                    deadline = bounty.deadline;
                    created_at = bounty.created_at;
                    updated_at = Time.now();
                };

                bounties.put(bounty_id, updated_bounty);
                #ok(updated_bounty)
            };
        }
    };

    // Check for and update expired bounties
    public func checkExpiredBounties() : async Nat {
        let current_time = Time.now();
        var count = 0;
        
        for ((id, bounty) in bounties.entries()) {
            if (bounty.status == #Open and bounty.deadline < current_time) {
                let expired_bounty : Bounty = {
                    id = bounty.id;
                    title = bounty.title;
                    description = bounty.description;
                    reward = bounty.reward;
                    category = bounty.category;
                    creator_id = bounty.creator_id;
                    status = #Expired;
                    deadline = bounty.deadline;
                    created_at = bounty.created_at;
                    updated_at = current_time;
                };
                
                bounties.put(id, expired_bounty);
                count += 1;
            }
        };
        
        count
    };

    // Submission management functions
    public shared(msg) func submitSolution(bounty_id: Nat, description: Text, solution_link: Text) : async SubmissionResult {
        let caller = msg.caller;
        
        switch (bounties.get(bounty_id)) {
            case (null) { #err("Bounty not found") };
            case (?bounty) {
                if (bounty.status != #Open) {
                    return #err("Bounty is not open for submissions");
                };

                if (bounty.creator_id == caller) {
                    return #err("Cannot submit solution to your own bounty");
                };

                if (bounty.deadline < Time.now()) {
                    return #err("Bounty deadline has passed");
                };

                let submission : BountySubmission = {
                    id = next_submission_id;
                    bounty_id = bounty_id;
                    submitter_id = caller;
                    description = description;
                    solution_link = solution_link;
                    status = #Pending;
                    created_at = Time.now();
                };

                submissions.put(next_submission_id, submission);
                next_submission_id += 1;
                
                #ok(submission)
            };
        }
    };

    public query func getSubmission(submission_id: Nat) : async SubmissionResult {
        switch (submissions.get(submission_id)) {
            case (null) { #err("Submission not found") };
            case (?submission) { #ok(submission) };
        }
    };

    public query func getBountySubmissions(bounty_id: Nat) : async [BountySubmission] {
        Array.filter<BountySubmission>(
            Iter.toArray(submissions.vals()), 
            func(submission: BountySubmission) : Bool {
                submission.bounty_id == bounty_id
            }
        )
    };

    public query func getUserSubmissions(user_id: Principal) : async [BountySubmission] {
        Array.filter<BountySubmission>(
            Iter.toArray(submissions.vals()), 
            func(submission: BountySubmission) : Bool {
                Principal.equal(submission.submitter_id, user_id)
            }
        )
    };

    public shared(msg) func acceptSubmission(submission_id: Nat) : async Result.Result<(BountySubmission, Bounty), Text> {
        let caller = msg.caller;
        
        switch (submissions.get(submission_id)) {
            case (null) { #err("Submission not found") };
            case (?submission) {
                switch (bounties.get(submission.bounty_id)) {
                    case (null) { #err("Bounty not found") };
                    case (?bounty) {
                        if (bounty.creator_id != caller) {
                            return #err("Not authorized");
                        };

                        if (bounty.status != #Open) {
                            return #err("Bounty is not open");
                        };

                        let updated_submission : BountySubmission = {
                            id = submission.id;
                            bounty_id = submission.bounty_id;
                            submitter_id = submission.submitter_id;
                            description = submission.description;
                            solution_link = submission.solution_link;
                            status = #Accepted;
                            created_at = submission.created_at;
                        };

                        let updated_bounty : Bounty = {
                            id = bounty.id;
                            title = bounty.title;
                            description = bounty.description;
                            reward = bounty.reward;
                            category = bounty.category;
                            creator_id = bounty.creator_id;
                            status = #Awarded;
                            deadline = bounty.deadline;
                            created_at = bounty.created_at;
                            updated_at = Time.now();
                        };

                        // Update other submissions to rejected
                        for (sub in submissions.vals()) {
                            if (sub.bounty_id == submission.bounty_id and sub.id != submission_id) {
                                let rejected_sub : BountySubmission = {
                                    id = sub.id;
                                    bounty_id = sub.bounty_id;
                                    submitter_id = sub.submitter_id;
                                    description = sub.description;
                                    solution_link = sub.solution_link;
                                    status = #Rejected;
                                    created_at = sub.created_at;
                                };
                                submissions.put(sub.id, rejected_sub);
                            }
                        };

                        submissions.put(submission_id, updated_submission);
                        bounties.put(bounty.id, updated_bounty);

                        #ok(updated_submission, updated_bounty)
                    };
                }
            };
        }
    };

    public shared(msg) func rejectSubmission(submission_id: Nat) : async SubmissionResult {
        let caller = msg.caller;
        
        switch (submissions.get(submission_id)) {
            case (null) { #err("Submission not found") };
            case (?submission) {
                switch (bounties.get(submission.bounty_id)) {
                    case (null) { #err("Bounty not found") };
                    case (?bounty) {
                        if (bounty.creator_id != caller) {
                            return #err("Not authorized");
                        };

                        let updated_submission : BountySubmission = {
                            id = submission.id;
                            bounty_id = submission.bounty_id;
                            submitter_id = submission.submitter_id;
                            description = submission.description;
                            solution_link = submission.solution_link;
                            status = #Rejected;
                            created_at = submission.created_at;
                        };

                        submissions.put(submission_id, updated_submission);
                        #ok(updated_submission)
                    };
                }
            };
        }
    };
};
