export type ActionType =
  | "mileage-plan"
  | "schedule-maintenance"
  | "review-document"
  | "dismiss-recommendation";
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  plate: string;
  color: string;
  odometerKm: number;
}
export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  occurredAt: string;
  status: string;
}
export interface ServiceValue {
  total: number;
  periodLabel: string;
  items: {
    id: string;
    name: string;
    date: string;
    referenceValue: number;
    description: string;
  }[];
}
export interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  reason: string;
  priority: number;
  ctaLabel: string;
  estimatedValue: number | null;
}
export interface Dashboard {
  customer: { id: string; name: string; firstName: string; email: string };
  vehicle: Vehicle;
  subscription: {
    id: string;
    planName: string;
    monthlyPrice: number;
    monthlyAllowanceKm: number;
    excessKmPrice: number;
    startDate: string;
    endDate: string;
  };
  referenceDate: string;
  isDemo: boolean;
  mileage: {
    currentKm: number;
    projectedKm: number;
    allowanceKm: number;
    excessKm: number;
    estimatedExcessCost: number;
    dailyAverageKm: number;
    remainingDays: number;
    safeDailyKm: number;
    series: { date: string; actualKm: number; projectedKm: number }[];
  };
  alerts: {
    id: string;
    type: string;
    severity: "warning" | "critical" | "info";
    title: string;
    description: string;
    dueDate: string;
    status: string;
    actionType: ActionType;
  }[];
  nextBestAction: Recommendation | null;
  serviceValue: ServiceValue;
  timeline: TimelineEvent[];
  usageSummary: {
    totalTrips: number;
    averageDailyKm: number;
    mostUsedDay: string;
  };
}
export interface Usage {
  months: {
    month: string;
    label: string;
    distanceKm: number;
    allowanceKm: number;
    trips: number;
  }[];
  daily: { date: string; distanceKm: number; trips: number }[];
  insights: string[];
}
export interface AdminOverview {
  totalCustomers: number;
  activeCustomers: number;
  totalEvents: number;
  actionsCompleted: number;
  recommendationConversion: number;
  eventsByName: { name: string; count: number }[];
  recentEvents: {
    id: string;
    name: string;
    customerName: string;
    page: string;
    occurredAt: string;
  }[];
  featureUsage: { feature: string; users: number; events: number }[];
}
