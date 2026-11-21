import { describe, it, expect } from 'vitest';
import { entityCountText, viajesLoadErrorMessage } from './liquidacionPicker';

describe('entityCountText', () => {
  it('muestra interrogante cuando falló la carga de conteos', () => {
    expect(entityCountText(0, true)).toBe('(?)');
  });

  it('muestra el conteo cuando no hay error', () => {
    expect(entityCountText(3, false)).toBe('(3)');
    expect(entityCountText(null, false)).toBe('(0)');
  });
});

describe('viajesLoadErrorMessage', () => {
  it('devuelve el mensaje de conteos por entidad', () => {
    expect(viajesLoadErrorMessage('counts')).toBe('No se pudieron cargar los viajes disponibles por entidad.');
  });

  it('devuelve el mensaje general de viajes', () => {
    expect(viajesLoadErrorMessage('viajes')).toBe('No se pudieron cargar los viajes disponibles.');
  });
});
