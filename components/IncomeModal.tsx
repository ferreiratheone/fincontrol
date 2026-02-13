import React from 'react';
import { X, CheckCircle2, Circle, Wallet, ArrowUpCircle, AlertTriangle } from 'lucide-react';
import { IncomeForm } from '../types';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => Promise<void>;
  data: IncomeForm;
  onChange: (data: IncomeForm) => void;
}

const IncomeModal: React.FC<IncomeModalProps> = ({ isOpen, onClose, onSave, data, onChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="glass-dark w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-white/10 animate-slide-up relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-600/20 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Renda Mensal</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Configure seus ganhos</p>
          </div>
          <button onClick={onClose} className="bg-white/5 p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-6 relative z-10">
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salário Líquido</label>
               <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0,00" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none font-black text-lg text-white placeholder:text-slate-700 transition-all" 
                    value={data.salary} 
                    onChange={e => onChange({...data, salary: e.target.value})} 
                  />
               </div>
            </div>
            <div className="col-span-2 space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dia Pagto.</label>
               <input 
                  type="number" 
                  min="1" 
                  max="31"
                  placeholder="Dia..." 
                  className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-center text-white placeholder:text-slate-700 transition-all" 
                  value={data.salaryDate || ''} 
                  onChange={e => onChange({...data, salaryDate: e.target.value})} 
                />
            </div>
          </div>
          
          {!data.onlySalary && (
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vale / Extra</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold group-focus-within:text-emerald-500 transition-colors">R$</span>
                  <input
                    type="number"
                    placeholder="0,00"
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-white placeholder:text-slate-700 transition-all"
                    value={data.vale}
                    onChange={(e) => onChange({ ...data, vale: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dia Vale</label>
                 <input 
                    type="number" 
                    min="1" 
                    max="31"
                    placeholder="Dia..." 
                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-center text-white placeholder:text-slate-700 transition-all" 
                    value={data.valeDate || ''} 
                    onChange={e => onChange({...data, valeDate: e.target.value})} 
                  />
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-white/5">
             <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                   <AlertTriangle size={12} /> Teto de Gastos (Opcional)
                </label>
             </div>
             <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold group-focus-within:text-amber-500 transition-colors">R$</span>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Defina um limite..." 
                  className="w-full bg-amber-500/5 border border-amber-500/10 rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-amber-500 outline-none font-black text-lg text-amber-200 placeholder:text-amber-900/40 transition-all" 
                  value={data.spendingLimit || ''} 
                  onChange={e => onChange({...data, spendingLimit: e.target.value})} 
                />
             </div>
             <p className="text-[10px] text-slate-500 font-medium ml-2">O app avisará quando você atingir 80% deste valor.</p>
          </div>
          
          <button 
            type="button"
            onClick={() => onChange({...data, onlySalary: !data.onlySalary})} 
            className={`p-5 rounded-2xl flex items-center justify-between border-2 transition-all duration-300 ${data.onlySalary ? 'bg-indigo-600/10 border-indigo-600/30 text-white' : 'border-white/5 bg-white/5 text-slate-400'}`}
          >
            <div className="flex items-center gap-3">
               <ArrowUpCircle size={20} className={data.onlySalary ? 'text-indigo-400' : 'text-slate-600'} />
               <span className="text-[10px] font-black uppercase tracking-wider">Recebo apenas salário fixo</span>
            </div>
            {data.onlySalary ? <CheckCircle2 className="text-indigo-400" /> : <Circle className="text-slate-700" />}
          </button>
          
          <button 
            type="submit" 
            className="w-full bg-emerald-600 py-5 rounded-[1.5rem] text-white font-black text-lg active:scale-95 transition-all shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 hover:shadow-emerald-600/40 mt-4 flex items-center justify-center gap-3"
          >
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncomeModal;