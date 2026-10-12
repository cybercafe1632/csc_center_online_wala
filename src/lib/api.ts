import {
  UserProfile,
  EmployeePermissions,
  BusinessSettings,
  ServiceItem,
  RequestItem,
  AccountingTransaction,
  WhatsAppLogItem,
  LeadItem,
  MarketingTemplate,
  CampaignItem,
  ReferralItem,
  QuickLinkItem,
  WorkGuideItem,
  AuditLogItem,
  WhatsAppOutcome,
} from '../types/index.ts';

function getHeaders(currentUser?: UserProfile | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (currentUser) {
    headers['x-user-id'] = currentUser.id;
    headers['x-user-role'] = currentUser.role;
  }
  return headers;
}

export const api = {
  // Auth
  async login(mobile: string, password: string):Promise<{ user: UserProfile; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to login');
    }
    return res.json();
  },

  async register(data: { name: string; mobile: string; password: string; address?: string; email?: string }): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async changePassword(newPassword: string, user: UserProfile): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to change password');
    }
    return res.json();
  },

  // Business
  async getBusinessSettings(): Promise<BusinessSettings> {
    const res = await fetch('/api/business');
    return res.json();
  },

  async updateBusinessSettings(settings: Partial<BusinessSettings>, user: UserProfile): Promise<BusinessSettings> {
    const res = await fetch('/api/business', {
      method: 'PUT',
      headers: getHeaders(user),
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update business settings');
    return res.json();
  },

  // Services
  async getServices(user?: UserProfile | null): Promise<ServiceItem[]> {
    const isCust = !user || user.role === 'customer';
    const res = await fetch(`/api/services${isCust ? '?view=customer' : ''}`, {
      headers: getHeaders(user),
    });
    return res.json();
  },

  async saveService(service: Partial<ServiceItem>, user: UserProfile): Promise<ServiceItem> {
    const url = service.id ? `/api/services/${service.id}` : '/api/services';
    const method = service.id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: getHeaders(user),
      body: JSON.stringify(service),
    });
    if (!res.ok) throw new Error('Failed to save service');
    return res.json();
  },

  async deleteService(id: string, user: UserProfile): Promise<void> {
    const res = await fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: getHeaders(user),
    });
    if (!res.ok) throw new Error('Failed to delete service');
  },

  // Requests
  async getRequests(user: UserProfile): Promise<RequestItem[]> {
    const res = await fetch('/api/requests', {
      headers: getHeaders(user),
    });
    return res.json();
  },

  async createRequest(
    data: { serviceId: string; customerNotes?: string; customerName?: string; customerMobile?: string; customerAddress?: string },
    user?: UserProfile | null
  ): Promise<RequestItem> {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit request');
    }
    return res.json();
  },

  async assignRequest(
    requestId: string,
    data: { employeeId: string; priority?: 'Normal' | 'High' | 'Urgent'; dueDate?: string },
    user: UserProfile
  ): Promise<RequestItem> {
    const res = await fetch(`/api/requests/${requestId}/assign`, {
      method: 'PATCH',
      headers: getHeaders(user),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to assign request');
    return res.json();
  },

  async updateRequestStatus(
    requestId: string,
    status: RequestItem['status'],
    note: string,
    user: UserProfile
  ): Promise<RequestItem> {
    const res = await fetch(`/api/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: getHeaders(user),
      body: JSON.stringify({ status, note }),
    });
    if (!res.ok) throw new Error('Failed to update request status');
    return res.json();
  },

  async addInternalNote(requestId: string, note: string, user: UserProfile): Promise<RequestItem> {
    const res = await fetch(`/api/requests/${requestId}/notes`, {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify({ note }),
    });
    if (!res.ok) throw new Error('Failed to add internal note');
    return res.json();
  },

  async updateRequestFinancials(
    requestId: string,
    data: {
      amountReceived?: number;
      actualGovtFeePaid?: number;
      otherExpensesPaid?: number;
      employeeCostPaid?: number;
      paymentMode?: RequestItem['paymentMode'];
    },
    user: UserProfile
  ): Promise<RequestItem> {
    const res = await fetch(`/api/requests/${requestId}/financials`, {
      method: 'PATCH',
      headers: getHeaders(user),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update request financials');
    return res.json();
  },

  // Employees
  async getEmployees(user: UserProfile): Promise<UserProfile[]> {
    const res = await fetch('/api/employees', {
      headers: getHeaders(user),
    });
    return res.json();
  },

  async addEmployee(data: Partial<UserProfile> & { password?: string }, user: UserProfile): Promise<UserProfile> {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add employee');
    return res.json();
  },

  async updateEmployee(id: string, updates: Partial<UserProfile>, user: UserProfile): Promise<UserProfile> {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: getHeaders(user),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update employee');
    return res.json();
  },

  async promoteCustomer(
    customerId: string,
    designation: string,
    permissions: EmployeePermissions,
    user: UserProfile
  ): Promise<UserProfile> {
    const res = await fetch('/api/employees/promote', {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify({ customerId, designation, permissions }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to promote customer');
    }
    return res.json();
  },

  // Customers
  async getCustomers(user: UserProfile): Promise<UserProfile[]> {
    const res = await fetch('/api/customers', {
      headers: getHeaders(user),
    });
    return res.json();
  },

  // Accounting
  async getAccountingSummary(user: UserProfile) {
    const res = await fetch('/api/accounting/summary', {
      headers: getHeaders(user),
    });
    return res.json();
  },

  async getTransactions(user: UserProfile): Promise<AccountingTransaction[]> {
    const res = await fetch('/api/accounting/transactions', {
      headers: getHeaders(user),
    });
    return res.json();
  },

  async addTransaction(data: Omit<AccountingTransaction, 'id' | 'date'>, user: UserProfile): Promise<AccountingTransaction> {
    const res = await fetch('/api/accounting/transactions', {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add transaction');
    return res.json();
  },

  // WhatsApp
  async getWhatsAppLogs(user: UserProfile): Promise<WhatsAppLogItem[]> {
    const res = await fetch('/api/whatsapp/logs', {
      headers: getHeaders(user),
    });
    return res.json();
  },

  async logWhatsAppMessage(log: Omit<WhatsAppLogItem, 'id' | 'timestamp' | 'operatorName'>, user: UserProfile): Promise<WhatsAppLogItem> {
    const res = await fetch('/api/whatsapp/logs', {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify(log),
    });
    return res.json();
  },

  async updateWhatsAppOutcome(id: string, outcome: WhatsAppOutcome, notes?: string, user?: UserProfile): Promise<WhatsAppLogItem> {
    const res = await fetch(`/api/whatsapp/logs/${id}/outcome`, {
      method: 'PATCH',
      headers: getHeaders(user),
      body: JSON.stringify({ outcome, notes }),
    });
    return res.json();
  },

  // Leads
  async getLeads(user: UserProfile): Promise<LeadItem[]> {
    const res = await fetch('/api/leads', {
      headers: getHeaders(user),
    });
    return res.json();
  },

  async createLead(data: Omit<LeadItem, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'notes'>): Promise<LeadItem> {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit enquiry');
    return res.json();
  },

  async updateLead(id: string, updates: Partial<LeadItem>, user: UserProfile): Promise<LeadItem> {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: getHeaders(user),
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async convertLeadToCustomer(leadId: string, user: UserProfile): Promise<UserProfile> {
    const res = await fetch(`/api/leads/${leadId}/convert`, {
      method: 'POST',
      headers: getHeaders(user),
    });
    return res.json();
  },

  // Marketing Templates & Campaigns
  async getMarketingTemplates(): Promise<MarketingTemplate[]> {
    const res = await fetch('/api/marketing/templates');
    return res.json();
  },

  async saveMarketingTemplate(tpl: MarketingTemplate, user: UserProfile): Promise<MarketingTemplate> {
    const res = await fetch('/api/marketing/templates', {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify(tpl),
    });
    return res.json();
  },

  async getCampaigns(): Promise<CampaignItem[]> {
    const res = await fetch('/api/campaigns');
    return res.json();
  },

  async createCampaign(camp: any, user: UserProfile): Promise<CampaignItem> {
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify(camp),
    });
    return res.json();
  },

  async updateCampaignMetrics(id: string, metrics: any): Promise<CampaignItem> {
    const res = await fetch(`/api/campaigns/${id}/metrics`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
    });
    return res.json();
  },

  // Referrals
  async getReferrals(): Promise<ReferralItem[]> {
    const res = await fetch('/api/referrals');
    return res.json();
  },

  async addReferral(ref: any): Promise<ReferralItem> {
    const res = await fetch('/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ref),
    });
    return res.json();
  },

  async updateReferral(id: string, updates: any): Promise<ReferralItem> {
    const res = await fetch(`/api/referrals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // Quick Links & Guides
  async getQuickLinks(): Promise<QuickLinkItem[]> {
    const res = await fetch('/api/quicklinks');
    return res.json();
  },

  async saveQuickLink(link: QuickLinkItem, user: UserProfile): Promise<QuickLinkItem> {
    const res = await fetch('/api/quicklinks', {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify(link),
    });
    return res.json();
  },

  async deleteQuickLink(id: string, user: UserProfile): Promise<void> {
    const res = await fetch(`/api/quicklinks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(user),
    });
  },

  async getWorkGuides(): Promise<WorkGuideItem[]> {
    const res = await fetch('/api/guides');
    return res.json();
  },

  async saveWorkGuide(guide: WorkGuideItem, user: UserProfile): Promise<WorkGuideItem> {
    const res = await fetch('/api/guides', {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify(guide),
    });
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(user: UserProfile): Promise<AuditLogItem[]> {
    const res = await fetch('/api/audit-logs', {
      headers: getHeaders(user),
    });
    return res.json();
  },

  // Database JSON Backup & Restore
  async downloadDatabaseBackup(user: UserProfile): Promise<Blob> {
    const res = await fetch('/api/backup/download', {
      headers: getHeaders(user),
    });
    if (!res.ok) throw new Error('Failed to download database backup');
    return res.blob();
  },

  async restoreDatabaseBackup(jsonData: any, user: UserProfile): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/backup/restore', {
      method: 'POST',
      headers: getHeaders(user),
      body: JSON.stringify(jsonData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to restore database backup');
    }
    return res.json();
  },
};
