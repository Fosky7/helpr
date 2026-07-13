import React from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidthClassName?: string;
  contentClassName?: string;
  centered?: boolean;
  'aria-label'?: string;
}

export default function AppShell({
  children,
  className,
  maxWidthClassName = 'max-w-5xl',
  contentClassName,
  centered = false,
  ...rest
}: AppShellProps) {
  return (
    <main
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8',
        maxWidthClassName,
        centered && 'flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center',
        className,
        contentClassName
      )}
      {...rest}
    >
      {children}
    </main>
  );
}
