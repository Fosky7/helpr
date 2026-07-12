import { Link } from 'react-router-dom';

interface FooterBottomProps {
  /** Optional override for the copyright year */
  year?: number;
}

/**
 * Bottom section of the footer with copyright and legal links.
 * Uses the app's glassmorphism design tokens.
 */
const FooterBottom = ({ year }: FooterBottomProps) => {
  const currentYear = year ?? new Date().getFullYear();

  return (
    <div className="mt-8 border-t border-primary/20 pt-5">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          &copy; {currentYear} Renderr. All rights reserved.
        </p>
        <nav aria-label="Legal links" className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
          <Link
            to="/terms"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Terms of Service
          </Link>
          <Link
            to="/privacy"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
          <a
            href="mailto:hello@renderr.app"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Contact
          </a>
        </nav>
      </div>
    </div>
  );
};

export default FooterBottom;
