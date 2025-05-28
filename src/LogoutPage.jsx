import { useEffect } from 'react';
import { useUserInfoStore, useKeycloakStore } from './store/useStore';

const LogoutPage = () => {
  const {keycloakClient} = useKeycloakStore();
  const {setUserInfo} = useUserInfoStore();

  function doLogout() {
    setUserInfo(null);
    keycloakClient.logout({redirectUri: 'https://portal-saras.com', logoutMethod: 'POST'});
  }

  useEffect(() => {
    doLogout();
  });

  return (
    <div className='w-full h-screen flex flex-col justify-center items-center gap-8'>
      <h1 className='text-5xl text-white animate-pulse font-extrabold'>Success!</h1>
      <h3 className='text-xl text-white font-bold'>Redirecting to https://portal-saras.com</h3>
    </div>
  )
}

export default LogoutPage;