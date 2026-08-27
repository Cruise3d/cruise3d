import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../../lib/validators/authSchemas';
import { forgotPassword } from '../api';
import { showToast } from '../../../components/ui/toastEvents';

export const ForgotPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSendReset = async (emailToSend: string) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      await forgotPassword(emailToSend.trim());
      setIsSubmitted(true);
      setSubmittedEmail(emailToSend.trim());
      setResendCooldown(60); // 60-second cooldown
      showToast('Password reset link sent successfully!', 'success');
    } catch (error) {
      // In case of backend error (or if endpoint returns a specific message)
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Unable to send reset email. Please check your email address and try again.';
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const result = forgotPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    await handleSendReset(formData.email);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading || !submittedEmail) return;
    await handleSendReset(submittedEmail);
  };

  return (
    <main className="min-h-screen bg-surface px-6 py-12">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container border border-surface-container-highest shadow-sm">
            <span className="material-symbols-outlined text-2xl text-primary">
              {isSubmitted ? 'mark_email_read' : 'lock_reset'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface">
            {isSubmitted ? 'Check Your Inbox' : 'Forgot Password'}
          </h1>
          <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">
            {isSubmitted
              ? `We've sent a password reset link to your email address.`
              : `Enter your email address and we'll send you instructions to reset your password.`}
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-6 md:p-8 shadow-sm">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <Input
                label="Email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@example.com"
                icon="mail"
                autoComplete="email"
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
                icon="arrow_forward"
                iconPosition="right"
              >
                Send Reset Link
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-left">
                  {submitError}
                </div>
              )}

              <div className="rounded-xl bg-surface p-4 border border-surface-container-highest text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Sent To
                </p>
                <p className="text-sm font-semibold text-on-surface break-all mt-1">
                  {submittedEmail}
                </p>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-left text-xs text-amber-800 space-y-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Didn't receive the email?
                </div>
                <p className="text-amber-700 leading-relaxed">
                  Please check your spam or junk folder. The reset link will remain valid for 1 hour.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  isLoading={isLoading}
                  className="w-full"
                  icon="refresh"
                >
                  {resendCooldown > 0
                    ? `Resend Email in ${resendCooldown}s`
                    : 'Resend Email'}
                </Button>

                <Link to="/login" className="block w-full">
                  <Button variant="primary" size="lg" className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Alternate Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary-container transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
