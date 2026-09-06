
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  transparentBg?: boolean;
  'aria-label'?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', transparentBg = false, ...props }) => {
  const baseStyles = 'block w-full rounded-md shadow-sm sm:text-sm transition-all duration-200 text-gray-900 placeholder-gray-400';
  // Default: White bg, border. Transparent: No border initially, border on focus/hover.
  const defaultBgStyles = 'border-gray-300 focus:border-rose-500 focus:ring-rose-500 bg-white border';
  const transparentStyles = 'border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-rose-500 focus:ring-rose-500 focus:shadow-sm border'; 
  const errorStyles = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';

  const inputMode = props.inputMode || (props.type === 'number' ? 'decimal' : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={props.id || props.name} className="block text-sm font-bold text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`${baseStyles} ${transparentBg ? transparentStyles : defaultBgStyles} ${errorStyles} p-2`}
        inputMode={inputMode}
        {...props}
        aria-label={props['aria-label'] || label || props.placeholder || props.name}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
