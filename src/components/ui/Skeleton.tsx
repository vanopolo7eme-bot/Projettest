import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', style, className }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className || ''}`}
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Skeleton width="48px" height="48px" borderRadius="12px" />
        <div style={{ flex: 1 }}>
          <Skeleton height="14px" width="60%" style={{ marginBottom: '8px' }} />
          <Skeleton height="10px" width="40%" />
        </div>
      </div>
      <Skeleton height="32px" width="50%" style={{ marginBottom: '8px' }} />
      <Skeleton height="12px" width="80%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ padding: '16px' }}>
      <Skeleton height="40px" style={{ marginBottom: '12px' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height="48px" style={{ marginBottom: '8px' }} />
      ))}
    </div>
  );
}
