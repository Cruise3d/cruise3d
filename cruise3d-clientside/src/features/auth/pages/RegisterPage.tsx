import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { registerSchema, type RegisterFormData } from '../../../lib/validators/authSchemas';
import { useRegister } from '../hooks/useRegister';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
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
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });
      navigate('/');
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <main className="min-h-screen bg-surface px-6 py-12">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-on-surface">Create Account</h1>
          <p className="text-on-surface-variant mt-2">
            Join Cruise3D and start ordering custom 3D prints
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-6 md:p-8">
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
