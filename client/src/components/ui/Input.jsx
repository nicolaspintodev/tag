import { forwardRef } from 'react';

const Input = forwardRef(({ className = '', ...props }, ref) => (
  <input ref={ref} className={`input-field ${className}`.trim()} {...props} />
));

Input.displayName = 'Input';

export default Input;
