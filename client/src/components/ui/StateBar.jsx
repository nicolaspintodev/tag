const StateBar = ({ count = 0, singular = 'registro', plural = 'registros', errors = {}, rows = [], lastAction = null }) => {
  if (!count || count <= 0) return null;

  let statusBadge = null;

  if (lastAction) {
    const { rowKey, state } = lastAction;
    const error = errors[rowKey];
    const visualRowIndex = rows.findIndex(r => r.id === rowKey) + 1;

    const translateError = (msg) => {
      if (!msg) return 'Error desconocido';
      const lower = msg.toLowerCase();

      const fieldMap = {
        'nombre': 'nombre',
        'apellido': 'apellido',
        'dni': 'DNI',
        'cuit': 'CUIT',
        'email': 'email',
        'razon social': 'razón social',
        'razon_social': 'razón social',
        'telefono': 'teléfono',
        'direccion': 'dirección',
        'localidad': 'localidad',
        'contacto': 'contacto',
      };

      for (const [key, label] of Object.entries(fieldMap)) {
        const pattern1 = `the ${key} field is required`;
        const pattern2 = `the ${key.replace(' ', '_')} field is required`;
        if (lower.includes(pattern1) || lower.includes(pattern2)) {
          return `El campo ${label} es obligatorio`;
        }
      }

      if (lower.includes('and ') && lower.includes('more error')) {
        return lower
          .replace(/the (\w+(?: \w+)?) field is required\. \(and (\d+) more error\)/, 'El campo $1 es obligatorio (y $2 errores más)')
          .replace(/the (\w+(?: \w+)?) field is required\. \(and (\d+) more errors\)/, 'El campo $1 es obligatorio (y $2 errores más)');
      }

      return msg
        .replace(/The (\w+(?: \w+)?) field is required/gi, 'El campo $1 es obligatorio')
        .replace(/and (\d+) more errors?/gi, 'y $1 errores más')
        .replace(/unique/gi, 'ya existe')
        .replace(/invalid/gi, 'inválido')
        .replace(/already exists/gi, 'ya existe');
    };

    if (state === 'saving') {
      statusBadge = (
        <span className="state-badge saving">
          Guardando fila {visualRowIndex}...
        </span>
      );
    } else if (state === 'saved') {
      statusBadge = (
        <span className="state-badge saved">
          Fila {visualRowIndex} guardada exitosamente
        </span>
      );
    } else if (state === 'error' && error) {
      const rawMsg = typeof error === 'object' ? (error._row || Object.values(error)[0] || 'Error desconocido') : error;
      const msg = translateError(rawMsg);
      statusBadge = (
        <span className="state-badge error">
          No se pudo guardar la fila {visualRowIndex}. Error: {msg}
        </span>
      );
    }
  }

  return (
    <div className="state-bar">
      {statusBadge && <span className="state-bar-status">{statusBadge}</span>}
      <span className="state-bar-count">{count} {count === 1 ? singular : plural}</span>
    </div>
  );
};

export default StateBar;