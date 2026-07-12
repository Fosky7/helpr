import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppShell from '@/components/layout/AppShell';
import BrandMark from '@/components/brand/BrandMark';
import ColorfulSectionHeader from '@/components/layout/ColorfulSectionHeader';
import CampaignCard, { type ManagedCampaign } from '@/components/campaigns/CampaignCard';
import CampaignStateCard from '@/components/campaigns/CampaignStateCard';
import { Button } from '@/components/ui/button';

export default function Campaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<ManagedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setCampaigns([]);
    } else {
      setCampaigns((data as ManagedCampaign[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadCampaigns();
  }, [user]);

  return (
    <AppShell maxWidthClassName="max-w-7xl" contentClassName="space-y-8" aria-label="Your campaigns">
      {/* Navigation Header */}
      <header className="flex flex-col gap-4 rounded-3xl border border-primary/20 bg-card/85 p-5 shadow-xl shadow-primary/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          <BrandMark subtitle="Your campaigns" />
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="rounded-xl bg-background/70">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
            <Link to="/campaigns/new">Create Campaign</Link>
          </Button>
        </div>
      </header>

      <ColorfulSectionHeader
        eyebrow="Manage your fundraisers"
        title="Campaign overview"
        description="View, edit, and publish your campaigns from this colorful dashboard. Each card links to its full detail page where you can share and track progress."
      />

      {/* Loading / Error / Empty states */}
      {loading ? (
        <CampaignStateCard variant="loading" title="Loading campaigns" description="Gathering your Renderr campaigns..." />
      ) : error ? (
        <CampaignStateCard variant="error" title="Could not load campaigns" description={error} onRetry={loadCampaigns} />
      ) : campaigns.length === 0 ? (
        <CampaignStateCard
          variant="empty"
          title="No campaigns yet"
          description="You haven't created any campaigns. Start your first Renderr fundraiser to see it here."
          actionLabel="Create a campaign"
          actionTo="/campaigns/new"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
