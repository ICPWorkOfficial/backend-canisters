# ICPWork Deployment Guide

This guide outlines the steps to deploy the ICPWork application to the Internet Computer (IC) mainnet.

## Prerequisites

Before deployment, ensure you have:

1. [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) installed (version 0.14.0 or later)
2. Node.js (version 16 or later) and npm
3. Rust and Cargo (for the Payment Escrow canister)
4. ICP tokens for canister creation and cycles
5. A cycles wallet connected to your developer identity

## Development and Testing Flow

### Local Development

1. Start the local ICP replica:
   ```bash
   dfx start --clean --background
   ```

2. Deploy all canisters to the local replica:
   ```bash
   dfx deploy
   ```

3. Run the test script to verify functionality:
   ```bash
   node scripts/test-local-flow.js
   ```

4. For demo data setup:
   ```bash
   node scripts/test-local-flow.js --demo
   ```

5. Start the frontend development server:
   ```bash
   npm run dev
   ```

### Testing the Frontend-Canister Integration

1. After deploying locally, the frontend should connect to the local canisters.
2. Ensure environment variables are correctly set in `.env.local`:
   ```
   DFX_NETWORK=local
   CANISTER_ID_USER_MANAGEMENT=<local-canister-id>
   CANISTER_ID_PROJECT_MANAGEMENT=<local-canister-id>
   CANISTER_ID_PAYMENT_ESCROW=<local-canister-id>
   CANISTER_ID_MESSAGING_SYSTEM=<local-canister-id>
   ```

3. Test user authentication flow using the Internet Identity canister.
4. Test all CRUD operations for projects, proposals, messaging, and payments.

## Mainnet Deployment

### 1. Preparation

1. Create a `canister_ids.json` file (if it doesn't exist):
   ```json
   {
     "user_management": {
       "ic": "aaaaa-aa"
     },
     "project_management": {
       "ic": "aaaaa-aa"
     },
     "payment_escrow": {
       "ic": "aaaaa-aa"
     },
     "messaging_system": {
       "ic": "aaaaa-aa"
     }
   }
   ```

2. Update the network in `dfx.json`:
   ```json
   {
     "networks": {
       "ic": {
         "providers": ["https://ic0.app"],
         "type": "persistent"
       },
       "local": {
         "bind": "127.0.0.1:8000",
         "type": "ephemeral"
       }
     }
   }
   ```

3. Ensure you have a cycles wallet with sufficient cycles:
   ```bash
   dfx wallet --network=ic balance
   ```

### 2. Deploy to Mainnet

1. Build and deploy the canisters:
   ```bash
   dfx deploy --network=ic
   ```

2. Note the assigned canister IDs in `canister_ids.json`.

3. Update your frontend environment variables for production:
   ```
   DFX_NETWORK=ic
   CANISTER_ID_USER_MANAGEMENT=<mainnet-canister-id>
   CANISTER_ID_PROJECT_MANAGEMENT=<mainnet-canister-id>
   CANISTER_ID_PAYMENT_ESCROW=<mainnet-canister-id>
   CANISTER_ID_MESSAGING_SYSTEM=<mainnet-canister-id>
   ```

### 3. Frontend Build and Deployment

1. Build the frontend for production:
   ```bash
   npm run build
   ```

2. Deploy the frontend assets to a hosting service or to a dedicated asset canister on the IC.

3. For IC asset canister deployment:
   ```bash
   dfx deploy --network=ic assets
   ```

### 4. Managing Cycles

1. Check cycle balances:
   ```bash
   dfx canister --network=ic status user_management
   dfx canister --network=ic status project_management
   dfx canister --network=ic status payment_escrow
   dfx canister --network=ic status messaging_system
   ```

2. Top up cycles as needed:
   ```bash
   dfx canister --network=ic deposit-cycles <amount> <canister_id>
   ```

### 5. Canister Upgrades

When you need to upgrade your canisters:

1. Make changes to your canister code.
2. Build and deploy the updates:
   ```bash
   dfx build --network=ic <canister_name>
   dfx canister --network=ic install <canister_name> --mode=upgrade
   ```

3. Verify the upgrade was successful:
   ```bash
   dfx canister --network=ic call <canister_name> <method_name>
   ```

### 6. Monitoring and Maintenance

1. Set up monitoring for your canisters using the IC Dashboard.
2. Regularly check cycle balances to ensure canisters remain operational.
3. Keep backups of your canister state for critical data.

## Troubleshooting

### Common Issues

1. **Insufficient cycles**: Ensure your cycles wallet has enough cycles and properly top up your canisters.
2. **Authentication failures**: Verify Internet Identity integration is properly configured.
3. **Cross-canister call failures**: Check canister IDs and permissions for inter-canister communication.
4. **Upgrade failures**: Ensure your data schemas are compatible with previous versions when performing upgrades.

### Support and Resources

- [Internet Computer Documentation](https://internetcomputer.org/docs)
- [DFINITY Developer Forum](https://forum.dfinity.org/)
- [DFINITY Discord](https://discord.gg/cA7y6ezyE2)

## Security Considerations

1. **Canister Security**: Implement proper access control in all canisters.
2. **Escrow Security**: Ensure the payment escrow canister has robust security measures.
3. **Principal Verification**: Always verify caller principals before performing sensitive operations.
4. **Identity Management**: Secure handling of user identities and authentication tokens.

## Cycle Management Strategy

For production deployments, implement a cycle management strategy:

1. Set up alerts for low cycle balances.
2. Establish an automated or manual process for cycle replenishment.
3. Consider future computational needs when allocating cycles.

---

By following this deployment guide, you should be able to successfully deploy the ICPWork application to the Internet Computer mainnet and manage its operations effectively.
