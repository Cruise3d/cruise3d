import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { registerSchema, type RegisterFormData } from '../../../lib/validators/authSchemas';
import { useRegister } from '../hooks/useRegister';
import { resendVerificationEmail } from '../api';
import { showToast } from '../../../components/ui/toastEvents';

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useRegister();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Post-registration "Check your email" state
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Cooldown timer for resend action
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const result = registerSchema.safeParse(formData);
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

    setSubmitError(null);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone?.trim() || undefined,
      });

      setRegisteredEmail(formData.email.trim());
      setIsRegistered(true);
      setResendCooldown(60);
      showToast('Account created! Please check your email for the verification link.', 'success');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setSubmitError(message);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending || !registeredEmail) return;

    setIsResending(true);
    setResendError(null);

    try {
      await resendVerificationEmail(registeredEmail);
      setResendCooldown(60);
      showToast('Verification email sent! Please check your inbox.', 'success');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to resend verification email right now. Please try again later.';
      setResendError(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface px-6 py-12">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container border border-surface-container-highest shadow-sm">
            <span className="material-symbols-outlined text-2xl text-primary">
              {isRegistered ? 'mark_email_unread' : 'person_add'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface">
            {isRegistered ? 'Verify Your Email' : 'Create Account'}
          </h1>
          <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">
            {isRegistered
              ? 'We sent a verification link to your email address.'
              : 'Join Cruise3D and start ordering custom 3D prints'}
          </p>
        </div>

        {/* Register Card / Check Email Card */}
        <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-6 md:p-8 shadow-sm">
          {!isRegistered ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <Input
                label="Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="John Doe"
                icon="person"
                autoComplete="name"
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@example.com"
                icon="mail"
                autoComplete="email"
              />

              <Input
                label="Phone (Optional)"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+1 (555) 123-4567"
                icon="phone"
                autoComplete="tel"
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Create a password"
                icon="lock"
                autoComplete="new-password"
                helperText="At least 6 characters"
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
                icon="lock"
                autoComplete="new-password"
              />

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-sm text-on-surface-variant">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Create Account
              </Button>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              {resendError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-left">
                  {resendError}
                </div>
              )}

              <div className="rounded-xl bg-surface p-4 border border-surface-container-highest text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Verification Sent To
                </p>
                <p className="text-sm font-semibold text-on-surface break-all mt-1">
                  {registeredEmail}
                </p>
              </div>

              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3.5 text-left text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Almost there!
                </div>
                <p className="text-blue-800 leading-relaxed">
                  Please click the link in your email to activate your account. If you don't see it in a few minutes, check your spam or junk folder.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  isLoading={isResending}
                  className="w-full"
                  icon="refresh"
                >
                  {resendCooldown > 0
                    ? `Resend Email in ${resendCooldown}s`
                    : 'Resend Verification Email'}
                </Button>

                <Link to="/login" className="block w-full">
                  <Button variant="primary" size="lg" className="w-full">
                    Proceed to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Divider & Socials (only shown on registration form) */}
          {!isRegistered && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-container-highest" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface-container-low px-2 text-on-surface-variant">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <span className="material-symbols-outlined">flutter_dash</span>
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  <span className="material-symbols-outlined">code</span>
                  GitHub
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-on-surface-variant">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary-container transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default RegisterPage;

