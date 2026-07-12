import React from 'react';

interface FooterWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const FooterWrapper: React.FC<FooterWrapperProps> = ({ children, className = '' }) => {
  return (
    <footer
      aria-label="Site footer"
      className={`relative mt-12 w-full overflow-hidden rounded-3xl border border-primary/20 bg-card/90 px-6 py-8 shadow-xl shadow-primary/10 backdrop-blur sm:px-8 sm:py-10 ${className}`}
    >
      {children}
    </footer>
  );
};

export default FooterWrapper;