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
import { BillListPage } from '@/pages/bills/BillListPage';
import { BillCreatePage } from '@/pages/bills/BillCreatePage';
import { BillDetailPage } from '@/pages/bills/BillDetailPage';
import { ClientListPage } from '@/pages/clients/ClientListPage';
import { ClientDetailPage } from '@/pages/clients/ClientDetailPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
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
      { path: 'bills', element: <BillListPage /> },
      { path: 'bills/new', element: <BillCreatePage /> },
      { path: 'bills/:id', element: <BillDetailPage /> },
      { path: 'clients', element: <ClientListPage /> },
      { path: 'clients/:id', element: <ClientDetailPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },

  // Root redirect
  { path: '/', element: <Navigate to="/app/dashboard" replace /> },
  { path: '*', element: <Navigate to="/app/dashboard" replace /> },
]);
