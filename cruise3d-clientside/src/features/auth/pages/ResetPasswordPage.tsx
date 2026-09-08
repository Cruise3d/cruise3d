import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { resetPasswordSchema, type ResetPasswordFormData } from '../../../lib/validators/authSchemas';
import { resetPassword } from '../api';
import { showToast } from '../../../components/ui/toastEvents';

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }
  return 'This reset link is invalid or has expired. Please request a new one.';
}

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: '' }));
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      setSubmitError('This reset link is missing its token. Please request a new one.');
      return;
    }

    const result = resetPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    setSubmitError(null);
    try {
      await resetPassword(token, result.data.newPassword);
      setIsSuccessful(true);
      showToast('Password reset successfully.', 'success');
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface px-6 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-container-highest bg-surface-container shadow-sm">
            <span className="material-symbols-outlined text-2xl text-primary">
              {isSuccessful ? 'check_circle' : 'lock_reset'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface">
            {isSuccessful ? 'Password Reset' : 'Reset Password'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            {isSuccessful
              ? 'Your password has been updated. You can now sign in with your new password.'
              : 'Choose a new password for your Cruise3D account.'}
          </p>
        </div>

        <div className="rounded-2xl border border-surface-container-highest bg-surface-container-low p-6 shadow-sm md:p-8">
          {isSuccessful ? (
            <Link to="/login" className="block w-full">
              <Button variant="primary" size="lg" className="w-full" icon="login">
                Go to Sign In
              </Button>
            </Link>
          ) : !token ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                This reset link is missing or incomplete. Please request a new password reset link.
              </div>
              <Link to="/forgot-password" className="block w-full">
                <Button variant="primary" size="lg" className="w-full">
                  Request New Link
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                autoComplete="new-password"
                icon="lock"
                autoFocus
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
                icon="lock"
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
                icon="check"
                iconPosition="right"
              >
                Reset Password
              </Button>
            </form>
          )}
        </div>

        {!isSuccessful && (
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface">
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default ResetPasswordPage;