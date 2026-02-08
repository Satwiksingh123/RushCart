import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Award, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductReport {
  id: string;
  issue_type: string;
  status: 'pending' | 'verified' | 'rejected';
  points_awarded: number;
  created_at: string;
  verified_at: string | null;
  product_id: string;
  description: string | null;
  products?: {
    name: string;
    barcode: string;
    image_url: string | null;
  };
}

const issueTypeLabels: Record<string, string> = {
  expired: '🗓️ Expired Product',
  damaged: '📦 Damaged Packaging',
  quality: '⚠️ Quality Issue',
  mislabeled: '🏷️ Wrong Label',
  other: '❓ Other Issue',
};

const statusConfig = {
  pending: {
    label: 'Under Review',
    icon: Clock,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  verified: {
    label: 'Verified',
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
};

export default function Report() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<ProductReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    totalPoints: 0,
  });

  useEffect(() => {
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_reports')
        .select(`
          *,
          products (
            name,
            barcode,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reportsData = data || [];
      setReports(reportsData);

      // Calculate stats
      setStats({
        total: reportsData.length,
        pending: reportsData.filter((r) => r.status === 'pending').length,
        verified: reportsData.filter((r) => r.status === 'verified').length,
        rejected: reportsData.filter((r) => r.status === 'rejected').length,
        totalPoints: reportsData.reduce((sum, r) => sum + (r.points_awarded || 0), 0),
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40 backdrop-blur-lg bg-card/95">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-9 w-9 rounded-lg hover:bg-primary/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold text-foreground text-base">My Reports</h1>
                <p className="text-xs text-muted-foreground">Product issue reports</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/points')}
              size="sm"
              className="gradient-primary h-9"
            >
              <Award className="w-4 h-4 mr-1" />
              Report New
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Points Earned</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPoints}</p>
              </div>
              <Award className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Status Summary */}
        <Card className="p-3">
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="text-center px-2">
              <p className="text-yellow-500 text-xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="text-center px-2">
              <p className="text-green-500 text-xl font-bold">{stats.verified}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
            <div className="text-center px-2">
              <p className="text-red-500 text-xl font-bold">{stats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </Card>

        {/* Reports List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground text-sm">Recent Reports</h2>

          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-secondary rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-secondary rounded w-1/2 mx-auto"></div>
              </div>
            </Card>
          ) : reports.length === 0 ? (
            <Card className="p-8 text-center bg-gradient-to-br from-secondary/50 to-secondary/30 border-dashed border-2">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-bold text-foreground mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Start reporting product issues to earn points!
              </p>
              <Button onClick={() => navigate('/points')} className="gradient-primary">
                <Award className="w-4 h-4 mr-2" />
                Report First Issue
              </Button>
            </Card>
          ) : (
            reports.map((report) => {
              const StatusIcon = statusConfig[report.status].icon;
              return (
                <Card
                  key={report.id}
                  className={cn(
                    'p-4 hover:shadow-lg transition-all border-2',
                    statusConfig[report.status].border
                  )}
                >
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-secondary/30 overflow-hidden">
                      {report.products?.image_url ? (
                        <img
                          src={report.products.image_url}
                          alt={report.products.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Report Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {report.products?.name || 'Unknown Product'}
                        </h3>
                        <Badge
                          className={cn(
                            'text-xs px-2 py-0.5',
                            statusConfig[report.status].bg,
                            statusConfig[report.status].color
                          )}
                          variant="outline"
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[report.status].label}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        {issueTypeLabels[report.issue_type] || report.issue_type}
                      </p>

                      {report.description && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-2">
                          {report.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {formatDate(report.created_at)}
                        </span>
                        {report.status === 'verified' && report.points_awarded > 0 && (
                          <span className="text-green-600 font-semibold flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            +{report.points_awarded} points
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
