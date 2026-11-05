import React from 'react';

interface SkeletonProps {
  count?: number;
  height?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ count = 1, height = 180 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ height: `${height}px`, background: 'linear-gradient(90deg, var(--border-light) 25%, var(--border-medium) 50%, var(--border-light) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 'var(--radius-lg)' }} />
      ))}
    </div>
  );
};