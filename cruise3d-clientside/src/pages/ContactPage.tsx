import { useState, type FormEvent } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { submitContactMessage } from '../features/contact/api';

type ContactForm = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
};

const initialForm: ContactForm = {
  fullName: '',
  email: '',
  subject: '',
  message: '',
};

const contactDetails = [
  {
    icon: 'mail',
    label: 'Email',
    value: 'support@cruise3d.in',
    href: 'mailto:support@cruise3d.in',
  },
  {
    icon: 'call',
    label: 'Phone',
    value: '+91 8719897391',
    href: 'tel:+918719897391',
  },
  {
    icon: 'location_on',
    label: 'Address',
    value: [
      'Cruise Technologies',
      '2nd Floor, Vengalethu Towers',
      'ONK Junction, Kayamkulam',
      'Alappuzha District, Kerala, India',
    ],
  },
  {
    icon: 'schedule',
    label: 'Support Hours',
    value: ['Monday - Saturday', '9:00 AM - 7:00 PM IST'],
  },
] as const;

function validateForm(form: ContactForm) {
  const errors: Partial<Record<keyof ContactForm, string>> = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address';
  if (!form.subject.trim()) errors.subject = 'Subject is required';
  if (!form.message.trim()) errors.message = 'Message is required';
  return errors;
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
    if (isSubmitted) setIsSubmitted(false);
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitContactMessage({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setIsSubmitted(true);
      setForm(initialForm);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : error && typeof error === 'object' && 'message' in error
            ? String((error as { message?: unknown }).message)
            : 'Unable to send your message right now. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface py-12">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Cruise3D Support
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-on-surface md:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-on-surface-variant">
            Have questions about our products or your order? We&apos;re here to help.
          </p>
        </div>

        <div className="mt-12 grid min-w-0 gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="min-w-0 rounded-2xl border border-surface-container-highest bg-surface-container-low p-6 md:p-8">
            <h2 className="text-xl font-bold text-on-surface">Contact Information</h2>
            <div className="mt-8 space-y-7">
              {contactDetails.map((detail) => (
                <div key={detail.label} className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-surface text-primary shadow-sm">
                    <span className="material-symbols-outlined">{detail.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                      {detail.label}
                    </p>
                    {Array.isArray(detail.value) ? (
                      <div className="mt-1 text-sm leading-6 text-on-surface">
                        {detail.value.map((line) => <p key={line}>{line}</p>)}
                      </div>
                    ) : 'href' in detail ? (
                      <a href={detail.href} className="mt-1 block text-sm text-on-surface transition-colors hover:text-primary">
                        {detail.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-on-surface">{detail.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="min-w-0 rounded-2xl border border-surface-container-highest bg-surface-container-low p-6 md:p-8">
            <h2 className="text-xl font-bold text-on-surface">Send Us a Message</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              Share a few details and our support team will be ready to assist.
            </p>

            {isSubmitted && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
                Thanks for reaching out. Our support team will get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {submitError}
                </div>
              )}

              <Input
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={(event) => handleChange('fullName', event.target.value)}
                error={errors.fullName}
                placeholder="Your full name"
                icon="person"
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                error={errors.email}
                placeholder="you@example.com"
                icon="mail"
              />
              <Input
                label="Subject"
                name="subject"
                value={form.subject}
                onChange={(event) => handleChange('subject', event.target.value)}
                error={errors.subject}
                placeholder="How can we help?"
                icon="subject"
              />
              <div className="flex w-full flex-col gap-1.5">
                <label htmlFor="contact-message" className="text-sm font-medium text-on-surface">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={(event) => handleChange('message', event.target.value)}
                  placeholder="Write your message here"
                  rows={5}
                  className="w-full resize-y rounded-lg border bg-surface px-3.5 py-3 text-sm text-on-surface outline-none transition-all duration-200 placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-primary/20"
                  style={{ borderColor: errors.message ? '#dc2626' : '#d4d4d4' }}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                />
                {errors.message && <p id="contact-message-error" role="alert" className="text-xs font-medium text-red-600">{errors.message}</p>}
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon="send"
                iconPosition="right"
                isLoading={isSubmitting}
                className="w-full sm:w-auto"
              >
                Send Message
              </Button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}