import { useEffect, useState } from 'react';
import App from './App';
import { LoginScreen } from './login/LoginScreen';

/** Tiny router: `/` is World 1-1 (login), `/otp` is World 1-2 (the OTP screen). */
export default function Root() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
  };

  return path.startsWith('/otp') ? <App /> : <LoginScreen onSignedIn={() => go('/otp')} />;
}
