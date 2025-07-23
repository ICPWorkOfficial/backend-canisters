import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Payment {
  'id' : PaymentId,
  'status' : { 'Disputed' : null } |
    { 'Refunded' : null } |
    { 'Released' : null } |
    { 'Escrowed' : null } |
    { 'Pending' : null },
  'updated_at' : bigint,
  'freelancer_id' : Principal,
  'created_at' : bigint,
  'project_id' : ProjectId,
  'client_id' : Principal,
  'amount' : bigint,
}
export type PaymentError = { 'OperationFailed' : null } |
  { 'InvalidStatus' : null } |
  { 'NotFound' : null } |
  { 'Unauthorized' : null } |
  { 'AlreadyExists' : null };
export type PaymentId = bigint;
export type PaymentResult = { 'ok' : Payment } |
  { 'err' : PaymentError };
export type ProjectId = bigint;
export interface _SERVICE {
  'create_escrow' : ActorMethod<[ProjectId, Principal, bigint], PaymentResult>,
  'deposit_to_escrow' : ActorMethod<[PaymentId], PaymentResult>,
  'dispute_payment' : ActorMethod<[PaymentId], PaymentResult>,
  'get_client_payments' : ActorMethod<[Principal], Array<Payment>>,
  'get_freelancer_payments' : ActorMethod<[Principal], Array<Payment>>,
  'get_payment' : ActorMethod<[PaymentId], PaymentResult>,
  'get_project_payments' : ActorMethod<[ProjectId], Array<Payment>>,
  'refund_payment' : ActorMethod<[PaymentId], PaymentResult>,
  'release_payment' : ActorMethod<[PaymentId], PaymentResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
