import React, { useState } from 'react';
import { 
  Wallet, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle,
  Info,
  User
} from 'lucide-react';
interface LoginScreenProps {
  onLoginAttempt: (email: string, password: string, type: 'login' | 'register', name?: string) => Promise<boolean>;
  onGoogleLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginAttempt, onGoogleLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isLogin && !name) {
        throw new Error("Por favor, informe seu nome.");
      }
      if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres.");
      }
      await onLoginAttempt(email, password, isLogin ? 'login' : 'register', name);
    } catch (err: any) {
      let msg = "Ocorreu um erro. Tente novamente.";
      if (err.code === 'auth/email-already-in-use') msg = "Este e-mail já está sendo usado.";
      if (err.code === 'auth/invalid-credential') msg = "E-mail ou senha incorretos.";
      if (err.code === 'auth/weak-password') msg = "A senha é muito fraca.";
      if (err.message) msg = err.message;
      
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 overflow-hidden relative font-sans">
      <div className="w-full max-w-sm flex flex-col relative z-10 animate-[fadeIn_0.7s_ease-out]">
        
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/40 mb-5">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">FinControl</h1>
          <p className="text-slate-400 text-sm">A inteligência que seu dinheiro merece.</p>
        </div>

        {/* Form Container */}
        <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-1">
            {isLogin ? 'Bem-vindo de volta' : 'Comece agora'}
          </h2>
          <p className="text-slate-400 text-xs mb-6 font-medium">
            {isLogin ? 'Acesse sua conta para gerenciar suas finanças.' : 'Crie sua conta gratuita.'}
          </p>

          <button 
            onClick={onGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md text-white font-bold py-3 px-4 rounded-xl border border-white/10 shadow hover:bg-white/20 active:scale-[0.98] transition-all mb-5 text-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
            Entrar com Google
          </button>

          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ou E-mail</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-center gap-2 text-rose-200 text-xs animate-[shake_0.5s_ease-in-out]">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1 animate-[fadeIn_0.3s_ease-out]">
                <label className="text-xs font-medium text-slate-300 ml-1 block">Nome Completo</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="text" 
                    className="block w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm" 
                    placeholder="Seu nome" 
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 ml-1 block">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="email" 
                  className="block w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm" 
                  placeholder="email@exemplo.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 ml-1 block">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="block w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button 
              disabled={isLoading} 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] active:scale-[0.98] disabled:opacity-70 transition-all mt-6 text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Cadastrar'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors text-[11px] uppercase tracking-wider"
            >
              {isLogin ? 'Criar conta gratuita' : 'Já possuo conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;