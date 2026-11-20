import { forwardRef } from 'react';

const Select = forwardRef(({ className = '', options = [], children, ...props }, ref) => (
  <select ref={ref} className={`input-field ${className}`.trim()} {...props}>
    {children ??
      options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
  </select>
));

Select.displayName = 'Select';

export default Select;
