// src/api/integration/index.js
import { userApi } from '../../temp/userApi.js';
import { projectApi } from '../../temp/projectApi.js';
import { messagingApi } from '../../temp/messagingApi.js';
import { paymentApi } from '../../temp/paymentApi.js';

// Export a unified interface to all canister APIs
export {
  userApi,
  projectApi,
  messagingApi,
  paymentApi
};

// Export a function to initialize all APIs at once
export const initializeAllApis = async (identity = null) => {
  const user = await userApi.initialize(identity);
  const project = await projectApi.initialize(identity);
  const messaging = await messagingApi.initialize(identity);
  const payment = await paymentApi.initialize(identity);
  
  return {
    user,
    project,
    messaging,
    payment
  };
};

// Workflow helper functions for common multi-canister operations
export const workflows = {
  // Complete project flow from creation to payment
  createProjectFlow: async (apis, projectData, proposalData, paymentData) => {
    try {
      // 1. Create a project
      const projectResult = await apis.project.createProject(
        projectData.title,
        projectData.description,
        projectData.budget,
        projectData.category,
        projectData.skills
      );
      
      if (!projectResult.ok) {
        throw new Error(`Failed to create project: ${JSON.stringify(projectResult.err)}`);
      }
      
      const projectId = projectResult.ok.id;
      console.log(`Created project with ID: ${projectId}`);
      
      // 2. Submit a proposal
      const proposalResult = await apis.project.submitProposal(
        projectId,
        proposalData.price,
        proposalData.description,
        proposalData.estimatedCompletionTime
      );
      
      if (!proposalResult.ok) {
        throw new Error(`Failed to submit proposal: ${JSON.stringify(proposalResult.err)}`);
      }
      
      const proposalId = proposalResult.ok;
      console.log(`Submitted proposal with ID: ${proposalId}`);
      
      // 3. Accept the proposal (typically would be done by the client)
      const acceptResult = await apis.project.acceptProposal(projectId, proposalId);
      console.log(`Proposal acceptance result: ${JSON.stringify(acceptResult)}`);
      
      // 4. Create an escrow
      const escrowResult = await apis.payment.createEscrow(
        projectId,
        paymentData.amount,
        paymentData.freelancerPrincipal
      );
      console.log(`Escrow creation result: ${JSON.stringify(escrowResult)}`);
      
      // 5. Create a messaging thread
      const threadResult = await apis.messaging.createThread(
        "Project Discussion",
        [paymentData.freelancerPrincipal], // participants
        projectId.toString() // reference
      );
      console.log(`Messaging thread created: ${JSON.stringify(threadResult)}`);
      
      return {
        projectId,
        proposalId,
        escrowId: escrowResult.ok,
        threadId: threadResult.ok
      };
    } catch (error) {
      console.error("Error in project flow:", error);
      throw error;
    }
  },
  
  // Complete project delivery and payment flow
  completeProjectFlow: async (apis, projectId, escrowId) => {
    try {
      // 1. Mark project as completed
      const completionResult = await apis.project.updateProjectStatus(projectId, { Completed: null });
      console.log(`Project marked as completed: ${JSON.stringify(completionResult)}`);
      
      // 2. Release payment from escrow
      const releaseResult = await apis.payment.releaseEscrow(escrowId);
      console.log(`Payment released: ${JSON.stringify(releaseResult)}`);
      
      // 3. Update user ratings
      // (This would typically include getting the client and freelancer principals from the project)
      
      return {
        completionResult,
        releaseResult
      };
    } catch (error) {
      console.error("Error in completion flow:", error);
      throw error;
    }
  },
  
  // Handle dispute resolution
  disputeResolutionFlow: async (apis, projectId, escrowId, resolution) => {
    try {
      // 1. Raise a dispute
      const disputeResult = await apis.payment.disputeEscrow(escrowId);
      console.log(`Dispute raised: ${JSON.stringify(disputeResult)}`);
      
      // 2. Resolve based on provided resolution (refund or release)
      let resolutionResult;
      if (resolution === 'refund') {
        resolutionResult = await apis.payment.refundEscrow(escrowId);
        console.log(`Payment refunded: ${JSON.stringify(resolutionResult)}`);
      } else if (resolution === 'release') {
        resolutionResult = await apis.payment.releaseEscrow(escrowId);
        console.log(`Payment released despite dispute: ${JSON.stringify(resolutionResult)}`);
      }
      
      // 3. Update project status accordingly
      const statusResult = await apis.project.updateProjectStatus(
        projectId, 
        resolution === 'refund' ? { Cancelled: null } : { Completed: null }
      );
      console.log(`Project status updated: ${JSON.stringify(statusResult)}`);
      
      return {
        disputeResult,
        resolutionResult,
        statusResult
      };
    } catch (error) {
      console.error("Error in dispute resolution flow:", error);
      throw error;
    }
  }
};
