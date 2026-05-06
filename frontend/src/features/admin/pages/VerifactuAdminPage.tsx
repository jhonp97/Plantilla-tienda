/**
 * VerifactuAdminPage — Verifactu invoice management page.
 * Lists invoices with StatusPill statuses, QR preview, rectificative button.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusPill } from '../../../components/StatusPill';
import { formatPrice } from '../../../utils';
import { InvoicePreviewModal } from '../components/InvoicePreviewModal';
import styles from './VerifactuAdminPage.module.css';

interface VerifactuInvoice {
  id: string;
  orderId: string;
  orderNumber: string;
  invoiceNumber: string;
  status: 'PENDING' | 'CORRECT' | 'ACCEPTED_WITH_ERRORS' | 'CANCELLED';
  date: string;
  amount: number;
  customerName: string;
  qrData?: string;
  pdfUrl?: string;
}

const MOCK_INVOICES: VerifactuInvoice[] = [
  { id: 'inv-1', orderId: 'ord-1', orderNumber: 'ORD-001', invoiceNumber: 'FAC-2026-001', status: 'CORRECT', date: '2026-04-01', amount: 12500, customerName: 'Juan Pérez', qrData: 'https://sede.aeat.gob.es/verifactu/verify/FAC-2026-001', pdfUrl: '#' },
  { id: 'inv-2', orderId: 'ord-2', orderNumber: 'ORD-002', invoiceNumber: 'FAC-2026-002', status: 'PENDING', date: '2026-04-03', amount: 8900, customerName: 'María García' },
  { id: 'inv-3', orderId: 'ord-3', orderNumber: 'ORD-003', invoiceNumber: 'FAC-2026-003', status: 'ACCEPTED_WITH_ERRORS', date: '2026-04-05', amount: 23400, customerName: 'Carlos López' },
  { id: 'inv-4', orderId: 'ord-4', orderNumber: 'ORD-004', invoiceNumber: 'FAC-2026-004', status: 'CORRECT', date: '2026-04-07', amount: 5600, customerName: 'Ana Martínez' },
  { id: 'inv-5', orderId: 'ord-5', orderNumber: 'ORD-005', invoiceNumber: 'FAC-2026-005', status: 'CANCELLED', date: '2026-04-08', amount: 18200, customerName: 'Pedro Sánchez' },
];

const STATUS_MAP: Record<string, 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'SHIPPED'> = {
  PENDING: 'PENDING',
  CORRECT: 'COMPLETED',
  ACCEPTED_WITH_ERRORS: 'PROCESSING',
  CANCELLED: 'CANCELLED',
};

export default function VerifactuAdminPage() {
  const { t } = useTranslation();

  const STATUS_LABELS: Record<string, string> = {
    PENDING: t('verifactu.statusPending'),
    CORRECT: t('verifactu.statusCorrect'),
    ACCEPTED_WITH_ERRORS: t('verifactu.statusAcceptedErrors'),
    CANCELLED: t('verifactu.statusCancelled'),
  };

  const [invoices] = useState<VerifactuInvoice[]>(MOCK_INVOICES);
  const [previewInvoice, setPreviewInvoice] = useState<VerifactuInvoice | null>(null);
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; invoice: VerifactuInvoice | null }>({ isOpen: false, invoice: null });
  const [isCancelling, setIsCancelling] = useState(false);

  const handlePreview = (invoice: VerifactuInvoice) => {
    setPreviewInvoice(invoice);
  };

  const handleRectificativa = (invoice: VerifactuInvoice) => {
    setCancelModal({ isOpen: true, invoice });
  };

  const handleConfirmRectificativa = async () => {
    if (!cancelModal.invoice) return;
    setIsCancelling(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsCancelling(false);
    setCancelModal({ isOpen: false, invoice: null });
  };

  const handleCancelRectificativa = () => {
    setCancelModal({ isOpen: false, invoice: null });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('verifactu.title')}</h1>
          <p className={styles.pageSubtitle}>{t('verifactu.subtitle')}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{invoices.length}</span>
          <span className={styles.summaryLabel}>{t('verifactu.totalInvoices')}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{invoices.filter(i => i.status === 'CORRECT').length}</span>
          <span className={styles.summaryLabel}>{t('verifactu.correct')}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{invoices.filter(i => i.status === 'PENDING' || i.status === 'ACCEPTED_WITH_ERRORS').length}</span>
          <span className={styles.summaryLabel}>{t('verifactu.pendingErrors')}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{invoices.filter(i => i.status === 'CANCELLED').length}</span>
          <span className={styles.summaryLabel}>{t('verifactu.cancelled')}</span>
        </div>
      </div>

      {/* Invoice Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th scope="col" className={styles.tableHeaderCell}>{t('verifactu.tableInvoice')}</th>
                <th scope="col" className={styles.tableHeaderCell}>{t('verifactu.tableOrder')}</th>
                <th scope="col" className={styles.tableHeaderCell}>{t('verifactu.tableCustomer')}</th>
                <th scope="col" className={styles.tableHeaderCell}>{t('verifactu.tableStatus')}</th>
                <th scope="col" className={styles.tableHeaderCell}>{t('verifactu.tableDate')}</th>
                <th scope="col" className={styles.tableHeaderCell}>{t('verifactu.tableAmount')}</th>
                <th scope="col" className={styles.tableHeaderCell}>{t('verifactu.tableActions')}</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {invoices.length === 0 ? (
                <tr><td colSpan={7} className={styles.emptyCell}>{t('verifactu.noInvoices')}</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <span className={styles.invoiceNumber}>{inv.invoiceNumber}</span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.orderNumberRef}>{inv.orderNumber}</span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.customerNameCell}>{inv.customerName}</span>
                    </td>
                    <td className={styles.tableCell}>
                      <StatusPill status={STATUS_MAP[inv.status] || 'PENDING'} label={STATUS_LABELS[inv.status]} />
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.dateCell}>{new Date(inv.date).toLocaleDateString('es-ES')}</span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.amountCell}>{formatPrice(inv.amount)}</span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionsCell}>
                        <button onClick={() => handlePreview(inv)} className={styles.actionButtonSecondary} title={t('verifactu.previewTitle')} type="button">
                          <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {inv.status !== 'CANCELLED' && (
                          <button onClick={() => handleRectificativa(inv)} className={styles.actionButtonDanger} title={t('verifactu.rectificativaTitle')} type="button">
                            <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {previewInvoice && (
        <InvoicePreviewModal
          invoiceNumber={previewInvoice.invoiceNumber}
          orderNumber={previewInvoice.orderNumber}
          customerName={previewInvoice.customerName}
          date={previewInvoice.date}
          amount={previewInvoice.amount}
          qrData={previewInvoice.qrData}
          pdfUrl={previewInvoice.pdfUrl}
          onClose={() => setPreviewInvoice(null)}
        />
      )}

      {/* Rectificativa Confirmation Modal */}
      {cancelModal.isOpen && cancelModal.invoice && (
        <div className={styles.modalOverlay} onClick={handleCancelRectificativa} role="dialog" aria-modal="true" aria-label={t('verifactu.rectificativaModalTitle')}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t('verifactu.rectificativaModalTitle')}</h3>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.warningIcon}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className={styles.modalMessage} dangerouslySetInnerHTML={{
                __html: t('verifactu.rectificativaWarning', {
                  invoiceNumber: cancelModal.invoice.invoiceNumber,
                  orderNumber: cancelModal.invoice.orderNumber,
                })
              }} />
              <p className={styles.modalMessage} dangerouslySetInnerHTML={{
                __html: t('verifactu.rectificativaCannotUndo')
              }} />
            </div>
            <div className={styles.modalFooter}>
              <button onClick={handleCancelRectificativa} disabled={isCancelling} className={styles.cancelButton} type="button">{t('verifactu.cancel')}</button>
              <button onClick={handleConfirmRectificativa} disabled={isCancelling} className={styles.rectificativaButton} type="button">
                {isCancelling ? t('verifactu.generating') : t('verifactu.generateRectificativa')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
