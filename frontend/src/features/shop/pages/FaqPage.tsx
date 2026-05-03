/**
 * FaqPage - Accordion FAQ with CSS animations for expand/collapse
 */

import { useState } from 'react';
import { SEO } from '@components/SEO';
import styles from './FaqPage.module.css';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Cómo puedo realizar un pedido?',
    answer: 'Para realizar un pedido, simplemente navega por nuestro catálogo, agrega los productos que desees al carrito y sigue el proceso de compra. Necesitarás crear una cuenta o iniciar sesión para completar el pedido. Una vez realizado, recibirás un correo de confirmación con los detalles.',
  },
  {
    question: '¿Cuáles son los métodos de pago aceptados?',
    answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), PayPal y transferencia bancaria. Todos los pagos se procesan de forma segura a través de Stripe, garantizando la protección de tus datos financieros.',
  },
  {
    question: '¿Cuánto tarda el envío?',
    answer: 'Los plazos de entrega varían según tu ubicación. Para envíos nacionales (España peninsular), el tiempo estimado es de 2-4 días hábiles. Para Baleares, Canarias e internacional, puede ser de 5-10 días hábiles. Todos los envíos incluyen número de seguimiento.',
  },
  {
    question: '¿Cuál es la política de devoluciones?',
    answer: 'Aceptamos devoluciones dentro de los 14 días naturales posteriores a la recepción del pedido. Los productos deben estar en su estado original, sin usar y con el embalaje completo. Para iniciar una devolución, contacta con nuestro equipo de atención al cliente.',
  },
  {
    question: '¿Ofrecen factura con IVA?',
    answer: 'Sí, todas nuestras facturas incluyen el IVA correspondiente. Al realizar el pedido, puedes ingresar tu NIF/CIF y los datos fiscales, y te enviaremos la factura electrónica a tu correo electrónico una vez confirmado el pago.',
  },
  {
    question: '¿Cómo puedo contactar con soporte?',
    answer: 'Puedes contactarnos a través de nuestro formulario de contacto en la página /contact, enviando un email a info@tiendaonline.com, o llamando al +34 900 123 456 en horario de atención al cliente (Lun-Vie 9:00-18:00, Sáb 10:00-14:00).',
  },
];

function AccordionItem({ item, isOpen, onClick }: { item: FaqItem; isOpen: boolean; onClick: () => void }) {
  return (
    <div className={`${styles.accordionItem} ${isOpen ? styles.accordionItemOpen : ''}`}>
      <button
        className={styles.accordionTrigger}
        onClick={onClick}
        aria-expanded={isOpen}
        type="button"
      >
        <span className={styles.accordionQuestion}>{item.question}</span>
        <svg
          className={`${styles.accordionIcon} ${isOpen ? styles.accordionIconOpen : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className={`${styles.accordionContent} ${isOpen ? styles.accordionContentOpen : ''}`}
        role="region"
        aria-hidden={!isOpen}
      >
        <p className={styles.accordionAnswer}>{item.answer}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <>
      <SEO
        title="Preguntas Frecuentes"
        description="Encuentra respuestas a las preguntas más comunes sobre compras, envíos, devoluciones y más."
        pathname="/faq"
      />

      <div className={styles.pageContainer}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Preguntas Frecuentes</h1>
            <p className={styles.heroDescription}>
              Encuentra respuestas a las dudas más comunes sobre nuestros productos y servicios.
            </p>
          </div>
        </section>

        {/* Accordion */}
        <div className={styles.container}>
          <div className={styles.accordion}>
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={index}
                item={item}
                isOpen={openIndex === index}
                onClick={() => handleToggle(index)}
              />
            ))}
          </div>

          <div className={styles.contactCta}>
            <h2 className={styles.ctaTitle}>¿No encuentras lo que buscas?</h2>
            <p className={styles.ctaText}>
              Estamos aquí para ayudarte. No dudes en contactarnos directamente.
            </p>
            <a href="/contact" className={styles.ctaButton}>
              Contactar
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
