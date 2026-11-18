import { useEffect, useRef } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { runValidators } from '../../lib/validations';

const PRINTABLE_KEY_REGEX = /^[^ -~]$/;

const formatCuit = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
};

const toBoolean = (val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val === 'true';
  return Boolean(val);
};

const GridCell = ({ column, value, draft, row, isActive, isEditing, onSelect, onStartEdit, onChange, onCommit, onCancel, onToggle, serverError, rowError }) => {
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
    onStartEdit(value ?? '');
  };

  const handleToggleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect?.();
    onToggle?.(!toBoolean(value));
  };

  const validationError = column.validate
    ? (Array.isArray(column.validate)
        ? runValidators(column.validate, value, row)
        : column.validate(value, row))
    : null;
  const hasServerError = serverError || rowError;
  // No agregar cell-error/cell-warning aquí; el padre (tr) maneja el color de toda la fila
  const hasServerErrorClass = hasServerError ? 'has-server-error' : '';
  const className = `grid-cell ${isActive ? 'active' : ''} ${isEditing ? 'editing' : ''} ${hasServerErrorClass} ${column.className ?? ''}`.trim();
  const errorTitle = serverError || rowError || validationError;

  if (!column.editable) {
    const displayValue = column.id === 'cuit' ? formatCuit(value) : value;
    return (
      <td className={className} title={errorTitle || undefined} onClick={onSelect} onDoubleClick={handleDoubleClick}>
        {column.render ? column.render(value, row) : displayValue}
      </td>
    );
  }

  if (!isEditing) {
    const displayValue = column.id === 'cuit' ? formatCuit(value) : value;
    const isBooleanType = column.type === 'boolean' || (column.type === 'select' && column.options?.some((o) => typeof o.value === 'boolean'));
    return (
      <td
        className={className}
        title={errorTitle || undefined}
        onClick={isBooleanType ? handleToggleClick : onSelect}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDownDisplay}
      >
        {isBooleanType ? (
          <div
            className={`toggle-switch-display ${toBoolean(value) ? 'on' : 'off'}`}
          />
        ) : column.render ? (
          column.render(value, row)
        ) : (
          displayValue
        )}
      </td>
    );
  }

  const editingValue = draft ?? '';

  if (column.type === 'boolean') {
    const checked = toBoolean(editingValue);
    return (
      <td className={className}>
        <input
          ref={ref}
          type="checkbox"
          className="toggle-switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          onKeyDown={handleKeyDown}
          onBlur={() => onCommit(false)}
        />
      </td>
    );
  }

  if (column.type === 'select') {
    const isBooleanOptions = column.options?.some((o) => typeof o.value === 'boolean');
    return (
      <td className={className}>
        <Select
          ref={ref}
          value={editingValue ?? ''}
          options={column.options}
          onChange={(event) => {
            const val = event.target.value;
            onChange(isBooleanOptions ? toBoolean(val) : val);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => onCommit(false)}
        />
      </td>
    );
  }

  if (column.type === 'textarea') {
    return (
      <td className={className}>
        <textarea
          ref={ref}
          className="input-field"
          value={editingValue}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => onCommit(false)}
        />
      </td>
    );
  }

  return (
    <td className={className}>
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
    </td>
  );
};

export default GridCell;