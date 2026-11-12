import { useEffect, useRef } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';

const EditableCell = ({ column, value, draft, row, isActive, isEditing, onSelect, onChange, onCommit, onCancel }) => {
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
      onCommit(true);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  };

  const error = column.validate ? column.validate(value, row) : null;
  const severity = error ? (column.warn ? 'cell-warning' : 'cell-error') : '';
  const className = `grid-cell ${isActive ? 'active' : ''} ${severity}`.trim();

  if (!column.editable || !isEditing) {
    return (
      <td className={className} title={error || undefined} onClick={onSelect}>
        {column.render ? column.render(value, row) : value}
      </td>
    );
  }

  const editingValue = draft ?? '';

  return (
    <td className={className}>
      {column.type === 'select' ? (
        <Select
          ref={ref}
          value={editingValue}
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
          value={editingValue}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => onCommit(false)}
        />
      )}
    </td>
  );
};

export default EditableCell;
