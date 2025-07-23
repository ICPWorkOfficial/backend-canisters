// src/api/integration/paymentApi.js
import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { readFile } from 'fs/promises';

// Get the appropriate idlFactory based on environment
const getIdlFactory = async () => {
  try {
    const { idlFactory } = await import('../../declarations/payment_escrow/payment_escrow.did.js');
    return idlFactory;
  } catch (error) {
    const { idlFactory } = await import('../../../.dfx/local/canisters/payment_escrow/service.did.js');
    return idlFactory;
  }
};

// Get canister ID dynamically
const getCanisterId = async () => {
  try {
    // Try environment variable first
    if (process.env.CANISTER_ID_PAYMENT_ESCROW) {
      return process.env.CANISTER_ID_PAYMENT_ESCROW;
    }
    
    // Otherwise read from canister_ids.json
    const canisterIdsPath = './.dfx/local/canister_ids.json';
    const data = await readFile(canisterIdsPath, 'utf8');
    const canisterIds = JSON.parse(data);
    
    // Get the appropriate network
    const network = process.env.DFX_NETWORK || 'local';
    return canisterIds.payment_escrow[network];
  } catch (error) {
    console.error("Error reading payment_escrow canister ID:", error);
    throw new Error("Could not find payment_escrow canister ID");
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
    console.error("Failed to initialize payment escrow API:", error);
    throw error;
  }
};

// Payment Escrow API
export const paymentApi = {
  initialize,
  
  // Create a new escrow for a project
  createEscrow: async (identity, projectId, freelancerPrincipal, amount) => {
    const { actor } = await initialize(identity);
    try {
      // Convert projectId to BigInt
      const projectIdBigInt = typeof projectId === 'bigint' ? projectId : BigInt(projectId);
      
      // Convert amount to BigInt
      const amountBigInt = typeof amount === 'bigint' ? amount : BigInt(amount);
      
      // Handle the freelancer principal properly
      let freelancer;
      if (typeof freelancerPrincipal === 'string') {
        // If it's a string, convert it to a Principal object
        freelancer = Principal.fromText(freelancerPrincipal);
      } else if (freelancerPrincipal instanceof Principal) {
        // If it's already a Principal object, use it as is
        freelancer = freelancerPrincipal;
      } else {
        // If it's something else, throw an error
        throw new Error(`Invalid freelancer principal type: ${typeof freelancerPrincipal}`);
      }
      
      // Use snake_case function name to match canister interface
      const result = await actor.create_escrow(projectIdBigInt, freelancer, amountBigInt);
      return result;
    } catch (error) {
      console.error("Error creating escrow:", error);
      throw error;
    }
  },
  
  // Deposit funds to escrow
  depositToEscrow: async (identity, escrowId) => {
    const { actor } = await initialize(identity);
    try {
      const escrowIdBigInt = typeof escrowId === 'bigint' ? escrowId : BigInt(escrowId);
      // Use snake_case function name to match canister interface
      const result = await actor.deposit_to_escrow(escrowIdBigInt);
      return result;
    } catch (error) {
      console.error("Error depositing to escrow:", error);
      throw error;
    }
  },

  // Release funds from escrow to freelancer
  releaseEscrow: async (identity, escrowId) => {
    const { actor } = await initialize(identity);
    try {
      const escrowIdBigInt = typeof escrowId === 'bigint' ? escrowId : BigInt(escrowId);
      // Use snake_case function name to match canister interface
      const result = await actor.release_payment(escrowIdBigInt);
      return result;
    } catch (error) {
      console.error("Error releasing escrow payment:", error);
      throw error;
    }
  },
  
  // Refund funds from escrow back to client
  refundEscrow: async (identity, escrowId) => {
    const { actor } = await initialize(identity);
    try {
      const escrowIdBigInt = typeof escrowId === 'bigint' ? escrowId : BigInt(escrowId);
      // Use snake_case function name to match canister interface
      const result = await actor.refund_payment(escrowIdBigInt);
      return result;
    } catch (error) {
      console.error("Error refunding escrow payment:", error);
      throw error;
    }
  },
  
  // Dispute an escrow payment
  disputeEscrow: async (identity, escrowId) => {
    const { actor } = await initialize(identity);
    try {
      const escrowIdBigInt = typeof escrowId === 'bigint' ? escrowId : BigInt(escrowId);
      // Use snake_case function name to match canister interface
      const result = await actor.dispute_payment(escrowIdBigInt);
      return result;
    } catch (error) {
      console.error("Error disputing escrow payment:", error);
      throw error;
    }
  },
  
  // Get payment by ID
  getPayment: async (identity, paymentId) => {
    const { actor } = await initialize(identity);
    try {
      const paymentIdBigInt = typeof paymentId === 'bigint' ? paymentId : BigInt(paymentId);
      // Use snake_case function name to match canister interface
      const result = await actor.get_payment(paymentIdBigInt);
      return result;
    } catch (error) {
      console.error("Error getting payment:", error);
      throw error;
    }
  },
  
  // Get payments for a project
  getProjectPayments: async (identity, projectId) => {
    const { actor } = await initialize(identity);
    try {
      const projectIdBigInt = typeof projectId === 'bigint' ? projectId : BigInt(projectId);
      // Use snake_case function name to match canister interface
      const result = await actor.get_project_payments(projectIdBigInt);
      return result;
    } catch (error) {
      console.error("Error getting project payments:", error);
      throw error;
    }
  },
  
  // Get payments for a client
  getClientPayments: async (identity, clientPrincipal) => {
    const { actor } = await initialize(identity);
    try {
      const clientPrinc = typeof clientPrincipal === 'string' 
        ? Principal.fromText(clientPrincipal) 
        : clientPrincipal;
      // Use snake_case function name to match canister interface  
      const result = await actor.get_client_payments(clientPrinc);
      return result;
    } catch (error) {
      console.error("Error getting client payments:", error);
      throw error;
    }
  },
  
  // Get payments for a freelancer
  getFreelancerPayments: async (identity, freelancerPrincipal) => {
    const { actor } = await initialize(identity);
    try {
      const freelancerPrinc = typeof freelancerPrincipal === 'string' 
        ? Principal.fromText(freelancerPrincipal) 
        : freelancerPrincipal;
      // Use snake_case function name to match canister interface
      const result = await actor.get_freelancer_payments(freelancerPrinc);
      return result;
    } catch (error) {
      console.error("Error getting freelancer payments:", error);
      throw error;
    }
  }
};
