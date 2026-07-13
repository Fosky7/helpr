import { Link } from 'react-router-dom';

interface BackNavigationProps {
  fallbackTo: string;
  label?: string;
}

const BackNavigation: React.FC<BackNavigationProps> = ({ fallbackTo, label = 'Back' }) => {
  return (
    <Link
      to={fallbackTo}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    >
      ← {label}
    </Link>
  );
};

export default BackNavigation;
