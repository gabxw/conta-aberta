import type { Dashboard, ServiceValue } from "./types";
export interface OwnershipInputs {
  vehiclePrice: number;
  resaleValue: number;
  months: number;
  downPaymentPercent: number;
  interestMonthlyPercent: number;
  yieldMonthlyPercent: number;
  ipvaPercent: number;
  insuranceAnnual: number;
  maintenanceAnnual: number;
  tiresTotal: number;
  licensingAnnual: number;
}
export interface OwnershipPart {
  id: string;
  name: string;
  monthlyValue: number;
  explanation: string;
  category: string;
}
export interface Comparison {
  inputs: OwnershipInputs;
  subscriptionMonthly: number;
  cashMonthly: number;
  financedMonthly: number;
  installment: number;
  downPayment: number;
  cashDifference: number;
  financedDifference: number;
  cashPresentCost: number;
  financedPresentCost: number;
  subscriptionPresentCost: number;
  cashBreakdown: OwnershipPart[];
  method: string;
  scope: string;
}
export interface ContractOption {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number | null;
  allowanceKm: number | null;
  fitsUsage: boolean;
  recommended: boolean;
  cta: string;
}
export interface Account {
  dashboard: Dashboard;
  monthLabel: string;
  usedThisMonth: ServiceValue["items"];
  includedReferences: OwnershipPart[];
  estimatedCosts: OwnershipPart[];
  comparison: Comparison;
  recentAverageKm: number;
  contractOptions: ContractOption[];
  registeredInterests: string[];
  elapsedMonths: number;
  subscriptionPaidReference: number;
  periodLabel: string;
  shareText: string;
  statementMonth: string;
  usedServicesReferenceTotal: number;
  usedServicesCount: number;
}
