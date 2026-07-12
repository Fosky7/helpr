import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function CampaignNewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    const goal = Number(goalAmount);
    if (!goalAmount.trim() || !Number.isFinite(goal) || goal <= 0) {
      newErrors.goalAmount = 'Goal must be a positive number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user?.id) {
      setApiError('You must be signed in to create a campaign.');
      return;
    }

    setSubmitting(true);
    setApiError('');

    const now = new Date().toISOString();
    const payload = {
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      goal_amount: Number(goalAmount),
      status: 'draft',
      current_amount: 0,
      created_at: now,
      updated_at: now,
    };

    const { error } = await supabase.from('campaigns').insert(payload);

    setSubmitting(false);

    if (error) {
      setApiError(error.message);
      toast.error(error.message);
      return;
    }

    toast.success('Campaign draft created!');
    navigate('/campaigns');
  };

  return (
    <AppShell centered maxWidthClassName="max-w-md" aria-label="Create campaign">
      <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="relative border-b border-primary/20 bg-gradient-to-br from-primary/15 via-accent/30 to-card p-6">
          <CardTitle className="text-2xl tracking-tight">Create a Campaign</CardTitle>
          <CardDescription>
            Start a new fundraiser with a title, brief description, and goal amount.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Community art studio fundraiser"
                disabled={submitting}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell supporters what this campaign funds in one or two sentences."
                rows={4}
                disabled={submitting}
                className={`min-h-24 w-full rounded-xl border bg-background/75 px-3.5 py-3 text-sm shadow-sm outline-none transition-all ${
                  errors.description ? 'border-destructive' : 'border-primary/15'
                }`}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalAmount">Goal Amount (USD)</Label>
              <Input
                id="goalAmount"
                type="number"
                inputMode="decimal"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="5000"
                disabled={submitting}
                className={errors.goalAmount ? 'border-destructive' : ''}
              />
              {errors.goalAmount && <p className="text-xs text-destructive">{errors.goalAmount}</p>}
            </div>
            {apiError && <p className="text-sm text-destructive">{apiError}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-primary/20 bg-muted/20 p-6">
            <Button type="submit" className="w-full rounded-xl shadow-lg shadow-primary/20" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Draft Campaign'}
            </Button>
            <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => navigate('/campaigns')}>
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AppShell>
  );
}
