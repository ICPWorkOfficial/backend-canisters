// src/utils/icpTestFlow.js
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { 
  createUser,
  getUser,
  getAllUsers
} from '../api/icp/userManager.js';
import { 
  createProject, 
  getProject,
  submitProposal,
  getProposalsByProject,
  acceptProposal,
  completeProject 
} from '../api/icp/projectManager.js';
import { 
  createEscrow,
  depositToEscrow,
  releasePayment,
  getPayment 
} from '../api/icp/paymentEscrow.js';
import {
  createThread,
  sendMessage,
  getThreadMessages
} from '../api/icp/messagingSystem.js';

// Helper to create a test identity
const createTestIdentity = () => {
  // Generate a random identity for testing
  return Ed25519KeyIdentity.generate();
};

// Complete end-to-end test flow
export const runFullTestFlow = async () => {
  try {
    console.log('Starting full test flow...');
    
    // Create test identities
    console.log('Creating test identities...');
    const clientIdentity = createTestIdentity();
    const freelancerIdentity = createTestIdentity();
    
    // 1. Create users
    console.log('Creating users...');
    const client = await createUser(
      'Test Client',
      'client@example.com',
      ['business', 'marketing'],
      0, // Hourly rate is 0 for clients
      clientIdentity
    );
    console.log('Client created:', client);
    
    const freelancer = await createUser(
      'Test Freelancer',
      'freelancer@example.com',
      ['web development', 'design', 'javascript'],
      50, // $50 hourly rate
      freelancerIdentity
    );
    console.log('Freelancer created:', freelancer);
    
    // 2. Create project (as client)
    console.log('Creating project...');
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    
    const project = await createProject(
      'Build Website Landing Page',
      'Create a modern landing page with React and Tailwind CSS',
      1000, // $1000 budget
      ['web development', 'react', 'tailwind'],
      oneMonthLater,
      clientIdentity
    );
    console.log('Project created:', project);
    
    // 3. Submit proposal (as freelancer)
    console.log('Submitting proposal...');
    const proposal = await submitProposal(
      project.id,
      950, // $950 bid
      'I would love to work on this project. I have extensive experience with React and Tailwind CSS.',
      14, // 14 days estimated duration
      freelancerIdentity
    );
    console.log('Proposal submitted:', proposal);
    
    // 4. Accept proposal (as client)
    console.log('Accepting proposal...');
    const updatedProject = await acceptProposal(
      proposal.id,
      clientIdentity
    );
    console.log('Proposal accepted, project updated:', updatedProject);
    
    // 5. Create escrow for payment (as client)
    console.log('Creating payment escrow...');
    const payment = await createEscrow(
      project.id,
      freelancer.principal.toString(),
      updatedProject.budget,
      clientIdentity
    );
    console.log('Payment escrow created:', payment);
    
    // 6. Deposit to escrow (as client)
    console.log('Depositing to escrow...');
    const escrowedPayment = await depositToEscrow(
      payment.id,
      clientIdentity
    );
    console.log('Deposit to escrow complete:', escrowedPayment);
    
    // 7. Create message thread (as client)
    console.log('Creating message thread...');
    const thread = await createThread(
      `Discussion: ${project.title}`,
      [client.principal.toString(), freelancer.principal.toString()],
      project.id,
      clientIdentity
    );
    console.log('Thread created:', thread);
    
    // 8. Send message (as client)
    console.log('Sending message...');
    const message = await sendMessage(
      thread.id,
      freelancer.principal.toString(),
      'Hi! I just accepted your proposal and created the escrow payment. When can you start?',
      clientIdentity
    );
    console.log('Message sent:', message);
    
    // 9. Reply to message (as freelancer)
    console.log('Replying to message...');
    const reply = await sendMessage(
      thread.id,
      client.principal.toString(),
      'Thank you! I can start right away. I\'ll keep you updated on my progress.',
      freelancerIdentity
    );
    console.log('Reply sent:', reply);
    
    // 10. Complete project (as client)
    console.log('Completing project...');
    const completedProject = await completeProject(
      project.id,
      clientIdentity
    );
    console.log('Project completed:', completedProject);
    
    // 11. Release payment (as client)
    console.log('Releasing payment...');
    const releasedPayment = await releasePayment(
      payment.id,
      clientIdentity
    );
    console.log('Payment released:', releasedPayment);
    
    console.log('End-to-end test flow completed successfully!');
    
    return {
      client,
      freelancer,
      project: completedProject,
      payment: releasedPayment,
      thread
    };
  } catch (error) {
    console.error('Error in test flow:', error);
    throw error;
  }
};

// Run specific parts of the flow for testing
export const createTestUsers = async () => {
  const clientIdentity = createTestIdentity();
  const freelancerIdentity = createTestIdentity();
  
  const client = await createUser(
    'Test Client',
    'client@example.com',
    ['business', 'marketing'],
    0,
    clientIdentity
  );
  
  const freelancer = await createUser(
    'Test Freelancer',
    'freelancer@example.com',
    ['web development', 'design', 'javascript'],
    50,
    freelancerIdentity
  );
  
  return { client, freelancer, clientIdentity, freelancerIdentity };
};

export const listAllUsers = async () => {
  return getAllUsers();
};

// Helper function for UI testing
export const setupDemoData = async () => {
  const { client, freelancer, clientIdentity, freelancerIdentity } = await createTestUsers();
  
  // Create a few projects
  const projects = [];
  
  // Project 1
  const deadline1 = new Date();
  deadline1.setMonth(deadline1.getMonth() + 1);
  projects.push(await createProject(
    'E-commerce Website Development',
    'Create a full-stack e-commerce website with product catalog, shopping cart, and payment processing',
    3000,
    ['web development', 'e-commerce', 'react', 'nodejs'],
    deadline1,
    clientIdentity
  ));
  
  // Project 2
  const deadline2 = new Date();
  deadline2.setMonth(deadline2.getMonth() + 2);
  projects.push(await createProject(
    'Mobile App UI Design',
    'Design a modern, user-friendly UI for an iOS and Android fitness tracking application',
    1500,
    ['ui design', 'mobile', 'figma'],
    deadline2,
    clientIdentity
  ));
  
  // Project 3
  const deadline3 = new Date();
  deadline3.setMonth(deadline3.getMonth() + 1);
  projects.push(await createProject(
    'Logo and Brand Identity',
    'Create a logo and brand identity guidelines for a new tech startup',
    800,
    ['graphic design', 'branding', 'logo design'],
    deadline3,
    clientIdentity
  ));
  
  // Submit a proposal for each project
  for (const project of projects) {
    await submitProposal(
      project.id,
      project.budget * 0.9, // 10% less than budget
      `I'm interested in working on "${project.title}". I have extensive experience in this area and can deliver high-quality work within your timeframe.`,
      21, // 3 weeks estimated
      freelancerIdentity
    );
  }
  
  return {
    client,
    freelancer,
    projects,
    clientIdentity,
    freelancerIdentity
  };
};
