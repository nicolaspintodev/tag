export const entityCountText = (cantidad, hasError = false) => {
  if (hasError) return '(?)';

  const value = Number(cantidad);
  return `(${Number.isFinite(value) ? value : 0})`;
};

export const viajesLoadErrorMessage = (context) => {
  if (context === 'counts') {
    return 'No se pudieron cargar los viajes disponibles por entidad.';
  }

  return 'No se pudieron cargar los viajes disponibles.';
};
