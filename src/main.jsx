import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Assuming you have a global CSS file
// Removed Keycloak imports and setup
// import { ReactKeycloakProvider } from '@react-keycloak/web';
// import keycloak from './keycloak';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Removed Keycloak specific components and event handlers
// const LoadingComponent = () => <div>Loading Keycloak...</div>;
// const onKeycloakEvent = (event, error) => {
//   console.log('onKeycloakEvent', event, error);
// };
// const onKeycloakTokens = (tokens) => {
//   console.log('onKeycloakTokens', tokens);
// };

root.render(
  <React.StrictMode>
    {/* Removed ReactKeycloakProvider wrapper */}
      <App />
  </React.StrictMode>
);
