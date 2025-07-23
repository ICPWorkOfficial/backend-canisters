import React, { createContext, useContext, useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import * as userApi from '../api/integration/userApi';
import * as projectApi from '../api/integration/projectApi';
import * as messagingApi from '../api/integration/messagingApi';
import * as paymentApi from '../api/integration/paymentApi';

// Create a mock identity for development
const mockIdentity = {
  getPrincipal: () => ({ toString: () => "2vxsx-fae" }), // Anonymous principal
  transformRequest: async (request) => request,
};

const ApiContext = creNateContext(null);

export const ApiProvider = ({ children }) => {
  // Always provide a mock identity and set authentication to true
  const [identity, setIdentity] = useState(mockIdentity);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Always authenticated
  const [isLoading, setIsLoading] = useState(false); // No loading state needed
  const [principal, setPrincipal] = useState("2vxsx-fae"); // Anonymous principal

  useEffect(() => {
    // No authentication check needed
    console.log("Mock authentication enabled");
  }, []);

  const login = async () => {
    console.log("Mock login - already authenticated");
    return mockIdentity;
  };

  const logout = async () => {
    console.log("Mock logout - staying authenticated for development");
  };

  // The API object that will be provided to components
  const api = {
    user: {
      ...userApi,
      // Override methods to automatically inject mock identity
      createUser: (username, fullName, email, skills) => 
        userApi.createUser(mockIdentity, username, fullName, email, skills),
      getUser: () => userApi.getUser(mockIdentity),
      updateUser: (username, fullName, email, skills, bio) => 
        userApi.updateUser(mockIdentity, username, fullName, email, skills, bio),
      getAllUsers: () => userApi.getAllUsers(mockIdentity),
      // Add method to get user by ID
      getUserById: (userId) => {
        // Mock implementation for development
        console.log(`Mock getting user by ID: ${userId}`);
        return Promise.resolve({
          id: userId,
          username: `user_${userId.substring(0, 5)}`,
          name: `User ${userId.substring(0, 5)}`,
          email: `user_${userId.substring(0, 5)}@example.com`,
          skills: ["JavaScript", "React", "ICP"],
          bio: "This is a mock user bio for development",
          created_at: Date.now() * 1000000,
          rating: 4.5,
          completed_projects: 3
        });
      }
    },
    project: {
      ...projectApi,
      // Override methods to automatically inject mock identity
      createProject: (title, description, budget, skillsRequired, deadlineDays, category) =>
        projectApi.createProject(mockIdentity, title, description, budget, skillsRequired, deadlineDays, category),
      getAllProjects: () => projectApi.getAllProjects(mockIdentity),
      getProject: (projectId) => projectApi.getProject(mockIdentity, projectId),
      submitProposal: (projectId, price, deliveryTime, coverLetter) => 
        projectApi.submitProposal(mockIdentity, projectId, price, deliveryTime, coverLetter),
      acceptProposal: (proposalId) => projectApi.acceptProposal(mockIdentity, proposalId),
      completeProject: (projectId) => projectApi.completeProject(mockIdentity, projectId),
      // Add methods for convenience
      getUserProjects: () => {
        // Mock implementation for development
        console.log("Mock getting user projects");
        return Promise.resolve([
          {
            id: "project-1",
            title: "Build ICP Frontend App",
            description: "Create a frontend for the ICP marketplace",
            budget: 50,
            status: "open",
            created_at: Date.now() * 1000000,
            skills_required: ["React", "JavaScript", "ICP"],
            proposals_count: 3,
            deadline_days: 30,
            category: "Web Development"
          },
          {
            id: "project-2",
            title: "Smart Contract Development",
            description: "Develop smart contracts for a DeFi application",
            budget: 100,
            status: "in_progress",
            created_at: (Date.now() - 5 * 24 * 60 * 60 * 1000) * 1000000,
            skills_required: ["Motoko", "Rust", "Smart Contracts"],
            proposals_count: 5,
            deadline_days: 15,
            category: "Smart Contract"
          }
        ]);
      },
      getUserProposals: () => {
        // Mock implementation for development
        console.log("Mock getting user proposals");
        return Promise.resolve([
          {
            id: "proposal-1",
            project_id: "project-3",
            status: "pending",
            price: 75,
            delivery_time: 14,
            cover_letter: "I'm excited to work on this project and have relevant experience.",
            created_at: Date.now() * 1000000
          },
          {
            id: "proposal-2",
            project_id: "project-4",
            status: "accepted",
            price: 120,
            delivery_time: 21,
            cover_letter: "I have completed similar projects in the past and can deliver high quality work.",
            created_at: (Date.now() - 3 * 24 * 60 * 60 * 1000) * 1000000
          }
        ]);
      }
    },
    messaging: {
      ...messagingApi,
      // Override methods to automatically inject mock identity
      sendMessage: (conversationId, content) => {
        console.log(`Mock sending message to conversation ${conversationId}: ${content}`);
        return Promise.resolve({
          id: `msg-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: principal,
          content: content,
          timestamp: Date.now() * 1000000,
          is_read: false
        });
      },
      getConversations: () => {
        console.log("Mock getting conversations");
        return Promise.resolve([
          {
            id: "conv-1",
            participants: ["2vxsx-fae", "user-1"],
            last_message: {
              content: "Hello there!",
              timestamp: Date.now() * 1000000,
              sender_id: "user-1"
            },
            unread_count: 1
          },
          {
            id: "conv-2",
            participants: ["2vxsx-fae", "user-2"],
            last_message: {
              content: "When can you start the project?",
              timestamp: (Date.now() - 1 * 60 * 60 * 1000) * 1000000,
              sender_id: "2vxsx-fae"
            },
            unread_count: 0
          }
        ]);
      },
      getMessages: (conversationId) => {
        console.log(`Mock getting messages for conversation ${conversationId}`);
        return Promise.resolve([
          {
            id: "msg-1",
            conversation_id: conversationId,
            sender_id: "user-1",
            content: "Hello there!",
            timestamp: (Date.now() - 2 * 60 * 60 * 1000) * 1000000
          },
          {
            id: "msg-2",
            conversation_id: conversationId,
            sender_id: "2vxsx-fae",
            content: "Hi! How can I help you with the project?",
            timestamp: (Date.now() - 1 * 60 * 60 * 1000) * 1000000
          }
        ]);
      }
    },
    payment: {
      ...paymentApi,
      // Override methods to automatically inject mock identity
      createEscrow: (projectId, freelancerPrincipal, amount) => 
        paymentApi.createEscrow(mockIdentity, projectId, freelancerPrincipal, amount),
      releasePayment: (escrowId) => paymentApi.releasePayment(mockIdentity, escrowId),
      requestRefund: (escrowId) => paymentApi.requestRefund(mockIdentity, escrowId),
      getEscrow: (escrowId) => paymentApi.getEscrow(mockIdentity, escrowId),
      getAllEscrows: () => {
        console.log("Mock getting all escrows");
        return Promise.resolve([
          {
            id: "escrow-1",
            project_id: "project-1",
            client: principal,
            freelancer: "user-1",
            amount: 50,
            status: "funded",
            created_at: Date.now() * 1000000
          },
          {
            id: "escrow-2",
            project_id: "project-2",
            client: "user-2",
            freelancer: principal,
            amount: 100,
            status: "completed",
            created_at: (Date.now() - 10 * 24 * 60 * 60 * 1000) * 1000000
          }
        ]);
      }
    },
    auth: {
      login,
      logout,
      isAuthenticated,
      isLoading,
      identity,
      principal
    }
  };

  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
