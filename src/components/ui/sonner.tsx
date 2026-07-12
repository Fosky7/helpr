import { Toaster } from 'sonner';

const SonnerToaster = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'rounded-xl border border-primary/20 bg-card/90 text-foreground shadow-xl shadow-primary/10 backdrop-blur',
        success: { className: 'border-green-500/20 bg-green-500/10' },
        error: { className: 'border-destructive/40 bg-destructive/10' },
      }}
    />
  );
};

export { SonnerToaster };
