import React, { useState } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Coins, Menu, X, Trophy, Ticket, History, Plus, ArrowDownCircle, LayoutDashboard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { userProfile, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    window.location.href = '/';
  };

  const navLinks = isAuthenticated
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
        { href: '/lotteries', label: 'Lotteries', icon: <Trophy size={16} /> },
        { href: '/my-tickets', label: 'My Tickets', icon: <Ticket size={16} /> },
        { href: '/transactions', label: 'Transactions', icon: <History size={16} /> },
        { href: '/add-balance', label: 'Add Balance', icon: <Plus size={16} /> },
        { href: '/withdraw', label: 'Withdraw', icon: <ArrowDownCircle size={16} /> },
      ]
    : [
        { href: '/lotteries', label: 'Lotteries', icon: <Trophy size={16} /> },
      ];

  const isAdmin = isAuthenticated && userProfile?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/assets/generated/gold-coin.dim_128x128.png" alt="Logo" className="w-8 h-8 rounded-full" />
            <span className="text-xl font-bold text-primary tracking-tight">LuckyCoins</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {link.icon}
                {link.label}
              </a>
            ))}
            {isAdmin && (
              <a
                href="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors border border-amber-400/30 hover:border-amber-300/50"
              >
                <Shield size={16} />
                Admin Panel
              </a>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated && userProfile && (
              <div className="hidden sm:flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
                <Coins size={16} className="text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {Number(userProfile.coinsBalance).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground hidden lg:inline">| {userProfile.name}</span>
              </div>
            )}

            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex border-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
              >
                Logout
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="hidden sm:flex bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : 'Login'}
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.icon}
                {link.label}
              </a>
            ))}
            {isAdmin && (
              <a
                href="/admin/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors border border-amber-400/30"
                onClick={() => setMobileOpen(false)}
              >
                <Shield size={16} />
                Admin Panel
              </a>
            )}
            <div className="pt-2 border-t border-border">
              {isAuthenticated && userProfile && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-primary font-medium">
                  <Coins size={16} />
                  {Number(userProfile.coinsBalance).toLocaleString()} coins
                  <span className="text-muted-foreground">· {userProfile.name}</span>
                </div>
              )}
              {isAuthenticated ? (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => { handleLogin(); setMobileOpen(false); }}
                  disabled={isLoggingIn}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors font-medium disabled:opacity-50"
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
