// src/api/integration/userApi.js
import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { readFile } from 'fs/promises';

// Get the appropriate idlFactory based on environment
const getIdlFactory = async () => {
  try {
    const { idlFactory } = await import('../../declarations/user_management/user_management.did.js');
    return idlFactory;
  } catch (error) {
    const { idlFactory } = await import('../../../.dfx/local/canisters/user_management/service.did.js');
    return idlFactory;
  }
};

// Get canister ID dynamically
const getCanisterId = async () => {
  try {
    // Try environment variable first
    if (process.env.CANISTER_ID_USER_MANAGEMENT) {
      return process.env.CANISTER_ID_USER_MANAGEMENT;
    }
    
    // Otherwise read from canister_ids.json
    const canisterIdsPath = './.dfx/local/canister_ids.json';
    const data = await readFile(canisterIdsPath, 'utf8');
    const canisterIds = JSON.parse(data);
    
    // Get the appropriate network
    const network = process.env.DFX_NETWORK || 'local';
    return canisterIds.user_management[network];
  } catch (error) {
    console.error("Error reading user_management canister ID:", error);
    throw new Error("Could not find user_management canister ID");
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
    console.error("Failed to initialize user API:", error);
    throw error;
  }
};

// User Management API
export const userApi = {
  initialize,
  
  // Create a new user
  createUser: async (identity, username, fullName, email, skills = []) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.createUser(username, fullName, email, skills);
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
  
  // Get user by principal
  getUser: async (identity, userPrincipal = null) => {
    const { actor } = await initialize(identity);
    try {
      // If no principal provided, get the caller's own info
      const principal = userPrincipal ? Principal.fromText(userPrincipal) : undefined;
      const result = await actor.getUser(principal);
      return result;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  },
  
  // Update user profile
  updateUser: async (identity, username, fullName, email, skills = []) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.updateUser(username, fullName, email, skills);
      return result;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },
  
  // Verify a user (e.g., email verification)
  verifyUser: async (identity, userPrincipal) => {
    const { actor } = await initialize(identity);
    try {
      const principal = Principal.fromText(userPrincipal);
      const result = await actor.verifyUser(principal);
      return result;
    } catch (error) {
      console.error("Error verifying user:", error);
      throw error;
    }
  },
  
  // Update user rating
  updateRating: async (identity, userPrincipal, rating) => {
    const { actor } = await initialize(identity);
    try {
      const principal = Principal.fromText(userPrincipal);
      const result = await actor.updateRating(principal, rating);
      return result;
    } catch (error) {
      console.error("Error updating user rating:", error);
      throw error;
    }
  },
  
  // Search users by skill
  searchUsersBySkill: async (identity, skill) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.searchUsersBySkill(skill);
      return result;
    } catch (error) {
      console.error("Error searching users by skill:", error);
      throw error;
    }
  },
  
  // Get all users
  getAllUsers: async (identity) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getAllUsers();
      return result;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }
};
