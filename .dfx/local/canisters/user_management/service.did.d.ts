import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'ok' : User } |
  { 'err' : UserError };
export interface User {
  'id' : Principal,
  'bio' : string,
  'username' : string,
  'created_at' : bigint,
  'email' : string,
  'is_verified' : boolean,
  'rating' : number,
  'skills' : Array<string>,
}
export type UserError = { 'UserAlreadyExists' : null } |
  { 'InvalidData' : null } |
  { 'UserNotFound' : null };
export interface _SERVICE {
  'createUser' : ActorMethod<[string, string, Array<string>, string], Result>,
  'getAllUsers' : ActorMethod<[], Array<User>>,
  'getUser' : ActorMethod<[Principal], Result>,
  'updateRating' : ActorMethod<[Principal, number], Result>,
  'updateUser' : ActorMethod<[string, string, Array<string>, string], Result>,
  'verifyUser' : ActorMethod<[Principal], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
