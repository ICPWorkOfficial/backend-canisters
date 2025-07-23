// src/utils/icpAuth.js
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

// Singleton to manage authentication state
let authClient = null;
let identity = null;

/**
 * Initialize the auth client
 * @returns {Promise<AuthClient>} The authenticated client
 */
export const initAuth = async () => {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  return authClient;
};

/**
 * Check if the user is authenticated
 * @returns {Promise<boolean>} Whether the user is authenticated
 */
export const isAuthenticated = async () => {
  const client = await initAuth();
  return await client.isAuthenticated();
};

/**
 * Get the current identity
 * @returns {Promise<Identity|null>} The current identity or null if not authenticated
 */
export const getIdentity = async () => {
  if (identity) return identity;
  
  const client = await initAuth();
  if (await client.isAuthenticated()) {
    identity = client.getIdentity();
    return identity;
  }
  return null;
};

/**
 * Get the principal ID of the authenticated user
 * @returns {Promise<string|null>} The principal ID as a string, or null if not authenticated
 */
export const getPrincipal = async () => {
  const currentIdentity = await getIdentity();
  if (currentIdentity) {
    return currentIdentity.getPrincipal().toString();
  }
  return null;
};

/**
 * Log in using Internet Identity
 * @param {Function} onSuccess - Callback function to execute on successful login
 * @returns {Promise<void>}
 */
export const login = async (onSuccess = () => {}) => {
  const client = await initAuth();
  
  const days = 30;
  const onLoginComplete = async (authClientAfterLogin) => {
    identity = authClientAfterLogin.getIdentity();
    onSuccess();
  };

  // Start the login flow
  await client.login({
    identityProvider: process.env.DFX_NETWORK === 'ic' 
      ? 'https://identity.ic0.app' 
      : `http://localhost:8000?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`,
    maxTimeToLive: BigInt(days * 24 * 60 * 60 * 1000 * 1000 * 1000),
    onSuccess: () => onLoginComplete(client),
  });
};

/**
 * Log out the current user
 * @param {Function} onSuccess - Callback function to execute on successful logout
 * @returns {Promise<void>}
 */
export const logout = async (onSuccess = () => {}) => {
  const client = await initAuth();
  await client.logout();
  identity = null;
  onSuccess();
};

/**
 * Create an authenticated agent for canister interactions
 * @returns {Promise<HttpAgent>} The authenticated agent
 */
export const createAuthenticatedAgent = async () => {
  const currentIdentity = await getIdentity();
  
  const agent = new HttpAgent({
    identity: currentIdentity,
    host: process.env.DFX_NETWORK === 'ic' 
      ? 'https://ic0.app' 
      : 'http://localhost:8000',
  });
  
  // Fetch root key for local development
  if (process.env.DFX_NETWORK !== 'ic') {
    await agent.fetchRootKey();
  }
  
  return agent;
};
