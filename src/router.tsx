import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingGuard } from '@/components/auth/OnboardingGuard';
import { MobileShell } from '@/components/layout/MobileShell';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// App pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { InvoiceListPage } from '@/pages/invoices/InvoiceListPage';
import { InvoiceCreatePage } from '@/pages/invoices/InvoiceCreatePage';
import { InvoiceDetailPage } from '@/pages/invoices/InvoiceDetailPage';
import { InvoiceEditPage } from '@/pages/invoices/InvoiceEditPage';
import { InvoicePreviewPage } from '@/pages/invoices/InvoicePreviewPage';
import { BillListPage } from '@/pages/bills/BillListPage';
import { BillCreatePage } from '@/pages/bills/BillCreatePage';
import { BillDetailPage } from '@/pages/bills/BillDetailPage';
import { ClientListPage } from '@/pages/clients/ClientListPage';
import { ClientDetailPage } from '@/pages/clients/ClientDetailPage';
import { ProductListPage } from '@/pages/products/ProductListPage';
import { ProductCreatePage } from '@/pages/products/ProductCreatePage';
import { ProductDetailPage } from '@/pages/products/ProductDetailPage';
import { POSPage } from '@/pages/pos/POSPage';
import { OrderListPage } from '@/pages/orders/OrderListPage';
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage';
import { StockPage } from '@/pages/stock/StockPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { HelpCenterPage } from '@/pages/help/HelpCenterPage';
import { HelpCategoryPage } from '@/pages/help/HelpCategoryPage';
import { HelpArticlePage } from '@/pages/help/HelpArticlePage';
import { TransactionsPage } from '@/pages/transactions/TransactionsPage';
import { TransactionCreatePage } from '@/pages/transactions/TransactionCreatePage';
import { IncomeStatementPage } from '@/pages/reports/IncomeStatementPage';
import { TaxOverviewPage } from '@/pages/tax/TaxOverviewPage';
import { PaymentSettingsPage } from '@/pages/settings/PaymentSettingsPage';
import { BillingPage } from '@/pages/settings/BillingPage';
import { ClientCreatePage } from '@/pages/clients/ClientCreatePage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';

export const router = createBrowserRouter([
  // Public auth routes
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  // Onboarding (protected but no business required)
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },

  // Protected app routes
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <MobileShell />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'invoices', element: <InvoiceListPage /> },
      { path: 'invoices/new', element: <InvoiceCreatePage /> },
      { path: 'invoices/:id', element: <InvoiceDetailPage /> },
      { path: 'invoices/:id/edit', element: <InvoiceEditPage /> },
      { path: 'invoices/:id/preview', element: <InvoicePreviewPage /> },
      { path: 'bills', element: <BillListPage /> },
      { path: 'bills/new', element: <BillCreatePage /> },
      { path: 'bills/:id', element: <BillDetailPage /> },
      { path: 'clients', element: <ClientListPage /> },
      { path: 'clients/new', element: <ClientCreatePage /> },
      { path: 'clients/:id', element: <ClientDetailPage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/new', element: <ProductCreatePage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'pos', element: <POSPage /> },
      { path: 'orders', element: <OrderListPage /> },
      { path: 'orders/:id', element: <OrderDetailPage /> },
      { path: 'stock', element: <StockPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'transactions/new', element: <TransactionCreatePage /> },
      { path: 'income-statement', element: <IncomeStatementPage /> },
      { path: 'tax-overview', element: <TaxOverviewPage /> },
      { path: 'payment-settings', element: <PaymentSettingsPage /> },
      { path: 'billing', element: <BillingPage /> },
      { path: 'help', element: <HelpCenterPage /> },
      { path: 'help/:categoryId', element: <HelpCategoryPage /> },
      { path: 'help/:categoryId/:articleId', element: <HelpArticlePage /> },
    ],
  },

  // Root redirect
  { path: '/', element: <Navigate to="/app/dashboard" replace /> },
  { path: '*', element: <Navigate to="/app/dashboard" replace /> },
]);
