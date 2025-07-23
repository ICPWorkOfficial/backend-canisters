export const idlFactory = ({ IDL }) => {
  const Thread = IDL.Record({
    'id' : IDL.Nat,
    'last_message_time' : IDL.Int,
    'user1_id' : IDL.Principal,
    'user2_id' : IDL.Principal,
  });
  const ThreadResult = IDL.Variant({ 'ok' : Thread, 'err' : IDL.Text });
  const Message = IDL.Record({
    'id' : IDL.Nat,
    'receiver_id' : IDL.Principal,
    'content' : IDL.Text,
    'read' : IDL.Bool,
    'sender_id' : IDL.Principal,
    'timestamp' : IDL.Int,
    'thread_id' : IDL.Nat,
  });
  const MessageResult = IDL.Variant({ 'ok' : Message, 'err' : IDL.Text });
  const MessagesResult = IDL.Variant({
    'ok' : IDL.Vec(Message),
    'err' : IDL.Text,
  });
  return IDL.Service({
    'createThread' : IDL.Func([IDL.Principal], [ThreadResult], []),
    'getMessage' : IDL.Func([IDL.Nat], [MessageResult], ['query']),
    'getThreadMessages' : IDL.Func([IDL.Nat], [MessagesResult], ['query']),
    'getUnreadMessageCount' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getUserThreads' : IDL.Func([IDL.Principal], [IDL.Vec(Thread)], ['query']),
    'markMessageAsRead' : IDL.Func([IDL.Nat], [MessageResult], []),
    'sendMessage' : IDL.Func([IDL.Principal, IDL.Text], [MessageResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
