import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import CampaignStatusBadge, { type CampaignStatus } from '@/components/campaigns/CampaignStatusBadge';
import { Button } from '@/components/ui/button';

export interface ManagedCampaign {
  id: string;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  goal_amount?: number | null;
  cover_image_url?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  published_at?: string | null;
  archived_at?: string | null;
  story?: string | null;
  user_id?: string | null;
}

interface CampaignCardProps {
  campaign: ManagedCampaign;
}

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value ?? 0);

const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const status: CampaignStatus = (campaign.status as CampaignStatus) || 'draft';

  return (
    <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur transition-colors hover:border-primary/40">
      <CardHeader className="relative border-b border-primary/20 bg-gradient-to-br from-primary/15 via-accent/25 to-card p-5">
        <div className="absolute right-4 top-4">
          <CampaignStatusBadge status={status} />
        </div>
        <CardTitle className="text-lg font-semibold tracking-tight line-clamp-2">
          {campaign.title || 'Untitled Campaign'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <p className="text-sm leading-6 text-muted-foreground line-clamp-3">
          {campaign.description || 'No description provided.'}
        </p>
        {campaign.goal_amount != null && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Goal</p>
            <p className="mt-1 text-xl font-bold text-primary">{formatCurrency(campaign.goal_amount)}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-primary/20 bg-muted/20 p-4">
        <Button asChild variant="outline" className="w-full rounded-xl bg-background/70">
          <Link to={`/campaigns/${campaign.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;
