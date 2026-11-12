import { describe, it, expect } from 'vitest';
import { required, email, cuit, runValidators } from './validations';

describe('required', () => {
  it('rechaza vacío, null, undefined y espacios', () => {
    expect(required('')).toBe('Requerido');
    expect(required('   ')).toBe('Requerido');
    expect(required(null)).toBe('Requerido');
    expect(required(undefined)).toBe('Requerido');
  });
  it('acepta valor con contenido', () => {
    expect(required('ACME')).toBeNull();
  });
});

describe('email', () => {
  it('acepta vacío (campo opcional)', () => {
    expect(email('')).toBeNull();
    expect(email(null)).toBeNull();
  });
  it('acepta formato válido y rechaza inválido', () => {
    expect(email('a@b.com')).toBeNull();
    expect(email('no-es-email')).toBe('Email inválido');
  });
});

describe('cuit', () => {
  it('acepta con guiones y sin guiones', () => {
    expect(cuit('20-12345678-6')).toBeNull();
    expect(cuit('20123456786')).toBeNull();
    expect(cuit(' 20-12345678-6 ')).toBeNull();
  });
  it('rechaza dígito verificador inválido', () => {
    expect(cuit('20-12345678-9')).toBe('CUIT inválido');
  });
  it('rechaza longitud incorrecta', () => {
    expect(cuit('123')).toBe('CUIT inválido');
  });
  it('acepta vacío (campo opcional a nivel validador)', () => {
    expect(cuit('')).toBeNull();
  });
});

describe('runValidators', () => {
  it('devuelve el primer error', () => {
    expect(runValidators([required, cuit], '')).toBe('Requerido');
  });
  it('devuelve null si todo pasa', () => {
    expect(runValidators([required, cuit], '20-12345678-6')).toBeNull();
  });
});
