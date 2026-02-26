import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Pencil,
  User,
  Target,
  Smile,
  PiggyBank,
  Download,
  Upload,
  Landmark
} from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal States
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'home' | 'investments' | 'history'>('home');

  // Haptic feedback function for native app feel
  const vibrate = (duration: number | number[] = 50) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(duration as VibratePattern); } catch(e) {}
    }
  };

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

  // --- DATA FETCHING (LOCAL STORAGE) ---
  useEffect(() => {
    const localBills = localStorage.getItem('fincontrol_bills');
    const localIncomes = localStorage.getItem('fincontrol_incomes');
    
    if (localBills) {
      try { setBills(JSON.parse(localBills)); } catch (e) {}
    }
    if (localIncomes) {
      try { setIncomes(JSON.parse(localIncomes)); } catch (e) {}
    }
  }, []);

  const saveBills = (newBills: Bill[]) => {
    setBills(newBills);
    localStorage.setItem('fincontrol_bills', JSON.stringify(newBills));
  };

  const saveIncomes = (newIncomes: Income[]) => {
    setIncomes(newIncomes);
    localStorage.setItem('fincontrol_incomes', JSON.stringify(newIncomes));
  };


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
  
  const getIncomeDocId = (date: Date) => {
    const uid = user?.uid || 'local-device';
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
    
    const sortedBills = [...currentMonthBills].sort((a, b) => (a.dueDate || 10) - (b.dueDate || 10));

    let availableSalary = Number(currentIncome.salary) || 0;
    let availableVale = currentIncome.onlySalary ? 0 : (Number(currentIncome.vale) || 0);
    
    let totalExp = 0;
    let totalPaid = 0;

    sortedBills.forEach(bill => {
       const val = bill.value || 0;
       totalExp += val;
       if (bill.isPaid) totalPaid += val;

       const due = bill.dueDate || 10;
       
       if (bill.isPaid) {
          if (due >= salaryDate && due < valeDate) {
             availableSalary -= val;
          } else if (due >= valeDate) {
             if (availableVale >= val) {
                availableVale -= val;
             } else {
                const remainder = val - availableVale;
                availableVale = 0;
                availableSalary -= remainder;
             }
          } else {
             availableSalary -= val;
          }
       }
    });

    const totalInc = (Number(currentIncome.salary) || 0) + (currentIncome.onlySalary ? 0 : (Number(currentIncome.vale) || 0));
    const balance = availableSalary + availableVale; 
    
    const usagePerc = totalInc > 0 ? (totalExp / totalInc) * 100 : 0;
    
    const categories = currentMonthBills.reduce((acc, bill) => { 
      acc[bill.category] = (acc[bill.category] || 0) + (bill.value || 0); 
      return acc; 
    }, {} as Record<string, number>);

    return { totalExp, totalPaid, totalInc, balance, usagePerc, categories };
  }, [currentMonthBills, currentIncome]);

  // --- ACTIONS ---
  const handleExportData = () => {
    vibrate();
    try {
      const dataToExport = { bills, incomes };
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fincontrol_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast("Dados exportados com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      showToast("Erro ao exportar dados.", "error");
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    vibrate();
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedData = JSON.parse(text);

        if (!importedData.bills || !importedData.incomes) {
          showToast("Arquivo inválido. Formato incorreto.", "error");
          return;
        }

        if (window.confirm('Você tem certeza que deseja importar esses dados? Isso irá adicionar as informações do arquivo à sua conta atual e pode substituir contas antigas.')) {
          // Merge imported incomes and bills
          const newIncomes = [...incomes];
          importedData.incomes.forEach((inc: any) => {
            const idx = newIncomes.findIndex(i => i.id === inc.id);
            if (idx >= 0) newIncomes[idx] = { ...newIncomes[idx], ...inc };
            else newIncomes.push({ ...inc });
          });

          const newBills = [...bills];
          importedData.bills.forEach((bill: any) => {
            const idx = newBills.findIndex(b => b.id === bill.id);
            if (idx >= 0) newBills[idx] = { ...newBills[idx], ...bill, userId: user.uid || 'local-device' };
            else newBills.push({ ...bill, userId: user.uid || 'local-device', id: bill.id || generateId() });
          });

          saveIncomes(newIncomes);
          saveBills(newBills);
          showToast("Dados importados com sucesso!", "success");
        }
      } catch (error) {
        console.error("Erro ao importar:", error);
        showToast("Erro ao importar dados. Verifique o arquivo.", "error");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const openIncomeModal = () => {
    vibrate();
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

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const docId = getIncomeDocId(currentDate);
    const newIncome: Income = {
      id: docId,
      salary: Number(incomeData.salary),
      vale: incomeData.onlySalary ? 0 : Number(incomeData.vale),
      spendingLimit: incomeData.spendingLimit && !isNaN(Number(incomeData.spendingLimit)) ? Number(incomeData.spendingLimit) : 0,
      salaryDate: Number(incomeData.salaryDate) || 5,
      valeDate: Number(incomeData.valeDate) || 20,
      onlySalary: incomeData.onlySalary,
      updatedAt: new Date().toISOString()
    };
    
    const newIncomes = [...incomes];
    const idx = newIncomes.findIndex(i => i.id === docId);
    if (idx >= 0) newIncomes[idx] = newIncome;
    else newIncomes.push(newIncome);

    saveIncomes(newIncomes);
    showToast("Renda e datas atualizadas com sucesso!", "success");
    setIsIncomeModalOpen(false);
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const inst = parseInt(newBill.installments);
    const totalVal = parseFloat(newBill.totalValue);
    const timestamp = new Date().toISOString();
    const valPerInstallment = totalVal / inst;
    
    if (editingBillId) {
       // --- EDIT MODE ---
       const updatedBills = bills.map(b => b.id === editingBillId ? {
          ...b,
          name: newBill.name,
          value: totalVal, 
          totalInstallments: inst > 1 ? inst : 1, 
          dueDate: Number(newBill.dueDate) || 10,
          category: newBill.category || 'Outros',
          isCreditCard: newBill.isCreditCard,
          updatedAt: timestamp
       } : b);
       saveBills(updatedBills);
       showToast("Lançamento atualizado!", "success");
    } else {
      // --- CREATE MODE ---
      const purchaseId = generateId();
      const newBills = [...bills];

      for (let i = 0; i < inst; i++) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        newBills.push({
          id: generateId(),
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
          userId: user.uid || 'local-device',
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
      saveBills(newBills);
      
      const newTotalExp = stats.totalExp + totalVal; 
      const limit = currentIncome.spendingLimit || 0;
      
      if (limit > 0 && newTotalExp > limit * 0.8) {
         showToast(`Alerta: ${(newTotalExp / limit * 100).toFixed(0)}% do limite atingido!`, "warning");
         vibrate([100, 50, 100]); // warning vibrate pattern
      } else {
         showToast("Lançamento adicionado!", "success");
         vibrate();
      }
    }

    setIsBillModalOpen(false);
    setNewBill({ name: '', totalValue: '', installments: '1', isCreditCard: false, category: 'Fixa', dueDate: '' });
    setEditingBillId(null);
  };

  const handleEditBill = (bill: Bill) => {
    setNewBill({
      name: bill.name,
      totalValue: bill.value.toString(),
      installments: bill.totalInstallments.toString(),
      isCreditCard: bill.isCreditCard,
      category: bill.category,
      dueDate: bill.dueDate ? bill.dueDate.toString() : ''
    });
    setEditingBillId(bill.id);
    setIsBillModalOpen(true);
  };

  const updateStatus = (id: string, isPaid: boolean) => {
    vibrate();
    const updatedBills = bills.map(b => b.id === id ? { ...b, isPaid } : b);
    saveBills(updatedBills);
  };

  const deleteBill = (bill: Bill) => {
    // Basic single bill deletion logic
    const executeDelete = (idsToDelete: string[]) => {
      const updatedBills = bills.filter(b => !idsToDelete.includes(b.id));
      saveBills(updatedBills);
      showToast(idsToDelete.length > 1 ? "Todas as parcelas foram removidas." : "Lançamento removido.", "info");
    };

    if (bill.purchaseId && bill.totalInstallments > 1) {
      // It's part of a multi-installment purchase
      const wantsAll = window.confirm(
        `Esta é a parcela ${bill.installmentNumber} de ${bill.totalInstallments}.\n\nDeseja apagar TODAS as parcelas dessa compra junta?`
      );
      
      if (wantsAll) {
        // Find all bills with this purchaseId
        const relatedIds = bills.filter(b => b.purchaseId === bill.purchaseId).map(b => b.id);
        executeDelete(relatedIds);
      } else {
         if (window.confirm("Deseja apagar APENAS esta parcela selecionada?")) {
           executeDelete([bill.id]);
         }
      }
    } else {
      // Regular single bill
      if (window.confirm("Tem certeza que deseja apagar este lançamento?")) {
        executeDelete([bill.id]);
      }
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
    <div className="max-w-xl mx-auto h-[100dvh] flex flex-col overflow-hidden bg-slate-950 font-sans selection:bg-purple-500/30">
      
      {/* HEADER FIXO - SEMPRE VISÍVEL MAS COMPACTO */}
      <header className="shrink-0 px-4 pt-safe-top pt-6 pb-2 z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[2px] shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border border-white/10">
                   <User className="text-white w-5 h-5" />
                </div>
             </div>
             <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bem-vindo(a),</p>
                <h1 className="text-white font-black text-sm">{user?.displayName?.split(' ')[0] || 'Gestor'}</h1>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportData} 
              className="w-10 h-10 rounded-xl glass-dark flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-400/50 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all"
              title="Exportar Dados"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-10 h-10 rounded-xl glass-dark flex items-center justify-center text-slate-300 hover:text-blue-400 hover:border-blue-400/50 hover:shadow-[0_0_15px_rgba(96,165,250,0.3)] transition-all"
              title="Importar Dados"
            >
              <Upload size={18} />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportData} 
                className="hidden" 
                accept=".json" 
              />
            </button>
            <button 
              onClick={openIncomeModal} 
              className="w-10 h-10 rounded-xl glass-dark flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-400/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
              title="Configurar Renda"
            >
              <Wallet size={18} />
            </button>
          </div>
        </div>

        {/* MONTH SELECTOR PILL (Fixo no topo em todas as telas) */}
        <div className="flex justify-center">
           <div className="h-10 glass-dark rounded-full px-2 flex items-center gap-4 border border-white/10 shadow-lg">
              <button onClick={() => { changeMonth(-1); vibrate(); }} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-indigo-400 hover:bg-white/5 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="capitalize text-[11px] font-black text-white min-w-[100px] text-center tracking-widest">
                {getMonthLabel(currentDate)}
              </span>
              <button onClick={() => { changeMonth(1); vibrate(); }} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-indigo-400 hover:bg-white/5 transition-colors">
                <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO ROLÁVEL COM BARRA DE SCROLL OCULTA */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pb-[100px] relative w-full h-full">

        {/* --- ABA: RESUMO (HOME) --- */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in pt-4">
            {/* VIRTUAL CREDIT CARD */}
            <div className="glass-card rounded-[2rem] p-6 relative hologram-effect bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-8 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-600 opacity-80 shadow-md"></div>
                  <div className="flex items-center gap-1.5 opacity-70">
                    <div className="w-6 h-6 rounded-full bg-white/40"></div>
                    <div className="w-6 h-6 rounded-full bg-white/20 -ml-3"></div>
                  </div>
              </div>

              <div className="mb-6 relative z-10">
                  <p className="text-[10px] text-indigo-200/70 font-black uppercase tracking-widest mb-1">Saldo Disponível</p>
                  <h2 className="text-4xl font-black text-white tracking-tighter drop-shadow-md">
                    {formatCurrency(stats.balance)}
                  </h2>
              </div>

              {typeof currentIncome.spendingLimit === 'number' && currentIncome.spendingLimit > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200/50">Teto de Gastos</span>
                      <span className="text-[9px] font-bold text-indigo-200">
                        {((stats.totalExp / currentIncome.spendingLimit) * 100).toFixed(1)}%
                      </span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${ stats.totalExp > currentIncome.spendingLimit ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]' : stats.totalExp > currentIncome.spendingLimit * 0.8 ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,1)]' : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]'}`} style={{ width: `${Math.min((stats.totalExp / currentIncome.spendingLimit) * 100, 100)}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-6 mt-4 pt-4 border-t border-white/10 relative z-10">
                  <div>
                    <p className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-wider mb-0.5">Renda Mensal</p>
                    <p className="text-xs font-black text-white">{formatCurrency(stats.totalInc)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-rose-400/80 uppercase tracking-wider mb-0.5">Gastos (Saídas)</p>
                    <p className="text-xs font-black text-white">{formatCurrency(stats.totalExp)}</p>
                  </div>
                  <div className="ml-auto flex items-center justify-center">
                    <div className="relative w-10 h-10">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path className="text-white/10 stroke-current" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className={`${stats.usagePerc > 90 ? 'text-rose-400' : 'text-cyan-400'} stroke-current transition-all duration-1000`} strokeWidth="4" strokeDasharray={`${Math.min(stats.usagePerc, 100)}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[8px] font-black text-white">{Math.round(stats.usagePerc)}%</span>
                        </div>
                    </div>
                  </div>
              </div>
            </div>

            <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2 mb-2">
              <Star size={16} className="text-amber-400" /> Insights Rápidos
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-dark p-4 rounded-3xl border border-indigo-500/20">
                <Calculator size={20} className="text-indigo-400 mb-2" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Custo Diário</p>
                <p className="text-sm font-black text-white">{formatCurrency(stats.totalExp / 30)}</p>
              </div>
              
              <div className="glass-dark p-4 rounded-3xl border border-emerald-500/20">
                <CheckCircle2 size={20} className="text-emerald-400 mb-2" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Pago</p>
                <p className="text-sm font-black text-white">{formatCurrency(stats.totalPaid)}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA: INVESTIMENTOS & INTELIGÊNCIA --- */}
        {activeTab === 'investments' && (
          <div className="space-y-6 animate-fade-in pt-4">
             <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
              <Target size={16} className="text-emerald-400" /> Método 50/30/20
            </h3>
            
            <div className="glass-dark p-6 rounded-[2rem] border border-emerald-500/20">
              <p className="text-slate-400 text-xs mb-6">Uma sugestão inteligente de como dividir sua renda total de <strong>{formatCurrency(stats.totalInc)}</strong> este mês:</p>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 text-slate-300 font-bold"><Home size={14} className="text-blue-400"/> Essenciais (50%)</span>
                    <span className="font-black text-white opacity-80">{formatCurrency(stats.totalInc * 0.5)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]" style={{width: '50%'}}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 text-slate-300 font-bold"><Smile size={14} className="text-amber-400"/> Lazer (30%)</span>
                    <span className="font-black text-white opacity-80">{formatCurrency(stats.totalInc * 0.3)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{width: '30%'}}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 text-slate-300 font-bold"><PiggyBank size={14} className="text-emerald-400"/> Investimentos (20%)</span>
                    <span className="font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">{formatCurrency(stats.totalInc * 0.2)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{width: '20%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2 mt-4">
              <PieChart size={16} className="text-indigo-400" /> Distribuição Atual
            </h3>
            
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
                <div className="text-center py-6 text-slate-500">
                  <PieChart size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold uppercase tracking-widest">Nenhuma categoria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ABA: HISTÓRICO DE CONTAS --- */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-fade-in pt-4">
            <div className="relative group w-full mb-6 sticky top-0 z-20">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="w-full h-12 pl-12 pr-4 bg-slate-900 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium text-white placeholder:text-slate-600 shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {currentMonthBills.length === 0 ? (
               <div className="py-24 flex flex-col items-center opacity-20 text-slate-500">
                <Calendar size={80} className="mb-6" />
                <p className="font-black text-sm uppercase tracking-[0.3em]">Sem registros</p>
              </div>
            ) : (
              currentMonthBills.map(bill => {
                const CatInfo = CATEGORY_MAP[bill.category] || CATEGORY_MAP['Outros'];
                const Icon = CatInfo.icon;
                
                return (
                  <div key={bill.id} className="glass-dark p-4 rounded-3xl border border-white/5 transition-all group hover:border-white/10 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div onClick={() => updateStatus(bill.id, !bill.isPaid)} className={`cursor-pointer w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md ${bill.isPaid ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                          {bill.isPaid ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-black text-sm transition-colors ${bill.isPaid ? 'line-through text-slate-600' : 'text-white'}`}>
                            {bill.name}
                          </span>
                          
                          <div className="flex flex-col gap-1 mt-1">
                             <div className="flex items-center gap-2">
                                <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider ${CatInfo.color}`}>
                                    <Icon size={10} /> {bill.category}
                                </div>
                                {bill.isCreditCard && (
                                   <div className="flex items-center gap-1 text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-1.5 py-0.5 rounded-md">
                                     <CreditCard size={8} /> Crédito
                                   </div>
                                )}
                             </div>
                             
                             <span className="text-[9px] font-bold text-slate-500 mt-0.5">
                                Vence dia {bill.dueDate || 10}
                             </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-base font-black tracking-tight transition-colors ${bill.isPaid ? 'text-slate-600' : 'text-white'}`}>
                          {formatCurrency(bill.value)}
                        </span>
                        
                        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditBill(bill)} className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg">
                            <Pencil size={14}/>
                          </button>
                          <button onClick={() => deleteBill(bill)} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>

      {/* BOTTOM NAVIGATION BAR FIXA E SOBREPOSTA */}
      <nav className="absolute bottom-0 left-0 right-0 w-full sm:max-w-[390px] mx-auto z-40 px-4 pb-4 pt-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none flex justify-center pb-safe-bottom">
        <div className="glass-dark border border-white/10 rounded-[2rem] p-1.5 flex items-center justify-between pointer-events-auto backdrop-blur-2xl shadow-2xl relative w-full mb-2">
          
          <button 
            onClick={() => { setActiveTab('home'); vibrate(); }} 
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'home' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Home size={20} className={activeTab === 'home' ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''} />
            <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">Início</span>
          </button>

          <button 
            onClick={() => { setActiveTab('investments'); vibrate(); }} 
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'investments' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Landmark size={20} className={activeTab === 'investments' ? 'scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''} />
            <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">Cofres</span>
          </button>

          {/* CENTER FAB */}
          <div className="relative px-1">
            <button 
              onClick={() => { setIsBillModalOpen(true); vibrate(); }} 
              className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center active:scale-95 transition-all -translate-y-6 border-[5px] border-slate-950"
            >
              <Plus size={28} />
            </button>
          </div>

          <button 
            onClick={() => { setActiveTab('history'); vibrate(); }} 
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'history' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Calendar size={20} className={activeTab === 'history' ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''} />
            <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">Contas</span>
          </button>

        </div>
      </nav>

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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Dashboard;