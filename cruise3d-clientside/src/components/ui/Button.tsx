import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Spinner } from './Spinner';
import { theme } from '../../styles/theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      iconPosition = 'left',
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const { colors, button } = theme;

    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

    // Get button styles from theme
    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return {
            background: button.primary.background,
            color: button.primary.color,
            hoverBackground: button.primary.hoverBackground,
            border: `1.5px solid ${button.primary.border}`,
            focusOutline: colors.primary.DEFAULT,
          };
        case 'secondary':
          return {
            background: button.secondary.background,
            color: button.secondary.color,
            hoverBackground: button.secondary.hoverBackground,
            border: `1px solid ${button.secondary.border}`,
            focusOutline: colors.secondary.DEFAULT,
          };
        case 'outline':
          return {
            background: button.outline.background,
            color: button.outline.color,
            hoverBackground: button.outline.hoverBackground,
            hoverColor: button.outline.hoverColor,
            border: `1.5px solid ${button.outline.border}`,
            focusOutline: colors.primary.DEFAULT,
          };
        case 'ghost':
          return {
            background: button.ghost.background,
            color: button.ghost.color,
            hoverBackground: button.ghost.hoverBackground,
            hoverColor: button.ghost.hoverColor,
            border: button.ghost.border,
            focusOutline: colors.secondary.DEFAULT,
          };
        case 'danger':
          return {
            background: button.danger.background,
            color: button.danger.color,
            hoverBackground: button.danger.hoverBackground,
            border: `1px solid ${button.danger.border}`,
            focusOutline: colors.status.error.DEFAULT,
          };
        default:
          return {
            background: button.primary.background,
            color: button.primary.color,
            hoverBackground: button.primary.hoverBackground,
            border: `1px solid ${button.primary.border}`,
            focusOutline: colors.primary.DEFAULT,
          };
      }
    };

    const styles = getVariantStyles();

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    const spinnerVariant = variant === 'primary' || variant === 'danger' ? 'white' : 'current';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={clsx(
          baseStyles,
          sizes[size],
          className
        )}
        style={{
          backgroundColor: styles.background,
          color: styles.color,
          border: styles.border,
          boxShadow: variant === 'primary' ? theme.shadows.primary : 'none',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.backgroundColor = styles.hoverBackground;
            if (variant === 'outline' || variant === 'ghost') {
              e.currentTarget.style.color = styles.hoverColor || styles.color;
            }
            if (variant === 'primary') {
              e.currentTarget.style.boxShadow = theme.shadows.md;
            }
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.backgroundColor = styles.background;
            if (variant === 'outline' || variant === 'ghost') {
              e.currentTarget.style.color = styles.color;
            }
            if (variant === 'primary') {
              e.currentTarget.style.boxShadow = theme.shadows.primary;
            }
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
        {...props}
      >
        {isLoading && (
          <Spinner size={size === 'lg' ? 'md' : 'sm'} variant={spinnerVariant} />
        )}
        {!isLoading && icon && iconPosition === 'left' && (
          <span className="material-symbols-outlined select-none text-[1.25em] leading-none">
            {icon}
          </span>
        )}
        {children}
        {!isLoading && icon && iconPosition === 'right' && (
          <span className="material-symbols-outlined select-none text-[1.25em] leading-none">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';