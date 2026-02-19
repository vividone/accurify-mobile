import { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInvoice, useInvoicePdf } from '@/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { ArrowDownTrayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export function InvoicePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: invoice } = useInvoice(id!);
  const { data: pdfBlob, isLoading, isError } = useInvoicePdf(id!, true);

  const blobUrl = useMemo(() => {
    if (!pdfBlob) return null;
    return URL.createObjectURL(pdfBlob);
  }, [pdfBlob]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const title = invoice?.invoiceNumber
    ? `Preview — ${invoice.invoiceNumber}`
    : 'Preview Invoice';

  const handleDownload = () => {
    if (!blobUrl || !invoice) return;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    if (!blobUrl) return;
    window.open(blobUrl, '_blank');
  };

  return (
    <>
      <PageHeader title={title} backTo={`/app/invoices/${id}`} />
      <div className="px-4 pb-4">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-body-01 text-gray-50">Loading PDF...</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <p className="text-body-01 text-gray-70 mb-2">
                Failed to load PDF preview.
              </p>
              <p className="text-helper-01 text-gray-50">
                Please try again later.
              </p>
            </div>
          </div>
        )}

        {blobUrl && (
          <div className="space-y-4">
            {/* PDF viewer */}
            <iframe
              src={blobUrl}
              className="w-full border-0 rounded-lg bg-white"
              style={{ height: '70vh' }}
              title="Invoice PDF Preview"
            />

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 h-12 bg-primary text-white font-medium text-body-01 rounded-lg"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Download PDF
              </button>
              <button
                onClick={handleOpenNewTab}
                className="flex items-center justify-center gap-2 h-12 px-4 border border-gray-30 text-gray-70 font-medium text-body-01 rounded-lg"
              >
                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
