import React from 'react';

interface FooterWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const FooterWrapper: React.FC<FooterWrapperProps> = ({ children, className = '' }) => {
  return (
    <footer
      aria-label="Site footer"
      className={`relative mt-8 w-full overflow-hidden rounded-3xl border border-primary/20 bg-card/90 px-6 py-6 shadow-xl shadow-primary/10 backdrop-blur sm:mt-12 sm:px-8 sm:py-8 ${className}`}
    >
      {children}
    </footer>
  );
};

export default FooterWrapper;
