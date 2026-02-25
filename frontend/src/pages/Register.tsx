import React, { useEffect } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useAuth } from '@/contexts/AuthContext';
import { Coins, UserPlus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Register() {
  const { login, loginStatus } = useInternetIdentity();
  const { isAuthenticated } = useAuth();

  const isLoggingIn = loginStatus === 'logging-in';

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  const handleRegister = async () => {
    try {
      await login();
    } catch (err: any) {
      console.error('Register error:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/20">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/assets/generated/gold-coin.dim_128x128.png"
                alt="LuckyCoins"
                className="w-16 h-16 rounded-full shadow-lg shadow-primary/30"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join LuckyCoins and start winning today</p>
          </div>

          <Button
            onClick={handleRegister}
            disabled={isLoggingIn}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg rounded-xl shadow-lg shadow-primary/25"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <UserPlus size={20} />
                Register with Internet Identity
              </span>
            )}
          </Button>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <Shield size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">No passwords needed</span> — Internet Identity uses secure cryptographic keys stored on your device.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <Coins size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Welcome bonus</span> — New accounts receive bonus coins to get started.
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline font-medium">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
