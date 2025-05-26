import { useState, useEffect, useRef } from "react";
import { useKeycloakStore, useUserInfoStore } from '../store/useStore';
import Keycloak from "keycloak-js";

const useAuth = () => {
  const isRun = useRef(false);
  const {keycloakClient, setKeycloakClient} = useKeycloakStore();
  const {userInfo, setUserInfo} = useUserInfoStore();
  const [isLogin, setLogin] = useState(false);

  useEffect(() => {
    if (isRun.current) return;

    const client = new Keycloak({
      url: 'https://keycloak.portal-saras.com',
      realm: 'S4RAS',
      clientId: 'front-end',
    });

    isRun.current = true;
    client
      .init({
        onLoad: 'login-required',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then((res) => {
        setKeycloakClient(client);
        client.loadUserInfo().then((info) => {
            setUserInfo(info);
            setLogin(res);
        })
      });
  }, []);

  return [isLogin];
};

export default useAuth;