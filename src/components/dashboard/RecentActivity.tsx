import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Plus, Eye, AlertCircle } from 'lucide-react';

interface CampaignAction {
  id: string;
  title: string | null;
  status: string | null;
  updated_at: string | null;
  created_at: string | null;
  published_at: string | null;
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function getActionIcon(status: string | null, createdAt: string | null, updatedAt: string | null) {
  if (status === 'published') {
    return <Eye className="h-4 w-4 text-green-500" />;
  } else if (createdAt === updatedAt) {
    return <Plus className="h-4 w-4 text-blue-500" />;
  } else {
    return <Edit className="h-4 w-4 text-yellow-500" />;
  }
}

function getActionLabel(status: string | null, createdAt: string | null, updatedAt: string | null): string {
  if (status === 'published') return 'Published';
  if (createdAt === updatedAt) return 'Created';
  return 'Updated';
}

interface RecentActivityProps {
  userId: string | undefined;
}

export default function RecentActivity({ userId }: RecentActivityProps) {
  const [actions, setActions] = useState<CampaignAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const fetchRecent = async () => {
      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('id, title, status, updated_at, created_at, published_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (!mountedRef.current) return;

      if (fetchError) {
        setError('Failed to load recent activity.');
        setActions([]);
      } else {
        setActions(data as CampaignAction[]);
      }
      setLoading(false);
    };

    fetchRecent();

    return () => {
      mountedRef.current = false;
    };
  }, [userId]);

  if (!userId) {
    return null;
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-primary/20 bg-card/90 p-5 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
        </div>
        <ul className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
          <div>
            <h3 className="text-sm font-semibold text-destructive">Couldn’t load recent activity</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="rounded-3xl border border-primary/20 bg-card/90 p-5 shadow-sm backdrop-blur">
        <div className="text-center">
          <Edit className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 text-sm font-semibold">No recent activity</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            When you start working on campaigns, they’ll appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-primary/20 bg-card/90 p-5 shadow-sm backdrop-blur">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
        <Edit className="h-5 w-5 text-primary" />
        Recent activity
      </h3>
      <ul className="space-y-4">
        {actions.map((action) => (
          <li key={action.id} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-background/80">
              {getActionIcon(action.status, action.created_at, action.updated_at)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{action.title || 'Untitled campaign'}</p>
              <p className="text-xs text-muted-foreground">
                {getActionLabel(action.status, action.created_at, action.updated_at)} ·{' '}
                {action.updated_at ? getRelativeTime(action.updated_at) : 'Unknown time'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}