
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: { value: string; label: string }[];
  error?: string;
  transparentBg?: boolean;
  'aria-label'?: string;
}

const Select: React.FC<SelectProps> = ({ label, options = [], error, className = '', transparentBg = false, ...props }) => {
  const baseStyles = 'block w-full rounded-md shadow-sm sm:text-sm transition-colors duration-150 text-gray-900';
  const defaultBgStyles = 'border-gray-300 focus:border-rose-500 focus:ring-rose-500 bg-white border';
  const transparentStyles = 'border-transparent focus:border-rose-500 focus:ring-rose-500 hover:bg-gray-50 bg-transparent';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';

  return (
    <div className={`mb-2 ${className}`}>
      {label && (
        <label htmlFor={props.id || props.name} className="block text-sm font-bold text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={`${baseStyles} ${transparentBg ? transparentStyles : defaultBgStyles} ${errorStyles} p-2.5`}
        {...props}
        aria-label={props['aria-label'] || label || props.name}
      >
        {(options || []).map((option) => (
          <option key={option.value} value={option.value} className="text-gray-900">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
