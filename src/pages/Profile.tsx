import { LogOut, User as UserIcon, Mail, ShoppingBag, Shield, Clock, Award, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
                onClick={() => navigate('/')}
                className="h-9 w-9 rounded-lg hover:bg-primary/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <img src="/images/logo.png" alt="RushCart" className="h-8 w-auto" />
                <div>
                  <h1 className="font-bold text-foreground text-base">Profile</h1>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-3 space-y-3 max-w-2xl mx-auto">
        {/* User Profile Card */}
        <Card className="p-6 shadow-lg rounded-2xl bg-gradient-to-br from-card to-card/50 border-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-md">
              <UserIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-xl text-foreground mb-1">Welcome Back!</h2>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
          </div>
          
          {/* Member Badge */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Premium Member</p>
                <p className="text-xs text-muted-foreground">Fast checkout enabled</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/30">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Quick Scan</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Self-checkout shopping</p>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/30">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Secure Pay</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Protected payments</p>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/30">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Save Time</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Skip the queues</p>
          </Card>

          <Card 
            onClick={() => navigate('/orders')}
            className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">My Orders</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">View history →</p>
          </Card>
        </div>

        {/* App Info Card */}
        <Card className="p-5 bg-gradient-to-r from-secondary/50 to-secondary/30 border-dashed border-2">
          <div className="flex items-start gap-4">
            <img src="/images/logo.png" alt="RushCart" className="h-12 w-auto" />
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">RushCart Mall</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Experience the future of shopping with our self-checkout technology. Fast, secure, and hassle-free.
              </p>
            </div>
          </div>
        </Card>

        {/* Sign Out Button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full h-14 text-destructive border-2 border-destructive/30 hover:bg-destructive/10 font-semibold"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
