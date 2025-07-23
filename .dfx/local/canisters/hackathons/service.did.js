export const idlFactory = ({ IDL }) => {
  const LocationType = IDL.Variant({
    'InPerson' : IDL.Null,
    'Hybrid' : IDL.Null,
    'Virtual' : IDL.Null,
  });
  const HackathonStatus = IDL.Variant({
    'Ongoing' : IDL.Null,
    'RegistrationClosed' : IDL.Null,
    'Cancelled' : IDL.Null,
    'RegistrationOpen' : IDL.Null,
    'Completed' : IDL.Null,
  });
  const Hackathon = IDL.Record({
    'id' : IDL.Nat,
    'categories' : IDL.Vec(IDL.Text),
    'status' : HackathonStatus,
    'registration_deadline' : IDL.Int,
    'organizer_id' : IDL.Principal,
    'title' : IDL.Text,
    'updated_at' : IDL.Int,
    'participant_limit' : IDL.Nat,
    'description' : IDL.Text,
    'end_date' : IDL.Int,
    'created_at' : IDL.Int,
    'start_date' : IDL.Int,
    'location_type' : LocationType,
    'prize_pool' : IDL.Nat,
    'location' : IDL.Text,
    'participant_count' : IDL.Nat,
  });
  const HackathonResult = IDL.Variant({ 'ok' : Hackathon, 'err' : IDL.Text });
  const ProjectStatus = IDL.Variant({
    'UnderReview' : IDL.Null,
    'Draft' : IDL.Null,
    'Winner' : IDL.Null,
    'Submitted' : IDL.Null,
    'Finalist' : IDL.Null,
    'Completed' : IDL.Null,
  });
  const Project = IDL.Record({
    'id' : IDL.Nat,
    'categories' : IDL.Vec(IDL.Text),
    'status' : ProjectStatus,
    'submission_link' : IDL.Text,
    'title' : IDL.Text,
    'updated_at' : IDL.Int,
    'hackathon_id' : IDL.Nat,
    'description' : IDL.Text,
    'created_at' : IDL.Int,
    'team_members' : IDL.Vec(IDL.Principal),
  });
  const ProjectResult = IDL.Variant({ 'ok' : Project, 'err' : IDL.Text });
  const Participant = IDL.Record({
    'hackathon_id' : IDL.Nat,
    'user_id' : IDL.Principal,
    'team_name' : IDL.Opt(IDL.Text),
    'registered_at' : IDL.Int,
  });
  const ParticipantResult = IDL.Variant({
    'ok' : Participant,
    'err' : IDL.Text,
  });
  return IDL.Service({
    'createHackathon' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          LocationType,
          IDL.Text,
          IDL.Nat,
          IDL.Vec(IDL.Text),
          IDL.Nat,
          IDL.Int,
          IDL.Int,
          IDL.Int,
        ],
        [HackathonResult],
        [],
      ),
    'createProject' : IDL.Func(
        [
          IDL.Nat,
          IDL.Text,
          IDL.Text,
          IDL.Vec(IDL.Principal),
          IDL.Text,
          IDL.Vec(IDL.Text),
        ],
        [ProjectResult],
        [],
      ),
    'getAllHackathons' : IDL.Func([], [IDL.Vec(Hackathon)], ['query']),
    'getHackathon' : IDL.Func([IDL.Nat], [HackathonResult], ['query']),
    'getHackathonParticipants' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(Participant)],
        ['query'],
      ),
    'getHackathonProjects' : IDL.Func([IDL.Nat], [IDL.Vec(Project)], ['query']),
    'getHackathonsByStatus' : IDL.Func(
        [HackathonStatus],
        [IDL.Vec(Hackathon)],
        ['query'],
      ),
    'getOrganizerHackathons' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Hackathon)],
        ['query'],
      ),
    'getProject' : IDL.Func([IDL.Nat], [ProjectResult], ['query']),
    'getUpcomingHackathons' : IDL.Func([], [IDL.Vec(Hackathon)], ['query']),
    'getUserParticipations' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Participant)],
        ['query'],
      ),
    'getUserProjects' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Project)],
        ['query'],
      ),
    'getWinningProjects' : IDL.Func([IDL.Nat], [IDL.Vec(Project)], ['query']),
    'isUserRegistered' : IDL.Func(
        [IDL.Nat, IDL.Principal],
        [IDL.Bool],
        ['query'],
      ),
    'registerForHackathon' : IDL.Func(
        [IDL.Nat, IDL.Opt(IDL.Text)],
        [ParticipantResult],
        [],
      ),
    'submitProject' : IDL.Func([IDL.Nat], [ProjectResult], []),
    'updateHackathonStatus' : IDL.Func(
        [IDL.Nat, HackathonStatus],
        [HackathonResult],
        [],
      ),
    'updateHackathonStatuses' : IDL.Func([], [IDL.Nat], []),
    'updateProjectStatus' : IDL.Func(
        [IDL.Nat, ProjectStatus],
        [ProjectResult],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
