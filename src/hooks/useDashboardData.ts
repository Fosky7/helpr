import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { listMyCampaigns } from '@/lib/campaigns';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

interface DashboardData {
  profile: Profile | null;
  profileLoading: boolean;
  profileError: boolean;
  campaignCount: number | null;
  campaignCountLoading: boolean;
  campaignCountError: boolean;
  refresh: () => void;
}

export function useDashboardData(userId: string | undefined): DashboardData {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [campaignCount, setCampaignCount] = useState<number | null>(null);
  const [campaignCountLoading, setCampaignCountLoading] = useState(true);
  const [campaignCountError, setCampaignCountError] = useState(false);
  const mountedRef = useRef(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfileLoading(false);
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    setProfileError(false);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();
      if (!mountedRef.current) return;
      if (error) {
        setProfileError(true);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      if (mountedRef.current) {
        setProfileError(true);
      }
    } finally {
      if (mountedRef.current) setProfileLoading(false);
    }
  }, [userId]);

  const fetchCampaignCount = useCallback(async () => {
    if (!userId) {
      setCampaignCount(null);
      setCampaignCountLoading(false);
      setCampaignCountError(false);
      return;
    }
    setCampaignCountLoading(true);
    setCampaignCountError(false);
    try {
      const { data, error } = await listMyCampaigns(userId, {
        limit: 100,
        sortBy: 'updated_at',
        sortDirection: 'desc',
      });
      if (!mountedRef.current) return;
      if (error) {
        setCampaignCount(null);
        setCampaignCountError(true);
      } else {
        setCampaignCount(data?.length ?? 0);
      }
    } catch (err) {
      if (mountedRef.current) {
        setCampaignCount(null);
        setCampaignCountError(true);
      }
    } finally {
      if (mountedRef.current) setCampaignCountLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(() => {
    fetchProfile();
    fetchCampaignCount();
  }, [fetchProfile, fetchCampaignCount]);

  useEffect(() => {
    mountedRef.current = true;
    fetchProfile();
    fetchCampaignCount();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchProfile, fetchCampaignCount]);

  return {
    profile,
    profileLoading,
    profileError,
    campaignCount,
    campaignCountLoading,
    campaignCountError,
    refresh,
  };
}