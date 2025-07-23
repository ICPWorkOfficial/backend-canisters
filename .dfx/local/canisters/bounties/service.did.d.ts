import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Bounty {
  'id' : bigint,
  'status' : BountyStatus,
  'reward' : bigint,
  'title' : string,
  'updated_at' : bigint,
  'creator_id' : Principal,
  'description' : string,
  'deadline' : bigint,
  'created_at' : bigint,
  'category' : string,
}
export type BountyResult = { 'ok' : Bounty } |
  { 'err' : string };
export type BountyStatus = { 'Open' : null } |
  { 'Closed' : null } |
  { 'Awarded' : null } |
  { 'Expired' : null };
export interface BountySubmission {
  'id' : bigint,
  'status' : SubmissionStatus,
  'solution_link' : string,
  'description' : string,
  'created_at' : bigint,
  'bounty_id' : bigint,
  'submitter_id' : Principal,
}
export type Result = { 'ok' : [BountySubmission, Bounty] } |
  { 'err' : string };
export type SubmissionResult = { 'ok' : BountySubmission } |
  { 'err' : string };
export type SubmissionStatus = { 'Rejected' : null } |
  { 'Accepted' : null } |
  { 'Pending' : null };
export interface _SERVICE {
  'acceptSubmission' : ActorMethod<[bigint], Result>,
  'checkExpiredBounties' : ActorMethod<[], bigint>,
  'createBounty' : ActorMethod<
    [string, string, bigint, string, bigint],
    BountyResult
  >,
  'getAllBounties' : ActorMethod<[], Array<Bounty>>,
  'getBountiesByCategory' : ActorMethod<[string], Array<Bounty>>,
  'getBounty' : ActorMethod<[bigint], BountyResult>,
  'getBountySubmissions' : ActorMethod<[bigint], Array<BountySubmission>>,
  'getCreatorBounties' : ActorMethod<[Principal], Array<Bounty>>,
  'getOpenBounties' : ActorMethod<[], Array<Bounty>>,
  'getSubmission' : ActorMethod<[bigint], SubmissionResult>,
  'getUserSubmissions' : ActorMethod<[Principal], Array<BountySubmission>>,
  'rejectSubmission' : ActorMethod<[bigint], SubmissionResult>,
  'submitSolution' : ActorMethod<[bigint, string, string], SubmissionResult>,
  'updateBountyStatus' : ActorMethod<[bigint, BountyStatus], BountyResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
