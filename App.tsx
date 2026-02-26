import React from 'react';
import Dashboard from './components/Dashboard';
import Background3D from './components/Background3D';

export default function App() {
  const user = { uid: 'local-device', email: 'local@fincontrol', displayName: 'Gestor' };

  return (
    <div className="bg-[#020617] min-h-[100dvh] flex items-center justify-center font-sans overflow-hidden selection:bg-purple-500/30">
      <div className="w-full h-[100dvh] sm:h-[844px] sm:max-w-[390px] sm:rounded-[40px] sm:border-[8px] sm:border-slate-800 relative bg-slate-950 text-slate-100 overflow-hidden sm:shadow-2xl sm:shadow-purple-500/20">
        <Background3D />
        
        <div className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar">
          <Dashboard user={user} />
        </div>
      </div>
    </div>
  );
}

