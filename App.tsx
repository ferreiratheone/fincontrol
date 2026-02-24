import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { auth, isDemo } from './services/firebase';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import Background3D from './components/Background3D';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
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

  const handleResetPassword = async (email: string) => {
    await auth.sendPasswordResetEmail(email);
  };

  return (
    <div className="bg-[#020617] min-h-[100dvh] flex items-center justify-center font-sans overflow-hidden selection:bg-purple-500/30">
      <div className="w-full h-[100dvh] sm:h-[844px] sm:max-w-[390px] sm:rounded-[40px] sm:border-[8px] sm:border-slate-800 relative bg-slate-950 text-slate-100 overflow-hidden sm:shadow-2xl sm:shadow-purple-500/20">
        <Background3D />
        
        <div className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar">
          {isAuthLoading ? (
             <div className="h-full flex items-center justify-center">
               <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
             </div>
          ) : !user ? (
            <LoginScreen 
              onLoginAttempt={handleManualLogin} 
              onResetPassword={handleResetPassword}
            />
          ) : (
            <Dashboard user={user} />
          )}
        </div>
      </div>
    </div>
  );
}
