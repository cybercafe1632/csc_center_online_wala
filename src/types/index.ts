export type UserRole = 'admin' | 'employee' | 'customer';

export interface EmployeePermissions {
  viewAssignedWork: boolean;
  updateWorkStatus: boolean;
  addInternalNotes: boolean;
  manageCustomerRecords: boolean;
  createOrEditServices: boolean;
  uploadServiceImages: boolean;
  editCustomerPrices: boolean;
  editGovtFees: boolean;
  assignOrReassignWork: boolean;
  viewIncomeAndExpenses: boolean;
  addFinancialTransactions: boolean;
  viewReports: boolean;
  manageLeads: boolean;
  manageCampaigns: boolean;
  useWhatsAppCenter: boolean;
  manageQuickLinks: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  email?: string;
  address?: string;
  designation?: string;
  active: boolean;
  permissions?: EmployeePermissions;
  marketingConsent?: boolean;
  promotionalWhatsAppConsent?: boolean;
  createdAt: string;
}

export interface BusinessSettings {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  vleName: string;
  cscId: string;
  logoUrl: string;
  categories: string[];
  bannerImages: string[];
  emergencyNotice?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  customerPrice: number;
  estimatedGovtFee: number;
  internalServiceCost: number;
  otherDirectExpenses: number;
  employeeCost: number;
  feeNotes: string;
  requiredDocuments: string[];
  instructions: string[];
  isPopular: boolean;
  isNew: boolean;
  isPublished: boolean;
  order: number;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export type RequestStatus =
  | 'New / Unassigned'
  | 'Pending'
  | 'Under Process'
  | 'Document Required'
  | 'Ready for Collection'
  | 'Complete'
  | 'Rejected';

export interface StatusHistoryItem {
  timestamp: string;
  updatedBy: string;
  oldStatus: RequestStatus;
  newStatus: RequestStatus;
  note: string;
}

export interface AssignmentHistoryItem {
  timestamp: string;
  assignedBy: string;
  oldEmployeeId?: string;
  oldEmployeeName?: string;
  newEmployeeId: string;
  newEmployeeName: string;
  note?: string;
}

export interface RequestItem {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  customerPriceSnapshot: number;
  estimatedGovtFeeSnapshot: number;
  actualGovtFeePaid: number;
  otherExpensesPaid: number;
  employeeCostPaid: number;
  amountReceived: number;
  paymentMode?: 'Cash' | 'UPI' | 'QR' | 'NetBanking' | 'Card';
  status: RequestStatus;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  priority: 'Normal' | 'High' | 'Urgent';
  dueDate?: string;
  customerNotes?: string;
  internalNotes: string[];
  attachedDocumentNames: string[];
  history: StatusHistoryItem[];
  assignmentHistory: AssignmentHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AccountingTransaction {
  id: string;
  requestId?: string;
  type: 'customer_payment' | 'govt_fee' | 'direct_expense' | 'employee_payout' | 'general_expense';
  amount: number;
  description: string;
  category: string;
  recordedBy: string;
  paymentMode: 'Cash' | 'UPI' | 'QR' | 'CSC Wallet' | 'Bank';
  date: string;
}

export type WhatsAppOutcome =
  | 'Not Opened'
  | 'WhatsApp Opened'
  | 'Manually Confirmed Sent'
  | 'Reply Recorded'
  | 'Follow-up Required';

export interface WhatsAppLogItem {
  id: string;
  recipientMobile: string;
  recipientName: string;
  messageType: 'request_created' | 'status_update' | 'ready_collection' | 'doc_reminder' | 'payment_reminder' | 'campaign_msg' | 'custom';
  messageText: string;
  relatedRequestId?: string;
  relatedLeadId?: string;
  operatorName: string;
  outcome: WhatsAppOutcome;
  timestamp: string;
  notes?: string;
}

export type LeadStatus =
  | 'New Lead'
  | 'Contact Pending'
  | 'Contacted'
  | 'Interested'
  | 'Follow-up Required'
  | 'Converted to Customer'
  | 'Not Interested'
  | 'Closed';

export type LeadSource =
  | 'Walk-in'
  | 'Website'
  | 'WhatsApp'
  | 'Facebook'
  | 'Instagram'
  | 'YouTube'
  | 'Referral'
  | 'Other';

export interface LeadItem {
  id: string;
  name: string;
  mobile: string;
  interestedService: string;
  areaLocality: string;
  message?: string;
  source: LeadSource;
  contactConsent: boolean;
  promotionalWhatsAppConsent: boolean;
  status: LeadStatus;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  followUpDate?: string;
  convertedCustomerId?: string;
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketingTemplate {
  id: string;
  title: string;
  category: 'whatsapp' | 'whatsapp_status' | 'facebook' | 'instagram' | 'reel_script' | 'festival' | 'followup';
  language: 'hindi' | 'hinglish' | 'english';
  tone: 'professional' | 'friendly' | 'attractive' | 'short_direct';
  content: string;
}

export interface CampaignItem {
  id: string;
  name: string;
  objective: string;
  servicePromoted: string;
  audienceFilter: {
    serviceCategory?: string;
    area?: string;
    source?: string;
    onlyPromotionalConsented: boolean;
  };
  messageTemplate: string;
  startDate: string;
  followUpDate?: string;
  owner: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Paused';
  targetCount: number;
  chatsOpenedCount: number;
  confirmedSentCount: number;
  repliesRecordedCount: number;
  conversionsCount: number;
  createdAt: string;
}

export interface ReferralItem {
  id: string;
  referrerName: string;
  referrerMobile: string;
  referredPersonName: string;
  referredPersonMobile: string;
  serviceInterested: string;
  status: 'Pending' | 'Contacted' | 'Converted' | 'Paid Reward';
  rewardAmount?: number;
  notes?: string;
  createdAt: string;
}

export interface QuickLinkItem {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
  officialBadge: string;
  internalInstructions?: string;
  order: number;
}

export interface WorkGuideStep {
  stepNumber: number;
  title: string;
  description: string;
  checklist: string[];
}

export interface WorkGuideItem {
  id: string;
  serviceName: string;
  portalName: string;
  portalUrl: string;
  category: string;
  requiredDocuments: string[];
  steps: WorkGuideStep[];
  importantNotes: string[];
  updatedAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ip?: string;
}
