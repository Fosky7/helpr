import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

/**
 * Email subscription form with glassmorphism styling.
 * Simulates an API call and shows a success/error toast.
 */
const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success('Subscribed! We\u2019ll keep you updated with the latest Renderr news.');
    setEmail('');
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
    >
      <div className="relative flex-1">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={loading}
          className="h-11 w-full rounded-xl border border-primary/20 bg-card/80 px-4 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Email address for newsletter"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-11 shrink-0 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
      >
        {loading ? 'Joining…' : 'Subscribe'}
      </Button>
    </form>
  );
};

export default NewsletterForm;
