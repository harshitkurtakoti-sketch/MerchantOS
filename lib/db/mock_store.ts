import {
  Business,
  User,
  Product,
  InventoryEvent,
  Supplier,
  Customer,
  Sale,
  Transaction,
  Expense,
  Receivable,
  Payable,
  Scenario,
  Forecast,
  RiskEvent,
  HealthScoreSnapshot,
  FinanceReadinessSnapshot,
  AuditLog,
  Notification,
  AIMessage,
  AIConversation,
  AIRecommendation
} from './types';

export class MockStore {
  public users: User[] = [];
  public businesses: Business[] = [];
  public products: Product[] = [];
  public inventory_events: InventoryEvent[] = [];
  public suppliers: Supplier[] = [];
  public customers: Customer[] = [];
  public sales: Sale[] = [];
  public transactions: Transaction[] = [];
  public expenses: Expense[] = [];
  public receivables: Receivable[] = [];
  public payables: Payable[] = [];
  public scenarios: Scenario[] = [];
  public forecasts: Forecast[] = [];
  public risk_events: RiskEvent[] = [];
  public health_scores: HealthScoreSnapshot[] = [];
  public readiness_scores: FinanceReadinessSnapshot[] = [];
  public conversations: AIConversation[] = [];
  public messages: AIMessage[] = [];
  public recommendations: AIRecommendation[] = [];
  public audit_logs: AuditLog[] = [];
  public notifications: Notification[] = [];

  private static instance: MockStore;

  public static getInstance(): MockStore {
    if (!MockStore.instance) {
      MockStore.instance = new MockStore();
    }
    return MockStore.instance;
  }

  public reset() {
    this.users = [];
    this.businesses = [];
    this.products = [];
    this.inventory_events = [];
    this.suppliers = [];
    this.customers = [];
    this.sales = [];
    this.transactions = [];
    this.expenses = [];
    this.receivables = [];
    this.payables = [];
    this.scenarios = [];
    this.forecasts = [];
    this.risk_events = [];
    this.health_scores = [];
    this.readiness_scores = [];
    this.conversations = [];
    this.messages = [];
    this.recommendations = [];
    this.audit_logs = [];
    this.notifications = [];
  }
  public ensureInitialized(): void {
    if (this.businesses.length === 0) {
      try {
        // Lazy require is intentional: a static import would create a circular
        // module dependency (synthetic_generator -> mock_store -> synthetic_generator).
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { seedSyntheticDemoBusiness } = require('../demo/synthetic_generator');
        seedSyntheticDemoBusiness();
      } catch (err) {
        console.warn('Auto-seed synthetic business warning:', err);
      }
    }
  }
}


export const store = MockStore.getInstance();
// Note: do NOT auto-seed here — calling ensureInitialized() at module
// evaluation time causes a circular import crash because synthetic_generator.ts
// imports `store` from this same module. Instead, each API route handler calls
// store.ensureInitialized() lazily on the first request.

