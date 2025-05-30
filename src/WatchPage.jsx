'use client'

import { useState, useEffect, useRef } from 'react'
import NavbarComponent from './components/Navbar'
import { useNavigate } from 'react-router-dom'
import useQuery from './hooks/useQuery'
import Hls from 'hls.js'

const BIG_BUCK_BUNNY_UUID = '78210b8e5bf423d9130f46be9d9e07f4'
const BIG_BUCK_BUNNY_MP4_URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

const WatchPage = () => {
  const [channel, setChannel] = useState(null);
  const [channelUuid, setChannelUuid] = useState('')
  const [currentStreamUrl, setCurrentStreamUrl] = useState('')
  const [currentChannelType, setCurrentChannelType] = useState('hls') // 'hls' or 'mp4'
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const query = useQuery();
  const navigate = useNavigate();

  const tvheadendIp = 'iptv.portal-saras.com'
  const username = 's4ras'
  const password = 'proxmox132'

  const fetchChannels = async (channel_uuid) => {
    try {
      const headers = new Headers()
      headers.append('Authorization', 'Basic ' + btoa(username + ":" + password))

      const response = await fetch(`https://${tvheadendIp}/api/channel/grid`, {
        method: 'GET',
        headers: headers
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
      setChannel(data.entries.filter((data) => data.uuid === channel_uuid)[0] || {})
    } catch (error) {
      console.error("Failed to fetch channels:", error)
      setChannel({})
    }
  }

  useEffect(() => {
    if(channelUuid === '') {
      const uuidFromQuery = query.get('uuid');
      
      if(!uuidFromQuery) {
        navigate('/')
        return
      }
      fetchChannels(uuidFromQuery);
      setChannelUuid(uuidFromQuery);
      
      if(uuidFromQuery === '1') {
        setCurrentChannelType('hls');
        setCurrentStreamUrl('https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index.m3u8');
      } else if(uuidFromQuery !== '' && uuidFromQuery !== '1') {
        setCurrentChannelType('hls');

        const streamUrl = `https://${username}:${password}@${tvheadendIp}/stream/channel/${uuidFromQuery}?profile=pass`;
        setCurrentStreamUrl(streamUrl);
      }
    }
    else if (videoRef.current && currentStreamUrl) {
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
            if (url.startsWith(`https://${tvheadendIp}`)) {
              xhr.withCredentials = true;
              xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ":" + password))
            }
          }
        })
        hlsRef.current = hls
        hls.loadSource(currentStreamUrl)
        hls.attachMedia(videoRef.current)
        hls.on(Hls.Events.FRAG_LOADING, (_, data) => {
          console.log('Loading segment:', data.frag.url);
        })
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play().catch(e => console.error("Error playing HLS (manifest parsed):", e))
        })
        hls.on(Hls.Events.ERROR, function (_, data) {
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
  }, [currentStreamUrl, currentChannelType, channelUuid])

  return (
    <div className='min-h-screen bg-gray-950'>
      <NavbarComponent />

      <div className='flex flex-col pt-20'>
        <div className='rounded-3xl flex justify-center items-center bg-black w-full h-auto'>
          {
            currentStreamUrl
            ?
              <video ref={videoRef} controls autoPlay className='w-full h-[75vh] object-contain'></video>
            :
              <></>
          }
        </div>
        <div className='pt-8 px-12'>
          <h1 className='text-white text-2xl font-extrabold'>Channel: { channel?.name }</h1>
        </div>
      </div>
    </div>
  )
}

export default WatchPage;