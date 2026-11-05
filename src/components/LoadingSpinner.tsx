import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const spinnerStyles = `
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

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = '#007bff' }) => {
  const sizeMap = { sm: 20, md: 32, lg: 48 };
  const diameter = sizeMap[size];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: spinnerStyles }} />
      <svg
        width={diameter}
        height={diameter}
        viewBox="0 0 24 24"
        style={{ animation: 'spin 1s linear infinite', color }}
        role="status"
        aria-label="Carregando"
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
    </>
  );
};