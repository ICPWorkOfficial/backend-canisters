export const idlFactory = ({ IDL }) => {
  const SubmissionStatus = IDL.Variant({
    'Rejected' : IDL.Null,
    'Accepted' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const BountySubmission = IDL.Record({
    'id' : IDL.Nat,
    'status' : SubmissionStatus,
    'solution_link' : IDL.Text,
    'description' : IDL.Text,
    'created_at' : IDL.Int,
    'bounty_id' : IDL.Nat,
    'submitter_id' : IDL.Principal,
  });
  const BountyStatus = IDL.Variant({
    'Open' : IDL.Null,
    'Closed' : IDL.Null,
    'Awarded' : IDL.Null,
    'Expired' : IDL.Null,
  });
  const Bounty = IDL.Record({
    'id' : IDL.Nat,
    'status' : BountyStatus,
    'reward' : IDL.Nat,
    'title' : IDL.Text,
    'updated_at' : IDL.Int,
    'creator_id' : IDL.Principal,
    'description' : IDL.Text,
    'deadline' : IDL.Int,
    'created_at' : IDL.Int,
    'category' : IDL.Text,
  });
  const Result = IDL.Variant({
    'ok' : IDL.Tuple(BountySubmission, Bounty),
    'err' : IDL.Text,
  });
  const BountyResult = IDL.Variant({ 'ok' : Bounty, 'err' : IDL.Text });
  const SubmissionResult = IDL.Variant({
    'ok' : BountySubmission,
    'err' : IDL.Text,
  });
  return IDL.Service({
    'acceptSubmission' : IDL.Func([IDL.Nat], [Result], []),
    'checkExpiredBounties' : IDL.Func([], [IDL.Nat], []),
    'createBounty' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Int],
        [BountyResult],
        [],
      ),
    'getAllBounties' : IDL.Func([], [IDL.Vec(Bounty)], ['query']),
    'getBountiesByCategory' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(Bounty)],
        ['query'],
      ),
    'getBounty' : IDL.Func([IDL.Nat], [BountyResult], ['query']),
    'getBountySubmissions' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(BountySubmission)],
        ['query'],
      ),
    'getCreatorBounties' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Bounty)],
        ['query'],
      ),
    'getOpenBounties' : IDL.Func([], [IDL.Vec(Bounty)], ['query']),
    'getSubmission' : IDL.Func([IDL.Nat], [SubmissionResult], ['query']),
    'getUserSubmissions' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(BountySubmission)],
        ['query'],
      ),
    'rejectSubmission' : IDL.Func([IDL.Nat], [SubmissionResult], []),
    'submitSolution' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text],
        [SubmissionResult],
        [],
      ),
    'updateBountyStatus' : IDL.Func(
        [IDL.Nat, BountyStatus],
        [BountyResult],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
