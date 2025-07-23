// src/backend/project_management/main.mo
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Hash "mo:base/Hash";
import Nat32 "mo:base/Nat32";

actor ProjectManagement {
    public type Project = {
        id: Nat;
        title: Text;
        description: Text;
        budget: Nat;
        category: Text;
        skills_required: [Text];
        client_id: Principal;
        freelancer_id: ?Principal;
        status: ProjectStatus;
        created_at: Int;
        updated_at: Int;
    };

    public type ProjectStatus = {
        #Open;
        #InProgress;
        #UnderReview;
        #Completed;
        #Cancelled;
    };

    public type Proposal = {
        id: Nat;
        project_id: Nat;
        freelancer_id: Principal;
        bid_amount: Nat;
        delivery_time: Nat; // in days
        cover_letter: Text;
        status: ProposalStatus;
        created_at: Int;
    };

    public type ProposalStatus = {
        #Pending;
        #Accepted;
        #Rejected;
        #Withdrawn;
    };

    public type ProjectResult = Result.Result<Project, Text>;
    public type ProposalResult = Result.Result<Proposal, Text>;

    private var next_project_id: Nat = 1;
    private var next_proposal_id: Nat = 1;

    // Simple hash function for Nat
    private func natHash(n : Nat) : Hash.Hash {
        Nat32.fromNat(n)
    };

    private var projects = HashMap.HashMap<Nat, Project>(0, Nat.equal, natHash);
    private var proposals = HashMap.HashMap<Nat, Proposal>(0, Nat.equal, natHash);
    
    // Project management functions
    public shared(msg) func createProject(title: Text, description: Text, budget: Nat, category: Text, skills_required: [Text]) : async ProjectResult {
        let caller = msg.caller;
        
        let project : Project = {
            id = next_project_id;
            title = title;
            description = description;
            budget = budget;
            category = category;
            skills_required = skills_required;
            client_id = caller;
            freelancer_id = null;
            status = #Open;
            created_at = Time.now();
            updated_at = Time.now();
        };

        projects.put(next_project_id, project);
        next_project_id += 1;
        
        #ok(project)
    };

    public query func getProject(project_id: Nat) : async ProjectResult {
        switch (projects.get(project_id)) {
            case (null) { #err("Project not found") };
            case (?project) { #ok(project) };
        }
    };

    public query func getAllProjects() : async [Project] {
        Iter.toArray(projects.vals())
    };

    public query func getClientProjects(client_id: Principal) : async [Project] {
        Array.filter<Project>(
            Iter.toArray(projects.vals()), 
            func(project: Project) : Bool {
                project.client_id == client_id
            }
        )
    };

    public query func getFreelancerProjects(freelancer_id: Principal) : async [Project] {
        Array.filter<Project>(
            Iter.toArray(projects.vals()), 
            func(project: Project) : Bool {
                switch (project.freelancer_id) {
                    case (null) { false };
                    case (?id) { id == freelancer_id };
                }
            }
        )
    };

    public shared(msg) func updateProjectStatus(project_id: Nat, status: ProjectStatus) : async ProjectResult {
        let caller = msg.caller;
        
        switch (projects.get(project_id)) {
            case (null) { #err("Project not found") };
            case (?project) {
                if (project.client_id != caller) {
                    return #err("Not authorized");
                };

                let updated_project : Project = {
                    id = project.id;
                    title = project.title;
                    description = project.description;
                    budget = project.budget;
                    category = project.category;
                    skills_required = project.skills_required;
                    client_id = project.client_id;
                    freelancer_id = project.freelancer_id;
                    status = status;
                    created_at = project.created_at;
                    updated_at = Time.now();
                };

                projects.put(project_id, updated_project);
                #ok(updated_project)
            };
        }
    };

    // Proposal management functions
    public shared(msg) func submitProposal(project_id: Nat, bid_amount: Nat, delivery_time: Nat, cover_letter: Text) : async ProposalResult {
        let caller = msg.caller;
        
        switch (projects.get(project_id)) {
            case (null) { #err("Project not found") };
            case (?project) {
                if (project.status != #Open) {
                    return #err("Project is not open for proposals");
                };

                if (project.client_id == caller) {
                    return #err("Cannot submit proposal to your own project");
                };

                let proposal : Proposal = {
                    id = next_proposal_id;
                    project_id = project_id;
                    freelancer_id = caller;
                    bid_amount = bid_amount;
                    delivery_time = delivery_time;
                    cover_letter = cover_letter;
                    status = #Pending;
                    created_at = Time.now();
                };

                proposals.put(next_proposal_id, proposal);
                next_proposal_id += 1;
                
                #ok(proposal)
            };
        }
    };

    public query func getProposal(proposal_id: Nat) : async ProposalResult {
        switch (proposals.get(proposal_id)) {
            case (null) { #err("Proposal not found") };
            case (?proposal) { #ok(proposal) };
        }
    };

    public query func getProjectProposals(project_id: Nat) : async [Proposal] {
        Array.filter<Proposal>(
            Iter.toArray(proposals.vals()), 
            func(proposal: Proposal) : Bool {
                proposal.project_id == project_id
            }
        )
    };

    public query func getFreelancerProposals(freelancer_id: Principal) : async [Proposal] {
        Array.filter<Proposal>(
            Iter.toArray(proposals.vals()), 
            func(proposal: Proposal) : Bool {
                proposal.freelancer_id == freelancer_id
            }
        )
    };

    public shared(msg) func acceptProposal(proposal_id: Nat) : async Result.Result<(Proposal, Project), Text> {
        let caller = msg.caller;
        
        switch (proposals.get(proposal_id)) {
            case (null) { #err("Proposal not found") };
            case (?proposal) {
                switch (projects.get(proposal.project_id)) {
                    case (null) { #err("Project not found") };
                    case (?project) {
                        if (project.client_id != caller) {
                            return #err("Not authorized");
                        };

                        if (project.status != #Open) {
                            return #err("Project is not open");
                        };

                        let updated_proposal : Proposal = {
                            id = proposal.id;
                            project_id = proposal.project_id;
                            freelancer_id = proposal.freelancer_id;
                            bid_amount = proposal.bid_amount;
                            delivery_time = proposal.delivery_time;
                            cover_letter = proposal.cover_letter;
                            status = #Accepted;
                            created_at = proposal.created_at;
                        };

                        let updated_project : Project = {
                            id = project.id;
                            title = project.title;
                            description = project.description;
                            budget = project.budget;
                            category = project.category;
                            skills_required = project.skills_required;
                            client_id = project.client_id;
                            freelancer_id = ?proposal.freelancer_id;
                            status = #InProgress;
                            created_at = project.created_at;
                            updated_at = Time.now();
                        };

                        // Update other proposals to rejected
                        for (prop in proposals.vals()) {
                            if (prop.project_id == proposal.project_id and prop.id != proposal_id) {
                                let rejected_prop : Proposal = {
                                    id = prop.id;
                                    project_id = prop.project_id;
                                    freelancer_id = prop.freelancer_id;
                                    bid_amount = prop.bid_amount;
                                    delivery_time = prop.delivery_time;
                                    cover_letter = prop.cover_letter;
                                    status = #Rejected;
                                    created_at = prop.created_at;
                                };
                                proposals.put(prop.id, rejected_prop);
                            }
                        };

                        proposals.put(proposal_id, updated_proposal);
                        projects.put(project.id, updated_project);

                        #ok(updated_proposal, updated_project)
                    };
                }
            };
        }
    };
};
