import { useEffect, useRef } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';

const PRINTABLE_KEY_REGEX = /^[^ -~]$/;

const formatCuit = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
};

const GridCell = ({ column, value, draft, row, isActive, isEditing, onSelect, onStartEdit, onChange, onCommit, onCancel }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      if (ref.current.select) ref.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onCommit(false);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  };

  const handleKeyDownDisplay = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onStartEdit(value ?? '');
    } else if (PRINTABLE_KEY_REGEX.test(event.key)) {
      event.preventDefault();
      onStartEdit(event.key);
    } else if (event.key === 'F2') {
      event.preventDefault();
      onStartEdit();
    }
  };

  const handleDoubleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onStartEdit();
  };

  const error = column.validate ? column.validate(value, row) : null;
  const severity = error ? (column.warn ? 'cell-warning' : 'cell-error') : '';
  const className = `grid-cell ${isActive ? 'active' : ''} ${isEditing ? 'editing' : ''} ${severity} ${column.className ?? ''}`.trim();

  if (!column.editable) {
    const displayValue = column.id === 'cuit' ? formatCuit(value) : value;
    return (
      <td className={className} title={error || undefined} onClick={onSelect} onDoubleClick={handleDoubleClick}>
        {column.render ? column.render(value, row) : displayValue}
      </td>
    );
  }

  if (!isEditing) {
    const displayValue = column.id === 'cuit' ? formatCuit(value) : value;
    return (
      <td
        className={className}
        title={error || undefined}
        onClick={onSelect}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDownDisplay}
        tabIndex={0}
      >
        {column.render ? column.render(value, row) : displayValue}
      </td>
    );
  }

  const editingValue = draft ?? '';

  return (
    <td className={className}>
      {column.type === 'select' ? (
        <Select
          ref={ref}
          value={editingValue ?? ''}
          options={column.options}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => onCommit(false)}
        />
      ) : column.type === 'textarea' ? (
        <textarea
          ref={ref}
          className="input-field"
          value={editingValue}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => onCommit(false)}
        />
      ) : (
        <Input
          ref={ref}
          type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
          value={column.type === 'date' ? String(editingValue).slice(0, 10) : editingValue}
          onChange={(event) => {
            const formatted = column.id === 'cuit' ? formatCuit(event.target.value) : event.target.value;
            onChange(formatted);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => onCommit(false)}
        />
      )}
    </td>
  );
};

export default GridCell;