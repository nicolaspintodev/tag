export const CONDICIONES_IVA = [
  'responsable_inscripto',
  'monotributo',
  'exento',
  'consumidor_final',
  'no_categorizado',
];

export const required = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return 'Requerido';
  }
  return null;
};

export const email = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  return ok ? null : 'Email inválido';
};

export const CUIT_MESSAGE = 'CUIT inválido (11 dígitos; empresas 30/33/34, personas 20/23/24/27)';

export const cuit = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length !== 11) return CUIT_MESSAGE;
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((acc, weight, index) => acc + weight * Number(digits[index]), 0);
  let check = 11 - (sum % 11);
  if (check === 11) check = 0;
  if (check === 10) check = 9;
  return check === Number(digits[10]) ? null : CUIT_MESSAGE;
};

export const runValidators = (validators, value, row) => {
  for (const validate of validators) {
    const message = validate(value, row);
    if (message) return message;
  }
  return null;
};
