import { useState, useEffect, useRef } from 'react'
import Hls from 'hls.js'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

const BIG_BUCK_BUNNY_UUID = '78210b8e5bf423d9130f46be9d9e07f4'
const BIG_BUCK_BUNNY_MP4_URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

function App() {
  const [channels, setChannels] = useState([])
  const [currentStreamUrl, setCurrentStreamUrl] = useState('')
  const [currentChannelType, setCurrentChannelType] = useState('hls') // 'hls' or 'mp4'
  const [searchTerm, setSearchTerm] = useState('')
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  const tvheadendIp = '10.3.132.68:9981'
  const username = 's4ras'
  const password = 'proxmox132'

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const headers = new Headers()
        headers.append('Authorization', 'Basic ' + btoa(username + ":" + password))

        const response = await fetch(`http://${tvheadendIp}/api/channel/grid?all=1`, {
          method: 'GET',
          headers: headers,
        })

        if (!response.ok) {
          if (response.status === 0 || response.type === 'opaque' || response.type === 'error') {
            console.error(
              'Failed to fetch channels: Network error or CORS issue. ' +
              'Ensure TVHeadend CORS is configured for ' + window.location.origin + '. And check network.'
            )
            throw new Error('Network error or CORS issue')
          }
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
        }
        const data = await response.json()
        setChannels(data.entries || [])
      } catch (error) {
        console.error("Failed to fetch channels:", error)
        setChannels([])
      }
    }

    fetchChannels()
  }, [])

  useEffect(() => {
    if (videoRef.current && currentStreamUrl) {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      videoRef.current.src = null
      videoRef.current.removeAttribute('src')

      if (currentChannelType === 'mp4') {
        console.log("Playing MP4 directly:", currentStreamUrl)
        videoRef.current.src = currentStreamUrl
        videoRef.current.load()
        videoRef.current.play().catch(e => console.error("Error playing MP4:", e))
      } else if (currentChannelType === 'hls' && Hls.isSupported()) {
        console.log("Attempting to play HLS with hls.js:", currentStreamUrl)
        const hls = new Hls({
          manifestLoadingTimeOut: 30000,
          xhrSetup: function (xhr, url) {
            if (url.startsWith(`http://${tvheadendIp}`)) {
              xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ":" + password))
            }
          }
        })
        hlsRef.current = hls
        hls.loadSource(currentStreamUrl)
        hls.attachMedia(videoRef.current)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play().catch(e => console.error("Error playing HLS (manifest parsed):", e))
        })
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            let errorDetails = "HLS fatal error"
            if (data.details) errorDetails += `: ${data.details}`
            if (data.response && data.response.code) errorDetails += ` (HTTP ${data.response.code})`
            console.error(errorDetails, data)

            if (data.response && data.response.code === 401) {
              console.error('HLS Authorization error (401). Check credentials and TVHeadend stream protection.')
            }

            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError()
                break
              default:
                break
            }
          }
        })
      } else if (currentChannelType === 'hls' && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        console.warn("Attempting to play HLS natively on Safari. Auth might be an issue if stream is protected.")
        videoRef.current.src = currentStreamUrl
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current.play().catch(e => console.error("Error playing HLS (native Safari):", e))
        })
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [currentStreamUrl, currentChannelType, username, password, tvheadendIp])

  const handleChannelClick = (channelUuid, channelNumber) => {
    if (channelUuid === BIG_BUCK_BUNNY_UUID) {
      console.log("Selected Big Buck Bunny (MP4). Setting direct MP4 URL.")
      setCurrentChannelType('mp4')
      setCurrentStreamUrl(BIG_BUCK_BUNNY_MP4_URL)
    } else {
      console.log(`Selected other channel (UUID: ${channelUuid}). Attempting TVHeadend stream.`)
      setCurrentChannelType('hls')
      const streamUrl = `http://${tvheadendIp}/stream/channel/${channelUuid}?profile=hls-ts-avlib`
      setCurrentStreamUrl(streamUrl)
    }
  }

  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="App">
      <header className="App-header">
        <h1>NexaPlay IPTV</h1>
      </header>
      <main className="content-area">
        <div className="channel-list">
          <h2>Channels</h2>
          
          <input 
            type="text"
            placeholder="Search channels..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {(channels && channels.length === 0) && <p>Loading channels...</p>}
          {(channels && channels.length > 0 && filteredChannels.length === 0) && <p>No channels match your search.</p>}

          <ul>
            {filteredChannels.map((channel) => (
              <li 
                key={channel.uuid} 
                className={((currentChannelType === 'mp4' && channel.uuid === BIG_BUCK_BUNNY_UUID) || 
                             (currentChannelType === 'hls' && currentStreamUrl.includes(channel.uuid))) ? 'active-channel' : ''}
                onClick={() => handleChannelClick(channel.uuid, channel.number)}
              >
                {channel.name} ({channel.number})
              </li>
            ))}
          </ul>
        </div>
        <div className="video-player-container">
          {currentStreamUrl ? (
            <video ref={videoRef} controls style={{ /*backgroundColor removed, handled by container*/ }} />
          ) : (
            <p>Select a channel to start streaming.</p>
          )}
      </div>
      </main>
      </div>
  )
}

export default App
