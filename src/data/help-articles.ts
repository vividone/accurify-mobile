// =============================================================================
// HELP CENTER ARTICLE DATA
// Static knowledge base content for the in-app help center.
// Articles are organized by category and rendered as markdown-like content.
// =============================================================================

export interface HelpArticle {
  id: string;
  title: string;
  summary: string;
  content: string; // HTML content
  category: string;
  tags: string[];
}

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: string; // Carbon icon name reference
  articles: HelpArticle[];
}

// ---------------------------------------------------------------------------
// CATEGORIES & ARTICLES
// ---------------------------------------------------------------------------

export const helpCategories: HelpCategory[] = [
  // =========================================================================
  // GETTING STARTED
  // =========================================================================
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Create your account, set up your business, and learn the basics.',
    icon: 'Rocket',
    articles: [
      {
        id: 'create-account',
        title: 'How to create your Accurify account',
        summary: 'Sign up, verify your email, and log in for the first time.',
        category: 'getting-started',
        tags: ['signup', 'register', 'email', 'verification', 'account'],
        content: `
<h3>Creating Your Account</h3>
<ol>
  <li>Visit <strong>app.accurify.co</strong> and click <strong>Sign Up</strong>.</li>
  <li>Choose your account type:
    <ul>
      <li><strong>Business</strong> — for business owners managing their own finances.</li>
      <li><strong>Accountant</strong> — for accounting professionals managing client businesses.</li>
    </ul>
  </li>
  <li>Fill in your details: first name, last name, email, and password.</li>
  <li>Accept the Terms of Service and Privacy Policy.</li>
  <li>Click <strong>Create Account</strong>.</li>
  <li>Check your email for a verification link and click it to activate your account.</li>
</ol>
<h3>Didn't receive the verification email?</h3>
<ul>
  <li>Check your spam or junk folder.</li>
  <li>On the login page, click <strong>Resend Verification Email</strong>.</li>
  <li>Make sure you entered the correct email during registration.</li>
</ul>`,
      },
      {
        id: 'onboarding',
        title: 'Setting up your business profile',
        summary: 'Complete the onboarding wizard to configure your business.',
        category: 'getting-started',
        tags: ['onboarding', 'setup', 'business', 'profile', 'fiscal year'],
        content: `
<h3>Onboarding Wizard</h3>
<p>After verifying your email and logging in, you'll go through the onboarding process:</p>
<ol>
  <li><strong>Business Name</strong> — Your registered business name (e.g., "Acme Corp Ltd").</li>
  <li><strong>Business Type</strong> — Choose <em>Service</em> or <em>Goods</em>:
    <ul>
      <li><strong>Service</strong> businesses focus on invoicing clients for services.</li>
      <li><strong>Goods</strong> businesses get extra features: product catalog, inventory, stock tracking, and QuickStore.</li>
    </ul>
  </li>
  <li><strong>Industry</strong> — For automatic tax categorization.</li>
  <li><strong>Business Address</strong> — Your primary address.</li>
  <li><strong>Phone Number</strong> — Your business phone.</li>
  <li><strong>Business Email</strong> (optional) — A separate business contact email.</li>
  <li><strong>Fiscal Year Start Month</strong> — The month your financial year begins (January for most).</li>
</ol>

<h3>Completing Your Profile</h3>
<p>After onboarding, go to <strong>Settings &gt; Business Profile</strong> to add:</p>
<ul>
  <li><strong>Logo</strong> — Appears on invoices and receipts.</li>
  <li><strong>TIN</strong> — Tax Identification Number.</li>
  <li><strong>RC Number</strong> — CAC registration number.</li>
  <li><strong>Bank Details</strong> — Bank name, account number, and account name (displayed on invoices).</li>
</ul>`,
      },
      {
        id: 'service-vs-goods',
        title: 'Service vs Goods business types',
        summary: 'Understand the difference between Service and Goods businesses and which features each gets.',
        category: 'getting-started',
        tags: ['business type', 'service', 'goods', 'retail', 'products', 'inventory', 'pos'],
        content: `
<h3>Choosing Your Business Type</h3>
<p>During onboarding, you choose between <strong>Service</strong> and <strong>Goods</strong>. This determines which features are available to you.</p>

<h3>Service Businesses</h3>
<p>Best for: consultants, agencies, freelancers, professional services, and any business that primarily invoices for services rendered.</p>
<h4>Features Available:</h4>
<ul>
  <li>Invoices (standard and proforma)</li>
  <li>Bills and expense tracking</li>
  <li>Client management</li>
  <li>Banking and transaction categorization</li>
  <li>Accurify Books (double-entry accounting)</li>
  <li>Financial statements (Income Statement, Balance Sheet, Trial Balance)</li>
  <li>Tax Dashboard (VAT, WHT, CIT)</li>
  <li>Accurify Pay (online invoice payments)</li>
</ul>

<h3>Goods Businesses</h3>
<p>Best for: retailers, shops, supermarkets, trading companies, pharmacies, and any business that sells physical products.</p>
<h4>All Service features, plus:</h4>
<ul>
  <li><strong>Product Catalog</strong> — Add products with name, SKU, barcode, category, pricing, and images.</li>
  <li><strong>Inventory Management</strong> — Track stock levels, low stock alerts, and reorder levels.</li>
  <li><strong>Stock Movements</strong> — Record purchases, sales, adjustments, returns, and damaged goods.</li>
  <li><strong>Batch Tracking</strong> — Track product batches with expiry dates and FEFO (First Expiry, First Out).</li>
  <li><strong>Point of Sale (POS)</strong> — Quick in-person sales with a cart-based interface.</li>
  <li><strong>Orders</strong> — Manage store orders from POS, storefront, WhatsApp, or manual entry.</li>
  <li><strong>QuickStore</strong> — Set up an online storefront for customers to browse and order.</li>
  <li><strong>Product Dropdown on Invoices</strong> — When creating invoices, select from your product catalog to auto-fill description and price.</li>
</ul>

<h3>On the Mobile App</h3>
<p>Goods businesses see additional menu items on mobile:</p>
<ul>
  <li><strong>Products</strong> — View, add, and manage products.</li>
  <li><strong>Point of Sale</strong> — Quick sales from your phone.</li>
  <li><strong>Orders</strong> — View and manage customer orders.</li>
  <li><strong>Inventory</strong> — Track stock movements.</li>
</ul>
<p>Service businesses see a streamlined interface focused on invoicing and client management.</p>

<h3>Can I Change My Business Type?</h3>
<p>Contact support if you need to switch from Service to Goods or vice versa. Switching to Goods enables the extra features immediately.</p>`,
      },
      {
        id: 'dashboard-overview',
        title: 'Understanding your Dashboard',
        summary: 'Learn what each metric and section on the Dashboard means.',
        category: 'getting-started',
        tags: ['dashboard', 'metrics', 'revenue', 'overview', 'quick actions'],
        content: `
<h3>Dashboard Overview</h3>
<p>The Dashboard is your command center, giving you a quick overview of your business health.</p>

<h4>Key Metrics</h4>
<table>
  <tr><th>Card</th><th>What It Shows</th></tr>
  <tr><td><strong>Revenue</strong></td><td>Total revenue earned this month</td></tr>
  <tr><td><strong>Outstanding</strong></td><td>Total amount owed from unpaid invoices</td></tr>
  <tr><td><strong>Growth</strong></td><td>Revenue growth compared to last month</td></tr>
  <tr><td><strong>Uncategorized</strong></td><td>Transactions that need categorization</td></tr>
</table>

<h4>Quick Actions</h4>
<p>Shortcuts to common tasks: <strong>New Invoice</strong>, <strong>New Bill</strong>, and <strong>View Clients</strong>.</p>

<h4>Recent Activity</h4>
<p>Shows your most recent invoices, bills, and transactions.</p>

<h4>Onboarding Checklist</h4>
<p>If you're new, a setup checklist guides you through creating your first client, sending your first invoice, connecting your bank, and setting up Accurify Pay.</p>`,
      },
    ],
  },

  // =========================================================================
  // INVOICES
  // =========================================================================
  {
    id: 'invoices',
    title: 'Invoices',
    description: 'Create, send, track, and manage invoices for your clients.',
    icon: 'Document',
    articles: [
      {
        id: 'create-invoice',
        title: 'How to create an invoice',
        summary: 'Step-by-step guide to creating and sending your first invoice.',
        category: 'invoices',
        tags: ['create', 'invoice', 'line items', 'vat', 'wht', 'send', 'proforma'],
        content: `
<h3>Creating an Invoice</h3>
<ol>
  <li>Navigate to <strong>Invoices</strong> from the sidebar.</li>
  <li>Click <strong>Create Invoice</strong>.</li>
  <li>Choose the <strong>Invoice Type</strong>: Standard Invoice or Proforma Invoice. See <em>"Creating and managing proforma invoices"</em> for details on proforma.</li>
  <li>Fill in the details:
    <ul>
      <li><strong>Client</strong> — Select an existing client or create a new one.</li>
      <li><strong>Invoice Date</strong> — Defaults to today.</li>
      <li><strong>Due Date</strong> — Defaults to 14 days from today.</li>
      <li><strong>Line Items</strong> — Add description, quantity, and unit price for each item.</li>
      <li><strong>Tax</strong> (optional) — Enable VAT (7.5%) or WHT (5%/10%).</li>
      <li><strong>Notes</strong> — Additional payment terms for the client.</li>
      <li><strong>Accurify Pay</strong> — Enable to let clients pay online (standard invoices only).</li>
    </ul>
  </li>
  <li>Click <strong>Save as Draft</strong> to save without sending, or <strong>Save &amp; Send</strong> to email immediately.</li>
</ol>

<h3>Adding Multiple Line Items</h3>
<p>Click <strong>Add Line Item</strong> to add more rows. Each item has its own description, quantity, and price. The total is calculated automatically.</p>`,
      },
      {
        id: 'invoice-statuses',
        title: 'Understanding invoice statuses',
        summary: 'What each invoice status means and how invoices move between statuses.',
        category: 'invoices',
        tags: ['status', 'draft', 'sent', 'overdue', 'paid', 'cancelled', 'converted', 'proforma'],
        content: `
<h3>Invoice Statuses</h3>
<table>
  <tr><th>Status</th><th>Meaning</th></tr>
  <tr><td><strong>Draft</strong></td><td>Created but not yet sent to the client</td></tr>
  <tr><td><strong>Sent</strong></td><td>Emailed to the client</td></tr>
  <tr><td><strong>Overdue</strong></td><td>Due date has passed without payment</td></tr>
  <tr><td><strong>Paid</strong></td><td>Client has paid</td></tr>
  <tr><td><strong>Cancelled</strong></td><td>Voided and no longer valid</td></tr>
  <tr><td><strong>Converted</strong></td><td>Proforma invoice that has been converted to a standard invoice</td></tr>
</table>

<h3>Status Flow</h3>
<p><strong>Standard invoices:</strong> Draft &rarr; <em>(send)</em> &rarr; Sent &rarr; <em>(due date passes)</em> &rarr; Overdue. From Sent or Overdue, an invoice can be marked as <strong>Paid</strong> or <strong>Cancelled</strong>.</p>
<p><strong>Proforma invoices:</strong> Draft &rarr; <em>(send)</em> &rarr; Sent &rarr; <em>(due date passes)</em> &rarr; Overdue. From any status (except Cancelled), a proforma can be <strong>Converted</strong> to a standard invoice. It can also be <strong>Cancelled</strong>.</p>
<p>Cancelled and Converted invoices are final and cannot be re-opened.</p>`,
      },
      {
        id: 'send-invoice',
        title: 'Sending invoices via email and WhatsApp',
        summary: 'Share invoices with clients through email or WhatsApp.',
        category: 'invoices',
        tags: ['send', 'email', 'whatsapp', 'share', 'resend'],
        content: `
<h3>Sending via Email</h3>
<ol>
  <li>Open a Draft invoice.</li>
  <li>Click <strong>Send Invoice</strong>.</li>
  <li>The invoice is emailed to the client as a PDF attachment.</li>
</ol>

<h3>Sending via WhatsApp</h3>
<ol>
  <li>Open a Sent, Overdue, or Paid invoice.</li>
  <li>Click the green <strong>Share via WhatsApp</strong> button.</li>
  <li>WhatsApp opens with a pre-filled message containing the invoice number, amount, due date, and payment link (if Accurify Pay is enabled).</li>
  <li>If the client's phone number is on file, it's automatically selected. Otherwise, pick a contact manually.</li>
</ol>

<h3>Resending an Invoice</h3>
<p>If you edit a Sent or Overdue invoice and save changes, you'll be prompted to resend the updated version to the client.</p>

<h3>Tips</h3>
<ul>
  <li>Add a client <strong>email</strong> to enable email sending.</li>
  <li>Add a client <strong>phone number</strong> to pre-fill the WhatsApp recipient.</li>
</ul>`,
      },
      {
        id: 'invoice-payments',
        title: 'Tracking and recording payments',
        summary: 'Mark invoices as paid and send receipts to clients.',
        category: 'invoices',
        tags: ['payment', 'paid', 'receipt', 'mark paid', 'accurify pay'],
        content: `
<h3>Automatic Payment Tracking</h3>
<p>When a client pays via <strong>Accurify Pay</strong>, the invoice is automatically marked as <strong>Paid</strong>.</p>

<h3>Manual Payment Recording</h3>
<p>For bank transfers, cash, or other payment methods:</p>
<ol>
  <li>Open the invoice.</li>
  <li>Click <strong>Mark as Paid</strong>.</li>
  <li>The invoice status changes to Paid.</li>
</ol>

<h3>Sending Receipts</h3>
<p>After an invoice is marked as Paid:</p>
<ul>
  <li>Click <strong>Send Receipt</strong> to email the receipt to the client.</li>
  <li>Click <strong>Send Receipt via WhatsApp</strong> to share via WhatsApp.</li>
</ul>`,
      },
      {
        id: 'edit-cancel-invoice',
        title: 'Editing and cancelling invoices',
        summary: 'How to modify or void invoices after creation.',
        category: 'invoices',
        tags: ['edit', 'cancel', 'void', 'modify', 'journal entries', 'proforma'],
        content: `
<h3>Editing Invoices</h3>
<ul>
  <li><strong>Draft invoices</strong> can be freely edited.</li>
  <li><strong>Sent/Overdue standard invoices</strong> can be edited, but changes reverse and re-post the accounting journal entries. You'll be asked whether to resend the updated invoice.</li>
  <li><strong>Sent/Overdue proforma invoices</strong> can be edited freely since they have no accounting impact.</li>
  <li><strong>Paid, Cancelled, and Converted invoices</strong> cannot be edited.</li>
</ul>

<h3>Cancelling an Invoice</h3>
<ol>
  <li>Open a Sent or Overdue invoice.</li>
  <li>Click <strong>Cancel Invoice</strong>.</li>
  <li>For standard invoices, all associated accounting entries are reversed.</li>
  <li>For proforma invoices, the status is simply set to Cancelled (no journal entries to reverse).</li>
</ol>
<p><strong>Note:</strong> Cancelled invoices cannot be un-cancelled. Create a new invoice if needed.</p>`,
      },
      {
        id: 'payment-links',
        title: 'Using payment links (Accurify Pay)',
        summary: 'Generate and share online payment links for your invoices.',
        category: 'invoices',
        tags: ['payment link', 'accurify pay', 'online payment', 'paystack'],
        content: `
<h3>What Are Payment Links?</h3>
<p>Payment links let your clients pay invoices online using card, bank transfer, or USSD — powered by Paystack.</p>

<h3>Enabling Payment Links</h3>
<ol>
  <li>First, set up Accurify Pay in <strong>Settings &gt; Payment Setup</strong>.</li>
  <li>When creating or editing a standard invoice, toggle <strong>Enable Online Payment</strong>.</li>
  <li>After sending the invoice, a payment link is automatically generated.</li>
</ol>
<p><strong>Note:</strong> Payment links are not available for proforma invoices. Convert a proforma to a standard invoice first if you need online payment.</p>

<h3>Sharing Payment Links</h3>
<ul>
  <li>The link appears on the invoice detail page — click to copy.</li>
  <li>Share via email, WhatsApp, or any messaging platform.</li>
  <li>Links expire after 30 days but can be regenerated.</li>
</ul>

<h3>Platform Fee</h3>
<p>A small platform fee (typically 3%) is deducted per transaction. The exact fee and your net amount are shown on the invoice creation page when Accurify Pay is enabled.</p>`,
      },
      {
        id: 'proforma-invoices',
        title: 'Creating and managing proforma invoices',
        summary: 'Send preliminary invoices with no accounting impact, then convert to standard invoices.',
        category: 'invoices',
        tags: ['proforma', 'preliminary', 'quote', 'estimate', 'convert', 'no journal', 'PRO'],
        content: `
<h3>What Is a Proforma Invoice?</h3>
<p>A proforma invoice is a preliminary document sent to a client before a formal invoice is issued. It outlines the expected charges but has <strong>no accounting impact</strong> — no journal entries are created, and it doesn't appear in your revenue, tax, or dashboard statistics.</p>
<p>Common uses include price quotations, customs documentation, and getting client approval before issuing a binding invoice.</p>

<h3>Creating a Proforma Invoice</h3>
<ol>
  <li>Navigate to <strong>Invoices</strong> and click <strong>Create Invoice</strong>.</li>
  <li>At the top of the form, switch the invoice type from <strong>Standard Invoice</strong> to <strong>Proforma Invoice</strong>.</li>
  <li>Fill in the client, dates, line items, taxes, and notes as usual.</li>
  <li>Click <strong>Save as Draft</strong> or <strong>Save &amp; Send</strong>.</li>
</ol>
<p>Proforma invoices use a separate numbering sequence: <strong>PRO-YYYY-XXXX</strong> (e.g., PRO-2026-0001).</p>

<h3>Key Differences from Standard Invoices</h3>
<table>
  <tr><th>Feature</th><th>Standard Invoice</th><th>Proforma Invoice</th></tr>
  <tr><td>Journal entries</td><td>Created when sent</td><td>None</td></tr>
  <tr><td>Mark as Paid</td><td>Yes</td><td>No</td></tr>
  <tr><td>Send Receipt</td><td>Yes</td><td>No</td></tr>
  <tr><td>Accurify Pay</td><td>Available</td><td>Not available</td></tr>
  <tr><td>Dashboard &amp; Tax stats</td><td>Included</td><td>Excluded</td></tr>
  <tr><td>PDF heading</td><td>"INVOICE"</td><td>"PROFORMA INVOICE"</td></tr>
  <tr><td>Number format</td><td>INV-YYYY-XXXX</td><td>PRO-YYYY-XXXX</td></tr>
  <tr><td>Convert to Invoice</td><td>N/A</td><td>Yes</td></tr>
</table>

<h3>Sending a Proforma Invoice</h3>
<p>Proforma invoices are sent the same way as standard invoices — via email or WhatsApp. The email subject and PDF clearly label the document as a "Proforma Invoice" so your client knows it is not a binding invoice.</p>

<h3>Converting to a Standard Invoice</h3>
<p>Once the client approves the proforma, you can convert it into a real invoice:</p>
<ol>
  <li>Open the proforma invoice (it must be in Draft, Sent, or Overdue status).</li>
  <li>Click <strong>Convert to Invoice</strong>.</li>
  <li>A new standard invoice is created with the same details (client, items, amounts).</li>
  <li>The original proforma's status changes to <strong>Converted</strong>.</li>
  <li>You're redirected to the new invoice to review and send it.</li>
</ol>
<p><strong>Note:</strong> The proforma invoice is preserved for your records but can no longer be modified after conversion.</p>

<h3>Cancelling a Proforma Invoice</h3>
<p>You can cancel a proforma invoice from the Sent or Overdue status. Since proforma invoices have no accounting impact, cancellation does not reverse any journal entries — it simply marks the proforma as cancelled.</p>`,
      },
    ],
  },

  // =========================================================================
  // BILLS & EXPENSES
  // =========================================================================
  {
    id: 'bills',
    title: 'Bills & Expenses',
    description: 'Record, track, and manage bills from suppliers and vendors.',
    icon: 'Receipt',
    articles: [
      {
        id: 'create-bill',
        title: 'How to create a bill',
        summary: 'Record bills from suppliers and track what you owe.',
        category: 'bills',
        tags: ['bill', 'create', 'supplier', 'expense'],
        content: `
<h3>Creating a Bill</h3>
<ol>
  <li>Navigate to <strong>Bills</strong> from the sidebar.</li>
  <li>Click <strong>Create Bill</strong>.</li>
  <li>Fill in the details:
    <ul>
      <li><strong>Supplier</strong> — Select existing or enter name manually.</li>
      <li><strong>Bill Date</strong> — The date on the bill.</li>
      <li><strong>Due Date</strong> — When payment is expected.</li>
      <li><strong>Line Items</strong> — Description, category, quantity, and unit price.</li>
      <li><strong>Notes</strong> — Additional details.</li>
    </ul>
  </li>
  <li>Click <strong>Save as Draft</strong> or <strong>Save</strong>.</li>
</ol>

<h3>Bill Statuses</h3>
<table>
  <tr><th>Status</th><th>Meaning</th></tr>
  <tr><td><strong>Draft</strong></td><td>Entered but not confirmed</td></tr>
  <tr><td><strong>Approved</strong></td><td>Confirmed and tracked for payment</td></tr>
  <tr><td><strong>Paid</strong></td><td>Bill has been paid</td></tr>
  <tr><td><strong>Cancelled</strong></td><td>Voided</td></tr>
</table>`,
      },
      {
        id: 'bill-parsing',
        title: 'Uploading and parsing bills automatically',
        summary: 'Use AI to extract bill data from PDF or image uploads.',
        category: 'bills',
        tags: ['upload', 'parse', 'ai', 'pdf', 'image', 'ocr'],
        content: `
<h3>AI-Powered Bill Parsing</h3>
<p>Instead of typing bill details manually, upload the document and let Accurify extract the data.</p>
<ol>
  <li>Click <strong>Upload Bill</strong>.</li>
  <li>Select a PDF or image of your bill.</li>
  <li>Accurify automatically extracts:
    <ul>
      <li>Supplier name</li>
      <li>Bill date and due date</li>
      <li>Line items and amounts</li>
    </ul>
  </li>
  <li>Review the extracted data and correct any errors.</li>
  <li>Save the bill.</li>
</ol>
<p><strong>Tip:</strong> The clearer the document, the better the extraction accuracy. Scanned images with good resolution work best.</p>`,
      },
    ],
  },

  // =========================================================================
  // CLIENTS & SUPPLIERS
  // =========================================================================
  {
    id: 'clients',
    title: 'Clients & Suppliers',
    description: 'Manage your customers, vendors, and their contact details.',
    icon: 'UserMultiple',
    articles: [
      {
        id: 'manage-clients',
        title: 'Managing your clients',
        summary: 'Add, edit, and view client information and invoice history.',
        category: 'clients',
        tags: ['client', 'customer', 'add', 'edit', 'contact'],
        content: `
<h3>Adding a Client</h3>
<ol>
  <li>Navigate to <strong>Clients</strong> from the sidebar.</li>
  <li>Click <strong>Add Client</strong>.</li>
  <li>Enter: Name (required), Email, Phone, and Address.</li>
  <li>Click <strong>Save</strong>.</li>
</ol>

<h3>Client Details</h3>
<p>Click on any client to see:</p>
<ul>
  <li>Contact information</li>
  <li>Invoice history</li>
  <li>Total amount invoiced</li>
  <li>Outstanding balance</li>
</ul>

<h3>Why Add Contact Details?</h3>
<ul>
  <li><strong>Email</strong> — enables sending invoices and receipts via email.</li>
  <li><strong>Phone</strong> — enables the WhatsApp share feature.</li>
</ul>
<p>You can also create clients on-the-fly when creating an invoice.</p>`,
      },
      {
        id: 'manage-suppliers',
        title: 'Managing suppliers and vendors',
        summary: 'Track your suppliers for bill management (Goods businesses).',
        category: 'clients',
        tags: ['supplier', 'vendor', 'goods', 'bills'],
        content: `
<h3>Adding a Supplier</h3>
<p>Available for <strong>Goods</strong> businesses.</p>
<ol>
  <li>Navigate to <strong>Suppliers</strong> from the sidebar.</li>
  <li>Click <strong>Add Supplier</strong>.</li>
  <li>Enter: Name, contact person, email, phone, and address.</li>
  <li>Click <strong>Save</strong>.</li>
</ol>

<h3>Supplier Details</h3>
<p>View a supplier's bill history, total amount spent, outstanding balance, and last bill date.</p>`,
      },
    ],
  },

  // =========================================================================
  // TAX
  // =========================================================================
  {
    id: 'tax',
    title: 'Tax Management',
    description: 'Track VAT, WHT, and stay compliant with Nigerian tax regulations.',
    icon: 'Calculator',
    articles: [
      {
        id: 'tax-dashboard',
        title: 'Understanding the Tax Dashboard',
        summary: 'View your VAT and WHT obligations at a glance.',
        category: 'tax',
        tags: ['tax', 'vat', 'wht', 'dashboard', 'firs'],
        content: `
<h3>Tax Dashboard</h3>
<p>Navigate to <strong>Tax</strong> from the sidebar to see your tax summary:</p>
<table>
  <tr><th>Metric</th><th>Description</th></tr>
  <tr><td><strong>Output VAT</strong></td><td>VAT collected from clients on invoices</td></tr>
  <tr><td><strong>Input VAT</strong></td><td>VAT paid on bills and purchases</td></tr>
  <tr><td><strong>Net VAT Payable</strong></td><td>Output VAT minus Input VAT (what you owe FIRS)</td></tr>
  <tr><td><strong>WHT Payable</strong></td><td>Withholding tax obligations</td></tr>
</table>`,
      },
      {
        id: 'vat-wht-explained',
        title: 'VAT and WHT explained',
        summary: 'How Nigerian VAT and Withholding Tax work in Accurify.',
        category: 'tax',
        tags: ['vat', 'wht', 'withholding', 'tax rate', '7.5%', 'nigeria'],
        content: `
<h3>VAT (Value Added Tax) — 7.5%</h3>
<ul>
  <li>When you create an invoice with VAT enabled, Accurify adds 7.5% VAT to the subtotal.</li>
  <li>When you record a bill with VAT, it's tracked as Input VAT.</li>
  <li><strong>Net VAT Payable</strong> = Output VAT - Input VAT.</li>
</ul>

<h3>WHT (Withholding Tax)</h3>
<ul>
  <li>Applicable to certain service invoices.</li>
  <li><strong>5%</strong> — for contracts and supplies.</li>
  <li><strong>10%</strong> — for professional and management services.</li>
  <li>WHT is deducted from the invoice total, reducing the amount the client pays to you.</li>
  <li>The client remits the WHT portion directly to FIRS on your behalf.</li>
</ul>

<h3>Tax Compliance Tips</h3>
<ul>
  <li>Keep VAT enabled on all applicable invoices.</li>
  <li>Review your Tax Dashboard monthly before filing returns.</li>
  <li>Ensure your TIN is set up in Settings.</li>
  <li>Use the tax summary data for FIRS portal submissions.</li>
</ul>`,
      },
    ],
  },

  // =========================================================================
  // BANKING & TRANSACTIONS
  // =========================================================================
  {
    id: 'banking',
    title: 'Banking & Transactions',
    description: 'Connect bank accounts, import transactions, and categorize spending.',
    icon: 'Bank',
    articles: [
      {
        id: 'connect-bank',
        title: 'Connecting your bank account',
        summary: 'Import transactions automatically via Mono (Premium).',
        category: 'banking',
        tags: ['bank', 'connect', 'mono', 'sync', 'premium'],
        content: `
<h3>Connecting a Bank Account</h3>
<p><em>Available on Premium plans.</em></p>
<ol>
  <li>Navigate to <strong>Bank Accounts</strong> from the sidebar.</li>
  <li>Click <strong>Connect Bank</strong>.</li>
  <li>You'll be redirected to Mono's secure connection page.</li>
  <li>Select your bank and log in with your credentials.</li>
  <li>Authorize the connection.</li>
  <li>Transactions begin syncing automatically.</li>
</ol>

<h3>Is it safe?</h3>
<p>Yes. Bank connections are powered by <strong>Mono</strong>, a CBN-licensed financial data provider. Accurify only has <strong>read access</strong> to your transactions — we cannot initiate transfers or modify your account.</p>

<h3>Multiple Accounts</h3>
<p>You can connect multiple bank accounts from different banks.</p>`,
      },
      {
        id: 'categorize-transactions',
        title: 'Categorizing transactions',
        summary: 'Assign categories to your income and expenses for accurate reporting.',
        category: 'banking',
        tags: ['transactions', 'categorize', 'income', 'expense', 'category'],
        content: `
<h3>Why Categorize?</h3>
<p>Categorized transactions feed into your financial reports (Income Statement, Tax Dashboard). Uncategorized transactions won't appear in reports.</p>

<h3>How to Categorize</h3>
<ol>
  <li>Navigate to <strong>Transactions</strong> from the sidebar.</li>
  <li>Uncategorized transactions are highlighted.</li>
  <li>Click on a transaction and select a category.</li>
</ol>

<h3>Common Categories</h3>
<p><strong>Income:</strong> Sales Revenue, Service Income, Interest, Other Income.</p>
<p><strong>Expense:</strong> Cost of Goods Sold, Rent, Utilities, Salaries, Office Supplies, Travel, Marketing, Professional Fees, Insurance, Bank Charges.</p>`,
      },
      {
        id: 'upload-statement',
        title: 'Uploading bank statements',
        summary: 'Import transactions from PDF bank statements.',
        category: 'banking',
        tags: ['statement', 'upload', 'pdf', 'import', 'parse'],
        content: `
<h3>Uploading a Statement</h3>
<p>If you prefer not to connect your bank directly:</p>
<ol>
  <li>Download a PDF statement from your bank's app or website.</li>
  <li>Navigate to <strong>Upload Statement</strong> from the sidebar.</li>
  <li>Upload the PDF.</li>
  <li>Accurify parses the statement and extracts transactions.</li>
  <li>Review and approve each transaction.</li>
  <li>Categorize as needed.</li>
</ol>`,
      },
    ],
  },

  // =========================================================================
  // ACCOUNTING (ACCURIFY BOOKS)
  // =========================================================================
  {
    id: 'accounting',
    title: 'Accurify Books',
    description: 'Double-entry accounting: Chart of Accounts, Journal Entries, and General Ledger.',
    icon: 'Book',
    articles: [
      {
        id: 'chart-of-accounts',
        title: 'Understanding the Chart of Accounts',
        summary: 'Your account structure for tracking finances.',
        category: 'accounting',
        tags: ['chart of accounts', 'gl', 'accounts', 'assets', 'liabilities', 'equity', 'premium'],
        content: `
<h3>What is the Chart of Accounts?</h3>
<p><em>Available on Premium plans (Accurify Books).</em></p>
<p>Your Chart of Accounts lists every account used to track your finances. It's the foundation of double-entry accounting.</p>

<h3>Account Types</h3>
<table>
  <tr><th>Type</th><th>Examples</th></tr>
  <tr><td><strong>Assets</strong></td><td>Bank Account, Cash, Accounts Receivable, Inventory</td></tr>
  <tr><td><strong>Liabilities</strong></td><td>Accounts Payable, Loans, VAT Payable, WHT Payable</td></tr>
  <tr><td><strong>Equity</strong></td><td>Owner's Capital, Retained Earnings</td></tr>
  <tr><td><strong>Income</strong></td><td>Sales Revenue, Service Income</td></tr>
  <tr><td><strong>Expenses</strong></td><td>Rent, Salaries, Utilities, Cost of Goods Sold</td></tr>
</table>

<p>Accurify creates a default set of accounts during onboarding. You can add, edit, or archive accounts as needed.</p>`,
      },
      {
        id: 'journal-entries',
        title: 'Working with journal entries',
        summary: 'Create manual accounting entries for adjustments and corrections.',
        category: 'accounting',
        tags: ['journal', 'entry', 'debit', 'credit', 'double-entry', 'premium'],
        content: `
<h3>What Are Journal Entries?</h3>
<p>Journal entries record financial transactions using debits and credits. For every entry, total debits must equal total credits.</p>

<h3>Creating a Journal Entry</h3>
<ol>
  <li>Navigate to <strong>Journal Entries</strong> from the sidebar.</li>
  <li>Click <strong>New Entry</strong>.</li>
  <li>Fill in the date, description, and add debit/credit lines.</li>
  <li>Click <strong>Save as Draft</strong> or <strong>Post</strong> to record in the ledger.</li>
</ol>

<h3>Automatic Journal Entries</h3>
<p>Accurify automatically creates journal entries when you:</p>
<ul>
  <li>Send an invoice (debits Accounts Receivable, credits Revenue)</li>
  <li>Mark a bill as paid (debits Expense, credits Cash/Bank)</li>
  <li>Record a payment (debits Cash/Bank, credits Accounts Receivable)</li>
</ul>
<p>Manual entries are for adjustments, corrections, or transactions outside the invoice/bill workflow.</p>`,
      },
      {
        id: 'general-ledger',
        title: 'Viewing the General Ledger',
        summary: 'See all transactions posted to each account.',
        category: 'accounting',
        tags: ['general ledger', 'ledger', 'account activity', 'balance', 'premium'],
        content: `
<h3>General Ledger</h3>
<ol>
  <li>Navigate to <strong>General Ledger</strong> from the sidebar.</li>
  <li>Select an account to view its transactions.</li>
  <li>Filter by date range.</li>
  <li>See each transaction with debit, credit, and running balance.</li>
</ol>`,
      },
    ],
  },

  // =========================================================================
  // FINANCIAL STATEMENTS
  // =========================================================================
  {
    id: 'reports',
    title: 'Financial Statements',
    description: 'Generate Income Statements, Balance Sheets, Trial Balance, and Cash Flow reports.',
    icon: 'ChartColumn',
    articles: [
      {
        id: 'income-statement',
        title: 'Income Statement (Profit & Loss)',
        summary: 'View your revenue, expenses, and net income over a period.',
        category: 'reports',
        tags: ['income statement', 'profit', 'loss', 'p&l', 'revenue', 'expenses', 'premium'],
        content: `
<h3>Income Statement</h3>
<p><em>Available on Premium plans.</em></p>
<ol>
  <li>Navigate to <strong>Financial Statements</strong> from the sidebar.</li>
  <li>Select <strong>Income Statement</strong>.</li>
  <li>Choose a date range (this month, quarter, or year).</li>
  <li>View: Total Revenue, Cost of Goods Sold, Gross Profit, Operating Expenses (by category), and Net Income.</li>
</ol>
<p>Export as PDF for your records or accountant.</p>`,
      },
      {
        id: 'balance-sheet',
        title: 'Balance Sheet',
        summary: 'View your assets, liabilities, and equity at a point in time.',
        category: 'reports',
        tags: ['balance sheet', 'assets', 'liabilities', 'equity', 'premium'],
        content: `
<h3>Balance Sheet</h3>
<ol>
  <li>Select <strong>Balance Sheet</strong> from Financial Statements.</li>
  <li>Choose an "as of" date.</li>
  <li>View: Current and Fixed Assets, Current and Long-term Liabilities, and Equity (Capital + Retained Earnings).</li>
</ol>`,
      },
      {
        id: 'trial-balance',
        title: 'Trial Balance',
        summary: 'Verify that your books are in balance.',
        category: 'reports',
        tags: ['trial balance', 'debit', 'credit', 'verification', 'premium'],
        content: `
<h3>Trial Balance</h3>
<p>Lists all accounts with their debit or credit balances. Total debits should equal total credits. If they don't, there may be an error in your journal entries.</p>
<ol>
  <li>Navigate to <strong>Trial Balance</strong> from the sidebar.</li>
  <li>Select a date range.</li>
  <li>Review all account balances.</li>
</ol>`,
      },
    ],
  },

  // =========================================================================
  // PAYMENTS
  // =========================================================================
  {
    id: 'payments',
    title: 'Payments & Accurify Pay',
    description: 'Set up online payment collection and manage payment methods.',
    icon: 'Wallet',
    articles: [
      {
        id: 'setup-accurify-pay',
        title: 'Setting up Accurify Pay',
        summary: 'Enable online payment collection on your invoices.',
        category: 'payments',
        tags: ['accurify pay', 'setup', 'payment', 'paystack', 'bank account'],
        content: `
<h3>Setting Up</h3>
<ol>
  <li>Navigate to <strong>Settings &gt; Payment Setup</strong>.</li>
  <li>Enter your settlement bank account: bank name, account number, and account holder name.</li>
  <li>Complete the verification process.</li>
  <li>Once verified, you can enable Accurify Pay on any invoice.</li>
</ol>

<h3>How It Works</h3>
<ol>
  <li>Toggle <strong>Enable Online Payment</strong> when creating an invoice.</li>
  <li>After sending, a payment link is generated.</li>
  <li>Share the link via email, WhatsApp, or copy-paste.</li>
  <li>Clients pay via card, bank transfer, or USSD (Paystack).</li>
  <li>Payment is settled to your bank account (typically within 24 hours).</li>
  <li>Invoice is automatically marked as Paid.</li>
</ol>`,
      },
    ],
  },

  // =========================================================================
  // PRODUCTS & INVENTORY
  // =========================================================================
  {
    id: 'inventory',
    title: 'Products & Inventory',
    description: 'Manage your product catalog, stock levels, and batches (Goods businesses).',
    icon: 'ShoppingCart',
    articles: [
      {
        id: 'manage-products',
        title: 'Managing your product catalog',
        summary: 'Add, edit, and organize products.',
        category: 'inventory',
        tags: ['products', 'catalog', 'sku', 'price', 'goods'],
        content: `
<h3>Adding a Product</h3>
<p><em>Available for Goods businesses.</em></p>
<ol>
  <li>Navigate to <strong>Products</strong> from the sidebar.</li>
  <li>Click <strong>Add Product</strong>.</li>
  <li>Enter: Name, SKU, Description, Category, Unit Price, and Cost Price.</li>
  <li>Click <strong>Save</strong>.</li>
</ol>`,
      },
      {
        id: 'stock-management',
        title: 'Tracking stock and inventory',
        summary: 'Record stock movements and monitor inventory levels.',
        category: 'inventory',
        tags: ['stock', 'inventory', 'movement', 'purchase', 'sale', 'adjustment'],
        content: `
<h3>Stock Movements</h3>
<ul>
  <li><strong>Purchase</strong> — Incoming stock from a supplier.</li>
  <li><strong>Sale</strong> — Outgoing stock sold to a customer.</li>
  <li><strong>Adjustment</strong> — Correct levels after a physical count.</li>
  <li><strong>Return</strong> — Returned items.</li>
</ul>

<h3>Batch Tracking</h3>
<p>For products with expiry dates, create batches with batch numbers and expiry dates. Stock is deducted using FEFO (First Expiry, First Out).</p>

<h3>Stock Summary</h3>
<p>The Stock page shows summary statistics:</p>
<ul>
  <li><strong>Total Movements</strong> — All stock transactions recorded.</li>
  <li><strong>Purchase Count</strong> — Number of purchase (inbound) movements.</li>
  <li><strong>Sale Count</strong> — Number of sale (outbound) movements.</li>
  <li><strong>Total Purchase Value</strong> — Value of all stock purchased.</li>
  <li><strong>Total Sales Value</strong> — Value of all stock sold.</li>
</ul>

<h3>On Mobile</h3>
<p>Goods businesses can view and record stock movements from the mobile app:</p>
<ol>
  <li>Tap <strong>More</strong> &gt; <strong>Inventory</strong>.</li>
  <li>View movements filtered by type (Purchases, Sales, Adjustments, Returns).</li>
  <li>Tap <strong>+</strong> to record a new movement.</li>
  <li>From a product detail page, tap <strong>View Stock History</strong> to see that product's movements.</li>
</ol>`,
      },
    ],
  },

  // =========================================================================
  // QUICKSTORE
  // =========================================================================
  {
    id: 'quickstore',
    title: 'QuickStore',
    description: 'Set up an online storefront, manage orders, and use POS.',
    icon: 'Store',
    articles: [
      {
        id: 'setup-store',
        title: 'Setting up your online store',
        summary: 'Create a QuickStore storefront to sell products online.',
        category: 'quickstore',
        tags: ['quickstore', 'store', 'online', 'storefront', 'setup', 'premium'],
        content: `
<h3>Creating Your Store</h3>
<p><em>Available as a Premium addon for Goods businesses.</em></p>
<ol>
  <li>Navigate to <strong>QuickStore</strong> from the sidebar.</li>
  <li>Click <strong>Create Store</strong>.</li>
  <li>Configure: Store Name, URL slug, Description, and Contact Info.</li>
  <li>Add products from your catalog.</li>
  <li>Toggle <strong>Active</strong> to make your store live.</li>
</ol>
<p>Your store will be accessible at a public URL that you can share with customers.</p>`,
      },
      {
        id: 'manage-orders',
        title: 'Managing orders and POS',
        summary: 'Process customer orders and use Point of Sale for in-person sales.',
        category: 'quickstore',
        tags: ['orders', 'pos', 'point of sale', 'fulfillment'],
        content: `
<h3>Order Management</h3>
<p>When customers place orders through your store:</p>
<ol>
  <li>You receive a notification.</li>
  <li>View orders in the <strong>Orders</strong> tab.</li>
  <li>Update status: Pending &rarr; Processing &rarr; Shipped &rarr; Delivered.</li>
  <li>Payment is collected via Paystack.</li>
</ol>

<h3>Point of Sale (POS)</h3>
<p>For in-person sales:</p>
<ol>
  <li>Navigate to <strong>POS</strong> from the QuickStore section.</li>
  <li>Search or browse products — use name, SKU, or barcode.</li>
  <li>Tap products to add them to your cart.</li>
  <li>Adjust quantities using the + / - buttons.</li>
  <li>Optionally enter customer name and phone.</li>
  <li>Review the cart: subtotal, VAT (auto-calculated for taxable products), and total.</li>
  <li>Tap <strong>Complete Sale</strong> to create the order.</li>
</ol>

<h3>POS on Mobile</h3>
<p>Goods businesses can use POS directly from the mobile app:</p>
<ol>
  <li>Tap the <strong>+</strong> button &gt; <strong>New POS Sale</strong>, or go to <strong>More</strong> &gt; <strong>Point of Sale</strong>.</li>
  <li>Browse products in a grid view — stock availability is shown for each product.</li>
  <li>Build your cart, add customer info, and checkout.</li>
  <li>The order appears in your Orders list.</li>
</ol>

<h3>Order Fulfillment Workflow</h3>
<p>Orders follow a status workflow:</p>
<table>
  <tr><th>Status</th><th>Meaning</th><th>Next Action</th></tr>
  <tr><td>Pending</td><td>Order received, not yet confirmed</td><td>Confirm Order</td></tr>
  <tr><td>Confirmed</td><td>Order accepted, preparing</td><td>Mark Processing</td></tr>
  <tr><td>Processing</td><td>Being prepared/packed</td><td>Mark Ready</td></tr>
  <tr><td>Ready</td><td>Ready for pickup or delivery</td><td>Complete Order</td></tr>
  <tr><td>Completed</td><td>Order fulfilled</td><td>—</td></tr>
  <tr><td>Cancelled</td><td>Order cancelled</td><td>—</td></tr>
</table>`,
      },
    ],
  },

  // =========================================================================
  // HIRE AN EXPERT
  // =========================================================================
  {
    id: 'marketplace',
    title: 'Hire an Expert',
    description: 'Find and hire professional accountants through the marketplace.',
    icon: 'Person',
    articles: [
      {
        id: 'hire-accountant',
        title: 'Hiring an accountant',
        summary: 'Browse, evaluate, and subscribe to professional accountants.',
        category: 'marketplace',
        tags: ['accountant', 'hire', 'expert', 'retainer', 'marketplace', 'premium'],
        content: `
<h3>Browsing Accountants</h3>
<p><em>Available on Premium plans.</em></p>
<ol>
  <li>Navigate to <strong>Hire Expert</strong> from the sidebar.</li>
  <li>Browse verified accountants with profiles showing specializations, experience, rates, and ratings.</li>
</ol>

<h3>Subscribing to a Retainer</h3>
<ol>
  <li>Find an accountant that fits your needs.</li>
  <li>Click <strong>Subscribe</strong>.</li>
  <li>Select a service tier and confirm the monthly cost.</li>
  <li>The accountant gains access to your books and can create journal entries, generate statements, and provide advice.</li>
</ol>

<h3>Managing Retainers</h3>
<p>View active retainers in <strong>My Experts</strong>. Contact experts directly, review service delivery, and pause or cancel as needed.</p>`,
      },
    ],
  },

  // =========================================================================
  // SETTINGS & ACCOUNT
  // =========================================================================
  {
    id: 'settings',
    title: 'Settings & Account',
    description: 'Configure your business, manage your account, and handle subscriptions.',
    icon: 'SettingsAdjust',
    articles: [
      {
        id: 'business-settings',
        title: 'Business profile settings',
        summary: 'Update your business information, logo, and bank details.',
        category: 'settings',
        tags: ['settings', 'business', 'profile', 'logo', 'tin', 'bank details'],
        content: `
<h3>Business Profile</h3>
<p>Go to <strong>Settings</strong> from the sidebar to update:</p>
<ul>
  <li><strong>Company Name, Address, Phone, Email</strong></li>
  <li><strong>Logo</strong> — Appears on invoices and receipts.</li>
  <li><strong>TIN &amp; RC Number</strong> — For tax compliance.</li>
  <li><strong>Bank Details</strong> — Bank name, account number, and account name (shown on invoices so clients know where to pay).</li>
  <li><strong>Fiscal Year Start Month</strong></li>
</ul>`,
      },
      {
        id: 'subscriptions',
        title: 'Managing your subscription',
        summary: 'Upgrade, downgrade, or manage your Accurify plan.',
        category: 'settings',
        tags: ['subscription', 'premium', 'plan', 'upgrade', 'billing', 'trial'],
        content: `
<h3>Free Plan</h3>
<ul>
  <li>5 invoices per day, 3 sends per day</li>
  <li>20 clients, 50 products, 100 transactions/month</li>
</ul>

<h3>Premium Plan</h3>
<ul>
  <li>Unlimited everything</li>
  <li>Accurify Books, Bank Sync, Financial Statements</li>
  <li>Hire Expert marketplace, Advanced reporting</li>
</ul>

<h3>Free Trial</h3>
<p>New users get a <strong>14-day free trial</strong> of all Premium features. After the trial, upgrade to keep them or continue on the Free plan.</p>

<h3>Managing Your Plan</h3>
<p>Go to <strong>Settings &gt; Subscriptions</strong> to view your plan, upgrade, or cancel.</p>`,
      },
      {
        id: 'data-import',
        title: 'Importing data into Accurify',
        summary: 'Import clients, invoices, products, and transactions from CSV files.',
        category: 'settings',
        tags: ['import', 'csv', 'data', 'migration', 'opening balances', 'premium'],
        content: `
<h3>Importing Data</h3>
<p><em>Available on Premium plans.</em></p>
<ol>
  <li>Navigate to <strong>Import Data</strong> from the sidebar.</li>
  <li>Download the CSV template for the data type (clients, invoices, products, etc.).</li>
  <li>Fill in the template with your data.</li>
  <li>Upload the completed CSV.</li>
  <li>Review the preview and confirm.</li>
</ol>

<h3>Opening Balances</h3>
<p>If switching from another system:</p>
<ol>
  <li>Go to <strong>Opening Balances</strong>.</li>
  <li>Enter the balance for each account as of your start date.</li>
  <li>Verify total debits equal total credits.</li>
  <li>Save to establish your starting point.</li>
</ol>`,
      },
    ],
  },

  // =========================================================================
  // MOBILE APP
  // =========================================================================
  {
    id: 'mobile',
    title: 'Mobile App',
    description: 'Access Accurify on your phone with the mobile web app.',
    icon: 'MobileCheck',
    articles: [
      {
        id: 'mobile-app-guide',
        title: 'Using the Accurify mobile app',
        summary: 'Install and use the mobile PWA on your phone.',
        category: 'mobile',
        tags: ['mobile', 'pwa', 'install', 'phone', 'ios', 'android'],
        content: `
<h3>Accessing the Mobile App</h3>
<p>Visit <strong>m.accurify.co</strong> on your phone's browser.</p>

<h3>Installing as PWA</h3>
<ul>
  <li><strong>iOS:</strong> Tap the Share button &gt; <strong>Add to Home Screen</strong>.</li>
  <li><strong>Android:</strong> Tap the <strong>Install</strong> prompt or go to browser menu &gt; <strong>Add to Home Screen</strong>.</li>
</ul>

<h3>Mobile Features</h3>
<ul>
  <li><strong>Dashboard</strong> — Key metrics and recent activity.</li>
  <li><strong>Invoices</strong> — Create, view, send, and manage (standard and proforma).</li>
  <li><strong>Bills</strong> — Create and manage bills.</li>
  <li><strong>Clients</strong> — View and manage clients.</li>
  <li><strong>Notifications</strong> — Stay updated on the go.</li>
  <li><strong>WhatsApp Sharing</strong> — Share invoices and receipts directly.</li>
</ul>

<h3>Goods Business Features</h3>
<p>If your business type is <strong>Goods</strong>, you also get:</p>
<ul>
  <li><strong>Products</strong> — View, add, and manage your product catalog.</li>
  <li><strong>Point of Sale (POS)</strong> — Quick in-person sales with cart and checkout.</li>
  <li><strong>Orders</strong> — View and process customer orders.</li>
  <li><strong>Inventory</strong> — Track stock movements and record changes.</li>
  <li><strong>Product Dropdown on Invoices</strong> — Select products to auto-fill line item details.</li>
</ul>

<h3>Navigation</h3>
<ul>
  <li><strong>Bottom Tab Bar</strong> — Dashboard, Invoices, +Create, Bills, More.</li>
  <li><strong>+ Button</strong> — Quick create: New Invoice, New Bill. Goods businesses also see: New Product, New POS Sale.</li>
  <li><strong>More Menu</strong> — Clients, [Products, POS, Orders, Inventory for Goods], Settings, Desktop Version, Sign Out.</li>
</ul>

<h3>Pull to Refresh</h3>
<p>Swipe down on any list page (Dashboard, Invoices, Bills, Clients, Products, Orders, Inventory) to refresh the data.</p>

<p>For advanced features (Accurify Books, Financial Statements, QuickStore setup), use the desktop version at <strong>app.accurify.co</strong>.</p>`,
      },
      {
        id: 'mobile-transactions',
        title: 'Viewing transactions on mobile',
        summary: 'Check your transaction activity and uncategorized items from your phone.',
        category: 'mobile',
        tags: ['mobile', 'transactions', 'uncategorized', 'dashboard', 'categorize'],
        content: `
<h3>Transaction Overview</h3>
<p>The mobile Dashboard shows an <strong>Uncategorized</strong> counter — this tells you how many imported transactions still need a category assigned.</p>

<h3>What You Can See</h3>
<ul>
  <li><strong>Uncategorized count</strong> — Displayed as a summary card on the Dashboard.</li>
  <li><strong>Recent Activity</strong> — The Dashboard shows your most recent transactions and invoices with timestamps and amounts.</li>
</ul>

<h3>Categorizing Transactions</h3>
<p>Full transaction management — viewing the complete list, filtering by type/date, and assigning categories — is available on the desktop version.</p>
<ol>
  <li>Tap <strong>More</strong> in the bottom tab bar.</li>
  <li>Tap <strong>Desktop Version</strong> to open <strong>app.accurify.co</strong>.</li>
  <li>Navigate to <strong>Transactions</strong> from the sidebar.</li>
</ol>

<h3>Tips</h3>
<ul>
  <li>Check the Uncategorized counter regularly — uncategorized transactions won't appear in your financial reports.</li>
  <li>Connect your bank on the desktop app to have transactions imported automatically.</li>
</ul>`,
      },
      {
        id: 'mobile-clients',
        title: 'Managing clients on mobile',
        summary: 'View your client list, see contact details, and create invoices from a client profile.',
        category: 'mobile',
        tags: ['mobile', 'clients', 'contacts', 'create', 'invoice'],
        content: `
<h3>Accessing Your Clients</h3>
<ol>
  <li>Tap <strong>More</strong> in the bottom tab bar.</li>
  <li>Tap <strong>Clients</strong>.</li>
</ol>
<p>You can also reach the client list from the Dashboard by tapping the <strong>Clients</strong> quick action button.</p>

<h3>Client List</h3>
<p>The client list shows each client's name, email, and avatar (or initials). Use the search bar at the top to quickly find a client by name.</p>

<h3>Client Details</h3>
<p>Tap on any client to view their profile:</p>
<ul>
  <li><strong>Email</strong> — Tap to open your email app.</li>
  <li><strong>Phone</strong> — Tap to call directly.</li>
  <li><strong>Address</strong> — Displayed if on file.</li>
</ul>

<h3>Creating an Invoice for a Client</h3>
<p>From a client's detail page, tap the <strong>Create Invoice</strong> button to start a new invoice pre-linked to that client.</p>

<h3>Adding New Clients</h3>
<p>New clients are added when you create an invoice — select or enter the client details during invoice creation. To manage client details (edit name, email, phone, address), use the desktop version at <strong>app.accurify.co</strong>.</p>`,
      },
      {
        id: 'mobile-income-statement',
        title: 'Viewing your Income Statement on mobile',
        summary: 'Check your revenue, expenses, and net income from your phone.',
        category: 'mobile',
        tags: ['mobile', 'income statement', 'profit', 'loss', 'revenue', 'reports', 'premium'],
        content: `
<h3>Income Statement on Mobile</h3>
<p><em>Available on Premium plans.</em></p>
<p>The Income Statement (also called Profit &amp; Loss) shows your business performance over a period — total revenue, expenses, and net income.</p>

<h3>Quick Overview from the Dashboard</h3>
<p>The mobile Dashboard gives you a snapshot of key financials:</p>
<ul>
  <li><strong>Revenue</strong> — Total revenue earned this month.</li>
  <li><strong>Growth</strong> — Percentage change compared to last month (green if up, red if down).</li>
  <li><strong>Outstanding</strong> — Unpaid invoice totals and count.</li>
</ul>

<h3>Viewing the Full Report</h3>
<p>For the detailed Income Statement with line-by-line revenue, cost of sales, gross profit, operating expenses, and net income:</p>
<ol>
  <li>Tap <strong>More</strong> in the bottom tab bar.</li>
  <li>Tap <strong>Desktop Version</strong> to open <strong>app.accurify.co</strong>.</li>
  <li>Navigate to <strong>Financial Statements</strong> &gt; <strong>Income Statement</strong>.</li>
  <li>Choose your date range and view or export as PDF.</li>
</ol>

<h3>What the Report Includes</h3>
<table>
  <tr><th>Section</th><th>What It Shows</th></tr>
  <tr><td><strong>Revenue</strong></td><td>All income from invoices and sales</td></tr>
  <tr><td><strong>Cost of Sales</strong></td><td>Direct costs tied to your goods/services</td></tr>
  <tr><td><strong>Gross Profit</strong></td><td>Revenue minus Cost of Sales</td></tr>
  <tr><td><strong>Operating Expenses</strong></td><td>Rent, salaries, utilities, and other overheads</td></tr>
  <tr><td><strong>Net Income</strong></td><td>Your bottom line — profit (or loss) after all expenses</td></tr>
</table>`,
      },
      {
        id: 'mobile-tax',
        title: 'Checking your tax status on mobile',
        summary: 'View your VAT and WHT obligations from your phone.',
        category: 'mobile',
        tags: ['mobile', 'tax', 'vat', 'wht', 'dashboard', 'firs'],
        content: `
<h3>Tax Overview</h3>
<p>Accurify tracks your VAT and WHT obligations automatically as you create invoices and record bills.</p>

<h3>What's Tracked</h3>
<table>
  <tr><th>Metric</th><th>Description</th></tr>
  <tr><td><strong>Output VAT</strong></td><td>VAT collected from your clients on invoices</td></tr>
  <tr><td><strong>Input VAT</strong></td><td>VAT you paid on bills and purchases</td></tr>
  <tr><td><strong>Net VAT Payable</strong></td><td>Output VAT minus Input VAT — what you owe FIRS</td></tr>
  <tr><td><strong>WHT Payable</strong></td><td>Withholding Tax obligations from applicable invoices</td></tr>
</table>

<h3>Viewing Your Tax Dashboard</h3>
<p>The full Tax Dashboard is available on the desktop version:</p>
<ol>
  <li>Tap <strong>More</strong> in the bottom tab bar.</li>
  <li>Tap <strong>Desktop Version</strong> to open <strong>app.accurify.co</strong>.</li>
  <li>Navigate to <strong>Tax</strong> from the sidebar.</li>
</ol>

<h3>Tips</h3>
<ul>
  <li>Enable VAT on applicable invoices when creating them on mobile — the tax impact is calculated automatically.</li>
  <li>Review the Tax Dashboard monthly before filing returns with FIRS.</li>
  <li>Only standard invoices affect your tax figures — proforma invoices are excluded.</li>
</ul>`,
      },
      {
        id: 'mobile-payment-settings',
        title: 'Payment settings on mobile',
        summary: 'Manage Accurify Pay and payment setup from your phone.',
        category: 'mobile',
        tags: ['mobile', 'payment', 'accurify pay', 'settings', 'paystack', 'setup'],
        content: `
<h3>About Accurify Pay</h3>
<p>Accurify Pay lets your clients pay invoices online via card, bank transfer, or USSD — powered by Paystack. When a client pays, the invoice is automatically marked as Paid.</p>

<h3>Setting Up Accurify Pay</h3>
<p>Payment setup requires entering your settlement bank details and completing verification. This is done on the desktop version:</p>
<ol>
  <li>Tap <strong>More</strong> in the bottom tab bar.</li>
  <li>Tap <strong>Desktop Version</strong> to open <strong>app.accurify.co</strong>.</li>
  <li>Navigate to <strong>Settings</strong> &gt; <strong>Payment Setup</strong>.</li>
  <li>Enter your bank name, account number, and account holder name.</li>
  <li>Complete the verification process.</li>
</ol>

<h3>Using Accurify Pay on Mobile</h3>
<p>Once set up on the desktop, Accurify Pay works seamlessly on mobile:</p>
<ul>
  <li>When creating a standard invoice, online payment is available if Accurify Pay is configured.</li>
  <li>After sending an invoice, the payment link is generated automatically.</li>
  <li>Share the link via WhatsApp directly from the invoice detail page.</li>
</ul>

<h3>Important Notes</h3>
<ul>
  <li>Accurify Pay is not available for proforma invoices.</li>
  <li>A platform fee (typically 3%) is deducted per transaction.</li>
  <li>Payments are settled to your bank account, usually within 24 hours.</li>
</ul>`,
      },
      {
        id: 'mobile-billing',
        title: 'Subscription and billing on mobile',
        summary: 'View your plan, upgrade to Premium, and check billing history.',
        category: 'mobile',
        tags: ['mobile', 'subscription', 'billing', 'premium', 'plan', 'upgrade', 'trial'],
        content: `
<h3>Your Subscription</h3>
<p>Accurify offers a Free plan and a Premium plan. New users get a <strong>14-day free trial</strong> of all Premium features.</p>

<h3>Free Plan Limits</h3>
<ul>
  <li>5 invoices per day, 3 sends per day</li>
  <li>20 clients, 50 products, 100 transactions/month</li>
  <li>Core features: Invoices, Bills, Clients</li>
</ul>

<h3>Premium Plan</h3>
<ul>
  <li>Unlimited invoices, bills, clients, and transactions</li>
  <li>Accurify Books (double-entry accounting)</li>
  <li>Bank Sync, Financial Statements, Tax Dashboard</li>
  <li>Hire Expert marketplace</li>
  <li>Advanced reporting and data import</li>
</ul>

<h3>Managing Your Subscription</h3>
<p>To view your current plan, upgrade, or check your billing history:</p>
<ol>
  <li>Tap <strong>More</strong> in the bottom tab bar.</li>
  <li>Tap <strong>Desktop Version</strong> to open <strong>app.accurify.co</strong>.</li>
  <li>Navigate to <strong>Settings</strong> &gt; <strong>Subscriptions</strong>.</li>
</ol>

<h3>What You'll Find</h3>
<ul>
  <li><strong>Current Plan</strong> — Your active plan (Free, Premium, or Trial) and renewal date.</li>
  <li><strong>Upgrade</strong> — Switch to Premium for unlimited access.</li>
  <li><strong>Billing History</strong> — View past payments and download receipts.</li>
  <li><strong>Cancel</strong> — Downgrade to Free at any time (features revert at the end of the billing period).</li>
</ul>

<h3>Tip</h3>
<p>If you see a feature marked as Premium while using the mobile app, you'll be prompted to upgrade. You can start your free trial directly from the prompt.</p>`,
      },
      {
        id: 'mobile-products',
        title: 'Managing products on mobile',
        summary: 'View, add, and manage your product catalog from your phone (Goods businesses).',
        category: 'mobile',
        tags: ['mobile', 'products', 'catalog', 'goods', 'inventory', 'sku', 'create'],
        content: `
<h3>Accessing Products</h3>
<p><em>Available for Goods businesses only.</em></p>
<ol>
  <li>Tap <strong>More</strong> in the bottom tab bar.</li>
  <li>Tap <strong>Products</strong>.</li>
</ol>
<p>You can also reach Products from the Dashboard quick actions (Goods businesses see a <strong>Products</strong> button).</p>

<h3>Product List</h3>
<p>The product list shows:</p>
<ul>
  <li>Product name, image or category icon</li>
  <li>SKU or category label</li>
  <li>Selling price and stock quantity</li>
  <li><strong>Low Stock</strong> / <strong>Out of Stock</strong> badges</li>
</ul>
<p>Use the search bar to find products by name or SKU. Filter by: All, Active, Low Stock, or Out of Stock.</p>

<h3>Summary Cards</h3>
<p>At the top of the product list, you'll see:</p>
<ul>
  <li><strong>Total</strong> — Number of active products.</li>
  <li><strong>Low Stock</strong> — Products below their reorder level.</li>
  <li><strong>Value</strong> — Total inventory value.</li>
</ul>

<h3>Adding a Product</h3>
<ol>
  <li>Tap the <strong>+</strong> icon in the Products header, or tap the <strong>+</strong> button &gt; <strong>New Product</strong>.</li>
  <li>Enter: Name, Description, Category, SKU, Barcode.</li>
  <li>Set Selling Price and Cost Price.</li>
  <li>Set Stock Quantity and Reorder Level.</li>
  <li>Toggle VAT if applicable (defaults to 7.5%).</li>
  <li>Tap <strong>Create Product</strong>.</li>
</ol>

<h3>Product Details</h3>
<p>Tap any product to see:</p>
<ul>
  <li>Full pricing, stock, and margin information</li>
  <li>Recent stock movements</li>
  <li><strong>Record Sale</strong> — Quick-sell from the product page</li>
  <li><strong>View Stock History</strong> — See all movements for this product</li>
  <li><strong>Deactivate/Activate</strong> — Soft-delete products without losing data</li>
</ul>

<h3>Products on Invoices</h3>
<p>When creating an invoice, Goods businesses see a product dropdown on each line item. Select a product to auto-fill the description and unit price.</p>`,
      },
      {
        id: 'mobile-pos',
        title: 'Using Point of Sale on mobile',
        summary: 'Make quick in-person sales using the mobile POS (Goods businesses).',
        category: 'mobile',
        tags: ['mobile', 'pos', 'point of sale', 'cart', 'sale', 'checkout', 'goods'],
        content: `
<h3>Accessing POS</h3>
<p><em>Available for Goods businesses only.</em></p>
<ul>
  <li>Tap <strong>More</strong> &gt; <strong>Point of Sale</strong>, or</li>
  <li>Tap the <strong>+</strong> button &gt; <strong>New POS Sale</strong>, or</li>
  <li>From the Dashboard, tap the <strong>POS Sale</strong> quick action.</li>
</ul>

<h3>Making a Sale</h3>
<ol>
  <li><strong>Search products</strong> — Use the search bar to find by name, SKU, or barcode.</li>
  <li><strong>Add to cart</strong> — Tap a product to add it. A badge shows the quantity in your cart.</li>
  <li><strong>Review cart</strong> — Tap the cart summary bar or the cart icon to open the checkout sheet.</li>
  <li><strong>Adjust quantities</strong> — Use +/- buttons in the checkout sheet. Remove items with the trash icon.</li>
  <li><strong>Add customer info</strong> (optional) — Enter customer name and phone number.</li>
  <li><strong>Complete sale</strong> — Tap the button to create the order.</li>
</ol>

<h3>Cart Details</h3>
<ul>
  <li><strong>Subtotal</strong> — Sum of all items before tax.</li>
  <li><strong>VAT</strong> — Automatically calculated for taxable products.</li>
  <li><strong>Total</strong> — Final amount including tax.</li>
</ul>

<h3>After the Sale</h3>
<p>The sale creates an order with source <strong>POS</strong>. You can view it in the Orders page. Stock is deducted automatically.</p>

<h3>Tips</h3>
<ul>
  <li>Out-of-stock products are greyed out and cannot be added to the cart.</li>
  <li>You cannot add more than the available stock quantity.</li>
  <li>The product grid shows available stock for each product.</li>
</ul>`,
      },
      {
        id: 'mobile-orders',
        title: 'Managing orders on mobile',
        summary: 'View, filter, and process customer orders from your phone (Goods businesses).',
        category: 'mobile',
        tags: ['mobile', 'orders', 'store', 'fulfillment', 'status', 'goods'],
        content: `
<h3>Accessing Orders</h3>
<p><em>Available for Goods businesses only.</em></p>
<ol>
  <li>Tap <strong>More</strong> in the bottom tab bar.</li>
  <li>Tap <strong>Orders</strong>.</li>
</ol>

<h3>Order List</h3>
<p>The order list shows each order's:</p>
<ul>
  <li>Order number</li>
  <li>Status badge (Pending, Confirmed, Processing, Ready, Completed, Cancelled)</li>
  <li>Source badge (POS, Storefront, WhatsApp, Manual)</li>
  <li>Payment status (Unpaid, Partial, Paid, Refunded)</li>
  <li>Customer name and order total</li>
  <li>Item summary</li>
</ul>
<p>Filter orders by status using the chips at the top.</p>

<h3>Order Details</h3>
<p>Tap any order to see:</p>
<ul>
  <li>Full status, source, and payment information</li>
  <li>Customer contact details (tap to call or email)</li>
  <li>Itemized list with quantities and prices</li>
  <li>Subtotal, tax, discounts, delivery fee, and total</li>
  <li>Any notes or cancellation reason</li>
</ul>

<h3>Processing Orders</h3>
<p>Each order status has a next action button:</p>
<table>
  <tr><th>Current Status</th><th>Action Button</th></tr>
  <tr><td>Pending</td><td>Confirm Order</td></tr>
  <tr><td>Confirmed</td><td>Mark Processing</td></tr>
  <tr><td>Processing</td><td>Mark Ready</td></tr>
  <tr><td>Ready</td><td>Complete Order</td></tr>
</table>
<p>You can also <strong>Cancel</strong> any non-completed order with an optional reason.</p>`,
      },
      {
        id: 'mobile-inventory',
        title: 'Tracking inventory on mobile',
        summary: 'View stock movements and record inventory changes from your phone (Goods businesses).',
        category: 'mobile',
        tags: ['mobile', 'inventory', 'stock', 'movement', 'purchase', 'sale', 'goods'],
        content: `
<h3>Accessing Inventory</h3>
<p><em>Available for Goods businesses only.</em></p>
<ol>
  <li>Tap <strong>More</strong> in the bottom tab bar.</li>
  <li>Tap <strong>Inventory</strong>.</li>
</ol>

<h3>Stock Movement History</h3>
<p>The Inventory page shows all stock movements across your products:</p>
<ul>
  <li><strong>Product name</strong> and movement type badge</li>
  <li><strong>Quantity change</strong> — Green (+) for incoming, red (-) for outgoing</li>
  <li><strong>Balance after</strong> — Running stock balance after the movement</li>
  <li><strong>Date</strong> and any notes</li>
</ul>
<p>Filter by: All, Purchases, Sales, Adjustments, or Returns.</p>

<h3>Summary Cards</h3>
<p>At the top, you'll see:</p>
<ul>
  <li><strong>Purchases</strong> — Total purchase movements.</li>
  <li><strong>Sales</strong> — Total sale movements.</li>
  <li><strong>Total</strong> — All movements combined.</li>
</ul>

<h3>Recording a Stock Movement</h3>
<ol>
  <li>Tap the <strong>+</strong> icon in the Inventory header.</li>
  <li>Select a product from the dropdown.</li>
  <li>Choose the movement type: Purchase, Sale, Adjustment (In/Out), Return, or Damaged.</li>
  <li>Enter the quantity and optional unit price.</li>
  <li>Add notes if needed.</li>
  <li>Tap <strong>Record</strong>.</li>
</ol>

<h3>Movement Types</h3>
<table>
  <tr><th>Type</th><th>Direction</th><th>Description</th></tr>
  <tr><td>Purchase</td><td>In (+)</td><td>Stock received from a supplier</td></tr>
  <tr><td>Sale</td><td>Out (-)</td><td>Stock sold to a customer</td></tr>
  <tr><td>Adjustment In</td><td>In (+)</td><td>Correction after physical count</td></tr>
  <tr><td>Adjustment Out</td><td>Out (-)</td><td>Correction after physical count</td></tr>
  <tr><td>Customer Return</td><td>In (+)</td><td>Stock returned by a customer</td></tr>
  <tr><td>Supplier Return</td><td>Out (-)</td><td>Stock returned to a supplier</td></tr>
  <tr><td>Damaged</td><td>Out (-)</td><td>Damaged or expired stock written off</td></tr>
  <tr><td>Initial</td><td>In (+)</td><td>Opening stock when first setting up</td></tr>
</table>

<h3>Product-Specific History</h3>
<p>From a product's detail page, tap <strong>View Stock History</strong> to see only that product's movements.</p>`,
      },
    ],
  },

  // =========================================================================
  // TROUBLESHOOTING
  // =========================================================================
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Solutions to common issues and frequently asked questions.',
    icon: 'Help',
    articles: [
      {
        id: 'login-issues',
        title: 'Login and account issues',
        summary: 'Can\'t log in, verification email missing, or password reset.',
        category: 'troubleshooting',
        tags: ['login', 'password', 'verification', 'email', 'locked', 'reset'],
        content: `
<h3>Can't log in?</h3>
<ul>
  <li>Check that you're using the correct email and password.</li>
  <li>Click <strong>Forgot Password</strong> on the login page to reset.</li>
  <li>Make sure you've verified your email (check spam folder for the link).</li>
</ul>

<h3>Verification email not received?</h3>
<ul>
  <li>Check spam/junk folders.</li>
  <li>Click <strong>Resend Verification Email</strong> on the login page.</li>
  <li>Ensure you entered the correct email during registration.</li>
</ul>

<h3>How to change your password</h3>
<p>Go to <strong>Settings &gt; Account</strong> and click <strong>Change Password</strong>.</p>`,
      },
      {
        id: 'invoice-issues',
        title: 'Invoice sending issues',
        summary: 'Client didn\'t receive invoice, or having trouble sending.',
        category: 'troubleshooting',
        tags: ['invoice', 'send', 'email', 'failed', 'client', 'spam'],
        content: `
<h3>Client didn't receive the invoice email?</h3>
<ul>
  <li>Verify the client's email address is correct in their profile.</li>
  <li>Ask them to check their spam/junk folder.</li>
  <li>Use <strong>Resend Invoice</strong> to try again.</li>
  <li>As an alternative, use <strong>Share via WhatsApp</strong>.</li>
</ul>

<h3>Sending limit reached?</h3>
<p>Free plan users have daily sending limits (3 sends/day). Upgrade to Premium for unlimited sends.</p>`,
      },
      {
        id: 'bank-sync-issues',
        title: 'Bank connection issues',
        summary: 'Transactions not syncing or bank connection failed.',
        category: 'troubleshooting',
        tags: ['bank', 'sync', 'connection', 'mono', 'failed', 'transactions'],
        content: `
<h3>Transactions not syncing?</h3>
<ul>
  <li>Bank sync runs daily. Wait 24 hours for new transactions.</li>
  <li>Try a manual sync from the Transactions page.</li>
  <li>If issues persist, disconnect and reconnect your bank account in Settings.</li>
</ul>

<h3>Bank connection failed?</h3>
<ul>
  <li>Ensure your banking credentials are correct.</li>
  <li>Some banks require OTP verification — check your phone for a code.</li>
  <li>Try again later if your bank's systems are temporarily unavailable.</li>
</ul>`,
      },
      {
        id: 'general-faq',
        title: 'Frequently Asked Questions',
        summary: 'Answers to the most common questions about Accurify.',
        category: 'troubleshooting',
        tags: ['faq', 'currency', 'security', 'export', 'data', 'support'],
        content: `
<h3>What currencies does Accurify support?</h3>
<p>Currently Nigerian Naira (NGN).</p>

<h3>Is my data secure?</h3>
<p>Yes. Accurify uses industry-standard encryption, secure authentication (httpOnly cookies), and enterprise-grade infrastructure. Data is encrypted at rest and in transit.</p>

<h3>Can I export my data?</h3>
<p>Yes. Financial statements export as PDF. Invoices and receipts can be downloaded as PDFs.</p>

<h3>Can multiple people access my business?</h3>
<p>Team access is available on Premium plans. You can also hire an accountant through the marketplace who gets controlled access to your books.</p>

<h3>How do I contact support?</h3>
<p>Email <strong>support@accurify.co</strong> or use the Help icon in the app header.</p>`,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// SEARCH HELPERS
// ---------------------------------------------------------------------------

/** Flatten all articles from all categories into a single array. */
export function getAllArticles(): HelpArticle[] {
  return helpCategories.flatMap((cat) => cat.articles);
}

/** Search articles by query string (matches title, summary, tags, and content). */
export function searchArticles(query: string): HelpArticle[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);

  return getAllArticles()
    .map((article) => {
      const haystack = [
        article.title,
        article.summary,
        article.tags.join(' '),
        article.content.replace(/<[^>]+>/g, ''), // strip HTML
      ]
        .join(' ')
        .toLowerCase();

      // Score: how many search words match
      const score = words.filter((w) => haystack.includes(w)).length;
      return { article, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ article }) => article);
}

/** Find an article by its ID. */
export function getArticleById(id: string): HelpArticle | undefined {
  return getAllArticles().find((a) => a.id === id);
}

/** Find a category by its ID. */
export function getCategoryById(id: string): HelpCategory | undefined {
  return helpCategories.find((c) => c.id === id);
}
