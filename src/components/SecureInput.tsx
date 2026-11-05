import React, { useState, useRef, useEffect } from 'react';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showToggle?: boolean;
  mask?: string;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  label,
  error,
  showToggle = false,
  mask,
  type = 'text',
  id,
  ...props
}) => {
  const [showValue, setShowValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleBlur = () => {
      if (showToggle && showValue) {
        setShowValue(false);
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('blur', handleBlur);
    }
    return () => {
      if (input) {
        input.removeEventListener('blur', handleBlur);
      }
    };
  }, [showToggle, showValue]);

  const displayType = showToggle && showValue ? 'text' : type;

  return (
    <div style={{ marginBottom: '16px' }}>
      <label htmlFor={id} style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          id={id}
          type={displayType}
          {...props}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: error ? '1px solid #dc3545' : '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box',
            ...props.style,
          }}
        />
        {showToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowValue(prev => !prev)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '16px',
              lineHeight: 1,
            }}
            aria-label={showValue ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showValue ? '👁️' : '🔒'}
          </button>
        )}
      </div>
      {error && (
        <p style={{ color: '#dc3545', margin: '4px 0 0', fontSize: '14px' }}>{error}</p>
      )}
    </div>
  );
};