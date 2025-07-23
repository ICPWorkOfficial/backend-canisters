// src/api/integration/projectApi.js
import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { readFile } from 'fs/promises';

// Get the appropriate idlFactory based on environment
const getIdlFactory = async () => {
  try {
    const { idlFactory } = await import('../../declarations/project_management/project_management.did.js');
    return idlFactory;
  } catch (error) {
    const { idlFactory } = await import('../../../.dfx/local/canisters/project_management/service.did.js');
    return idlFactory;
  }
};

// Get canister ID dynamically
const getCanisterId = async () => {
  try {
    // Try environment variable first
    if (process.env.CANISTER_ID_PROJECT_MANAGEMENT) {
      return process.env.CANISTER_ID_PROJECT_MANAGEMENT;
    }
    
    // Otherwise read from canister_ids.json
    const canisterIdsPath = './.dfx/local/canister_ids.json';
    const data = await readFile(canisterIdsPath, 'utf8');
    const canisterIds = JSON.parse(data);
    
    // Get the appropriate network
    const network = process.env.DFX_NETWORK || 'local';
    return canisterIds.project_management[network];
  } catch (error) {
    console.error("Error reading project_management canister ID:", error);
    throw new Error("Could not find project_management canister ID");
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
    console.error("Failed to initialize project API:", error);
    throw error;
  }
};

// Project Management API
export const projectApi = {
  initialize,
  
  // Create a new project
  createProject: async (identity, title, description, budget, category, skills = []) => {
    const { actor } = await initialize(identity);
    try {
      // Convert budget to bigint if it's not already
      const budgetBigInt = typeof budget === 'bigint' ? budget : BigInt(budget);
      const result = await actor.createProject(title, description, budgetBigInt, category, skills);
      return result;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },
  
  // Get a specific project by ID
  getProject: async (identity, projectId) => {
    const { actor } = await initialize(identity);
    try {
      // Convert projectId to bigint if it's not already
      const projectIdBigInt = typeof projectId === 'bigint' ? projectId : BigInt(projectId);
      const result = await actor.getProject(projectIdBigInt);
      return result;
    } catch (error) {
      console.error("Error getting project:", error);
      throw error;
    }
  },
  
  // Get all projects
  getAllProjects: async (identity) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getAllProjects();
      return result;
    } catch (error) {
      console.error("Error getting all projects:", error);
      throw error;
    }
  },
  
  // Get projects by client
  getClientProjects: async (identity) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getClientProjects();
      return result;
    } catch (error) {
      console.error("Error getting client projects:", error);
      throw error;
    }
  },
  
  // Get projects by freelancer
  getFreelancerProjects: async (identity) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.getFreelancerProjects();
      return result;
    } catch (error) {
      console.error("Error getting freelancer projects:", error);
      throw error;
    }
  },
  
  // Submit a proposal for a project
  submitProposal: async (identity, projectId, price, description, estimatedCompletionTime) => {
    const { actor } = await initialize(identity);
    try {
      // Convert values to bigint where needed
      const projectIdBigInt = typeof projectId === 'bigint' ? projectId : BigInt(projectId);
      const priceBigInt = typeof price === 'bigint' ? price : BigInt(price);
      const timeInt = typeof estimatedCompletionTime === 'bigint' ? 
        estimatedCompletionTime : BigInt(estimatedCompletionTime);
      
      // Canister expects (projectId, bid_amount, delivery_time, cover_letter)
      const result = await actor.submitProposal(
        projectIdBigInt, 
        priceBigInt, 
        timeInt,       // delivery time as BigInt (Nat)
        description    // cover letter as Text
      );
      return result;
    } catch (error) {
      console.error("Error submitting proposal:", error);
      throw error;
    }
  },
  
  // Get proposals for a project
  getProjectProposals: async (identity, projectId) => {
    const { actor } = await initialize(identity);
    try {
      const projectIdBigInt = typeof projectId === 'bigint' ? projectId : BigInt(projectId);
      const result = await actor.getProjectProposals(projectIdBigInt);
      return result;
    } catch (error) {
      console.error("Error getting project proposals:", error);
      throw error;
    }
  },
  
  // Accept a proposal
  acceptProposal: async (identity, projectId, proposalId) => {
    const { actor } = await initialize(identity);
    try {
      // According to the canister interface, acceptProposal only takes the proposalId
      const proposalIdBigInt = typeof proposalId === 'bigint' ? proposalId : BigInt(proposalId);
      const result = await actor.acceptProposal(proposalIdBigInt);
      return result;
    } catch (error) {
      console.error("Error accepting proposal:", error);
      throw error;
    }
  },
  
  // Update project status
  updateProjectStatus: async (identity, projectId, status) => {
    const { actor } = await initialize(identity);
    try {
      const projectIdBigInt = typeof projectId === 'bigint' ? projectId : BigInt(projectId);
      const result = await actor.updateProjectStatus(projectIdBigInt, status);
      return result;
    } catch (error) {
      console.error("Error updating project status:", error);
      throw error;
    }
  },
  
  // Add status update to a project
  addStatusUpdate: async (identity, projectId, message) => {
    const { actor } = await initialize(identity);
    try {
      const projectIdBigInt = typeof projectId === 'bigint' ? projectId : BigInt(projectId);
      const result = await actor.addStatusUpdate(projectIdBigInt, message);
      return result;
    } catch (error) {
      console.error("Error adding status update:", error);
      throw error;
    }
  },
  
  // Get status updates for a project
  getStatusUpdates: async (identity, projectId) => {
    const { actor } = await initialize(identity);
    try {
      const projectIdBigInt = typeof projectId === 'bigint' ? projectId : BigInt(projectId);
      const result = await actor.getStatusUpdates(projectIdBigInt);
      return result;
    } catch (error) {
      console.error("Error getting status updates:", error);
      throw error;
    }
  },
  
  // Search projects by category
  searchProjectsByCategory: async (identity, category) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.searchProjectsByCategory(category);
      return result;
    } catch (error) {
      console.error("Error searching projects by category:", error);
      throw error;
    }
  },
  
  // Search projects by skill
  searchProjectsBySkill: async (identity, skill) => {
    const { actor } = await initialize(identity);
    try {
      const result = await actor.searchProjectsBySkill(skill);
      return result;
    } catch (error) {
      console.error("Error searching projects by skill:", error);
      throw error;
    }
  }
};
