import React from 'react';
import FooterWrapper from '@/components/layout/Footer/FooterWrapper';
import FooterColumn from '@/components/layout/Footer/FooterColumn';
import FooterLink from '@/components/layout/Footer/FooterLink';
import SocialLinks from '@/components/layout/Footer/SocialLinks';
import NewsletterForm from '@/components/layout/Footer/NewsletterForm';
import FooterBottom from '@/components/layout/Footer/FooterBottom';

interface FooterLinkData {
  to: string;
  label: string;
}

const productLinks: FooterLinkData[] = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/integrations', label: 'Integrations' },
  { to: '/changelog', label: 'Changelog' },
];

const companyLinks: FooterLinkData[] = [
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/careers', label: 'Careers' },
  { to: '/contact', label: 'Contact' },
];

const legalLinks: FooterLinkData[] = [
  { to: '/terms', label: 'Terms of Service' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/cookies', label: 'Cookie Policy' },
];

const Footer: React.FC = () => {
  return (
    <FooterWrapper>
      <div
        className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-4"
        aria-label="Footer navigation"
      >
        <FooterColumn title="Product">
          {productLinks.map((link) => (
            <li key={link.to}>
              <FooterLink to={link.to}>{link.label}</FooterLink>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Company">
          {companyLinks.map((link) => (
            <li key={link.to}>
              <FooterLink to={link.to}>{link.label}</FooterLink>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Legal">
          {legalLinks.map((link) => (
            <li key={link.to}>
              <FooterLink to={link.to}>{link.label}</FooterLink>
            </li>
          ))}
        </FooterColumn>

        <div className="flex flex-col gap-6">
          <SocialLinks />
          <NewsletterForm />
        </div>
      </div>

      <FooterBottom />
    </FooterWrapper>
  );
};

export default Footer;
