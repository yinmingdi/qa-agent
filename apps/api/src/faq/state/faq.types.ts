export type FaqCategory = "billing" | "logistics" | "technical" | "other";

export type RouteDecision = "faq" | "handoff";

export type ConversationTurn = {
  role: "user" | "assistant";
  text: string;
};

export type BillingInfo = {
  orderId?: string;
  amount?: number;
  currency?: string;
  status: "paid" | "refunding" | "refunded" | "unpaid" | "unknown";
  lastUpdate: string;
};

export type LogisticsInfo = {
  orderId?: string;
  carrier?: string;
  trackingNumber?: string;
  status:
    | "created"
    | "shipped"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "exception"
    | "unknown";
  lastLocation?: string;
  eta?: string;
};

export type TechnicalContext = {
  platform?: "web" | "ios" | "android" | "mini_program" | "unknown";
  lastAction?: string;
  suggestionSteps: string[];
};

export type FaqState = {
  question: string;
  category?: FaqCategory;
  answer?: string;
  route?: RouteDecision;
  history: ConversationTurn[];
  billingInfo?: BillingInfo;
  logisticsInfo?: LogisticsInfo;
  technicalContext?: TechnicalContext;
};

