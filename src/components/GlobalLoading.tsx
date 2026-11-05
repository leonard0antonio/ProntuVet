import React from 'react';

interface GlobalLoadingProps {
  isLoading: boolean;
  message?: string;
}

const globalLoadingStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes dash {
    0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
    50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
    100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
  }
`;

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({ isLoading, message = 'Carregando...' }) => {
  if (!isLoading) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalLoadingStyles }} />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
        role="status"
        aria-live="polite"
      >
        <svg
          width={48}
          height={48}
          viewBox="0 0 24 24"
          style={{ animation: 'spin 1s linear infinite', color: '#007bff' }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray="31.4 31.4"
            strokeDashoffset="0"
            style={{ animation: 'dash 1.5s ease-in-out infinite' }}
          />
        </svg>
        <p style={{ marginTop: '16px', color: '#333', fontSize: '16px' }}>{message}</p>
      </div>
    </>
  );
};