import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Hackathon {
  'id' : bigint,
  'categories' : Array<string>,
  'status' : HackathonStatus,
  'registration_deadline' : bigint,
  'organizer_id' : Principal,
  'title' : string,
  'updated_at' : bigint,
  'participant_limit' : bigint,
  'description' : string,
  'end_date' : bigint,
  'created_at' : bigint,
  'start_date' : bigint,
  'location_type' : LocationType,
  'prize_pool' : bigint,
  'location' : string,
  'participant_count' : bigint,
}
export type HackathonResult = { 'ok' : Hackathon } |
  { 'err' : string };
export type HackathonStatus = { 'Ongoing' : null } |
  { 'RegistrationClosed' : null } |
  { 'Cancelled' : null } |
  { 'RegistrationOpen' : null } |
  { 'Completed' : null };
export type LocationType = { 'InPerson' : null } |
  { 'Hybrid' : null } |
  { 'Virtual' : null };
export interface Participant {
  'hackathon_id' : bigint,
  'user_id' : Principal,
  'team_name' : [] | [string],
  'registered_at' : bigint,
}
export type ParticipantResult = { 'ok' : Participant } |
  { 'err' : string };
export interface Project {
  'id' : bigint,
  'categories' : Array<string>,
  'status' : ProjectStatus,
  'submission_link' : string,
  'title' : string,
  'updated_at' : bigint,
  'hackathon_id' : bigint,
  'description' : string,
  'created_at' : bigint,
  'team_members' : Array<Principal>,
}
export type ProjectResult = { 'ok' : Project } |
  { 'err' : string };
export type ProjectStatus = { 'UnderReview' : null } |
  { 'Draft' : null } |
  { 'Winner' : null } |
  { 'Submitted' : null } |
  { 'Finalist' : null } |
  { 'Completed' : null };
export interface _SERVICE {
  'createHackathon' : ActorMethod<
    [
      string,
      string,
      LocationType,
      string,
      bigint,
      Array<string>,
      bigint,
      bigint,
      bigint,
      bigint,
    ],
    HackathonResult
  >,
  'createProject' : ActorMethod<
    [bigint, string, string, Array<Principal>, string, Array<string>],
    ProjectResult
  >,
  'getAllHackathons' : ActorMethod<[], Array<Hackathon>>,
  'getHackathon' : ActorMethod<[bigint], HackathonResult>,
  'getHackathonParticipants' : ActorMethod<[bigint], Array<Participant>>,
  'getHackathonProjects' : ActorMethod<[bigint], Array<Project>>,
  'getHackathonsByStatus' : ActorMethod<[HackathonStatus], Array<Hackathon>>,
  'getOrganizerHackathons' : ActorMethod<[Principal], Array<Hackathon>>,
  'getProject' : ActorMethod<[bigint], ProjectResult>,
  'getUpcomingHackathons' : ActorMethod<[], Array<Hackathon>>,
  'getUserParticipations' : ActorMethod<[Principal], Array<Participant>>,
  'getUserProjects' : ActorMethod<[Principal], Array<Project>>,
  'getWinningProjects' : ActorMethod<[bigint], Array<Project>>,
  'isUserRegistered' : ActorMethod<[bigint, Principal], boolean>,
  'registerForHackathon' : ActorMethod<
    [bigint, [] | [string]],
    ParticipantResult
  >,
  'submitProject' : ActorMethod<[bigint], ProjectResult>,
  'updateHackathonStatus' : ActorMethod<
    [bigint, HackathonStatus],
    HackathonResult
  >,
  'updateHackathonStatuses' : ActorMethod<[], bigint>,
  'updateProjectStatus' : ActorMethod<[bigint, ProjectStatus], ProjectResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
