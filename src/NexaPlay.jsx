import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import Hls from 'hls.js';

// Assume tvheadendApi.js exists in a services folder
// Example: import { getChannels } from './services/tvheadendApi';

// Mock API call for now
const fetchChannelsFromApi = async (token) => {
  const tvheadendApiUrl = import.meta.env.VITE_TVHEADEND_API_URL || '/api'; // Default to /api if not set
  console.log('Fetching channels with token:', token ? token.substring(0, 20) + '...' : 'No Token');
  try {
    const response = await fetch(`${tvheadendApiUrl}/channel/grid?all=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    // Tvheadend API for channel/grid returns an object with an 'entries' array
    return data.entries || []; 
  } catch (error) {
    console.error('Failed to fetch channels:', error);
    // In a real app, you'd set an error state here to display to the user
    return []; // Return empty array on error
  }
};

function NexaPlay() {
  const { keycloak, initialized } = useKeycloak();
  const [channels, setChannels] = useState([]);
  const [selectedChannelUrl, setSelectedChannelUrl] = useState(null);
  const videoRef = React.useRef(null);

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      fetchChannelsFromApi(keycloak.token).then(setChannels);
    }
  }, [initialized, keycloak]);

  useEffect(() => {
    let hls;
    if (selectedChannelUrl && videoRef.current) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(selectedChannelUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play();
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = selectedChannelUrl;
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current.play();
        });
      }
    }
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [selectedChannelUrl]);

  if (!initialized) {
    return <div>Loading authentication...</div>;
  }

  const handleChannelSelect = (channel) => {
    // Construct the stream URL. This might need adjustment based on your Tvheadend setup.
    // The user:pass part is tricky. If Tvheadend is fully OIDC protected, this might not be needed
    // or the API provides a full authenticated URL. For now, assuming it can be constructed or fetched.
    // Example: http://user:pass@TVH_IP:9981/stream/channel/<UUID>?profile=pass
    // You have UUIDs: 78210b8e5bf423d9130f46be9d9e07f4, 2e05ef52bdbff43fbf74f102c1273ddf
    // This URL needs to be accessible by the client and might have CORS issues if not configured on Tvheadend.
    const streamBaseUrl = (import.meta.env.VITE_TVHEADEND_API_URL || '').replace('/api',''); //e.g. http://10.3.132.68:9981
    // This is a placeholder. You'll need actual logic to get the correct UUID and credentials/auth method for stream URLs
    if (channel.uuid) {
        // Assuming your channel object from /api/channel/grid has a uuid and name
        // The stream URL might require specific auth. The original test used user:pass in the URL.
        // If Tvheadend is not configured for OIDC on stream paths, this is a challenge.
        // For now, let's assume the stream URL is something like this:
        const streamUrl = `${streamBaseUrl}/stream/channel/${channel.uuid}?profile=pass`;
        console.log(`Selected channel: ${channel.name}, Stream URL: ${streamUrl}`);
        setSelectedChannelUrl(streamUrl);
    } else {
        console.error('Channel UUID is missing', channel);
    }
  };

  return (
    <div>
      <h1>NexaPlay - IPTV</h1>
      {!keycloak.authenticated && (
        <button type="button" onClick={() => keycloak.login()}>
          Login
        </button>
      )}

      {keycloak.authenticated && (
        <div>
          <p>
            Welcome, {keycloak.tokenParsed?.preferred_username || 'User'}!
            <button type="button" onClick={() => keycloak.logout()} style={{ marginLeft: '10px' }}>
              Logout
            </button>
          </p>
          
          <h2>Channels</h2>
          {channels.length === 0 && <p>Loading channels or no channels available...</p>}
          <ul>
            {channels.map((channel) => (
              <li key={channel.uuid} onClick={() => handleChannelSelect(channel)} style={{ cursor: 'pointer' }}>
                {channel.name} (Enabled: {channel.enabled ? 'Yes' : 'No'}, Number: {channel.number})
              </li>
            ))}
          </ul>

          {selectedChannelUrl && (
            <div>
              <h2>Now Playing</h2>
              <video ref={videoRef} controls style={{ width: '80%', height: 'auto' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NexaPlay; 