import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Message {
  'id' : bigint,
  'receiver_id' : Principal,
  'content' : string,
  'read' : boolean,
  'sender_id' : Principal,
  'timestamp' : bigint,
  'thread_id' : bigint,
}
export type MessageResult = { 'ok' : Message } |
  { 'err' : string };
export type MessagesResult = { 'ok' : Array<Message> } |
  { 'err' : string };
export interface Thread {
  'id' : bigint,
  'last_message_time' : bigint,
  'user1_id' : Principal,
  'user2_id' : Principal,
}
export type ThreadResult = { 'ok' : Thread } |
  { 'err' : string };
export interface _SERVICE {
  'createThread' : ActorMethod<[Principal], ThreadResult>,
  'getMessage' : ActorMethod<[bigint], MessageResult>,
  'getThreadMessages' : ActorMethod<[bigint], MessagesResult>,
  'getUnreadMessageCount' : ActorMethod<[Principal], bigint>,
  'getUserThreads' : ActorMethod<[Principal], Array<Thread>>,
  'markMessageAsRead' : ActorMethod<[bigint], MessageResult>,
  'sendMessage' : ActorMethod<[Principal, string], MessageResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
