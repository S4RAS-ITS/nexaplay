'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavbarComponent from './components/Navbar'

function HomePage() {
  const [channels, setChannels] = useState(null);
  const navigate = useNavigate();

  const tvheadendIp = 'iptv.portal-saras.com'
  const username = 's4ras'
  const password = 'proxmox132'

  const fakeVideos = [
    { title: 'Kucing Unyu', video_id: '1', duration: '10:10', channel_name: 'Kucing Com', channel_id: '129380138', thumbnail: 'https://unair.ac.id/wp-content/uploads/2020/12/Kucing.jpg'},
    { title: 'My Cute Litl Bnuyy', video_id: '2', duration: '10:10', channel_name: 'Sate Kelinci', channel_id: '182871291982', thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Oryctolagus_cuniculus_Tasmania_2.jpg/960px-Oryctolagus_cuniculus_Tasmania_2.jpg'},
    { title: 'Unknown object discovered!? Goes Viral! Gone Wrong!!', video_id: '3', duration: '10:10', channel_name: 'Jeniffer Fk.', channel_id: '10920182981928', thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9XdDN93MDHFTx9takCKeXRaWXXLMNkDIGeg&s'},
    { title: 'Semangat Pagi! Never Give "you" up', video_id: '4', duration: '10:10', channel_name: 'Ritz rome', channel_id: '93121390839081', thumbnail: 'https://makerworld.bblmw.com/makerworld/model/US2ab61bb7d3000c/design/2024-01-30_029b2304056c.png?x-oss-process=image/resize,w_1000/format,webp'},
    { title: 'kucingUnyu5', video_id: '5', duration: '10:10', channel_name: 'Kucing Com5', channel_id: '28738913139019', thumbnail: 'https://unair.ac.id/wp-content/uploads/2020/12/Kucing.jpg'},
    { title: 'kucingUnyu6', video_id: '6', duration: '10:10', channel_name: 'Kucing Com6', channel_id: '19273971939132', thumbnail: 'https://unair.ac.id/wp-content/uploads/2020/12/Kucing.jpg'},
    { title: 'kucingUnyu7', video_id: '7', duration: '10:10', channel_name: 'Kucing Com7', channel_id: '39019009183112', thumbnail: 'https://unair.ac.id/wp-content/uploads/2020/12/Kucing.jpg'},
  ]

  function handleChannelStreamClick(uuid) {
    navigate(`/watch?uuid=${uuid}`)
  }


  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const headers = new Headers()
        headers.append('Authorization', 'Basic ' + btoa(username + ":" + password))

        const response = await fetch(`https://${tvheadendIp}/api/channel/grid?all=1`, {
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

  return (
    <div className='homePage min-h-screen bg-gray-950'>
      <NavbarComponent />

      <div className='flex flex-row justify-between pt-24 pl-0 pr-10'>
        <div className='sidebar fixed flex flex-col bg-gray-900/80 w-[320px] h-[85vh] pb-8 rounded-br-xl rounded-tr-xl'>
          <div className='flex py-8 w-full justify-center'>
            <h1 className='text-3xl text-white font-black'>Streaming</h1>
          </div>

          <div className='channel-lista px-3 h-full'>
            {
              channels === null
              ?
                <></>
              :
                <>
                  {
                    channels.length == 0
                    ?
                      <div className='px-3 py-5 flex flex-row gap-2 justify-between items-center'>
                        <h4 className='text-white/50 font-semibold text-sm italic w-auto'>No Channels Found</h4>
                      </div>
                    :
                      channels.map((channel) => {
                        return (
                          <div key={channel.uuid} className='px-3 py-4 flex flex-row gap-2 justify-between items-center hover:bg-gray-700/50 hover:cursor-pointer rounded-2xl' onClick={() => handleChannelStreamClick(channel.uuid)}>
                            <h4 className='text-white font-semibold text-base w-auto'>{ channel.name }</h4>
                            {
                              channel.enabled
                              ? 
                                <p className='text-green-600 font-extrabold text-sm w-fit'>Active</p>
                              : 
                                <p className='text-red-600 font-extrabold text-sm w-fit'>Offline</p>
                            }
                          </div>
                        )
                      })
                  }
                </>
            }
          </div>
        </div>

        <div className='vod ml-[350px] w-full'>
          <div className=' pb-5 w-full justify-start'>
            <h1 className='text-3xl text-white font-black'>Video On Demand</h1>
          </div>
          
          <div className='flex flex-wrap gap-3 justify-start'>
            {
              fakeVideos.map((video) => {
                return (
                  <div key={video.video_id} className='card group flex flex-col bg-gray-900 w-[350px] rounded-xl hover:cursor-pointer hover:bg-gray-800 transition-all ease-in-out duration-300 mb-5'>
                    
                    <div className='relative w-[350px] h-[240px] rounded-xl overflow-hidden'>
                      <img
                        className='w-[350px] h-[240px] object-cover object-center rounded-xl group-hover:rounded-none group-hover:scale-105 transition-all ease-in-out duration-300'
                        src={video.thumbnail}
                      />
                      <div className='absolute right-3 bottom-4 flex justify-center items-center px-2 py-0.5 rounded-sm bg-black/70 group-hover:opacity-0 transition-all duration-300'>
                        <p className='text-white text-sm font-semibold text-center'>{ video.duration }</p>
                      </div>
                    </div>

                    <div className='flex flex-col px-3 pt-3 pb-5 gap-5'>
                      <h3 className='text-white font-bold text-base'>{ video.title }</h3>
                      <p className='text-gray-400 font-medium text-sm'>{ video.channel_name }</p>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
