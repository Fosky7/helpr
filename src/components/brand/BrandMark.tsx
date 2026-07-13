import React from 'react';

interface BrandMarkProps {
  subtitle?: string;
  compact?: boolean;
  size?: 'sm' | 'lg';
  className?: string;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const BrandMark: React.FC<BrandMarkProps> = ({ subtitle, compact, size = 'lg', className }) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {compact ? (
        <span className="text-xl font-extrabold tracking-tight text-primary">R</span>
      ) : (
        <span className={cn('font-extrabold tracking-tight', size === 'lg' ? 'text-2xl' : 'text-xl')}>
          Renderr
        </span>
      )}
      {subtitle && !compact && (
        <span className="text-sm font-medium text-muted-foreground">/ {subtitle}</span>
      )}
    </div>
  );
};

export default BrandMark;
