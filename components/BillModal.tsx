import React from 'react';
import { X, Home, Gamepad2, Utensils, HeartPulse, Car, BookOpen, MoreHorizontal, Calendar, CreditCard } from 'lucide-react';
import { NewBillForm } from '../types';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => Promise<void>;
  data: NewBillForm;
  onChange: (data: NewBillForm) => void;
  isEditing?: boolean;
}

const CATEGORIES = [
  { id: 'Fixa', icon: Home, color: 'text-blue-400' },
  { id: 'Lazer', icon: Gamepad2, color: 'text-purple-400' },
  { id: 'Comida', icon: Utensils, color: 'text-orange-400' },
  { id: 'Saúde', icon: HeartPulse, color: 'text-rose-400' },
  { id: 'Transporte', icon: Car, color: 'text-cyan-400' },
  { id: 'Educação', icon: BookOpen, color: 'text-emerald-400' },
  { id: 'Outros', icon: MoreHorizontal, color: 'text-slate-400' }
];

const BillModal: React.FC<BillModalProps> = ({ isOpen, onClose, onSave, data, onChange, isEditing }) => {
  if (!isOpen) return null;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div 
        className="glass-dark w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-white/10 animate-slide-up relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">{isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Gerencie seus gastos</p>
          </div>
          <button onClick={onClose} className="bg-white/5 p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
            <div className="relative group">
              <input 
                required 
                type="text" 
                placeholder="Ex: Supermercado Mensal" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-white placeholder:text-slate-700 transition-all" 
                value={data.name} 
                onChange={e => onChange({...data, name: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-8 pr-2 py-4 focus:ring-2 focus:ring-indigo-500 outline-none font-black text-sm text-white placeholder:text-slate-700 transition-all" 
                  value={data.totalValue} 
                  onChange={e => onChange({...data, totalValue: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2 col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parcelas</label>
              <div className="relative">
                <input 
                  type="number" 
                  min="1" 
                  placeholder="1x" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none font-black text-sm text-center text-white placeholder:text-slate-700 transition-all" 
                  value={data.installments} 
                  onChange={e => onChange({...data, installments: e.target.value})} 
                />
              </div>
            </div>
             <div className="space-y-2 col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dia Venc.</label>
              <div className="relative">
                <input 
                  required
                  type="number" 
                  min="1" 
                  max="31"
                  placeholder="Dia" 
                  className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none font-black text-sm text-center text-white placeholder:text-slate-700 transition-all" 
                  value={data.dueDate || ''} 
                  onChange={e => onChange({...data, dueDate: e.target.value})} 
                />
              </div>
            </div>
          </div>
          
          {data.totalValue && parseInt(data.installments) > 1 && (
            <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 flex items-center justify-between text-xs font-black text-indigo-400 uppercase tracking-tighter">
              <div className="flex items-center gap-2">
                <CreditCard size={14} />
                <span>Projeção Mensal</span>
              </div>
              <span className="text-sm">
                {data.installments}x de {formatCurrency(parseFloat(data.totalValue) / parseInt(data.installments))}
              </span>
            </div>
          )}

          <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
             <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = data.category === cat.id;
                return (
                  <button 
                    key={cat.id} 
                    type="button" 
                    onClick={() => onChange({...data, category: cat.id})} 
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 ${isSelected ? 'bg-indigo-600/20 border-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}
                  >
                    <Icon size={18} className={isSelected ? cat.color : ''} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">{cat.id}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-indigo-600 py-5 rounded-[1.5rem] text-white font-black text-lg active:scale-95 transition-all shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-600/40 mt-4 flex items-center justify-center gap-3"
          >
            {isEditing ? 'Salvar Alterações' : 'Confirmar Lançamento'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BillModal;