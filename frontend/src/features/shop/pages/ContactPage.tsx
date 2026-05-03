/**
 * ContactPage - Contact form with Zod validation using useForm + Textarea
 */

import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { SEO } from '@components/SEO';
import { Input, Textarea, Button } from '@components/index';
import { useForm } from '@hooks/useForm';
import { useGSAPAnimation } from '@hooks/useGSAPAnimation';
import styles from './ContactPage.module.css';

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico no válido'),
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(1000, 'El mensaje no puede exceder los 1000 caracteres'),
});

type ContactForm = z.infer<typeof contactSchema>;

const initialValues: ContactForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export default function ContactPage() {
  const heroRef = useRef<HTMLElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);
  const infoSectionRef = useRef<HTMLDivElement>(null);
  const { fadeIn, scrollTrigger } = useGSAPAnimation();

  useEffect(() => {
    if (heroRef.current) fadeIn(heroRef.current);
    if (formSectionRef.current) scrollTrigger({ target: formSectionRef.current, trigger: formSectionRef.current, animationVars: {} });
    if (infoSectionRef.current) scrollTrigger({ target: infoSectionRef.current, trigger: infoSectionRef.current, animationVars: {}, start: 'top 80%' });
  }, [fadeIn, scrollTrigger]);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    reset,
  } = useForm<ContactForm>({
    initialValues,
    schema: contactSchema,
    onSubmit: async (formValues) => {
      // Simulate API call — no backend endpoint yet
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Contact form submitted:', formValues);
      reset();
      alert('Mensaje enviado correctamente. Nos pondremos en contacto pronto.');
    },
  });

  return (
    <>
      <SEO
        title="Contacto"
        description="Ponte en contacto con nosotros. Estamos aquí para ayudarte con cualquier consulta o duda."
        pathname="/contact"
      />

      <div className={styles.pageContainer}>
        {/* Hero */}
        <section className={styles.hero} ref={heroRef}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Contacto</h1>
            <p className={styles.heroDescription}>
              ¿Tienes alguna pregunta? Estamos aquí para ayudarte.
            </p>
          </div>
        </section>

        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Contact Form */}
            <div className={styles.formSection} ref={formSectionRef}>
              <h2 className={styles.formTitle}>Envíanos un mensaje</h2>
              <form onSubmit={handleSubmit} noValidate className={styles.form}>
                <Input
                  label="Nombre"
                  name="name"
                  value={values.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  error={touched.name ? errors.name : undefined}
                  placeholder="Tu nombre completo"
                  required
                />

                <Input
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  error={touched.email ? errors.email : undefined}
                  placeholder="tu@correo.com"
                  required
                />

                <Input
                  label="Asunto"
                  name="subject"
                  value={values.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  onBlur={() => handleBlur('subject')}
                  error={touched.subject ? errors.subject : undefined}
                  placeholder="¿Sobre qué quieres hablar?"
                  required
                />

                <Textarea
                  label="Mensaje"
                  name="message"
                  value={values.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onBlur={() => handleBlur('message')}
                  error={touched.message ? errors.message : undefined}
                  placeholder="Escribe tu mensaje aquí..."
                  rows={6}
                  maxLength={1000}
                  required
                />

                <Button type="submit" isLoading={isSubmitting} size="lg">
                  Enviar mensaje
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className={styles.infoSection} ref={infoSectionRef}>
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Información de contacto</h3>

                <div className={styles.infoItem}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <p className={styles.infoLabel}>Dirección</p>
                    <p className={styles.infoValue}>Calle Mayor, 123<br />28001 Madrid, España</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div>
                    <p className={styles.infoLabel}>Email</p>
                    <p className={styles.infoValue}>info@tiendaonline.com</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div>
                    <p className={styles.infoLabel}>Teléfono</p>
                    <p className={styles.infoValue}>+34 900 123 456</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <div>
                    <p className={styles.infoLabel}>Horario</p>
                    <p className={styles.infoValue}>Lun - Vie: 9:00 - 18:00<br />Sáb: 10:00 - 14:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
