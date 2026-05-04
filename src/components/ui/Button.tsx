'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = `
    inline-flex items-center justify-center 
    font-semibold rounded-3xl cursor-pointer 
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-background)]
    disabled:opacity-60 disabled:cursor-not-allowed
    active:scale-[0.98]
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizes = {
    sm: 'px-3 py-1.5 text-sm sm:px-4 sm:py-2 gap-1.5',
    md: 'px-4 py-2 text-base sm:px-5 sm:py-2.5 gap-2',
    lg: 'px-5 py-2.5 text-lg sm:px-7 sm:py-3 gap-2.5',
  };

  const variants = {
    primary: `
      bg-[var(--color-primary)] text-white 
      hover:bg-[var(--color-primary)]/90 hover:shadow-lg hover:shadow-[var(--color-primary)]/25
      focus:ring-[var(--color-primary)]
    `,
    secondary: `
      bg-white text-[var(--color-primary)] 
      border-2 border-[var(--color-primary)]
      hover:bg-[var(--color-primary)] hover:text-white
      focus:ring-[var(--color-primary)]
    `,
    ghost: `
      bg-transparent text-[var(--color-primary)] 
      hover:bg-[var(--color-primary)]/10
      focus:ring-[var(--color-primary)]
    `,
    danger: `
      bg-red-500 text-white 
      hover:bg-red-600 hover:shadow-lg
      focus:ring-red-500
    `,
  };

  const finalClass = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      className={finalClass}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="shrink-0 mr-2" aria-hidden="true">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0 ml-2" aria-hidden="true">{rightIcon}</span>}
    </button>
  );
}