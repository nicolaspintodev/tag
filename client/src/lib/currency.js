export const formatCurrency = (value) => {
  if (!value && value !== 0) return '$0';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
};

export const parseCurrency = (str) => {
  return parseFloat(String(str).replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
};