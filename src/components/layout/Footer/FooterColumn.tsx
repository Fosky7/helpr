import React from 'react';

interface FooterColumnProps {
  title: string;
  children: React.ReactNode;
}

const FooterColumn: React.FC<FooterColumnProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <ul className="flex flex-col gap-2 sm:gap-3 text-sm">{children}</ul>
    </div>
  );
};

export default FooterColumn;
