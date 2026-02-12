import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useBusinessStore } from '@/store/business.store';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useUIStore } from '@/store/ui.store';
import { businessApi } from '@/services/api/business.api';
import { authApi } from '@/services/api/auth.api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { NIGERIAN_BANKS } from '@/utils/constants';
import type { ChangePasswordRequest } from '@/types';
import {
  BuildingOffice2Icon,
  UserIcon,
  ComputerDesktopIcon,
  ArrowRightOnRectangleIcon,
  ArrowDownTrayIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PhotoIcon,
  LockClosedIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutAsync = useAuthStore((s) => s.logoutAsync);
  const business = useBusinessStore((s) => s.business);
  const setBusiness = useBusinessStore((s) => s.setBusiness);
  const showNotification = useUIStore((s) => s.showNotification);

  // Collapsible sections
  const [showBusiness, setShowBusiness] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Business form state
  const [businessForm, setBusinessForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    rcNumber: '',
    fiscalYearStartMonth: 1,
  });
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);

  // Logo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Invoice settings form state
  const [invoiceForm, setInvoiceForm] = useState({
    tin: '',
    invoiceBankName: '',
    invoiceAccountNumber: '',
    invoiceAccountName: '',
  });
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);

  // PWA
  const { canInstall, isInstalled, install } = usePWAInstall();
  const webUrl = import.meta.env.VITE_WEB_APP_URL || 'https://app.accurify.co';

  // Initialize forms from business data
  useEffect(() => {
    if (business) {
      setBusinessForm({
        name: business.name,
        phone: business.phone,
        email: business.email || '',
        address: business.address,
        rcNumber: business.rcNumber || '',
        fiscalYearStartMonth: business.fiscalYearStartMonth || 1,
      });
      setInvoiceForm({
        tin: business.tin || '',
        invoiceBankName: business.invoiceBankName || '',
        invoiceAccountNumber: business.invoiceAccountNumber || '',
        invoiceAccountName: business.invoiceAccountName || '',
      });
    }
  }, [business]);

  const handleLogout = async () => {
    await logoutAsync();
    navigate('/login', { replace: true });
  };

  const handleBusinessSave = async () => {
    if (!business || !businessForm.name || !businessForm.phone || !businessForm.address) return;
    setIsSavingBusiness(true);
    try {
      const updated = await businessApi.update({
        name: businessForm.name,
        type: business.type,
        address: businessForm.address,
        phone: businessForm.phone,
        email: businessForm.email,
        rcNumber: businessForm.rcNumber,
        fiscalYearStartMonth: businessForm.fiscalYearStartMonth,
        tin: business.tin,
        invoiceBankName: business.invoiceBankName,
        invoiceAccountNumber: business.invoiceAccountNumber,
        invoiceAccountName: business.invoiceAccountName,
      });
      setBusiness(updated);
      showNotification('Success', 'Business settings updated', 'success');
    } catch {
      showNotification('Error', 'Failed to update business settings', 'error');
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleInvoiceSave = async () => {
    if (!business) return;
    setIsSavingInvoice(true);
    try {
      const updated = await businessApi.update({
        name: business.name,
        type: business.type,
        address: business.address,
        phone: business.phone,
        email: business.email,
        rcNumber: business.rcNumber,
        fiscalYearStartMonth: business.fiscalYearStartMonth,
        tin: invoiceForm.tin,
        invoiceBankName: invoiceForm.invoiceBankName,
        invoiceAccountNumber: invoiceForm.invoiceAccountNumber,
        invoiceAccountName: invoiceForm.invoiceAccountName,
      });
      setBusiness(updated);
      showNotification('Success', 'Invoice settings updated', 'success');
    } catch {
      showNotification('Error', 'Failed to update invoice settings', 'error');
    } finally {
      setIsSavingInvoice(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== confirmPassword) {
      showNotification('Error', 'Passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showNotification('Error', 'Password must be at least 8 characters', 'error');
      return;
    }

    setIsSavingPassword(true);
    try {
      await authApi.changePassword(passwordForm);
      showNotification('Success', 'Password changed successfully', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
      setShowPassword(false);
    } catch {
      showNotification('Error', 'Failed to change password. Check your current password.', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Error', 'Please upload an image file (PNG, JPG)', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showNotification('Error', 'Image must be less than 2MB', 'error');
      return;
    }

    setIsUploadingLogo(true);
    try {
      await businessApi.uploadLogo(file);
      const updated = await businessApi.get();
      setBusiness(updated);
      showNotification('Success', 'Logo uploaded successfully', 'success');
    } catch {
      showNotification('Error', 'Failed to upload logo', 'error');
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const inputClass = 'w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <>
      <PageHeader title="Settings" backTo="/app/dashboard" />
      <div className="page-content space-y-4">
        {/* Business info card with logo */}
        {business && (
          <Card>
            <div className="flex items-center gap-3">
              {business.logoUrl ? (
                <div className="w-12 h-12 rounded-lg border border-gray-20 overflow-hidden flex-shrink-0 bg-gray-10 flex items-center justify-center">
                  <img src={business.logoUrl} alt="" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BuildingOffice2Icon className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-body-01 font-medium text-gray-100">
                  {business.name}
                </p>
                <p className="text-label-01 text-gray-50 truncate">
                  {business.email || business.phone || 'Business'}
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="p-2 text-gray-50 active:bg-gray-10 rounded-full"
              >
                <PhotoIcon className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            {isUploadingLogo && (
              <p className="text-helper-01 text-primary mt-2">Uploading logo...</p>
            )}
          </Card>
        )}

        {/* Account */}
        <Card padding={false}>
          <div className="px-4 py-3 border-b border-gray-10">
            <p className="text-label-01 text-gray-50 font-medium">Account</p>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-gray-50" />
              <div className="flex-1">
                <p className="text-body-01 text-gray-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-label-01 text-gray-50">{user?.email}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Change Password - Collapsible */}
        <Card padding={false}>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center gap-3 w-full px-4 py-3"
          >
            <LockClosedIcon className="w-5 h-5 text-gray-50" />
            <span className="flex-1 text-body-01 text-gray-100 text-left">
              Change Password
            </span>
            <ChevronDownIcon className={`w-4 h-4 text-gray-40 transition-transform ${showPassword ? 'rotate-180' : ''}`} />
          </button>
          {showPassword && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-10 pt-3">
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className={inputClass}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className={inputClass}
                  placeholder="Min. 8 characters"
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Re-enter new password"
                />
                {confirmPassword && confirmPassword !== passwordForm.newPassword && (
                  <p className="mt-1 text-helper-01 text-danger">Passwords do not match</p>
                )}
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={isSavingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !confirmPassword}
                className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
              >
                {isSavingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          )}
        </Card>

        {/* Business Settings - Collapsible */}
        <Card padding={false}>
          <button
            onClick={() => setShowBusiness(!showBusiness)}
            className="flex items-center gap-3 w-full px-4 py-3"
          >
            <BuildingOffice2Icon className="w-5 h-5 text-gray-50" />
            <span className="flex-1 text-body-01 text-gray-100 text-left">
              Business Settings
            </span>
            <ChevronDownIcon className={`w-4 h-4 text-gray-40 transition-transform ${showBusiness ? 'rotate-180' : ''}`} />
          </button>
          {showBusiness && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-10 pt-3">
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Business Name</label>
                <input
                  value={businessForm.name}
                  onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">RC Number (Optional)</label>
                <input
                  value={businessForm.rcNumber}
                  onChange={(e) => setBusinessForm({ ...businessForm, rcNumber: e.target.value })}
                  className={inputClass}
                  placeholder="Company registration number"
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={businessForm.phone}
                  onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Business Email</label>
                <input
                  type="email"
                  value={businessForm.email}
                  onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Business Address</label>
                <input
                  value={businessForm.address}
                  onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Fiscal Year Start</label>
                <select
                  value={businessForm.fiscalYearStartMonth}
                  onChange={(e) => setBusinessForm({ ...businessForm, fiscalYearStartMonth: Number(e.target.value) })}
                  className={inputClass}
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleBusinessSave}
                disabled={isSavingBusiness || !businessForm.name || !businessForm.phone || !businessForm.address}
                className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
              >
                {isSavingBusiness ? 'Saving...' : 'Save Business Settings'}
              </button>
            </div>
          )}
        </Card>

        {/* Invoice Settings - Collapsible */}
        <Card padding={false}>
          <button
            onClick={() => setShowInvoice(!showInvoice)}
            className="flex items-center gap-3 w-full px-4 py-3"
          >
            <DocumentTextIcon className="w-5 h-5 text-gray-50" />
            <div className="flex-1 text-left">
              <span className="text-body-01 text-gray-100">Invoice Settings</span>
              <p className="text-helper-01 text-gray-40">Bank details shown on your invoices</p>
            </div>
            <ChevronDownIcon className={`w-4 h-4 text-gray-40 transition-transform ${showInvoice ? 'rotate-180' : ''}`} />
          </button>
          {showInvoice && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-10 pt-3">
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Tax ID (TIN)</label>
                <input
                  value={invoiceForm.tin}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, tin: e.target.value })}
                  className={inputClass}
                  placeholder="Tax Identification Number"
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Bank Name</label>
                <select
                  value={invoiceForm.invoiceBankName}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceBankName: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select a bank</option>
                  {NIGERIAN_BANKS.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Account Number</label>
                <input
                  value={invoiceForm.invoiceAccountNumber}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceAccountNumber: e.target.value })}
                  className={inputClass}
                  placeholder="Bank account number"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Account Name</label>
                <input
                  value={invoiceForm.invoiceAccountName}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceAccountName: e.target.value })}
                  className={inputClass}
                  placeholder="Name on bank account"
                />
              </div>
              <button
                onClick={handleInvoiceSave}
                disabled={isSavingInvoice}
                className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
              >
                {isSavingInvoice ? 'Saving...' : 'Save Invoice Settings'}
              </button>
            </div>
          )}
        </Card>

        {/* Help Center & Desktop Version */}
        <Card padding={false}>
          <div className="divide-y divide-gray-10">
            <button
              onClick={() => navigate('/app/help')}
              className="flex items-center gap-3 px-4 py-3 w-full"
            >
              <QuestionMarkCircleIcon className="w-5 h-5 text-gray-50" />
              <span className="flex-1 text-body-01 text-gray-100 text-left">
                Help Center
              </span>
              <ChevronRightIcon className="w-4 h-4 text-gray-40" />
            </button>
            <a
              href={webUrl}
              className="flex items-center gap-3 px-4 py-3"
            >
              <ComputerDesktopIcon className="w-5 h-5 text-gray-50" />
              <span className="flex-1 text-body-01 text-gray-100">
                View Desktop Version
              </span>
              <ChevronRightIcon className="w-4 h-4 text-gray-40" />
            </a>
          </div>
        </Card>

        {/* Install App */}
        {canInstall && !isInstalled && (
          <Card padding={false}>
            <button
              onClick={install}
              className="flex items-center gap-3 px-4 py-3 w-full"
            >
              <ArrowDownTrayIcon className="w-5 h-5 text-primary" />
              <span className="flex-1 text-body-01 text-gray-100 text-left">
                Install App
              </span>
              <ChevronRightIcon className="w-4 h-4 text-gray-40" />
            </button>
          </Card>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 bg-white rounded-lg shadow-card active:bg-danger-light transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-danger" />
          <span className="text-body-01 text-danger font-medium">
            Sign Out
          </span>
        </button>

        {/* App info */}
        <p className="text-center text-helper-01 text-gray-40 pt-4">
          Accurify Mobile v0.1.0
        </p>
      </div>
    </>
  );
}
