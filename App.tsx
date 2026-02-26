import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Background3D from './components/Background3D';
import { auth } from './services/firebase';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Firebase auth listener + Anonymous login
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        // Logged in (anonymously or previously)
        setUser({ uid: u.uid, email: 'local@fincontrol', displayName: 'Gestor' });
        setIsAuthLoading(false);
      } else {
        // No user found, sign in anonymously
        try {
          await auth.signInAnonymously();
        } catch (error) {
          console.error("Anonymous auth failed:", error);
          // Fallback to local user if completely offline/failing
          setUser({ uid: 'local-device', email: 'local@fincontrol', displayName: 'Gestor' });
          setIsAuthLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-[#020617] min-h-[100dvh] flex items-center justify-center font-sans overflow-hidden selection:bg-purple-500/30">
      <div className="w-full h-[100dvh] sm:h-[844px] sm:max-w-[390px] sm:rounded-[40px] sm:border-[8px] sm:border-slate-800 relative bg-slate-950 text-slate-100 overflow-hidden sm:shadow-2xl sm:shadow-purple-500/20">
        <Background3D />
        
        <div className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar">
          {isAuthLoading ? (
            <div className="h-full flex items-center justify-center">
              {/* Optional tiny loader or nothing, since user asked to remove loading. Kept minimal just in case */}
            </div>
          ) : (
            <Dashboard user={user} />
          )}
        </div>
      </div>
    </div>
  );
}

