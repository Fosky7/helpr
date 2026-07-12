import React from 'react';
import FooterWrapper from './Footer/FooterWrapper';
import FooterColumn from './Footer/FooterColumn';
import FooterLink from './Footer/FooterLink';
import SocialLinks from './Footer/SocialLinks';
import NewsletterForm from './Footer/NewsletterForm';
import FooterBottom from './Footer/FooterBottom';

const Footer: React.FC = () => {
  return (
    <FooterWrapper>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary">Renderr</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Colorful fundraising for everyone.
          </p>
          <SocialLinks />
        </div>
        <FooterColumn title="Product">
          <FooterLink href="/status">Status</FooterLink>
          <FooterLink href="/campaigns">Campaigns</FooterLink>
        </FooterColumn>
        <FooterColumn title="Company">
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
        </FooterColumn>
      </div>
      <NewsletterForm />
      <FooterBottom />
    </FooterWrapper>
  );
};

export default Footer;
