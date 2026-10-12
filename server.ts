import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/server/database.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper to authenticate request via header
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const userRole = req.headers['x-user-role'] as string;
  if (userId) {
    (req as any).user = db.getUserById(userId) || { id: userId, role: userRole || 'customer', name: 'User' };
  }
  next();
};

app.use(authMiddleware);

// --- Auth Endpoints ---
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) {
    return res.status(400).json({ error: 'Mobile number and password are required' });
  }
  const user = db.authenticate(mobile, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid mobile number or password' });
  }
  res.json({ user, token: `token-${user.id}-${Date.now()}` });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, mobile, password, address, email } = req.body;
  if (!name || !mobile || !password) {
    return res.status(400).json({ error: 'Name, mobile and password are required' });
  }
  if (!/^\d{10}$/.test(mobile.trim())) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number' });
  }
  try {
    const user = db.registerCustomer(name, mobile, password, address, email);
    res.json({ user, token: `token-${user.id}-${Date.now()}` });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/change-password', (req: Request, res: Response) => {
  const user = (req as any).user;
  const { newPassword } = req.body;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long' });
  }
  try {
    db.changePassword(user.id, newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ user });
});

// --- Business Settings ---
app.get('/api/business', (req: Request, res: Response) => {
  res.json(db.getSettings());
});

app.put('/api/business', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only Admin can update business settings' });
  }
  const updated = db.updateSettings(req.body, user.id, user.name);
  res.json(updated);
});

// --- Services ---
app.get('/api/services', (req: Request, res: Response) => {
  const user = (req as any).user;
  const isCustomer = user?.role === 'customer' || req.query.view === 'customer' || !user;
  res.json(db.getServices(isCustomer));
});

app.post('/api/services', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.createOrEditServices) {
    return res.status(403).json({ error: 'Permission denied to create services' });
  }
  const saved = db.saveService(req.body, user?.id || 'admin', user?.name || 'Admin');
  res.json(saved);
});

app.put('/api/services/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.createOrEditServices) {
    return res.status(403).json({ error: 'Permission denied to edit services' });
  }
  const saved = db.saveService({ ...req.body, id: req.params.id }, user?.id || 'admin', user?.name || 'Admin');
  res.json(saved);
});

app.delete('/api/services/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only Admin can delete services' });
  }
  db.deleteService(req.params.id, user.id, user.name);
  res.json({ success: true });
});

// --- Requests ---
app.get('/api/requests', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(db.getRequests(user.role, user.id));
});

app.post('/api/requests', (req: Request, res: Response) => {
  const user = (req as any).user;
  const { serviceId, customerNotes, customerName, customerMobile, customerAddress } = req.body;
  if (!serviceId) {
    return res.status(400).json({ error: 'Service ID is required' });
  }

  const cId = user?.id || `CUST-GUEST-${Date.now().toString().slice(-4)}`;
  const cName = user?.name || customerName || 'Valued Customer';
  const cMobile = user?.mobile || customerMobile || '9289787348';
  const cAddr = user?.address || customerAddress || '';

  try {
    const created = db.createRequest(cId, cName, cMobile, serviceId, customerNotes, cAddr);
    res.json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create request' });
  }
});

app.patch('/api/requests/:id/assign', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.assignOrReassignWork) {
    return res.status(403).json({ error: 'Permission denied to assign work' });
  }
  const { employeeId, priority, dueDate } = req.body;
  try {
    const updated = db.assignRequest(req.params.id, employeeId, priority, dueDate, user?.id, user?.name);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/requests/:id/status', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.updateWorkStatus) {
    return res.status(403).json({ error: 'Permission denied to update work status' });
  }
  const { status, note } = req.body;
  try {
    const updated = db.updateRequestStatus(req.params.id, status, note, user?.id || 'sys', user?.name || 'Staff');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/requests/:id/notes', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.addInternalNotes) {
    return res.status(403).json({ error: 'Permission denied to add internal notes' });
  }
  const { note } = req.body;
  try {
    const updated = db.addInternalNote(req.params.id, note, user?.id || 'sys', user?.name || 'Staff');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/requests/:id/financials', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.addFinancialTransactions) {
    return res.status(403).json({ error: 'Permission denied to edit request financials' });
  }
  try {
    const updated = db.updateRequestFinancials(req.params.id, req.body, user?.id || 'sys', user?.name || 'Staff');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Employees & Permissions ---
app.get('/api/employees', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only Admin can view employees list' });
  }
  const emps = db.getUsers().filter((u) => u.role === 'employee');
  res.json(emps);
});

app.post('/api/employees', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only Admin can add employees' });
  }
  try {
    const emp = db.addEmployee(req.body, user.id, user.name);
    res.json(emp);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/employees/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only Admin can edit employees' });
  }
  try {
    const emp = db.updateEmployee(req.params.id, req.body, user.id, user.name);
    res.json(emp);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/employees/promote', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only Admin can assign employees' });
  }
  const { customerId, designation, permissions } = req.body;
  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }
  try {
    const updated = db.promoteCustomerToEmployee(
      customerId,
      designation,
      permissions,
      user.id,
      user.name
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Customers List (Admin/Employee with permission) ---
app.get('/api/customers', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.manageCustomerRecords) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  const customers = db.getUsers().filter((u) => u.role === 'customer');
  res.json(customers);
});

// --- Accounting ---
app.get('/api/accounting/summary', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.viewIncomeAndExpenses) {
    return res.status(403).json({ error: 'Permission denied to view financial summary' });
  }
  res.json(db.getAccountingSummary());
});

app.get('/api/accounting/transactions', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.viewIncomeAndExpenses) {
    return res.status(403).json({ error: 'Permission denied to view transactions' });
  }
  res.json(db.getTransactions());
});

app.post('/api/accounting/transactions', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.addFinancialTransactions) {
    return res.status(403).json({ error: 'Permission denied to add financial transactions' });
  }
  try {
    const txn = db.addTransaction(req.body, user?.id || 'sys', user?.name || 'Staff');
    res.json(txn);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- WhatsApp Center ---
app.get('/api/whatsapp/logs', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.useWhatsAppCenter) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  res.json(db.getWhatsAppLogs());
});

app.post('/api/whatsapp/logs', (req: Request, res: Response) => {
  const user = (req as any).user;
  const logged = db.logWhatsAppMessage({
    ...req.body,
    operatorName: user?.name || 'Staff',
  });
  res.json(logged);
});

app.patch('/api/whatsapp/logs/:id/outcome', (req: Request, res: Response) => {
  const { outcome, notes } = req.body;
  try {
    const updated = db.updateWhatsAppOutcome(req.params.id, outcome, notes);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Leads & CRM ---
app.get('/api/leads', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.manageLeads) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  res.json(db.getLeads());
});

app.post('/api/leads', (req: Request, res: Response) => {
  // Public or Admin can create lead
  try {
    const lead = db.createLead(req.body);
    res.json(lead);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/leads/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.manageLeads) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  try {
    const lead = db.updateLead(req.params.id, req.body, user?.id || 'sys', user?.name || 'Staff');
    res.json(lead);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/leads/:id/convert', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.manageLeads) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  try {
    const cust = db.convertLeadToCustomer(req.params.id, user?.id || 'sys', user?.name || 'Staff');
    res.json(cust);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Marketing Templates & Campaigns ---
app.get('/api/marketing/templates', (req: Request, res: Response) => {
  res.json(db.getMarketingTemplates());
});

app.post('/api/marketing/templates', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only Admin can save marketing templates' });
  }
  res.json(db.saveMarketingTemplate(req.body));
});

app.get('/api/campaigns', (req: Request, res: Response) => {
  res.json(db.getCampaigns());
});

app.post('/api/campaigns', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.manageCampaigns) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  res.json(db.createCampaign(req.body));
});

app.patch('/api/campaigns/:id/metrics', (req: Request, res: Response) => {
  res.json(db.updateCampaignMetrics(req.params.id, req.body));
});

// --- Referrals ---
app.get('/api/referrals', (req: Request, res: Response) => {
  res.json(db.getReferrals());
});

app.post('/api/referrals', (req: Request, res: Response) => {
  res.json(db.addReferral(req.body));
});

app.patch('/api/referrals/:id', (req: Request, res: Response) => {
  res.json(db.updateReferral(req.params.id, req.body));
});

// --- Quick Links & Work Guides ---
app.get('/api/quicklinks', (req: Request, res: Response) => {
  res.json(db.getQuickLinks());
});

app.post('/api/quicklinks', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.manageQuickLinks) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  res.json(db.saveQuickLink(req.body));
});

app.delete('/api/quicklinks/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only Admin can delete quick links' });
  }
  db.deleteQuickLink(req.params.id);
  res.json({ success: true });
});

app.get('/api/guides', (req: Request, res: Response) => {
  res.json(db.getWorkGuides());
});

app.post('/api/guides', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only Admin can edit work guides' });
  }
  res.json(db.saveWorkGuide(req.body));
});

// --- Audit Logs ---
app.get('/api/audit-logs', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only Admin can view audit logs' });
  }
  res.json(db.getAuditLogs());
});

// --- Full Database JSON Backup & Restore ---
app.get('/api/backup/download', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only Admin can download full database backup' });
  }
  const raw = db.getRawData();
  const dateStr = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="csc_online_backup_${dateStr}.json"`);
  res.send(JSON.stringify(raw, null, 2));
});

app.post('/api/backup/restore', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only Admin can restore database' });
  }
  try {
    const backupData = req.body;
    if (!backupData || typeof backupData !== 'object') {
      return res.status(400).json({ error: 'Invalid backup file payload' });
    }
    db.restoreRawData(backupData, user.id, user.name);
    res.json({ success: true, message: 'Database restored successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to restore database' });
  }
});

// --- CSV Export ---
app.get('/api/export/:type', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role !== 'admin' && !user?.permissions?.viewReports) {
    return res.status(403).send('Permission denied for export');
  }

  const { type } = req.params;
  let csv = '';

  if (type === 'requests') {
    const list = db.getRequests('admin', user.id);
    csv = 'RequestID,Customer,Mobile,Service,CustomerPrice,GovtFeePaid,OtherExpenses,AmountReceived,Status,AssignedTo,Date\n';
    list.forEach((r) => {
      csv += `"${r.id}","${r.customerName}","${r.customerMobile}","${r.serviceName}",${r.customerPriceSnapshot},${r.actualGovtFeePaid},${r.otherExpensesPaid},${r.amountReceived},"${r.status}","${r.assignedEmployeeName || 'Unassigned'}","${r.createdAt.slice(0, 10)}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="csc_requests_export.csv"');
    return res.send(csv);
  }

  if (type === 'accounting') {
    const txns = db.getTransactions();
    csv = 'TransactionID,Date,Type,Amount,Description,Category,PaymentMode,RecordedBy,RequestID\n';
    txns.forEach((t) => {
      csv += `"${t.id}","${t.date.slice(0, 10)}","${t.type}",${t.amount},"${t.description.replace(/"/g, '""')}","${t.category}","${t.paymentMode}","${t.recordedBy}","${t.requestId || ''}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="csc_transactions_export.csv"');
    return res.send(csv);
  }

  if (type === 'customers') {
    const users = db.getUsers().filter((u) => u.role === 'customer');
    csv = 'CustomerID,Name,Mobile,Address,RegisteredDate\n';
    users.forEach((c) => {
      csv += `"${c.id}","${c.name}","${c.mobile}","${(c.address || '').replace(/"/g, '""')}","${c.createdAt.slice(0, 10)}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="csc_customers_export.csv"');
    return res.send(csv);
  }

  if (type === 'leads') {
    const leads = db.getLeads();
    csv = 'LeadID,Name,Mobile,Service,Area,Source,Status,CreatedDate\n';
    leads.forEach((l) => {
      csv += `"${l.id}","${l.name}","${l.mobile}","${l.interestedService}","${l.areaLocality}","${l.source}","${l.status}","${l.createdAt.slice(0, 10)}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="csc_leads_export.csv"');
    return res.send(csv);
  }

  res.status(400).send('Invalid export type');
});

// --- Static assets or Vite dev middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
