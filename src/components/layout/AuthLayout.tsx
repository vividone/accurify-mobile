import accurifyLogo from '@/assets/accurify-logo.svg';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-8">
          <img src={accurifyLogo} alt="Accurify" className="h-7 w-auto" />
        </div>
        <h1 className="text-heading-04 text-gray-100">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-body-02 text-gray-60">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8">{children}</div>
    </div>
  );
}
