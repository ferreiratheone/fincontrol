import React, { useState, useEffect, useMemo } from 'react';
import firebase from 'firebase/compat/app';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  PieChart,
  Clock,
  Calculator,
  Home,
  Gamepad2,
  Utensils,
  HeartPulse,
  Car,
  BookOpen,
  MoreHorizontal,
  Search,
  Zap,
  Star,
  CreditCard,
  LogOut,
  Pencil
} from 'lucide-react';
import { db, isDemo, auth } from '../services/firebase';
import { Bill, Income, Stats, NewBillForm, IncomeForm } from '../types';
import IncomeModal from './IncomeModal';
import BillModal from './BillModal';
import Toast, { ToastType } from './Toast';

interface DashboardProps {
  user: any;
}

const CATEGORY_MAP: Record<string, { icon: any, color: string }> = {
  'Fixa': { icon: Home, color: 'text-blue-400' },
  'Lazer': { icon: Gamepad2, color: 'text-purple-400' },
  'Comida': { icon: Utensils, color: 'text-orange-400' },
  'Saúde': { icon: HeartPulse, color: 'text-rose-400' },
  'Transporte': { icon: Car, color: 'text-cyan-400' },
  'Educação': { icon: BookOpen, color: 'text-emerald-400' },
  'Outros': { icon: MoreHorizontal, color: 'text-slate-400' }
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  // Form States
  const [newBill, setNewBill] = useState<NewBillForm>({ 
    name: '', 
    totalValue: '', 
    installments: '1', 
    isCreditCard: false, 
    category: 'Fixa' 
  });
  
  const [incomeData, setIncomeData] = useState<IncomeForm>({ 
    salary: '', 
    vale: '', 
    spendingLimit: '',
    onlySalary: false 
  });

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!user) return;
    
    // Firestore Collections
    const billsCol = db.collection('bills').where('userId', '==', user.uid || 'demo-user');
    const incomesCol = db.collection('incomes').where('userId', '==', user.uid || 'demo-user');

    // Subscribe to Bills
    const unsubBills = billsCol.onSnapshot((snap) => {
      const fetchedBills = snap.docs.map(d => ({ id: d.id, ...d.data() } as Bill));
      setBills(fetchedBills);
    });

    // Subscribe to Incomes
    const unsubIncomes = incomesCol.onSnapshot((snap) => {
      const fetchedIncomes = snap.docs.map(d => ({ id: d.id, ...d.data() } as Income));
      setIncomes(fetchedIncomes);
    });

    return () => {
      unsubBills();
      unsubIncomes();
    };
  }, [user]);

  // --- HELPERS ---
  // --- HELPERS ---
  const generateId = () => {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  
  const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

  // Unique ID for income doc to prevent user collisions and permission errors
  const getIncomeDocId = (date: Date) => {
    const uid = user?.uid || 'demo-user';
    return `${uid}_${date.getFullYear()}-${date.getMonth()}`;
  };
  
  const getMonthLabel = (date: Date) => 
    new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);

  // --- COMPUTED DATA ---
  const currentMonthBills = useMemo(() => {
    return bills
      .filter(b => b.month === currentDate.getMonth() && b.year === currentDate.getFullYear())
      .filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => Number(a.isPaid) - Number(b.isPaid)); // Unpaid first
  }, [bills, currentDate, searchQuery]);

  const currentIncome = useMemo(() => {
    // Search for income matching the unique user ID
    const docId = getIncomeDocId(currentDate);
    return incomes.find(i => i.id === docId) || { 
      id: '', 
      salary: 0, 
      vale: 0, 
      onlySalary: true 
    };
  }, [incomes, currentDate, user]);

  const stats: Stats = useMemo(() => {
    const salaryDate = currentIncome.salaryDate || 5;
    const valeDate = currentIncome.valeDate || 20;
    
    // Sort bills by due date for correct flow
    const sortedBills = [...currentMonthBills].sort((a, b) => (a.dueDate || 10) - (b.dueDate || 10));

    let availableSalary = Number(currentIncome.salary);
    let availableVale = currentIncome.onlySalary ? 0 : Number(currentIncome.vale);
    
    let totalExp = 0;
    let totalPaid = 0;

    sortedBills.forEach(bill => {
       const val = bill.value || 0;
       totalExp += val;
       if (bill.isPaid) totalPaid += val;

       const due = bill.dueDate || 10;
       
       // Deduct logic
       if (bill.isPaid) {
          if (due >= salaryDate && due < valeDate) {
             // Paid with Salary
             availableSalary -= val;
          } else if (due >= valeDate) {
             // Paid with Vale (or Salary leftovers)
             if (availableVale >= val) {
                availableVale -= val;
             } else {
                const remainder = val - availableVale;
                availableVale = 0;
                availableSalary -= remainder;
             }
          } else {
             // Before salary (e.g. late from previous or early in month) - assume Salary
             availableSalary -= val;
          }
       }
    });

    const totalInc = Number(currentIncome.salary) + (currentIncome.onlySalary ? 0 : Number(currentIncome.vale));
    // Balance is essentially what's left
    const balance = availableSalary + availableVale; 
    
    const usagePerc = totalInc > 0 ? (totalExp / totalInc) * 100 : 0;
    
    const categories = currentMonthBills.reduce((acc, bill) => { 
      acc[bill.category] = (acc[bill.category] || 0) + (bill.value || 0); 
      return acc; 
    }, {} as Record<string, number>);

    return { totalExp, totalPaid, totalInc, balance, usagePerc, categories };
  }, [currentMonthBills, currentIncome]);

  // --- ACTIONS ---
  const openIncomeModal = () => {
    setIncomeData({
      salary: currentIncome.salary ? currentIncome.salary.toString() : '',
      vale: currentIncome.vale ? currentIncome.vale.toString() : '',
      spendingLimit: currentIncome.spendingLimit ? currentIncome.spendingLimit.toString() : '',
      salaryDate: currentIncome.salaryDate ? currentIncome.salaryDate.toString() : '5',
      valeDate: currentIncome.valeDate ? currentIncome.valeDate.toString() : '20',
      onlySalary: currentIncome.onlySalary
    });
    setIsIncomeModalOpen(true);
  };

  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const newIncome = {
      salary: Number(incomeData.salary),
      vale: incomeData.onlySalary ? 0 : Number(incomeData.vale),
      spendingLimit: incomeData.spendingLimit && !isNaN(Number(incomeData.spendingLimit)) ? Number(incomeData.spendingLimit) : 0,
      salaryDate: Number(incomeData.salaryDate) || 5, // Default to 5th
      valeDate: Number(incomeData.valeDate) || 20, // Default to 20th
      onlySalary: incomeData.onlySalary,
      updatedAt: new Date().toISOString(),
      userId: user.uid || 'demo-user'
    };
    
    // Use user-specific ID
    const docId = getIncomeDocId(currentDate);

    await db.collection('incomes').doc(docId).set({
      id: docId,
      ...newIncome
    }, { merge: true });

    showToast("Renda e datas atualizadas com sucesso!", "success");
    setIsIncomeModalOpen(false);
  };

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const inst = parseInt(newBill.installments);
    const totalVal = parseFloat(newBill.totalValue);
    const timestamp = new Date().toISOString();
    const valPerInstallment = totalVal / inst;
    if (editingBillId) {
       // --- EDIT MODE ---
       await db.collection('bills').doc(editingBillId).update({
        name: newBill.name,
        value: totalVal, // In edit mode, we treat the input value as the final value for this bill
        totalInstallments: inst > 1 ? inst : 1, 
        dueDate: Number(newBill.dueDate) || 10,
        category: newBill.category || 'Outros',
        isCreditCard: newBill.isCreditCard,
        updatedAt: timestamp
      });
      showToast("Lançamento atualizado!", "success");
    } else {
      // --- CREATE MODE ---
      const valPerInstallment = totalVal / inst;
      const purchaseId = generateId();
      const batchBills = [];
      const batch = db.batch();

      for (let i = 0; i < inst; i++) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        const ref = db.collection('bills').doc();
        batch.set(ref, {
          name: newBill.name,
          totalValue: totalVal,
          value: valPerInstallment,
          month: d.getMonth(),
          year: d.getFullYear(),
          installmentNumber: i + 1,
          totalInstallments: inst,
          purchaseId: purchaseId,
          isPaid: false,
          category: newBill.category || 'Outros',
          isCreditCard: newBill.isCreditCard,
          dueDate: Number(newBill.dueDate) || 10,
          userId: user.uid,
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
      await batch.commit();
      
      const newTotalExp = stats.totalExp + totalVal; 
      const limit = currentIncome.spendingLimit || 0;
      
      if (limit > 0 && newTotalExp > limit * 0.8) {
         showToast(`Alerta: ${(newTotalExp / limit * 100).toFixed(0)}% do limite atingido!`, "warning");
      } else {
         showToast("Lançamento adicionado!", "success");
      }
    }

    setIsBillModalOpen(false);
    setNewBill({ name: '', totalValue: '', installments: '1', isCreditCard: false, category: 'Fixa', dueDate: '' });
    setEditingBillId(null);
  };

  const handleEditBill = (bill: Bill) => {
    setNewBill({
      name: bill.name,
      totalValue: bill.value.toString(), // For editing single bill, totalValue is its value
      installments: bill.totalInstallments.toString(),
      isCreditCard: bill.isCreditCard,
      category: bill.category,
      dueDate: bill.dueDate ? bill.dueDate.toString() : ''
    });
    setEditingBillId(bill.id);
    setIsBillModalOpen(true);
  };

  const updateStatus = async (id: string, isPaid: boolean) => {
    await db.collection('bills').doc(id).update({ isPaid });
  };

  const deleteBill = async (id: string) => {
    if (window.confirm("Tem certeza que deseja apagar este lançamento?")) {
      await db.collection('bills').doc(id).delete();
      showToast("Lançamento removido.", "info");
    }
  };

  const getPurchaseStatus = (bill: Bill) => {
    if (!bill.purchaseId || !bill.totalInstallments) return null;
    const related = bills.filter(b => b.purchaseId === bill.purchaseId);
    const paidCount = related.filter(b => b.isPaid).length;
    return { paidCount };
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="max-w-2xl mx-auto min-h-[100dvh] pb-32 px-4 md:px-0 animate-fade-in flex flex-col justify-start pt-safe-top">
      
      {/* HEADER */}
      <header className="pt-10 mb-8">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2.5 rounded-2xl shadow-lg shadow-purple-600/40 animate-float">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-2xl tracking-tight leading-none">FinControl</h1>
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Dashboard Premium</span>
                {user?.displayName && (
                  <span className="text-purple-400 text-[11px] font-black mt-1">Olá, {user.displayName.split(' ')[0]}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => auth.signOut()}
              className="group flex items-center gap-2 text-slate-500 hover:text-rose-400 transition-all font-black text-[10px] uppercase tracking-widest"
            >
              Sair <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-2 glass-dark px-4 py-2 rounded-full border border-white/5">
              <button 
                onClick={() => changeMonth(-1)} 
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <ChevronLeft size={16}/>
              </button>
              <span className="capitalize text-xs font-black text-white min-w-[100px] text-center">
                {getMonthLabel(currentDate)}
              </span>
              <button 
                onClick={() => changeMonth(1)} 
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <ChevronRight size={16}/>
              </button>
            </div>
            <button 
              onClick={openIncomeModal} 
              className="bg-indigo-600/20 text-indigo-400 p-3 rounded-full border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              <Wallet size={20} />
            </button>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="glass-dark rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-600/30 transition-all duration-700" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-emerald-600/20 transition-all duration-700" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Saldo Disponível</p>
            {/* Show Spending Limit Progress if set */}
            {typeof currentIncome.spendingLimit === 'number' && currentIncome.spendingLimit > 0 && (
               <div className="mt-6 pt-6 border-t border-white/5 animate-fade-in delay-100">
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <AlertCircle size={12} className="text-amber-500" /> Teto de Gastos
                     </span>
                     <span className="text-xs font-bold text-amber-200">
                        {((stats.totalExp / currentIncome.spendingLimit) * 100).toFixed(1)}% <span className="text-slate-500">de {formatCurrency(currentIncome.spendingLimit)}</span>
                     </span>
                  </div>
                  <div className="w-full h-3 bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
                     <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                           stats.totalExp > currentIncome.spendingLimit ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 
                           stats.totalExp > currentIncome.spendingLimit * 0.8 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                           'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                        }`}
                        style={{ width: `${Math.min((stats.totalExp / currentIncome.spendingLimit) * 100, 100)}%` }}
                     />
                  </div>
               </div>
            )}
            <h2 className="text-5xl font-black text-white tracking-tighter mb-4">
                {formatCurrency(stats.balance)}
            </h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <span className="text-xs font-bold text-slate-300">Renda: {formatCurrency(stats.totalInc)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]" />
                  <span className="text-xs font-bold text-slate-300">Despesas: {formatCurrency(stats.totalExp)}</span>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-32 flex flex-col items-center">
              <div className="relative w-24 h-24 mb-2">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-white/5 stroke-current"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${stats.usagePerc > 90 ? 'text-rose-500' : 'text-emerald-500'} stroke-current transition-all duration-1000 ease-out`}
                    strokeWidth="3"
                    strokeDasharray={`${Math.min(stats.usagePerc, 100)}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-black text-white">{Math.round(stats.usagePerc)}%</span>
                  <span className="text-[7px] font-bold text-slate-500 uppercase">Uso</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* TABS & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex gap-2 glass-dark p-1.5 rounded-2xl border border-white/5 self-start">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-white'}`}
          >
            Resumo
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-white'}`}
          >
            Lançamentos
          </button>
        </div>

        <div className="relative group max-w-xs w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar contas..." 
            className="w-full glass-dark pl-12 pr-4 py-3 rounded-2xl border border-white/5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm text-white placeholder:text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* CONTENT */}
      <main>
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
            
            {/* CATEGORIES COLUMN */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                  <PieChart size={16} className="text-indigo-400" /> Gastos por Categoria
                </h3>
              </div>
              <div className="glass-dark rounded-[2rem] p-6 border border-white/5 space-y-6">
                {Object.keys(stats.categories).length > 0 ? (
                  Object.entries(stats.categories)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, val]) => {
                      const CatInfo = CATEGORY_MAP[cat] || CATEGORY_MAP['Outros'];
                      const Icon = CatInfo.icon;
                      return (
                        <div key={cat} className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl bg-slate-800/50 ${CatInfo.color}`}>
                                <Icon size={14} />
                              </div>
                              <span className="text-xs font-bold text-slate-300">{cat}</span>
                            </div>
                            <span className="text-xs font-black text-white">{formatCurrency(val)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full opacity-80 rounded-full transition-all duration-1000 ${CatInfo.color.replace('text', 'bg')}`} 
                              style={{width: `${(val / stats.totalExp) * 100}%`}}
                            />
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                      <Zap size={32} />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nada por aqui ainda</p>
                  </div>
                )}
              </div>
            </div>

            {/* INSIGHTS COLUMN */}
            <div className="space-y-6">
               <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2 mb-4">
                <Star size={16} className="text-amber-400" /> Insights de Gestão
              </h3>
              <div className="space-y-4">
                {stats.usagePerc > 80 && (
                   <div className="glass-dark p-6 rounded-[2rem] border border-rose-500/20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <AlertCircle size={40} className="text-rose-500" />
                     </div>
                     <h4 className="text-rose-400 font-bold text-sm mb-2">Atenção ao Orçamento!</h4>
                     <p className="text-slate-400 text-xs leading-relaxed">
                       Você já utilizou <strong>{Math.round(stats.usagePerc)}%</strong> da sua renda este mês. Considere revisar seus gastos não essenciais.
                     </p>
                   </div>
                )}
                
                {stats.balance > 0 && stats.usagePerc < 50 && (
                   <div className="glass-dark p-6 rounded-[2rem] border border-emerald-500/20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ArrowUpCircle size={40} className="text-emerald-500" />
                     </div>
                     <h4 className="text-emerald-400 font-bold text-sm mb-2">Excelente Gestão!</h4>
                     <p className="text-slate-400 text-xs leading-relaxed">
                       Seu saldo está positivo e você gastou menos da metade da sua renda. Ótimo momento para investir!
                     </p>
                   </div>
                )}

                <div className="glass-dark p-6 rounded-[2rem] border border-indigo-500/20 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                      <Calculator size={40} className="text-indigo-500" />
                   </div>
                   <h4 className="text-indigo-400 font-bold text-sm mb-2">Média de Gastos Diários</h4>
                   <p className="text-slate-400 text-xs leading-relaxed">
                     Sua média de gastos projetada para este mês é de <strong>{formatCurrency(stats.totalExp / 30)}</strong> por dia.
                   </p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-4 animate-slide-up pb-10">
            {currentMonthBills.length === 0 ? (
               <div className="py-24 flex flex-col items-center opacity-20 text-slate-500">
                <Calendar size={80} className="mb-6" />
                <p className="font-black text-sm uppercase tracking-[0.3em]">Sem registros</p>
                <p className="text-xs font-medium mt-2">em {getMonthLabel(currentDate)}</p>
              </div>
            ) : (
              currentMonthBills.map(bill => {
                const pStatus = getPurchaseStatus(bill);
                const CatInfo = CATEGORY_MAP[bill.category] || CATEGORY_MAP['Outros'];
                const Icon = CatInfo.icon;
                
                return (
                  <div key={bill.id} className="glass-dark p-5 rounded-[2.5rem] border border-white/5 transition-all group hover:border-white/10 hover:shadow-2xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${bill.isPaid ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                          {bill.isPaid ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-black text-lg transition-colors ${bill.isPaid ? 'line-through text-slate-600' : 'text-white'}`}>
                            {bill.name}
                          </span>
                          
                          <div className="flex flex-col gap-1 mt-1">
                             <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider ${CatInfo.color}`}>
                                    <Icon size={12} /> {bill.category}
                                </div>
                                {bill.isCreditCard && (
                                   <div className="flex items-center gap-1 text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded-md">
                                     <CreditCard size={10} /> Crédito
                                   </div>
                                )}
                                {bill.totalInstallments > 1 && (
                                   <span className="text-[9px] font-black text-white/30 uppercase tracking-widest flex items-center gap-1">
                                    <Calculator size={10} /> {bill.installmentNumber}/{bill.totalInstallments}
                                   </span>
                                )}
                             </div>
                             
                             {/* Status Badges */}
                             {!bill.isPaid && (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {/* Late Check */}
                                    {new Date().getDate() > (bill.dueDate || 10) && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear() && (
                                       <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                          <AlertCircle size={10} /> Atrasado
                                       </span>
                                    )}
                                    
                                    {/* Pending Revenue Check */}
                                    {(() => {
                                       const due = bill.dueDate || 10;
                                       const salaryDate = currentIncome.salaryDate || 5;
                                       const valeDate = currentIncome.valeDate || 20;
                                       const today = new Date().getDate();
                                       const isCurrentMonth = currentDate.getMonth() === new Date().getMonth();

                                       if (!isCurrentMonth) return null;

                                       // Waiting for Salary?
                                       if (due >= salaryDate && due < valeDate && today < salaryDate) {
                                          return (
                                             <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                                <Clock size={10} /> Aguardando Salário
                                             </span>
                                          );
                                       }
                                       // Waiting for Vale?
                                       if (due >= valeDate && today < valeDate) {
                                          return (
                                             <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                                <Clock size={10} /> Aguardando Vale
                                             </span>
                                          );
                                       }
                                       return null;
                                    })()}
                                </div>
                             )}
                             
                             {/* Due Date Display */}
                             <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                                <Calendar size={10} /> Vence dia {bill.dueDate || 10}
                             </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xl font-black tracking-tight transition-colors ${bill.isPaid ? 'text-slate-600' : 'text-white'}`}>
                          {formatCurrency(bill.value)}
                        </span>
                        <button 
                          onClick={() => handleEditBill(bill)} 
                          className="p-2 text-slate-600 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Pencil size={16}/>
                        </button>
                        <button 
                          onClick={() => deleteBill(bill.id)} 
                          className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <button 
                        onClick={() => updateStatus(bill.id, true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${bill.isPaid ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20'}`}
                      >
                        <CheckCircle2 size={14} /> Pago
                      </button>
                      <button 
                        onClick={() => updateStatus(bill.id, false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!bill.isPaid ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/20'}`}
                      >
                        <AlertCircle size={14} /> Pendente
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>

      {/* FAB */}
      <button 
        onClick={() => setIsBillModalOpen(true)} 
        className="fixed bottom-10 right-10 w-20 h-20 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center active:scale-90 hover:scale-105 transition-all z-40 border-4 border-slate-900 group"
      >
        <Plus size={40} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* MODALS */}
      <IncomeModal 
        isOpen={isIncomeModalOpen} 
        onClose={() => setIsIncomeModalOpen(false)} 
        onSave={handleSaveIncome}
        data={incomeData}
        onChange={setIncomeData}
      />

      <BillModal 
        isOpen={isBillModalOpen} 
        onClose={() => {
          setIsBillModalOpen(false);
          setEditingBillId(null);
          setNewBill({ name: '', totalValue: '', installments: '1', isCreditCard: false, category: 'Fixa', dueDate: '' });
        }}
        onSave={handleAddBill}
        data={newBill}
        onChange={setNewBill}
        isEditing={!!editingBillId}
      />

    </div>
  );
};

export default Dashboard;