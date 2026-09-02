import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { loginSchema, type LoginFormData } from '../../../lib/validators/authSchemas';
import { useLogin } from '../hooks/useLogin';
import { resendVerificationEmail } from '../api';
import { showToast } from '../../../components/ui/toastEvents';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useLogin();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Unverified account state
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const result = loginSchema.safeParse(formData);
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
    setIsUnverified(false);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      // Admins land on /admin; other users go home or back to the page
      // they were originally sent here from.
      const intendedDestination =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      if (response.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (intendedDestination && intendedDestination !== '/login') {
        navigate(intendedDestination, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error: unknown) {
      if ((error as { isUnverified?: boolean })?.isUnverified) {
        setIsUnverified(true);
        setUnverifiedEmail(formData.email);
        return;
      }

      setSubmitError(
        error instanceof Error ? error.message : 'Sign in failed. Please try again.'
      );
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending || !unverifiedEmail) return;

    setIsResending(true);
    try {
      await resendVerificationEmail(unverifiedEmail);
      setResendCooldown(60);
      showToast('Verification email sent! Please check your inbox.', 'success');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to resend verification email right now.';
      showToast(message, 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface px-6 py-12">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-on-surface">Welcome Back</h1>
          <p className="text-on-surface-variant mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {isUnverified && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-amber-600 text-xl shrink-0 mt-0.5">
                    mark_email_unread
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Email Verification Required</p>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      Your email address (<strong>{unverifiedEmail}</strong>) is not verified yet. Please check your inbox for the verification link.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  isLoading={isResending}
                  className="w-full text-xs"
                  icon="send"
                >
                  {resendCooldown > 0
                    ? `Resend Email in ${resendCooldown}s`
                    : 'Resend Verification Email'}
                </Button>
              </div>
            )}

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
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              icon="lock"
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-sm text-on-surface-variant">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary-container transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
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

          {/* Social Login Buttons */}
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
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-on-surface-variant">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:text-primary-container transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;

