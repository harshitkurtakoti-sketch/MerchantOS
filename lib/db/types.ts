export type UserRole = 'owner' | 'staff' | 'advisor' | 'admin';
export type BusinessCategory = 'retail' | 'd2c' | 'msme_manufacturing' | 'msme_services';
export type BusinessUserRole = 'owner' | 'staff' | 'advisor' | 'viewer';
export type InventoryEventType = 'purchase' | 'sale' | 'adjustment' | 'return';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cod' | 'wallet';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionSource = 'manual' | 'import' | 'system_generated';
export type ReceivableStatus = 'open' | 'partially_paid' | 'paid' | 'overdue';
export type PayableStatus = 'open' | 'partially_paid' | 'paid' | 'overdue';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskStatus = 'open' | 'reviewed' | 'dismissed';
export type AIRole = 'user' | 'agent';
export type RecommendationStatus = 'shown' | 'accepted' | 'rejected' | 'ignored';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  owner_user_id: string;
  currency: string;
  created_at: string;
}

export interface BusinessUser {
  business_id: string;
  user_id: string;
  role: BusinessUserRole;
  invited_at: string;
  accepted_at?: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  sku: string;
  category: string;
  cost_price: number;
  selling_price: number;
  active: boolean;
  created_at?: string;
}

export interface InventoryEvent {
  id: string;
  business_id: string;
  product_id: string;
  event_type: InventoryEventType;
  quantity: number;
  unit_cost: number;
  event_date: string;
  supplier_id?: string;
  created_at?: string;
}

export interface Supplier {
  id: string;
  business_id: string;
  name: string;
  contact_info?: string;
  payment_terms_days: number;
  created_at?: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  contact_info?: string;
  default_credit_terms_days?: number;
  created_at?: string;
}

export interface Sale {
  id: string;
  business_id: string;
  product_id: string;
  customer_id?: string;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  payment_method: PaymentMethod;
  sale_date: string;
  return_flag: boolean;
  created_at?: string;
}

export interface Transaction {
  id: string;
  business_id: string;
  type: TransactionType;
  category: string;
  amount: number;
  counterparty?: string;
  payment_method: PaymentMethod;
  transaction_date: string;
  source: TransactionSource;
  created_at?: string;
}

export interface Expense {
  id: string;
  business_id: string;
  category: string;
  amount: number;
  recurring: boolean;
  recurrence_interval?: string;
  expense_date: string;
  created_at?: string;
}

export interface Receivable {
  id: string;
  business_id: string;
  customer_id: string;
  invoice_ref: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: ReceivableStatus;
  created_at?: string;
}

export interface Payable {
  id: string;
  business_id: string;
  supplier_id: string;
  invoice_ref: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: PayableStatus;
  created_at?: string;
}

export interface ScenarioAssumptions {
  sales_change_pct?: number;
  price_change_pct?: number;
  inventory_purchase_amount?: number;
  discount_depth_pct?: number;
  marketing_spend?: number;
  supplier_terms_days?: number;
  customer_credit_days?: number;
  loan_amount?: number;
  interest_rate_pct?: number;
  repayment_months?: number;
  demand_change_pct?: number;
  return_rate_pct?: number;
  opex_change_pct?: number;
}

export interface ScenarioResultSnapshot {
  revenue: { current: number; scenario: number; diff: number; pct_change: number };
  gross_profit: { current: number; scenario: number; diff: number; pct_change: number };
  net_profit: { current: number; scenario: number; diff: number; pct_change: number };
  end_cash: { current: number; scenario: number; diff: number; pct_change: number };
  min_cash: { current: number; scenario: number; diff: number; pct_change: number };
  inventory_val: { current: number; scenario: number; diff: number; pct_change: number };
  receivables: { current: number; scenario: number; diff: number; pct_change: number };
  payables: { current: number; scenario: number; diff: number; pct_change: number };
  margin_pct: { current: number; scenario: number; diff: number; pct_change: number };
  risk_level: 'Low' | 'Medium' | 'High';
  cash_stress_days: number[];
  warning_notes: string[];
}

export interface Scenario {
  id: string;
  business_id: string;
  created_by?: string;
  name: string;
  assumptions: ScenarioAssumptions;
  result_snapshot: ScenarioResultSnapshot;
  is_saved: boolean;
  created_at: string;
}

export interface ForecastPoint {
  date: string;
  projected_cash: number;
  lower_bound: number;
  upper_bound: number;
  scheduled_payables: number;
  scheduled_receivables: number;
  organic_revenue: number;
  organic_expense: number;
  cash_stress_warning: boolean;
  notes?: string;
}

export interface Forecast {
  id: string;
  business_id: string;
  horizon_days: number;
  generated_at: string;
  forecast_data: ForecastPoint[];
  model_version: string;
}

export interface RiskEvent {
  id: string;
  business_id: string;
  entity_type: 'customer' | 'supplier' | 'transaction';
  entity_id?: string;
  rule_triggered: string;
  severity: RiskSeverity;
  evidence: Record<string, unknown>;
  status: RiskStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface HealthSubScores {
  cash_stability: number;
  profitability: number;
  customer_payment_reliability: number;
  inventory_efficiency: number;
  supplier_dependency: number;
}

export interface HealthScoreSnapshot {
  id?: string;
  business_id: string;
  score: number;
  sub_scores: HealthSubScores;
  confidence: ConfidenceLevel;
  history_days: number;
  computed_at: string;
}

export interface FinanceReadinessSubScores {
  cash_flow_stability: number;
  revenue_consistency: number;
  profitability: number;
  receivables_quality: number;
  inventory_health: number;
  growth_trend: number;
  debt_burden: number;
  payment_behavior: number;
}

export interface FinanceReadinessSnapshot {
  id?: string;
  business_id: string;
  score: number;
  sub_scores: FinanceReadinessSubScores;
  confidence: ConfidenceLevel;
  qualifying_statement: string;
  computed_at: string;
}

export interface AIConversation {
  id: string;
  business_id: string;
  user_id?: string;
  started_at: string;
}

export interface ToolCallRef {
  tool: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: AIRole;
  content: string;
  tool_calls?: ToolCallRef[];
  tool_results?: Record<string, unknown>;
  source_refs?: string[];
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  conversation_id?: string;
  business_id: string;
  recommendation_text: string;
  evidence: Record<string, unknown>;
  status: RecommendationStatus;
  created_at: string;
}

export interface AuditLog {
  id: string;
  business_id?: string;
  user_id?: string;
  action_type: string;
  entity_type: string;
  entity_id?: string;
  before_state?: Record<string, unknown>;
  after_state?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  business_id: string;
  user_id?: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
}
