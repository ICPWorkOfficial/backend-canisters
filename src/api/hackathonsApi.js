// src/api/hackathonsApi.js
import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { readFile } from 'fs/promises';

// Get the appropriate idlFactory based on environment
const getIdlFactory = async () => {
  try {
    const { idlFactory } = await import('../declarations/hackathons/hackathons.did.js');
    return idlFactory;
  } catch (error) {
    const { idlFactory } = await import('../../.dfx/local/canisters/hackathons/service.did.js');
    return idlFactory;
  }
};

// Get canister ID dynamically
const getCanisterId = async () => {
  try {
    // Try environment variable first
    if (process.env.CANISTER_ID_HACKATHONS) {
      return process.env.CANISTER_ID_HACKATHONS;
    }
    
    // Otherwise read from canister_ids.json
    const canisterIdsPath = './.dfx/local/canister_ids.json';
    const data = await readFile(canisterIdsPath, 'utf8');
    const canisterIds = JSON.parse(data);
    
    // Get the appropriate network
    const network = process.env.DFX_NETWORK || 'local';
    return canisterIds.hackathons[network];
  } catch (error) {
    console.error("Error reading hackathons canister ID:", error);
    throw new Error("Could not find hackathons canister ID");
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
    console.error("Failed to initialize hackathons API:", error);
    throw error;
  }
};

// Hackathons Management API
export const hackathonsApi = {
  initialize,
  
  // Create a new hackathon
  createHackathon: async (identity, title, description, startDate, endDate, location, 
    locationType, registrationDeadline, maxParticipants, prizePool, categories = []) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.createHackathon(
        title, description, startDate, endDate, location, locationType, 
        registrationDeadline, maxParticipants, prizePool, categories
      );
      return result;
    } catch (error) {
      console.error("Error creating hackathon:", error);
      throw error;
    }
  },
  
  // Get hackathon by ID
  getHackathon: async (identity, hackathonId) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getHackathon(hackathonId);
      return result;
    } catch (error) {
      console.error("Error getting hackathon:", error);
      throw error;
    }
  },
  
  // Get all hackathons
  getAllHackathons: async (identity) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getAllHackathons();
      return result;
    } catch (error) {
      console.error("Error getting all hackathons:", error);
      throw error;
    }
  },
  
  // Get hackathons by status
  getHackathonsByStatus: async (identity, status) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getHackathonsByStatus(status);
      return result;
    } catch (error) {
      console.error("Error getting hackathons by status:", error);
      throw error;
    }
  },
  
  // Update hackathon status
  updateHackathonStatus: async (identity, hackathonId, newStatus) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.updateHackathonStatus(hackathonId, newStatus);
      return result;
    } catch (error) {
      console.error("Error updating hackathon status:", error);
      throw error;
    }
  },
  
  // Register for a hackathon
  registerForHackathon: async (identity, hackathonId, teamName = null) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.registerForHackathon(hackathonId, teamName);
      return result;
    } catch (error) {
      console.error("Error registering for hackathon:", error);
      throw error;
    }
  },
  
  // Get participants for a hackathon
  getHackathonParticipants: async (identity, hackathonId) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getHackathonParticipants(hackathonId);
      return result;
    } catch (error) {
      console.error("Error getting hackathon participants:", error);
      throw error;
    }
  },
  
  // Create a project for a hackathon
  createHackathonProject: async (identity, hackathonId, title, description, teamMembers = []) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.createProject(hackathonId, title, description, teamMembers);
      return result;
    } catch (error) {
      console.error("Error creating hackathon project:", error);
      throw error;
    }
  },
  
  // Update a project
  updateProject: async (identity, hackathonId, projectId, title, description, submissionLink) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.updateProject(hackathonId, projectId, title, description, submissionLink);
      return result;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },
  
  // Submit a project
  submitProject: async (identity, hackathonId, projectId, submissionLink) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.submitProject(hackathonId, projectId, submissionLink);
      return result;
    } catch (error) {
      console.error("Error submitting project:", error);
      throw error;
    }
  },
  
  // Get projects for a hackathon
  getHackathonProjects: async (identity, hackathonId) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getHackathonProjects(hackathonId);
      return result;
    } catch (error) {
      console.error("Error getting hackathon projects:", error);
      throw error;
    }
  },
  
  // Update project status (for organizers)
  updateProjectStatus: async (identity, hackathonId, projectId, newStatus) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.updateProjectStatus(hackathonId, projectId, newStatus);
      return result;
    } catch (error) {
      console.error("Error updating project status:", error);
      throw error;
    }
  },
  
  // Check registration status
  checkRegistrationStatus: async (identity, hackathonId) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.checkRegistrationStatus(hackathonId);
      return result;
    } catch (error) {
      console.error("Error checking registration status:", error);
      throw error;
    }
  },
  
  // Get upcoming hackathons
  getUpcomingHackathons: async (identity) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getUpcomingHackathons();
      return result;
    } catch (error) {
      console.error("Error getting upcoming hackathons:", error);
      throw error;
    }
  },
  
  // Get ongoing hackathons
  getOngoingHackathons: async (identity) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getOngoingHackathons();
      return result;
    } catch (error) {
      console.error("Error getting ongoing hackathons:", error);
      throw error;
    }
  },
  
  // Get completed hackathons
  getCompletedHackathons: async (identity) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getCompletedHackathons();
      return result;
    } catch (error) {
      console.error("Error getting completed hackathons:", error);
      throw error;
    }
  }
};
