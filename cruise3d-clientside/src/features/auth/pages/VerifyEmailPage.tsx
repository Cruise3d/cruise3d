import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { verifyEmail, resendVerificationEmail } from '../api';
import { showToast } from '../../../components/ui/toastEvents';
import { resendVerificationSchema } from '../../../lib/validators/authSchemas';

type VerificationStatus = 'loading' | 'success' | 'error' | 'missing_token';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resend form state
  const [resendEmail, setResendEmail] = useState('');
  const [resendError, setResendError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Prevent double-invocations in React StrictMode
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!token || token.trim() === '') {
      setStatus('missing_token');
      setErrorMessage('No verification token was provided in the link.');
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    let isMounted = true;
    setStatus('loading');

    verifyEmail(token.trim())
      .then(() => {
        if (!isMounted) return;
        setStatus('success');
        showToast('Email verified successfully! You can now log in.', 'success');
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        setStatus('error');

        let message = 'This verification link is invalid, expired, or has already been used.';
        if (typeof error === 'string') {
          message = error;
        } else if (error && typeof error === 'object') {
          const anyErr = error as Record<string, unknown>;
          if (anyErr.response && typeof anyErr.response === 'object') {
            const resData = (anyErr.response as Record<string, unknown>).data as Record<string, unknown> | string;
            if (typeof resData === 'string') {
              message = resData;
            } else if (resData && typeof resData.message === 'string') {
              message = resData.message;
            }
          } else if (typeof anyErr.message === 'string') {
            message = anyErr.message;
          }
        }
        setErrorMessage(message);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = resendVerificationSchema.safeParse({ email: resendEmail });
    if (!validation.success) {
      setResendError(validation.error.issues[0]?.message || 'Please enter a valid email address.');
      return;
    }

    setResendError(null);
    setIsResending(true);

    try {
      await resendVerificationEmail(resendEmail.trim());
      setResendCooldown(60);
      showToast('Verification email sent! Please check your inbox.', 'success');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to resend verification email. Please try again later.';
      setResendError(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface px-6 py-12 flex items-center justify-center">
      <div className="mx-auto w-full max-w-md">
        {/* Verification Card */}
        <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-6 md:p-8 shadow-sm text-center">
          {/* LOADING STATE */}
          {status === 'loading' && (
            <div className="py-8 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container border border-surface-container-highest animate-pulse">
                <span className="material-symbols-outlined text-3xl text-primary animate-spin">
                  progress_activity
                </span>
              </div>
              <h1 className="text-2xl font-bold text-on-surface">Verifying Your Email</h1>
              <p className="text-on-surface-variant text-sm">
                Please wait a moment while we verify your email address...
              </p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === 'success' && (
            <div className="space-y-6 py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-on-surface">Email Verified!</h1>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Your Cruise3D account is now fully active. You can proceed to sign in and explore our 3D printing collections.
                </p>
              </div>

              <Link to="/login" className="block w-full">
                <Button variant="primary" size="lg" className="w-full" icon="login">
                  Sign In to Your Account
                </Button>
              </Link>
            </div>
          )}

          {/* ERROR OR MISSING TOKEN STATE */}
          {(status === 'error' || status === 'missing_token') && (
            <div className="space-y-6 py-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600">
                <span className="material-symbols-outlined text-3xl">error</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-on-surface">
                  {status === 'missing_token' ? 'Missing Verification Token' : 'Verification Failed'}
                </h1>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {errorMessage || 'This verification link is invalid, expired, or has already been used.'}
                </p>
              </div>

              {/* Resend Verification Form */}
              <div className="rounded-xl bg-surface p-4 border border-surface-container-highest text-left space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Request a New Verification Link
                </p>

                {resendError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                    {resendError}
                  </div>
                )}

                <form onSubmit={handleResendSubmit} className="space-y-3">
                  <Input
                    label="Email address"
                    type="email"
                    name="resendEmail"
                    value={resendEmail}
                    onChange={(e) => {
                      setResendEmail(e.target.value);
                      if (resendError) setResendError(null);
                    }}
                    placeholder="you@example.com"
                    icon="mail"
                    autoComplete="email"
                  />

                  <Button
                    type="submit"
                    variant="outline"
                    size="md"
                    disabled={resendCooldown > 0 || isResending}
                    isLoading={isResending}
                    className="w-full"
                    icon="send"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Send New Verification Link'}
                  </Button>
                </form>
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default VerifyEmailPage;
