export const idlFactory = ({ IDL }) => {
  const ProposalStatus = IDL.Variant({
    'Withdrawn' : IDL.Null,
    'Rejected' : IDL.Null,
    'Accepted' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const Proposal = IDL.Record({
    'id' : IDL.Nat,
    'status' : ProposalStatus,
    'delivery_time' : IDL.Nat,
    'freelancer_id' : IDL.Principal,
    'created_at' : IDL.Int,
    'cover_letter' : IDL.Text,
    'bid_amount' : IDL.Nat,
    'project_id' : IDL.Nat,
  });
  const ProjectStatus = IDL.Variant({
    'UnderReview' : IDL.Null,
    'Open' : IDL.Null,
    'Cancelled' : IDL.Null,
    'InProgress' : IDL.Null,
    'Completed' : IDL.Null,
  });
  const Project = IDL.Record({
    'id' : IDL.Nat,
    'status' : ProjectStatus,
    'title' : IDL.Text,
    'updated_at' : IDL.Int,
    'freelancer_id' : IDL.Opt(IDL.Principal),
    'skills_required' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'created_at' : IDL.Int,
    'category' : IDL.Text,
    'client_id' : IDL.Principal,
    'budget' : IDL.Nat,
  });
  const Result = IDL.Variant({
    'ok' : IDL.Tuple(Proposal, Project),
    'err' : IDL.Text,
  });
  const ProjectResult = IDL.Variant({ 'ok' : Project, 'err' : IDL.Text });
  const ProposalResult = IDL.Variant({ 'ok' : Proposal, 'err' : IDL.Text });
  return IDL.Service({
    'acceptProposal' : IDL.Func([IDL.Nat], [Result], []),
    'createProject' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Vec(IDL.Text)],
        [ProjectResult],
        [],
      ),
    'getAllProjects' : IDL.Func([], [IDL.Vec(Project)], ['query']),
    'getClientProjects' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Project)],
        ['query'],
      ),
    'getFreelancerProjects' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Project)],
        ['query'],
      ),
    'getFreelancerProposals' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Proposal)],
        ['query'],
      ),
    'getProject' : IDL.Func([IDL.Nat], [ProjectResult], ['query']),
    'getProjectProposals' : IDL.Func([IDL.Nat], [IDL.Vec(Proposal)], ['query']),
    'getProposal' : IDL.Func([IDL.Nat], [ProposalResult], ['query']),
    'submitProposal' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text],
        [ProposalResult],
        [],
      ),
    'updateProjectStatus' : IDL.Func(
        [IDL.Nat, ProjectStatus],
        [ProjectResult],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
