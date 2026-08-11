import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { theme } from '../../styles/theme';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      type = 'text',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const { colors } = theme;
    const inputId = id || React.useId();
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium transition-colors duration-200 select-none cursor-pointer"
            style={{
              color: disabled ? colors.text.tertiary : colors.text.primary,
            }}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {icon && iconPosition === 'left' && (
            <span
              className="material-symbols-outlined absolute left-3 select-none text-[1.25rem] pointer-events-none"
              style={{
                color: error ? colors.status.error.DEFAULT : disabled ? colors.text.tertiary : colors.text.secondary,
              }}
            >
              {icon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            aria-describedby={clsx(helperText && helperId, error && errorId) || undefined}
            className={clsx(
              'w-full px-3.5 py-2 text-sm rounded-lg border outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-0 disabled:shadow-none placeholder-gray-400',
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            style={{
              backgroundColor: disabled ? colors.surface.low : colors.surface.DEFAULT,
              color: disabled ? colors.text.secondary : colors.text.primary,
              borderColor: error ? colors.status.error.DEFAULT : disabled ? colors.border.light : colors.border.DEFAULT,
              boxShadow: 'none',
            }}
            onFocus={(e) => {
              if (!disabled && !error) {
                e.currentTarget.style.borderColor = colors.border.focus;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.surface.tint}`;
              }
            }}
            onBlur={(e) => {
              if (!disabled && !error) {
                e.currentTarget.style.borderColor = colors.border.DEFAULT;
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <span
              className="material-symbols-outlined absolute right-3 select-none text-[1.25rem] pointer-events-none"
              style={{
                color: error ? colors.status.error.DEFAULT : disabled ? colors.text.tertiary : colors.text.secondary,
              }}
            >
              {icon}
            </span>
          )}
        </div>

        {error && (
          <p 
            id={errorId} 
            role="alert" 
            className="text-xs font-medium"
            style={{ color: colors.status.error.DEFAULT }}
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p 
            id={helperId} 
            className="text-xs"
            style={{ color: colors.text.secondary }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';