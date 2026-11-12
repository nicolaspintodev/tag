import Button from './Button';

const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirmar', onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="card confirm-dialog" onClick={(event) => event.stopPropagation()}>
        <h3>{title}</h3>
        <p style={{ color: 'var(--text-muted)', margin: '0.75rem 0 1.25rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
