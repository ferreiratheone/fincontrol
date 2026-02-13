export interface Bill {
  id: string;
  name: string;
  totalValue: number;
  value: number;
  month: number;
  year: number;
  installmentNumber: number;
  totalInstallments: number;
  purchaseId: string;
  isPaid: boolean;
  category: string;
  isCreditCard: boolean;
  userId: string;
  dueDate?: number; // Day of month (1-31)
}

export interface Income {
  id: string; // Format: "YYYY-M"
  salary: number;
  vale: number;
  onlySalary: boolean;
  spendingLimit?: number;
  salaryDate?: number; // Day of month (1-31)
  valeDate?: number; // Day of month (1-31)
  updatedAt?: string;
}

export interface Stats {
  totalExp: number;
  totalPaid: number;
  totalInc: number;
  balance: number;
  usagePerc: number;
  categories: Record<string, number>;
}

export interface NewBillForm {
  name: string;
  totalValue: string;
  installments: string;
  isCreditCard: boolean;
  category: string;
  dueDate?: string;
}

export interface IncomeForm {
  salary: string;
  vale: string;
  spendingLimit?: string;
  salaryDate?: string;
  valeDate?: string;
  onlySalary: boolean;
}

declare global {
  interface Window {
    THREE: any;
    __firebase_config?: string;
    __app_id?: string;
    __initial_auth_token?: string;
  }
}