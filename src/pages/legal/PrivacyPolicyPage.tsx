import { Link, useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function PrivacyPolicyPage() {
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
          <span className="text-heading-02 text-gray-100">Privacy Policy</span>
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
          <p className="text-helper-01 text-gray-50 mt-1">
            Accurify Ltd, a subsidiary of Fortbridge Technologies Ltd.
          </p>
        </div>

        <div className="space-y-6 text-body-01 text-gray-80 leading-relaxed">
          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">1. Introduction</h2>
            <p>
              Accurify Ltd (&ldquo;Accurify&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) respects your privacy
              and is committed to protecting your personal data. This Privacy Policy outlines our
              practices regarding the collection, use, and disclosure of information when you use our
              website (accurify.africa), mobile applications, and services (collectively,
              the &ldquo;Platform&rdquo;), in compliance with the <strong>Nigeria Data Protection Regulation (NDPR)</strong>{' '}
              and aligned with the <strong>General Data Protection Regulation (GDPR)</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">2. The Data We Collect</h2>
            <p className="mb-2">We collect data to function as your Financial Operating System.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Identity Data:</strong> First name, last name, BVN (Bank Verification Number),
                CAC Registration Number, Government ID (for KYC compliance).
              </li>
              <li>
                <strong>Contact Data:</strong> Billing address, email address, telephone numbers.
              </li>
              <li>
                <strong>Financial Transaction Data:</strong> Invoices generated, expense receipts
                uploaded, bank statement history, tax identification numbers (TIN), and payroll records.
              </li>
              <li>
                <strong>Technical Data:</strong> Internet Protocol (IP) address, browser type and
                version, time zone setting, browser plug-in types, operating system, and platform.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you use our website, products, and
                services (e.g., features accessed, session duration).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">3. Lawful Basis for Processing</h2>
            <p className="mb-2">We process your data under the following legal bases:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Performance of Contract:</strong> To provide the core ledger, invoicing, and
                inventory services you subscribed to.
              </li>
              <li>
                <strong>Legal Obligation:</strong> To comply with FIRS (Federal Inland Revenue Service)
                tax record-keeping laws and CBN (Central Bank of Nigeria) anti-money laundering
                regulations.
              </li>
              <li>
                <strong>Legitimate Interest:</strong> To improve our AI algorithms (anonymized data
                only), prevent fraud, and ensure network security.
              </li>
              <li>
                <strong>Consent:</strong> Specifically for sharing your data with Third-Party Lenders
                via the &ldquo;Health Passport&rdquo; feature. You may withdraw this consent at any time.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">4. How We Share Your Data</h2>
            <p className="mb-2">We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Service Providers (Processors):</strong> Trusted third parties who assist in
                operating our platform, such as <strong>Paystack</strong> (Payments),{' '}
                <strong>AWS</strong> (Cloud Hosting), and <strong>WhatsApp/Meta</strong> (Communication
                API). These providers are contractually bound to protect your data.
              </li>
              <li>
                <strong>Professional Partners:</strong> Chartered Accountants sourced via the Accurify
                Marketplace. These professionals are bound by strict Data Processing Agreements (DPAs).
              </li>
              <li>
                <strong>Legal Authorities:</strong> When required by law (e.g., a court order or FIRS
                audit request).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">5. International Data Transfers</h2>
            <p>
              Your data may be stored or processed on servers located outside Nigeria (e.g., AWS
              regions in Europe or US). We ensure such transfers comply with NDPR/GDPR by using{' '}
              <strong>Standard Contractual Clauses (SCCs)</strong> or ensuring the destination country
              has adequate data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">6. Data Security</h2>
            <p className="mb-2">We implement banking-grade security measures:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Encryption:</strong> Data is encrypted in transit (TLS 1.2+) and at rest
                (AES-256).
              </li>
              <li>
                <strong>Access Control:</strong> Strict role-based access control (RBAC) and HttpOnly
                cookie authentication.
              </li>
              <li>
                <strong>Audit Logs:</strong> We maintain logs of all access to sensitive financial
                records.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">7. Your Legal Rights</h2>
            <p className="mb-2">Under NDPR/GDPR, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Access:</strong> Request a copy of the personal data we hold about you.
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate data.
              </li>
              <li>
                <strong>Erasure (Right to be Forgotten):</strong> Request deletion of your data,{' '}
                <em>subject to our legal obligation to retain tax records for 6-7 years</em>.
              </li>
              <li>
                <strong>Portability:</strong> Request transfer of your data to another service
                provider.
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Withdraw consent for marketing or optional data
                sharing.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">8. Contact Us</h2>
            <p>
              <strong>Data Protection Officer (DPO)</strong>
              <br />
              Email:{' '}
              <a href="mailto:privacy@accurify.africa" className="text-primary underline">
                privacy@accurify.africa
              </a>
              <br />
              Address: Lagos, Nigeria
            </p>
          </section>

          <section>
            <h2 className="text-heading-02 text-gray-100 mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &ldquo;Effective Date&rdquo; above.
              Your continued use of the Platform after such changes constitutes your acceptance of the
              updated policy.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-20">
          <p className="text-body-01 text-gray-50">
            See also:{' '}
            <Link to="/terms" className="text-primary underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
