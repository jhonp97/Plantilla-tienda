/**
 * InvoicePreviewModal — Premium invoice preview modal.
 * Shows order data, QR code (via qrcode.react), Hacienda phrase,
 * download PDF and email buttons.
 */
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import styles from './InvoicePreviewModal.module.css';

interface InvoicePreviewModalProps {
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  date: string;
  amount: number;
  qrData?: string;
  pdfUrl?: string;
  onClose: () => void;
}

export function InvoicePreviewModal({
  invoiceNumber,
  orderNumber,
  customerName,
  date,
  amount,
  qrData = 'https://sede.aeat.gob.es/verifactu/verify/',
  pdfUrl,
  onClose,
}: InvoicePreviewModalProps) {
  const { t } = useTranslation();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value / 100);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{t('verifactu.previewInvoice')}</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label={t('verifactu.close')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Invoice Data */}
          <div className={styles.invoiceData}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>{t('verifactu.invoiceNumber')}</span>
              <span className={styles.dataValue}>{invoiceNumber}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>{t('verifactu.orderNumber')}</span>
              <span className={styles.dataValue}>{orderNumber}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>{t('verifactu.customerName')}</span>
              <span className={styles.dataValue}>{customerName}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>{t('verifactu.invoiceDate')}</span>
              <span className={styles.dataValue}>{new Date(date).toLocaleDateString('es-ES')}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>{t('verifactu.invoiceAmount')}</span>
              <span className={styles.dataValueTotal}>{formatCurrency(amount)}</span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className={styles.qrSection}>
            <div className={styles.qrContainer}>
              <QRCodeSVG
                value={qrData}
                size={140}
                level="M"
                includeMargin
              />
            </div>
            <p className={styles.haciendaPhrase}>
              {t('verifactu.haciendaPhrase')}
            </p>
            <p className={styles.qrHint}>
              {t('verifactu.qrHint')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.downloadButton}
            onClick={() => {
              if (pdfUrl) window.open(pdfUrl, '_blank');
            }}
            disabled={!pdfUrl}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t('verifactu.downloadPdf')}
          </button>
          <button className={styles.emailButton}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {t('verifactu.sendEmail')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoicePreviewModal;
