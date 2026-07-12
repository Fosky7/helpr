import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';

interface FooterLinkProps extends LinkProps {}

const FooterLink: React.FC<FooterLinkProps> = ({ children, className = '', ...props }) => {
  return (
    <Link
      className={`text-sm font-medium text-foreground transition-colors hover:text-primary ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
};

export default FooterLink;