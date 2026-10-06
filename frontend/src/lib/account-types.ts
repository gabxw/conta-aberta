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
export interface DataSource {
  label: string;
  value: string;
  source: string;
  url: string | null;
}
export interface DailyValue {
  coveredThisMonth: number;
  coveredToday: number;
  dayOfMonth: number;
  daysInMonth: number;
  cumulativeByDay: number[];
}
export interface ContextualBenefit {
  title: string;
  partner: string;
  distance: string;
  discount: string;
  reason: string;
}
export interface Destination {
  city: string;
  trips: number;
  km: number;
}
export interface Recap {
  periodLabel: string;
  months: number;
  totalKm: number;
  worldTripPercent: number;
  kmToMoon: number;
  favoriteDestination: Destination;
  otherDestinations: Destination[];
  coveredTotal: number;
  paidTotal: number;
  difference: number;
  equivalents: { count: number; label: string }[];
  shareText: string;
}
export interface AssistantAnswer {
  answer: string;
  calculations: { name: string; input: string; result: string }[];
}
export interface Account {
  dashboard: Dashboard;
  monthLabel: string;
  usedThisMonth: ServiceValue["items"];
  includedReferences: OwnershipPart[];
  estimatedCosts: OwnershipPart[];
  comparison: Comparison;
  sources: DataSource[];
  recentAverageKm: number;
  elapsedMonths: number;
  subscriptionPaidReference: number;
  periodLabel: string;
  statementMonth: string;
  usedServicesReferenceTotal: number;
  usedServicesCount: number;
  today: DailyValue;
  benefit: ContextualBenefit;
  recap: Recap;
}
