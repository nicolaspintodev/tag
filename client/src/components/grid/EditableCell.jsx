import { useEffect, useRef } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';

const EditableCell = ({ column, value, row, isActive, isEditing, onChange, onCommit, onCancel }) => {
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
      onCommit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  };

  const error = column.validate ? column.validate(value, row) : null;
  const className = `grid-cell ${isActive ? 'active' : ''} ${error ? 'cell-error' : ''}`.trim();

  if (!column.editable || !isEditing) {
    return (
      <td className={className} title={error || undefined}>
        {column.render ? column.render(value, row) : value}
      </td>
    );
  }

  return (
    <td className={className}>
      {column.type === 'select' ? (
        <Select
          ref={ref}
          value={value ?? ''}
          options={column.options}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onCommit}
        />
      ) : column.type === 'textarea' ? (
        <textarea
          ref={ref}
          className="input-field"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onCommit}
        />
      ) : (
        <Input
          ref={ref}
          type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onCommit}
        />
      )}
    </td>
  );
};

export default EditableCell;
