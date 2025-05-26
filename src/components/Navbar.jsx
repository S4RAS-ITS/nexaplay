import { useUserInfoStore } from '../store/useStore'
import { useNavigate } from 'react-router-dom';

const NavbarComponent = () => {
  const navigate = useNavigate();
  const {userInfo, setUserInfo} = useUserInfoStore();

  function redirectHome() {
    navigate('/');
  }

  return (
    <div className='fixed block h-fit w-screen backdrop-blur-xl bg-gray-950/85 z-50'>
      <div className='flex flex-row px-10 py-5 justify-between items-center'>
        <div className='logo group hover:cursor-pointer' onClick={redirectHome}>
          <h1 className=' text-3xl text-blue-500 group-hover:text-blue-400 transition-colors ease-in-out duration-300 font-extrabold'>NEXAPLAY</h1>
        </div>

        <div className='other-menu flex flex-row gap-5 text-base font-semibold text-white'>
          <p>{ `Halo, ${userInfo?.given_name} ${userInfo?.family_name}` }</p>
        </div>
      </div>
    </div>
  )
}

export default NavbarComponent