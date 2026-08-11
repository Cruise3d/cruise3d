import React from 'react';
import { clsx } from 'clsx';

export type CheckoutStep =
  | 'billing'
  | 'shipping'
  | 'summary'
  | 'payment'
  | 'confirmation';

export interface CheckoutStepperProps {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
  completedSteps?: CheckoutStep[];
}

const STEPS: { key: CheckoutStep; label: string; number: number }[] = [
  { key: 'billing', label: 'Billing Address', number: 1 },
  { key: 'shipping', label: 'Shipping Address', number: 2 },
  { key: 'summary', label: 'Order Summary', number: 3 },
  { key: 'payment', label: 'Payment', number: 4 },
  { key: 'confirmation', label: 'Confirmation', number: 5 },
];

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({
  currentStep,
  onStepClick,
  completedSteps = [],
}) => {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  const isStepCompleted = (stepKey: CheckoutStep) => completedSteps.includes(stepKey);
  const isStepActive = (stepKey: CheckoutStep) => stepKey === currentStep;
  const isStepClickable = (stepKey: CheckoutStep) => {
    if (!onStepClick) return false;
    const stepIndex = STEPS.findIndex((s) => s.key === stepKey);
    // Can click if this step is completed or all previous steps are completed
    return isStepCompleted(stepKey) || STEPS.slice(0, stepIndex).every((s) => isStepCompleted(s.key));
  };

  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <nav className="hidden md:block" aria-label="Progress">
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = isStepCompleted(step.key);
            const isActive = isStepActive(step.key);
            const isClickable = isStepClickable(step.key);
            const isLast = index === STEPS.length - 1;

            return (
              <li key={step.key} className={clsx('relative flex-1', !isLast && 'pr-8 sm:pr-20')}>
                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={clsx(
                      'absolute top-5 left-0 right-0 h-0.5 mx-auto',
                      index < currentIndex || isCompleted
                        ? 'bg-primary'
                        : 'bg-surface-container-highest'
                    )}
                    style={{ left: 'auto', right: '-50%', width: '100%' }}
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex flex-col items-center">
                  {/* Step Circle */}
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick?.(step.key)}
                    disabled={!isClickable}
                    className={clsx(
                      'relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold text-sm transition-all duration-200',
                      isCompleted
                        ? 'border-primary bg-primary text-on-primary'
                        : isActive
                        ? 'border-primary bg-surface text-primary ring-4 ring-primary/10'
                        : 'border-surface-container-highest bg-surface-container-low text-on-surface-variant',
                      isClickable && 'cursor-pointer hover:scale-110',
                      !isClickable && 'cursor-default'
                    )}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-lg">check</span>
                    ) : (
                      step.number
                    )}
                  </button>

                  {/* Step Label */}
                  <span
                    className={clsx(
                      'mt-3 text-xs font-medium text-center max-w-[80px] transition-colors',
                      isActive
                        ? 'text-primary'
                        : isCompleted
                        ? 'text-on-surface'
                        : 'text-on-surface-variant'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-on-surface">
            Step {currentIndex + 1} of {STEPS.length}
          </span>
          <span className="text-sm font-medium text-primary">
            {STEPS[currentIndex].label}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutStepper;
