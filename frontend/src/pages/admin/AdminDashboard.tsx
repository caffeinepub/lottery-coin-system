import React from 'react';
import { useGetDashboardStats } from '@/hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Users, Coins, Clock, ArrowRight } from 'lucide-react';
import QuickCreditCoinsCard from '@/components/QuickCreditCoinsCard';

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useGetDashboardStats();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and quick actions</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 text-destructive text-sm">
          Failed to load dashboard stats. Please refresh the page.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Revenue',
            value: isLoading ? null : `${Number(stats?.totalRevenue || 0).toLocaleString()} coins`,
            icon: <Coins size={20} className="text-primary" />,
          },
          {
            label: 'Active Users',
            value: isLoading ? null : Number(stats?.totalActiveUsers || 0).toLocaleString(),
            icon: <Users size={20} className="text-primary" />,
          },
          {
            label: 'Active Lotteries',
            value: isLoading ? null : Number(stats?.activeLotteryPoolsCount || 0).toLocaleString(),
            icon: <Trophy size={20} className="text-primary" />,
          },
          {
            label: 'Pending Approvals',
            value: isLoading ? null : Number(stats?.pendingApprovalsCount || 0).toLocaleString(),
            icon: <Clock size={20} className="text-primary" />,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">{stat.label}</span>
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            {stat.value === null ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
            )}
          </div>
        ))}
      </div>

      {/* Main content grid: Quick Actions + Quick Credit */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/admin/lotteries', label: 'Manage Lotteries', icon: '🎰', desc: 'Create and manage lottery pools' },
              { href: '/admin/balance-requests', label: 'Balance Requests', icon: '💰', desc: 'Approve or reject top-up requests' },
              { href: '/admin/withdrawals', label: 'Withdrawals', icon: '💸', desc: 'Process withdrawal requests' },
              { href: '/admin/users', label: 'User Management', icon: '👥', desc: 'Manage user accounts and roles' },
              { href: '/admin/promotions', label: 'Promotions', icon: '🎁', desc: 'Create and manage promotions' },
              { href: '/admin/draws', label: 'Draw Declaration', icon: '🎲', desc: 'Declare lottery draw results' },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <div className="font-medium text-foreground text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.desc}</div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Credit Coins */}
        <div className="lg:col-span-1">
          <QuickCreditCoinsCard />
        </div>
      </div>
    </div>
  );
}
