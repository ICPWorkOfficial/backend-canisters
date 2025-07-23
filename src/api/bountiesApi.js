// src/api/bountiesApi.js
import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { readFile } from 'fs/promises';

// Get the appropriate idlFactory based on environment
const getIdlFactory = async () => {
  try {
    const { idlFactory } = await import('../declarations/bounties/bounties.did.js');
    return idlFactory;
  } catch (error) {
    const { idlFactory } = await import('../../.dfx/local/canisters/bounties/service.did.js');
    return idlFactory;
  }
};

// Get canister ID dynamically
const getCanisterId = async () => {
  try {
    // Try environment variable first
    if (process.env.CANISTER_ID_BOUNTIES) {
      return process.env.CANISTER_ID_BOUNTIES;
    }
    
    // Otherwise read from canister_ids.json
    const canisterIdsPath = './.dfx/local/canister_ids.json';
    const data = await readFile(canisterIdsPath, 'utf8');
    const canisterIds = JSON.parse(data);
    
    // Get the appropriate network
    const network = process.env.DFX_NETWORK || 'local';
    return canisterIds.bounties[network];
  } catch (error) {
    console.error("Error reading bounties canister ID:", error);
    throw new Error("Could not find bounties canister ID");
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
    console.error("Failed to initialize bounties API:", error);
    throw error;
  }
};

// Bounties Management API
export const bountiesApi = {
  initialize,
  
  // Create a new bounty
  createBounty: async (identity, title, description, reward, category, deadline) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.createBounty(title, description, reward, category, deadline);
      return result;
    } catch (error) {
      console.error("Error creating bounty:", error);
      throw error;
    }
  },
  
  // Get bounty by ID
  getBounty: async (identity, bountyId) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getBounty(bountyId);
      return result;
    } catch (error) {
      console.error("Error getting bounty:", error);
      throw error;
    }
  },
  
  // Get all bounties
  getAllBounties: async (identity) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getAllBounties();
      return result;
    } catch (error) {
      console.error("Error getting all bounties:", error);
      throw error;
    }
  },
  
  // Get bounties by category
  getBountiesByCategory: async (identity, category) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getBountiesByCategory(category);
      return result;
    } catch (error) {
      console.error("Error getting bounties by category:", error);
      throw error;
    }
  },
  
  // Get bounties by status
  getBountiesByStatus: async (identity, status) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getBountiesByStatus(status);
      return result;
    } catch (error) {
      console.error("Error getting bounties by status:", error);
      throw error;
    }
  },
  
  // Update bounty status
  updateBountyStatus: async (identity, bountyId, newStatus) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.updateBountyStatus(bountyId, newStatus);
      return result;
    } catch (error) {
      console.error("Error updating bounty status:", error);
      throw error;
    }
  },
  
  // Submit solution for a bounty
  submitBountySolution: async (identity, bountyId, description, submissionLink) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.submitSolution(bountyId, description, submissionLink);
      return result;
    } catch (error) {
      console.error("Error submitting bounty solution:", error);
      throw error;
    }
  },
  
  // Get submissions for a bounty
  getBountySubmissions: async (identity, bountyId) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getBountySubmissions(bountyId);
      return result;
    } catch (error) {
      console.error("Error getting bounty submissions:", error);
      throw error;
    }
  },
  
  // Accept a submission
  acceptSubmission: async (identity, bountyId, submissionId) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.acceptSubmission(bountyId, submissionId);
      return result;
    } catch (error) {
      console.error("Error accepting submission:", error);
      throw error;
    }
  },
  
  // Reject a submission
  rejectSubmission: async (identity, bountyId, submissionId) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.rejectSubmission(bountyId, submissionId);
      return result;
    } catch (error) {
      console.error("Error rejecting submission:", error);
      throw error;
    }
  },
  
  // Check if bounty is expired
  isBountyExpired: async (identity, bountyId) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.isBountyExpired(bountyId);
      return result;
    } catch (error) {
      console.error("Error checking if bounty is expired:", error);
      throw error;
    }
  }
};
