export const idlFactory = ({ IDL }) => {
  const User = IDL.Record({
    'id' : IDL.Principal,
    'bio' : IDL.Text,
    'username' : IDL.Text,
    'created_at' : IDL.Int,
    'email' : IDL.Text,
    'is_verified' : IDL.Bool,
    'rating' : IDL.Float64,
    'skills' : IDL.Vec(IDL.Text),
  });
  const UserError = IDL.Variant({
    'UserAlreadyExists' : IDL.Null,
    'InvalidData' : IDL.Null,
    'UserNotFound' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : User, 'err' : UserError });
  return IDL.Service({
    'createUser' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Text), IDL.Text],
        [Result],
        [],
      ),
    'getAllUsers' : IDL.Func([], [IDL.Vec(User)], ['query']),
    'getUser' : IDL.Func([IDL.Principal], [Result], ['query']),
    'updateRating' : IDL.Func([IDL.Principal, IDL.Float64], [Result], []),
    'updateUser' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Text), IDL.Text],
        [Result],
        [],
      ),
    'verifyUser' : IDL.Func([IDL.Principal], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
