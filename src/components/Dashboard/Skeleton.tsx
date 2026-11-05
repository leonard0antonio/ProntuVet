import React from 'react';

interface SkeletonProps {
  count?: number;
  height?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ count = 1, height = 100 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ height: `${height}px`, background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '8px' }} />
      ))}
    </div>
  );
};