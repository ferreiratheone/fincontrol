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
    <div className="min-h-[100dvh] flex items-center justify-center p-4 overflow-hidden selection:bg-purple-500/30 font-sans sm:py-10">
      <div className="w-full max-w-5xl bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 animate-[fadeIn_0.7s_ease-out] min-h-[500px] md:min-h-[600px]">
        
        {/* Left Side: Branding */}
        <div className="w-full md:w-1/2 p-10 text-white flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-indigo-600/20 to-transparent">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/40">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">FinControl</span>
            </div>
            <h1 className="text-4xl font-extrabold mb-6 leading-tight">
              A inteligência que seu <span className="text-indigo-400">dinheiro</span> merece.
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-md">
              Controle suas parcelas, gerencie seu salário e veja seu saldo real em tempo real usando Firebase.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white/5 flex flex-col justify-center border-l border-white/5">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Bem-vindo!' : 'Comece agora'}
            </h2>
            <p className="text-slate-400 mb-8 font-medium">
              {isLogin ? 'Acesse sua conta para gerenciar suas finanças.' : 'Crie sua conta gratuita em poucos segundos.'}
            </p>

            {/* Google Login Button */}
            <button 
              onClick={onGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md text-white font-bold py-3 px-4 rounded-xl border border-white/10 shadow-xl hover:bg-white/20 active:scale-[0.98] transition-all mb-6"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Entrar com Google
            </button>

            <div className="relative flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ou use e-mail</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-center gap-3 text-rose-200 text-sm animate-[shake_0.5s_ease-in-out]">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5 animate-[fadeIn_0.3s_ease-out]">
                  <label className="text-sm font-medium text-slate-300 ml-1 block">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="text" 
                      className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" 
                      placeholder="Como quer ser chamado?" 
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1 block">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="email" 
                    className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" 
                    placeholder="email@exemplo.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1 block">Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="block w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" 
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button 
                disabled={isLoading} 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-[0.98] disabled:opacity-70 transition-all"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Entrar' : 'Cadastrar'} <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors text-sm uppercase tracking-widest"
              >
                {isLogin ? 'Criar conta gratuita' : 'Já possuo conta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;