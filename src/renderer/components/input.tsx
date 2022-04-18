
import React from 'react';

export function Input({ 
    id, classes, label, placeholder, value, disabled, description }: 
    { id: string, classes?: string, label?: string, placeholder: string, value?: string, disabled?: boolean, description?: string }) {
return <div className={classes}>
  {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">
    {label}
  </label>}
  <div className="mt-1">
    <input
      disabled={disabled}
      type="text"
      name={id}
      id={id}
      className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
      placeholder={placeholder}
      value={value}
    />
  </div>
  {description && 
  <p className="mt-2 text-sm text-gray-500">
   {description}
  </p>}
</div>
}

export default Input;