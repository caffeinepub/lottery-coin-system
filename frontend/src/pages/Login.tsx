import React, { useEffect } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useAuth } from '@/contexts/AuthContext';
import { Coins, LogIn, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Login() {
  const { login, loginStatus } = useInternetIdentity();
  const { isAuthenticated } = useAuth();

  const isLoggingIn = loginStatus === 'logging-in';

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (err: any) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/assets/generated/gold-coin.dim_128x128.png"
                alt="LuckyCoins"
                className="w-16 h-16 rounded-full shadow-lg shadow-primary/30"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to access your LuckyCoins account</p>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg rounded-xl shadow-lg shadow-primary/25"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <LogIn size={20} />
                Sign in with Internet Identity
              </span>
            )}
          </Button>

          {/* Info */}
          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <Shield size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Secure & Private</span> — Internet Identity uses cryptographic keys. No passwords or emails required.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <Coins size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">New here?</span> — Signing in for the first time will automatically create your account.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>

          {/* Subtle Admin Portal link */}
          <div className="mt-5 pt-4 border-t border-border/50 text-center">
            <a
              href="/admin/login"
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Admin Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
