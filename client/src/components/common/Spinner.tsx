import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeMap: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-4',
  lg: 'w-16 h-16 border-4',
};

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', label = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div
          className={`${sizeMap[size]} border-white/30 border-t-white rounded-full animate-spin`} 
          role="status" 
          aria-live="polite"
          aria-label={label}
        />
        <span className="mt-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">{label}</span>
      </div>
    </div>
  );
};

export default Spinner;
