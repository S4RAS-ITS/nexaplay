import Keycloak from 'keycloak-js';

// Configure your Keycloak instance
const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL, // e.g., 'http://localhost:8080/auth' or 'http://localhost:8080/' if using Keycloak > 17
  realm: import.meta.env.VITE_KEYCLOAK_REALM, // e.g., 'S4RAS'
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID, // e.g., 'nexaplay-frontend'
});

export default keycloak; 