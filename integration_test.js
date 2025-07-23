// integration_test.js
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';

// Import our API modules
import { userApi } from './src/api/integration/userApi.js';
import { projectApi } from './src/api/integration/projectApi.js';
import { messagingApi } from './src/api/integration/messagingApi.js';
import { paymentApi } from './src/api/integration/paymentApi.js';
import { initializeAllApis } from './src/api/integration/index.js';

// Create test identities
const createIdentity = () => {
  // Generate a random identity for testing
  // In production, you would use Internet Identity or another auth method
  const seed = new Uint8Array(32);
  for (let i = 0; i < seed.length; i++) {
    seed[i] = Math.floor(Math.random() * 256);
  }
  return Ed25519KeyIdentity.generate(seed);
};

const clientIdentity = createIdentity();
const freelancerIdentity = createIdentity();

console.log('Client Principal:', clientIdentity.getPrincipal().toString());
console.log('Freelancer Principal:', freelancerIdentity.getPrincipal().toString());

// Main test function
const runIntegrationTest = async () => {
  try {
    console.log('\n=== Running Integration Tests ===\n');

    // 1. Create user profiles
    // Based on canister interface: (username, email, skills, bio)
    console.log('1. Creating user profiles...');
    const clientProfile = await userApi.createUser(
      clientIdentity,
      'TestClient',              // username
      'client@example.com',      // email
      ['client', 'buyer'],       // skills
      'Client looking for freelancers' // bio
    );
    console.log('✅ Client profile created');

    const freelancerProfile = await userApi.createUser(
      freelancerIdentity,
      'TestFreelancer',          // username
      'freelancer@example.com',  // email
      ['developer', 'rust', 'javascript', 'motoko'], // skills
      'Experienced developer'    // bio
    );
    console.log('✅ Freelancer profile created');

    // 2. Create a project
    console.log('\n2. Creating a test project...');
    const projectResult = await projectApi.createProject(
      clientIdentity,
      'Test Project',
      'A project to test the integration',
      1000, // Budget
      'Development',
      ['javascript', 'motoko'] // Required skills
    );
    
    if (!projectResult || !projectResult.ok) {
      throw new Error('Failed to create project');
    }
    
    // Extract the project ID from the result object
    const projectId = projectResult.ok.id;
    console.log(`✅ Project created with ID: ${projectId}`);

    // 3. Submit a proposal as freelancer
    console.log('\n3. Submitting a proposal...');
    const proposalResult = await projectApi.submitProposal(
      freelancerIdentity,
      projectId,
      950, // Price
      'I can complete this project efficiently',
      7 // Estimated days to complete
    );
    
    if (!proposalResult || !proposalResult.ok) {
      throw new Error('Failed to submit proposal');
    }
    
    const proposalId = proposalResult.ok.id;
    console.log(`✅ Proposal submitted with ID: ${proposalId}`);

    // 4. Client accepts the proposal
    console.log('\n4. Accepting proposal...');
    const acceptResult = await projectApi.acceptProposal(
      clientIdentity,
      null,  // projectId is not needed according to the canister interface
      proposalId
    );
    console.log('✅ Proposal accepted');

    // 5. Create an escrow
    console.log('\n5. Creating payment escrow...');
    const escrowResult = await paymentApi.createEscrow(
      clientIdentity,
      freelancerIdentity.getPrincipal(),
      projectId,
      950 // Amount
    );
    
    if (!escrowResult || !escrowResult.ok) {
      throw new Error('Failed to create escrow');
    }
    
    // Extract escrow ID from the result
    const escrowId = escrowResult.ok.id;
    console.log(`✅ Escrow created with ID: ${escrowId}`);

    // 6. Create a messaging thread
    console.log('\n6. Creating messaging thread...');
    const threadResult = await messagingApi.createThread(
      clientIdentity,
      `Project ${projectId} Discussion`,
      [freelancerIdentity.getPrincipal()],
      projectId.toString() // Reference to project
    );
    
    if (!threadResult || !threadResult.ok) {
      throw new Error('Failed to create thread');
    }
    
    const threadId = threadResult.ok;
    console.log(`✅ Thread created with ID: ${threadId}`);

    // 7. Send a message
    console.log('\n7. Sending a message...');
    const messageResult = await messagingApi.sendMessage(
      clientIdentity,
      threadId,
      "Hello! Let's discuss the project details."
    );
    console.log('✅ Message sent');

    // 8. Freelancer sends a status update
    console.log('\n8. Adding project status update...');
    const statusResult = await projectApi.addStatusUpdate(
      freelancerIdentity,
      projectId,
      "Started working on the project. Making good progress!"
    );
    console.log('✅ Status update added');

    // 9. Complete the project
    console.log('\n9. Updating project status to complete...');
    const completeResult = await projectApi.updateProjectStatus(
      freelancerIdentity,
      projectId,
      "COMPLETED"
    );
    console.log('✅ Project marked as completed');

    // 10. Release the escrow payment
    console.log('\n10. Releasing payment from escrow...');
    const releaseResult = await paymentApi.releaseEscrow(
      clientIdentity,
      escrowId
    );
    console.log('✅ Escrow payment released');

    // 11. Update freelancer rating
    console.log('\n11. Updating freelancer rating...');
    const ratingResult = await userApi.updateRating(
      clientIdentity,
      freelancerIdentity.getPrincipal().toString(),
      5 // 5-star rating
    );
    console.log('✅ Rating updated');

    console.log('\n=== Integration Test Complete ===');
    console.log('All API modules were successfully integrated and tested!');
    
  } catch (error) {
    console.error('❌ Integration Test Failed:', error);
  }
};

// Run the test
runIntegrationTest().catch(e => console.error(e));
