import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { loginSchema, type LoginFormData } from '../../../lib/validators/authSchemas';
import { useLogin } from '../hooks/useLogin';

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
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Sign in failed. Please try again.'
      );
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
