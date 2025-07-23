export const idlFactory = ({ IDL }) => {
  const ProjectId = IDL.Nat64;
  const PaymentId = IDL.Nat64;
  const Payment = IDL.Record({
    'id' : PaymentId,
    'status' : IDL.Variant({
      'Disputed' : IDL.Null,
      'Refunded' : IDL.Null,
      'Released' : IDL.Null,
      'Escrowed' : IDL.Null,
      'Pending' : IDL.Null,
    }),
    'updated_at' : IDL.Nat64,
    'freelancer_id' : IDL.Principal,
    'created_at' : IDL.Nat64,
    'project_id' : ProjectId,
    'client_id' : IDL.Principal,
    'amount' : IDL.Nat64,
  });
  const PaymentError = IDL.Variant({
    'OperationFailed' : IDL.Null,
    'InvalidStatus' : IDL.Null,
    'NotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'AlreadyExists' : IDL.Null,
  });
  const PaymentResult = IDL.Variant({ 'ok' : Payment, 'err' : PaymentError });
  return IDL.Service({
    'create_escrow' : IDL.Func(
        [ProjectId, IDL.Principal, IDL.Nat64],
        [PaymentResult],
        [],
      ),
    'deposit_to_escrow' : IDL.Func([PaymentId], [PaymentResult], []),
    'dispute_payment' : IDL.Func([PaymentId], [PaymentResult], []),
    'get_client_payments' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Payment)],
        ['query'],
      ),
    'get_freelancer_payments' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Payment)],
        ['query'],
      ),
    'get_payment' : IDL.Func([PaymentId], [PaymentResult], ['query']),
    'get_project_payments' : IDL.Func(
        [ProjectId],
        [IDL.Vec(Payment)],
        ['query'],
      ),
    'refund_payment' : IDL.Func([PaymentId], [PaymentResult], []),
    'release_payment' : IDL.Func([PaymentId], [PaymentResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
