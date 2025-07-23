import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Project {
  'id' : bigint,
  'status' : ProjectStatus,
  'title' : string,
  'updated_at' : bigint,
  'freelancer_id' : [] | [Principal],
  'skills_required' : Array<string>,
  'description' : string,
  'created_at' : bigint,
  'category' : string,
  'client_id' : Principal,
  'budget' : bigint,
}
export type ProjectResult = { 'ok' : Project } |
  { 'err' : string };
export type ProjectStatus = { 'UnderReview' : null } |
  { 'Open' : null } |
  { 'Cancelled' : null } |
  { 'InProgress' : null } |
  { 'Completed' : null };
export interface Proposal {
  'id' : bigint,
  'status' : ProposalStatus,
  'delivery_time' : bigint,
  'freelancer_id' : Principal,
  'created_at' : bigint,
  'cover_letter' : string,
  'bid_amount' : bigint,
  'project_id' : bigint,
}
export type ProposalResult = { 'ok' : Proposal } |
  { 'err' : string };
export type ProposalStatus = { 'Withdrawn' : null } |
  { 'Rejected' : null } |
  { 'Accepted' : null } |
  { 'Pending' : null };
export type Result = { 'ok' : [Proposal, Project] } |
  { 'err' : string };
export interface _SERVICE {
  'acceptProposal' : ActorMethod<[bigint], Result>,
  'createProject' : ActorMethod<
    [string, string, bigint, string, Array<string>],
    ProjectResult
  >,
  'getAllProjects' : ActorMethod<[], Array<Project>>,
  'getClientProjects' : ActorMethod<[Principal], Array<Project>>,
  'getFreelancerProjects' : ActorMethod<[Principal], Array<Project>>,
  'getFreelancerProposals' : ActorMethod<[Principal], Array<Proposal>>,
  'getProject' : ActorMethod<[bigint], ProjectResult>,
  'getProjectProposals' : ActorMethod<[bigint], Array<Proposal>>,
  'getProposal' : ActorMethod<[bigint], ProposalResult>,
  'submitProposal' : ActorMethod<
    [bigint, bigint, bigint, string],
    ProposalResult
  >,
  'updateProjectStatus' : ActorMethod<[bigint, ProjectStatus], ProjectResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
