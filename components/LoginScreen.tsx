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
  User,
  CheckCircle2,
  Key
} from 'lucide-react';
interface LoginScreenProps {
  onLoginAttempt: (email: string, password: string, type: 'login' | 'register', name?: string) => Promise<boolean>;
  onResetPassword?: (email: string) => Promise<void>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginAttempt, onResetPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres.");
      }
      await onLoginAttempt(email, password, 'login');
    } catch (err: any) {
      let msg = "Ocorreu um erro. Tente novamente.";
      if (err.code === 'auth/email-already-in-use') {
        msg = "Este e-mail já está sendo usado. Clique em 'JÁ POSSUO CONTA' para entrar.";
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = "E-mail ou senha incorretos.";
      } else if (err.code === 'auth/weak-password') {
        msg = "A senha é muito fraca (mínimo de 6 caracteres).";
      } else if (err.message) {
        msg = err.message;
      }
      
      setError(msg);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Por favor, digite seu e-mail no campo acima para redefinir a senha.");
      return;
    }
    if (onResetPassword) {
      setIsLoading(true);
      setError(null);
      setSuccessMsg(null);
      try {
        await onResetPassword(email);
        setSuccessMsg("E-mail de redefinição enviado! Verifique sua caixa de entrada.");
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || "Erro ao tentar enviar o e-mail de recuperação.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 overflow-hidden relative font-sans">
      <div className="w-full max-w-sm flex flex-col relative z-10 animate-[fadeIn_0.7s_ease-out]">
        
        {/* Branding */}
        <div className="text-center mb-8 relative z-10">
          <div className="relative inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-6 backdrop-blur-xl group">
             <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>
            <Wallet className="w-8 h-8 text-indigo-400 relative z-10 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-cyan-200 mb-2 tracking-tighter drop-shadow-md">FinControl</h1>
          <p className="text-cyan-200/60 text-xs font-bold uppercase tracking-[0.2em]">A elite financeira</p>
        </div>

        {/* Form Container (Glass Card) */}
        <div className="w-full glass-card rounded-3xl p-6 shadow-2xl relative z-10">
           {/* Cyber Line Decoration */}
           <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
           
           <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
            Autenticação Exclusiva
          </h2>
          <p className="text-indigo-200/60 text-xs mb-6 font-bold tracking-wide">
            Insira suas credenciais para acessar o painel VIP.
          </p>

          {error && (
            <div className="mb-5 p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-center gap-2 text-rose-200 text-xs animate-[shake_0.5s_ease-in-out]">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center gap-2 text-emerald-200 text-xs animate-[fadeIn_0.5s_ease-in-out]">
              <CheckCircle2 size={14} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 ml-1 block">E-mail</label>
              <div className="relative group">
                <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input 
                  type="email" 
                  className="block w-full h-14 pl-14 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium" 
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
                <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="block w-full h-14 pl-14 pr-14 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium tracking-wide" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-0 top-0 bottom-0 w-14 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button 
                  type="button" 
                  onClick={handleResetPassword}
                  className="text-indigo-400 hover:text-indigo-300 text-[10px] uppercase font-bold tracking-wider"
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>
            <button 
              disabled={isLoading} 
              type="submit" 
              className="w-full h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-6 text-[11px] border border-white/10"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Acessar Painel <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-white/5 text-center px-4">
             <p className="text-[9px] text-indigo-400/50 uppercase tracking-widest leading-relaxed font-bold">Apenas convidados confirmados. Adquira seu passe na plataforma de pagamentos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;