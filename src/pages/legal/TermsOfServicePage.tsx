import { Link, useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function TermsOfServicePage() {
  const navigate = useNavigate();

  const handleClose = () => {
    if (window.history.length <= 2) {
      window.close();
      navigate('/login');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-20">
        <div className="flex items-center justify-between px-4 h-14">
          <span className="text-heading-02 text-gray-100">Terms of Service</span>
          <button onClick={handleClose} className="p-2 -mr-2 text-gray-60">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 pb-12">
        <div className="mb-6">
          <p className="text-helper-01 text-gray-50">
            <strong>Version:</strong> 1.0 &middot; <strong>Effective:</strong> February 1, 2026
          </p>
        </div>

        <div className="space-y-6 text-body-01 text-gray-80 leading-relaxed">
          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Accurify Platform, you agree to be bound by these Terms. If you
              do not agree, do not use our Services. These Terms constitute a binding legal agreement
              between you and Accurify Ltd.
            </p>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">2. Description of Service</h2>
            <p className="mb-2">
              Accurify is a financial management platform providing bookkeeping, invoicing, inventory
              management, and tax compliance tools.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Not a Bank:</strong> We are a technology provider, not a bank. Payment
                processing is handled by licensed partners (e.g., Paystack).
              </li>
              <li>
                <strong>Not a Tax Advisor:</strong> While we provide tools for tax compliance, Accurify
                does not provide legal tax advice. Users are responsible for their own tax filings
                unless they subscribe to the "Expert Retainer" service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">3. User Obligations</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Accuracy:</strong> You agree that all financial data (sales, expenses,
                inventory) entered into the system is accurate and truthful. Accurify is not liable for
                tax penalties resulting from false or incomplete data entry.
              </li>
              <li>
                <strong>Account Security:</strong> You are responsible for safeguarding your password
                and 2FA credentials. You agree to notify us immediately of any unauthorized use of your
                account.
              </li>
              <li>
                <strong>Prohibited Use:</strong> You may not use the Platform to process transactions
                for illegal goods, money laundering, or prohibited substances.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">4. Subscription & Payments</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Billing:</strong> Fees are billed in advance on a monthly or annual basis.
              </li>
              <li>
                <strong>Automatic Renewal:</strong> Subscriptions auto-renew unless cancelled at least
                24 hours before the billing cycle ends.
              </li>
              <li>
                <strong>Non-Payment:</strong> Failure to pay subscription fees may result in suspension
                of access to "Write" features (Invoicing/Inventory), though "Read" access to historical
                data will be maintained for 30 days.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">5. Intellectual Property</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Our IP:</strong> Accurify, its code, logo, and AI algorithms remain the
                exclusive property of Accurify Ltd and its parent, Fortbridge Technologies Ltd.
              </li>
              <li>
                <strong>Your Data:</strong> You retain ownership of your financial data. You grant us a
                license to process this data solely to provide the Service and improve our AI models
                (in anonymized aggregate form).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">6. Limitation of Liability</h2>
            <p className="text-xs uppercase leading-relaxed">
              To the maximum extent permitted by law, Accurify shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits or
              revenues. Our total liability for any claim arising out of these terms shall not exceed
              the amount paid by you to Accurify in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">7. Dispute Resolution & Governing Law</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Jurisdiction:</strong> These Terms are governed by the laws of the Federal
                Republic of Nigeria.
              </li>
              <li>
                <strong>Arbitration:</strong> Any dispute arising from these Terms shall be settled by
                binding arbitration in Lagos, Nigeria, in accordance with the Arbitration and
                Conciliation Act.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">8. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service immediately, without prior notice
              or liability, for any reason whatsoever, including without limitation if you breach these
              Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is
              material, we will provide at least 30 days&apos; notice prior to any new terms taking effect.
              What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@accurify.africa" className="text-primary underline">
                legal@accurify.africa
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-20">
          <p className="text-body-01 text-gray-50">
            See also:{' '}
            <Link to="/privacy" className="text-primary underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
