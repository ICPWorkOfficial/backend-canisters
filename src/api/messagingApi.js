// src/api/integration/messagingApi.js
import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { readFile } from 'fs/promises';

// Get the appropriate idlFactory based on environment
const getIdlFactory = async () => {
  try {
    const { idlFactory } = await import('../../declarations/messaging_system/messaging_system.did.js');
    return idlFactory;
  } catch (error) {
    const { idlFactory } = await import('../../../.dfx/local/canisters/messaging_system/service.did.js');
    return idlFactory;
  }
};

// Get canister ID dynamically
const getCanisterId = async () => {
  try {
    // Try environment variable first
    if (process.env.CANISTER_ID_MESSAGING_SYSTEM) {
      return process.env.CANISTER_ID_MESSAGING_SYSTEM;
    }
    
    // Otherwise read from canister_ids.json
    const canisterIdsPath = './.dfx/local/canister_ids.json';
    const data = await readFile(canisterIdsPath, 'utf8');
    const canisterIds = JSON.parse(data);
    
    // Get the appropriate network
    const network = process.env.DFX_NETWORK || 'local';
    return canisterIds.messaging_system[network];
  } catch (error) {
    console.error("Error reading messaging_system canister ID:", error);
    throw new Error("Could not find messaging_system canister ID");
  }
};

// Initialize the API
const initialize = async (identity = null) => {
  try {
    const canisterId = await getCanisterId();
    const idlFactory = await getIdlFactory();
    
    // Create an agent for authentication
    const agent = new HttpAgent({
      identity,
      host: process.env.DFX_NETWORK === 'ic' 
        ? 'https://ic0.app' 
        : 'http://127.0.0.1:4943',
    });

    // If local network, fetch root key for certificate validation
    if (process.env.DFX_NETWORK !== 'ic') {
      await agent.fetchRootKey();
    }

    // Create the actor that interfaces with the canister
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });

    return {
      actor,
      canisterId
    };
  } catch (error) {
    console.error("Failed to initialize messaging API:", error);
    throw error;
  }
};

// Messaging System API
export const messagingApi = {
  initialize,
  
  // Create a new messaging thread
  createThread: async (identity, title, participantPrincipals = [], reference = "") => {
    const { actor } = await initialize(identity);
    try {
      // Convert string principals to Principal objects
      const participants = participantPrincipals.map(p => 
        typeof p === 'string' ? Principal.fromText(p) : p
      );
      const result = await actor.createThread(title, participants, reference);
      return result;
    } catch (error) {
      console.error("Error creating thread:", error);
      throw error;
    }
  },
  
  // Send a message in a thread
  sendMessage: async (identity, threadId, content) => {
    const { actor } = await initialize(identity);
    try {
      const threadIdBigInt = typeof threadId === 'bigint' ? threadId : BigInt(threadId);
      const result = await actor.sendMessage(threadIdBigInt, content);
      return result;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
  
  // Get all messages in a thread
  getThreadMessages: async (identity, threadId) => {
    const { actor } = await initialize(identity);
    try {
      const threadIdBigInt = typeof threadId === 'bigint' ? threadId : BigInt(threadId);
      const result = await actor.getThreadMessages(threadIdBigInt);
      return result;
    } catch (error) {
      console.error("Error getting thread messages:", error);
      throw error;
    }
  },
  
  // Mark messages as read
  markMessagesAsRead: async (identity, threadId, messageIds = []) => {
    const { actor } = await initialize(identity);
    try {
      const threadIdBigInt = typeof threadId === 'bigint' ? threadId : BigInt(threadId);
      const messageIdsBigInt = messageIds.map(id => 
        typeof id === 'bigint' ? id : BigInt(id)
      );
      const result = await actor.markMessagesAsRead(threadIdBigInt, messageIdsBigInt);
      return result;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  },
  
  // Get all threads for the current user
  getUserThreads: async (identity) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getUserThreads();
      return result;
    } catch (error) {
      console.error("Error getting user threads:", error);
      throw error;
    }
  },
  
  // Get threads by reference (e.g., project ID)
  getThreadsByReference: async (identity, reference) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getThreadsByReference(reference);
      return result;
    } catch (error) {
      console.error("Error getting threads by reference:", error);
      throw error;
    }
  },
  
  // Get unread message count for a thread
  getUnreadCount: async (identity, threadId) => {
    const { actor } = await initialize(identity);
    try {
      const threadIdBigInt = typeof threadId === 'bigint' ? threadId : BigInt(threadId);
      const result = await actor.getUnreadCount(threadIdBigInt);
      return result;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  },
  
  // Get total unread messages for the user
  getTotalUnreadCount: async (identity) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getTotalUnreadCount();
      return result;
    } catch (error) {
      console.error("Error getting total unread count:", error);
      throw error;
    }
  },
  
  // Add participants to a thread
  addParticipants: async (identity, threadId, participantPrincipals = []) => {
    const { actor } = await initialize(identity);
    try {
      const threadIdBigInt = typeof threadId === 'bigint' ? threadId : BigInt(threadId);
      // Convert string principals to Principal objects
      const participants = participantPrincipals.map(p => 
        typeof p === 'string' ? Principal.fromText(p) : p
      );
      const result = await actor.addParticipants(threadIdBigInt, participants);
      return result;
    } catch (error) {
      console.error("Error adding participants:", error);
      throw error;
    }
  }
};
