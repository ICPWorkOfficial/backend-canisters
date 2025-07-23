// src/backend/hackathons/main.mo
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

actor HackathonSystem {
    public type Hackathon = {
        id: Nat;
        title: Text;
        description: Text;
        location_type: LocationType;
        location: Text;
        prize_pool: Nat;
        categories: [Text];
        organizer_id: Principal;
        status: HackathonStatus;
        participant_limit: Nat;
        participant_count: Nat;
        registration_deadline: Int;
        start_date: Int;
        end_date: Int;
        created_at: Int;
        updated_at: Int;
    };

    public type LocationType = {
        #Virtual;
        #InPerson;
        #Hybrid;
    };

    public type HackathonStatus = {
        #RegistrationOpen;
        #RegistrationClosed;
        #Ongoing;
        #Completed;
        #Cancelled;
    };

    public type Participant = {
        hackathon_id: Nat;
        user_id: Principal;
        team_name: ?Text;
        registered_at: Int;
    };

    public type Project = {
        id: Nat;
        hackathon_id: Nat;
        title: Text;
        description: Text;
        team_members: [Principal];
        submission_link: Text;
        categories: [Text];
        status: ProjectStatus;
        created_at: Int;
        updated_at: Int;
    };

    public type ProjectStatus = {
        #Draft;
        #Submitted;
        #UnderReview;
        #Winner;
        #Finalist;
        #Completed;
    };

    public type HackathonResult = Result.Result<Hackathon, Text>;
    public type ParticipantResult = Result.Result<Participant, Text>;
    public type ProjectResult = Result.Result<Project, Text>;

    private var next_hackathon_id: Nat = 1;
    private var next_project_id: Nat = 1;

    // Simple hash function for Nat
    private func natHash(n : Nat) : Hash.Hash {
        Nat32.fromNat(n)
    };

    // Composite key for participants (hackathon_id + user_id)
    private func participantKey(hackathon_id: Nat, user_id: Principal) : Text {
        Nat.toText(hackathon_id) # Principal.toText(user_id)
    };

    private var hackathons = HashMap.HashMap<Nat, Hackathon>(0, Nat.equal, natHash);
    private var participants = HashMap.HashMap<Text, Participant>(0, Text.equal, Text.hash);
    private var projects = HashMap.HashMap<Nat, Project>(0, Nat.equal, natHash);
    
    // Hackathon management functions
    public shared(msg) func createHackathon(
        title: Text, 
        description: Text, 
        location_type: LocationType,
        location: Text,
        prize_pool: Nat, 
        categories: [Text],
        participant_limit: Nat,
        registration_deadline: Int,
        start_date: Int,
        end_date: Int
    ) : async HackathonResult {
        let caller = msg.caller;
        
        let hackathon : Hackathon = {
            id = next_hackathon_id;
            title = title;
            description = description;
            location_type = location_type;
            location = location;
            prize_pool = prize_pool;
            categories = categories;
            organizer_id = caller;
            status = #RegistrationOpen;
            participant_limit = participant_limit;
            participant_count = 0;
            registration_deadline = registration_deadline;
            start_date = start_date;
            end_date = end_date;
            created_at = Time.now();
            updated_at = Time.now();
        };

        hackathons.put(next_hackathon_id, hackathon);
        next_hackathon_id += 1;
        
        #ok(hackathon)
    };

    public query func getHackathon(hackathon_id: Nat) : async HackathonResult {
        switch (hackathons.get(hackathon_id)) {
            case (null) { #err("Hackathon not found") };
            case (?hackathon) { #ok(hackathon) };
        }
    };

    public query func getAllHackathons() : async [Hackathon] {
        Iter.toArray(hackathons.vals())
    };

    public query func getHackathonsByStatus(status: HackathonStatus) : async [Hackathon] {
        Array.filter<Hackathon>(
            Iter.toArray(hackathons.vals()), 
            func(hackathon: Hackathon) : Bool {
                hackathon.status == status
            }
        )
    };

    public query func getUpcomingHackathons() : async [Hackathon] {
        let now = Time.now();
        Array.filter<Hackathon>(
            Iter.toArray(hackathons.vals()), 
            func(hackathon: Hackathon) : Bool {
                hackathon.start_date > now and 
                (hackathon.status == #RegistrationOpen or hackathon.status == #RegistrationClosed)
            }
        )
    };

    public query func getOrganizerHackathons(organizer_id: Principal) : async [Hackathon] {
        Array.filter<Hackathon>(
            Iter.toArray(hackathons.vals()), 
            func(hackathon: Hackathon) : Bool {
                Principal.equal(hackathon.organizer_id, organizer_id)
            }
        )
    };

    public shared(msg) func updateHackathonStatus(hackathon_id: Nat, status: HackathonStatus) : async HackathonResult {
        let caller = msg.caller;
        
        switch (hackathons.get(hackathon_id)) {
            case (null) { #err("Hackathon not found") };
            case (?hackathon) {
                if (hackathon.organizer_id != caller) {
                    return #err("Not authorized");
                };

                let updated_hackathon : Hackathon = {
                    id = hackathon.id;
                    title = hackathon.title;
                    description = hackathon.description;
                    location_type = hackathon.location_type;
                    location = hackathon.location;
                    prize_pool = hackathon.prize_pool;
                    categories = hackathon.categories;
                    organizer_id = hackathon.organizer_id;
                    status = status;
                    participant_limit = hackathon.participant_limit;
                    participant_count = hackathon.participant_count;
                    registration_deadline = hackathon.registration_deadline;
                    start_date = hackathon.start_date;
                    end_date = hackathon.end_date;
                    created_at = hackathon.created_at;
                    updated_at = Time.now();
                };

                hackathons.put(hackathon_id, updated_hackathon);
                #ok(updated_hackathon)
            };
        }
    };

    // Update hackathon statuses based on dates
    public func updateHackathonStatuses() : async Nat {
        let current_time = Time.now();
        var count = 0;
        
        for ((id, hackathon) in hackathons.entries()) {
            var status_updated = false;
            var new_status = hackathon.status;
            
            // Registration deadline passed but still open
            if (hackathon.status == #RegistrationOpen and hackathon.registration_deadline < current_time) {
                new_status := #RegistrationClosed;
                status_updated := true;
            };
            
            // Start date reached but not ongoing
            if ((hackathon.status == #RegistrationOpen or hackathon.status == #RegistrationClosed) 
                and hackathon.start_date < current_time and current_time < hackathon.end_date) {
                new_status := #Ongoing;
                status_updated := true;
            };
            
            // End date reached but not completed
            if (hackathon.status == #Ongoing and hackathon.end_date < current_time) {
                new_status := #Completed;
                status_updated := true;
            };
            
            if (status_updated) {
                let updated_hackathon : Hackathon = {
                    id = hackathon.id;
                    title = hackathon.title;
                    description = hackathon.description;
                    location_type = hackathon.location_type;
                    location = hackathon.location;
                    prize_pool = hackathon.prize_pool;
                    categories = hackathon.categories;
                    organizer_id = hackathon.organizer_id;
                    status = new_status;
                    participant_limit = hackathon.participant_limit;
                    participant_count = hackathon.participant_count;
                    registration_deadline = hackathon.registration_deadline;
                    start_date = hackathon.start_date;
                    end_date = hackathon.end_date;
                    created_at = hackathon.created_at;
                    updated_at = current_time;
                };
                
                hackathons.put(id, updated_hackathon);
                count += 1;
            };
        };
        
        count
    };

    // Registration functions
    public shared(msg) func registerForHackathon(hackathon_id: Nat, team_name: ?Text) : async ParticipantResult {
        let caller = msg.caller;
        
        switch (hackathons.get(hackathon_id)) {
            case (null) { #err("Hackathon not found") };
            case (?hackathon) {
                if (hackathon.status != #RegistrationOpen) {
                    return #err("Hackathon registration is not open");
                };

                if (hackathon.registration_deadline < Time.now()) {
                    return #err("Registration deadline has passed");
                };

                if (hackathon.participant_count >= hackathon.participant_limit) {
                    return #err("Hackathon has reached participant limit");
                };

                let key = participantKey(hackathon_id, caller);
                switch (participants.get(key)) {
                    case (?_) { #err("Already registered") };
                    case (null) {
                        let participant : Participant = {
                            hackathon_id = hackathon_id;
                            user_id = caller;
                            team_name = team_name;
                            registered_at = Time.now();
                        };

                        participants.put(key, participant);
                        
                        // Update participant count
                        let updated_hackathon : Hackathon = {
                            id = hackathon.id;
                            title = hackathon.title;
                            description = hackathon.description;
                            location_type = hackathon.location_type;
                            location = hackathon.location;
                            prize_pool = hackathon.prize_pool;
                            categories = hackathon.categories;
                            organizer_id = hackathon.organizer_id;
                            status = hackathon.status;
                            participant_limit = hackathon.participant_limit;
                            participant_count = hackathon.participant_count + 1;
                            registration_deadline = hackathon.registration_deadline;
                            start_date = hackathon.start_date;
                            end_date = hackathon.end_date;
                            created_at = hackathon.created_at;
                            updated_at = Time.now();
                        };
                        
                        hackathons.put(hackathon_id, updated_hackathon);
                        
                        #ok(participant)
                    };
                };
            };
        }
    };

    public query func getHackathonParticipants(hackathon_id: Nat) : async [Participant] {
        Array.filter<Participant>(
            Iter.toArray(participants.vals()), 
            func(participant: Participant) : Bool {
                participant.hackathon_id == hackathon_id
            }
        )
    };

    public query func isUserRegistered(hackathon_id: Nat, user_id: Principal) : async Bool {
        let key = participantKey(hackathon_id, user_id);
        switch (participants.get(key)) {
            case (?_) { true };
            case (null) { false };
        }
    };

    public query func getUserParticipations(user_id: Principal) : async [Participant] {
        Array.filter<Participant>(
            Iter.toArray(participants.vals()), 
            func(participant: Participant) : Bool {
                Principal.equal(participant.user_id, user_id)
            }
        )
    };

    // Project submission functions
    public shared(msg) func createProject(
        hackathon_id: Nat,
        title: Text,
        description: Text,
        team_members: [Principal],
        submission_link: Text,
        categories: [Text]
    ) : async ProjectResult {
        let caller = msg.caller;
        
        switch (hackathons.get(hackathon_id)) {
            case (null) { #err("Hackathon not found") };
            case (?hackathon) {
                if (hackathon.status != #Ongoing and hackathon.status != #RegistrationClosed) {
                    return #err("Hackathon is not active or pre-launch");
                };

                let key = participantKey(hackathon_id, caller);
                switch (participants.get(key)) {
                    case (null) { #err("Not registered for this hackathon") };
                    case (?_) {
                        // Validate team members are all registered
                        for (member in team_members.vals()) {
                            let member_key = participantKey(hackathon_id, member);
                            switch (participants.get(member_key)) {
                                case (null) { return #err("Team member is not registered") };
                                case (?_) {};
                            };
                        };
                        
                        let project : Project = {
                            id = next_project_id;
                            hackathon_id = hackathon_id;
                            title = title;
                            description = description;
                            team_members = team_members;
                            submission_link = submission_link;
                            categories = categories;
                            status = #Draft;
                            created_at = Time.now();
                            updated_at = Time.now();
                        };

                        projects.put(next_project_id, project);
                        next_project_id += 1;
                        
                        #ok(project)
                    };
                };
            };
        }
    };

    public shared(msg) func submitProject(project_id: Nat) : async ProjectResult {
        let caller = msg.caller;
        
        switch (projects.get(project_id)) {
            case (null) { #err("Project not found") };
            case (?project) {
                // Check if caller is a team member
                let is_team_member = Array.find<Principal>(
                    project.team_members, 
                    func(member: Principal) : Bool { 
                        Principal.equal(member, caller) 
                    }
                );
                
                if (is_team_member == null) {
                    return #err("Not authorized - not a team member");
                };
                
                if (project.status != #Draft) {
                    return #err("Project is already submitted");
                };
                
                switch (hackathons.get(project.hackathon_id)) {
                    case (null) { #err("Hackathon not found") };
                    case (?hackathon) {
                        if (hackathon.status != #Ongoing) {
                            return #err("Hackathon is not ongoing");
                        };
                        
                        let updated_project : Project = {
                            id = project.id;
                            hackathon_id = project.hackathon_id;
                            title = project.title;
                            description = project.description;
                            team_members = project.team_members;
                            submission_link = project.submission_link;
                            categories = project.categories;
                            status = #Submitted;
                            created_at = project.created_at;
                            updated_at = Time.now();
                        };

                        projects.put(project_id, updated_project);
                        #ok(updated_project)
                    };
                };
            };
        }
    };

    public shared(msg) func updateProjectStatus(project_id: Nat, status: ProjectStatus) : async ProjectResult {
        let caller = msg.caller;
        
        switch (projects.get(project_id)) {
            case (null) { #err("Project not found") };
            case (?project) {
                switch (hackathons.get(project.hackathon_id)) {
                    case (null) { #err("Hackathon not found") };
                    case (?hackathon) {
                        // Only hackathon organizer can update status
                        if (hackathon.organizer_id != caller) {
                            return #err("Not authorized");
                        };
                        
                        let updated_project : Project = {
                            id = project.id;
                            hackathon_id = project.hackathon_id;
                            title = project.title;
                            description = project.description;
                            team_members = project.team_members;
                            submission_link = project.submission_link;
                            categories = project.categories;
                            status = status;
                            created_at = project.created_at;
                            updated_at = Time.now();
                        };

                        projects.put(project_id, updated_project);
                        #ok(updated_project)
                    };
                };
            };
        }
    };

    public query func getProject(project_id: Nat) : async ProjectResult {
        switch (projects.get(project_id)) {
            case (null) { #err("Project not found") };
            case (?project) { #ok(project) };
        }
    };

    public query func getHackathonProjects(hackathon_id: Nat) : async [Project] {
        Array.filter<Project>(
            Iter.toArray(projects.vals()), 
            func(project: Project) : Bool {
                project.hackathon_id == hackathon_id
            }
        )
    };

    public query func getUserProjects(user_id: Principal) : async [Project] {
        Array.filter<Project>(
            Iter.toArray(projects.vals()), 
            func(project: Project) : Bool {
                Array.find<Principal>(
                    project.team_members,
                    func(member: Principal) : Bool { 
                        Principal.equal(member, user_id) 
                    }
                ) != null
            }
        )
    };

    public query func getWinningProjects(hackathon_id: Nat) : async [Project] {
        Array.filter<Project>(
            Iter.toArray(projects.vals()), 
            func(project: Project) : Bool {
                project.hackathon_id == hackathon_id and project.status == #Winner
            }
        )
    };
};
