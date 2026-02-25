import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Eye, EyeOff, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLogin() {
  const { adminLogin, isAdmin } = useAuth();

  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAdmin) {
      window.location.href = '/admin/dashboard';
    }
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim() || !password.trim()) {
      setError('Please enter both Admin ID and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await adminLogin(adminId.trim(), password);
      if (result.success) {
        window.location.href = '/admin/dashboard';
      } else {
        setError(result.error || 'Invalid admin credentials');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-amber-400/20 rounded-2xl p-8 shadow-xl shadow-amber-400/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center shadow-lg shadow-amber-400/10">
                <Shield size={32} className="text-amber-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Admin Portal</h1>
            <p className="text-muted-foreground text-sm">
              Restricted access — authorized administrators only
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Admin ID */}
            <div className="space-y-2">
              <Label htmlFor="adminId" className="text-sm font-medium text-foreground">
                Admin ID
              </Label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="adminId"
                  type="text"
                  value={adminId}
                  onChange={(e) => { setAdminId(e.target.value); setError(null); }}
                  placeholder="Enter admin ID"
                  className="pl-9 bg-background border-border focus:border-amber-400/50 focus:ring-amber-400/20"
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="Enter admin password"
                  className="pl-9 pr-10 bg-background border-border focus:border-amber-400/50 focus:ring-amber-400/20"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <Shield size={14} className="text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-5 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Verifying credentials...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield size={16} />
                  Sign In as Admin
                </span>
              )}
            </Button>
          </form>

          {/* Security notice */}
          <div className="mt-6 p-3 bg-amber-400/5 border border-amber-400/15 rounded-xl">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              🔒 This portal is monitored. Unauthorized access attempts are logged and may result in legal action.
            </p>
          </div>

          {/* Back to user login */}
          <div className="mt-5 text-center">
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              Back to User Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
