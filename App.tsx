import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { auth, googleProvider, isDemo } from './services/firebase';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import Background3D from './components/Background3D';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Listen for redirect results (Google Logout/Login redirect)
    auth.getRedirectResult().then((result) => {
      if (result.user) {
        setUser(result.user);
      }
    }).catch((err) => {
      console.error("Redirect login error:", err);
      if (err.code !== 'auth/cancelled-popup-request') {
        alert("Erro no login via redirecionamento: " + err.message);
      }
    });

    // Firebase auth listener
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleManualLogin = async (email: string, password: string, type: 'login' | 'register' = 'login', name?: string): Promise<boolean> => {
    try {
      if (type === 'login') {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        if (result.user && name) {
          await result.user.updateProfile({ displayName: name });
        }
      }
      return true;
    } catch (err: any) {
      console.error("Auth error:", err.message);
      // Fallback to demo mode only if not registration
      if (type === 'login' && isDemo && email === 'admin@fincontrol.com' && password === '123456') {
         setUser({ uid: 'demo-user', email: 'admin@fincontrol.com', displayName: 'Admin Demo' });
         return true;
      }
      throw err; // Throw to show error on LoginScreen
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // On mobile devices, Popups are often blocked or fail to render.
      // Redirect is much more reliable for PWA and Mobile browsers.
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        await auth.signInWithRedirect(googleProvider);
      } else {
        await auth.signInWithPopup(googleProvider);
      }
    } catch (err: any) {
      console.error("Google Login error:", err.message);
      alert("Erro ao entrar com Google: " + err.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      <Background3D />
      
      <div className="relative z-10 w-full min-h-screen">
        {isAuthLoading ? (
           <div className="h-screen flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
           </div>
        ) : !user ? (
          <LoginScreen 
            onLoginAttempt={handleManualLogin} 
            onGoogleLogin={handleGoogleLogin} 
          />
        ) : (
          <Dashboard user={user} />
        )}
      </div>
    </div>
  );
}
