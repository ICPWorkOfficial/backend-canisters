# ICPWork Platform


A decentralized freelancing and collaboration platform built on the Internet Computer Protocol (ICP).


## Project Structure


The ICPWork platform consists of the following main components:


### Backend Canisters


- **User Management**: Handles user profiles, authentication, and verification
- **Project Management**: Manages freelance projects and proposals
- **Messaging System**: Provides communication between users
- **Payment Escrow**: Handles secure payment transactions (implemented in Rust)
- **Bounties**: Manages bounty creation, submissions, and rewards
- **Hackathons**: Organizes hackathon events, participant registration, and project submissions


### API Modules


API modules in `src/api` provide JavaScript interfaces to interact with the backend canisters:


- `userApi.js`: User management operations
- `projectApi.js`: Project and proposal operations
- `messagingApi.js`: User messaging operations
- `paymentApi.js`: Payment escrow operations
- `bountiesApi.js`: Bounty management operations
- `hackathonsApi.js`: Hackathon management operations


## File Structure


```
ICPWork/
├── .dfx/                      # DFX build and local state
├── src/
│   ├── api/                   # API modules for frontend integration
│   │   ├── icp/              # ICP-specific utilities
│   │   ├── bountiesApi.js    # Bounties API interface
│   │   ├── hackathonsApi.js  # Hackathons API interface
│   │   ├── messagingApi.js   # Messaging API interface
│   │   ├── paymentApi.js     # Payment API interface
│   │   ├── projectApi.js     # Project API interface
│   │   ├── userApi.js        # User API interface
│   │   └── index.js          # API exports
│   │
│   ├── backend/               # Backend canisters
│   │   ├── bounties/         # Bounties canister
│   │   │   └── main.mo       # Bounties implementation
│   │   │
│   │   ├── hackathons/       # Hackathons canister
│   │   │   └── main.mo       # Hackathons implementation
│   │   │
│   │   ├── messaging_system/ # Messaging canister
│   │   │   └── main.mo       # Messaging implementation
│   │   │
│   │   ├── payment_escrow/   # Payment escrow canister (Rust)
│   │   │   ├── Cargo.toml    # Rust dependencies
│   │   │   ├── lib.rs        # Entry point
│   │   │   └── payment_escrow.did # Candid interface
│   │   │
│   │   ├── project_management/
│   │   │   └── main.mo       # Project management implementation
│   │   │
│   │   └── user_management/
│   │       └── main.mo       # User management implementation
│   │
│   ├── context/              # Context providers
│   ├── declarations/         # Auto-generated canister declarations
│   ├── lib/                  # Shared libraries
│   └── utils/                # Utility functions
│       ├── icpAuth.js        # Authentication utilities
│       ├── icpTestFlow.js    # Test flow utilities
│       └── index.ts          # Utility exports
│
├── dfx.json                  # DFX configuration
├── integration_test.js       # Integration test script
├── DEPLOYMENT.md             # Deployment instructions
├── ICP_BACKEND_DOCUMENTATION.md # Detailed backend documentation
├── README.md                 # This file
└── WHITEPAPER.md             # Project whitepaper
```


## Getting Started


### Prerequisites


- Node.js (v16+)
- DFX (Internet Computer SDK)
- Rust (for payment_escrow canister)


### Installation


1. Clone the repository
2. Install dependencies:


```bash
npm install
```


3. Start the local replica:


```bash
dfx start --background
```


4. Deploy the canisters:


```bash
dfx deploy
```


## Canister Functions


### Bounties Canister


- `createBounty`: Create a new bounty with reward
- `getBounty`: Get bounty details
- `getAllBounties`: List all available bounties
- `getBountiesByCategory`: Filter bounties by category
- `getBountiesByStatus`: Filter bounties by status
- `submitSolution`: Submit a solution for a bounty
- `acceptSubmission`: Accept a submitted solution
- `rejectSubmission`: Reject a submitted solution
- `isBountyExpired`: Check if a bounty has expired


### Hackathons Canister


- `createHackathon`: Create a new hackathon event
- `getHackathon`: Get hackathon details
- `getAllHackathons`: List all hackathons
- `getHackathonsByStatus`: Filter hackathons by status
- `registerForHackathon`: Register as a participant
- `createProject`: Create a project for a hackathon
- `submitProject`: Submit a completed project
- `getHackathonParticipants`: List hackathon participants
- `getHackathonProjects`: List projects in a hackathon
- `getUpcomingHackathons`: Get upcoming hackathon events
- `getOngoingHackathons`: Get currently active hackathons
- `getCompletedHackathons`: Get past hackathons


## API Interface Notes


When integrating with the API modules, note that parameter order is important and should match the expected canister interface. For example, `userApi.js` expects parameters in this order:
- `(identity, username, fullName, email, skills)`

Always check parameter order when integrating with the canisters.


## Integration Testing


Run the integration tests to verify all canisters are working together correctly:


```bash
node integration_test.js
```


## License


This project is licensed under the MIT License - see the LICENSE file for details.


## Contact


For questions or support, please contact the ICPWork team.