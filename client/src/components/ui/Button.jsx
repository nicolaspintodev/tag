const Button = ({ variant = 'primary', type = 'button', className = '', ...props }) => {
  const variantClass =
    variant === 'outline'
      ? 'outline'
      : variant === 'danger'
        ? 'btn-danger'
        : variant === 'ghost'
          ? 'btn-ghost'
          : '';
  return <button type={type} className={`${variantClass} ${className}`.trim()} {...props} />;
};

export default Button;
