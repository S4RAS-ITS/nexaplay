import { useUserInfoStore, useKeycloakStore } from '../store/useStore'
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { IoLogOut } from "react-icons/io5";

const NavbarComponent = () => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const logoutRef = useRef(null);

  const {keycloakClient, setKeycloakClient} = useKeycloakStore();
  const {userInfo, setUserInfo} = useUserInfoStore();

  const handleClickOutside = event => {
    if (logoutRef.current && !logoutRef.current.contains(event.target)) {
      setShowLogout(false);
    }
  };

  useEffect(() => {
    if (showLogout) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLogout]);

  function redirectHome() {
    navigate('/');
  }

  function redirectLogout() {
    navigate('/logout');
  }

  return (
    <div className='fixed block h-fit w-screen backdrop-blur-xl bg-gray-950/85 z-50'>
      <div className='flex flex-row px-10 py-5 justify-between items-center'>
        <div className='logo group hover:cursor-pointer' onClick={redirectHome}>
          <h1 className=' text-3xl text-blue-500 group-hover:text-blue-400 transition-colors ease-in-out duration-300 font-extrabold'>NEXAPLAY</h1>
        </div>

        <div className='other-menu relative flex flex-row gap-5'>
          <div className='flex flex-col justify-center items-center hover:cursor-pointer px-3 py-2 hover:bg-gray-600/50 rounded-xl' onClick={() => setShowLogout(prev => !prev)}>
            <p className='text-base font-semibold text-white'>{ `Halo, ${userInfo?.given_name} ${userInfo?.family_name}` }</p>
          </div>
          {
            showLogout && (
              <div ref={logoutRef} className='logout-div absolute right-0 top-10 flex w-fit justify-center items-center py-3 px-5 rounded-xl backdrop-blur-xl bg-gray-900/50'>
                <div onClick={redirectLogout} className='flex flex-row gap-2 py-2 px-3 w-fit justify-center items-center rounded-xl bg-red-500/80 hover:bg-red-400 hover:cursor-pointer'>
                  <IoLogOut className='stroke-white size-6' />
                  <p className='text-white font-bold text-sm text-nowrap w-full'>Log Out</p>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default NavbarComponent