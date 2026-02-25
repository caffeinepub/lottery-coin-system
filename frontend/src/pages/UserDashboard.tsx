import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useListActiveLotteryPools, useListMyTransactions } from '@/hooks/useQueries';
import { Coins, Trophy, History, Plus, ArrowDownCircle, Ticket } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCoins } from '@/lib/utils';

export default function UserDashboard() {
  const { userProfile, isLoading: authLoading } = useAuth();
  const { data: activeLotteries, isLoading: lotteriesLoading } = useListActiveLotteryPools();
  const { data: transactions, isLoading: txLoading } = useListMyTransactions();

  const isLoading = authLoading || lotteriesLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {isLoading ? <Skeleton className="inline-block w-32 h-8" /> : (userProfile?.name || 'Player')}!
        </h1>
        <p className="text-muted-foreground mt-1">Here's your account overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Balance */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm">Coin Balance</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Coins size={20} className="text-primary" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold text-primary">
              {formatCoins(Number(userProfile?.coinsBalance || 0))}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <a href="/add-balance">
              <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary/10">
                <Plus size={12} className="mr-1" /> Add
              </Button>
            </a>
            <a href="/withdraw">
              <Button size="sm" variant="outline" className="text-xs border-border text-muted-foreground hover:bg-accent">
                <ArrowDownCircle size={12} className="mr-1" /> Withdraw
              </Button>
            </a>
          </div>
        </div>

        {/* Active Lotteries */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm">Active Lotteries</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy size={20} className="text-primary" />
            </div>
          </div>
          {lotteriesLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold text-foreground">{activeLotteries?.length || 0}</div>
          )}
          <a href="/lotteries" className="text-xs text-primary hover:underline mt-2 block">
            Browse all →
          </a>
        </div>

        {/* My Tickets */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm">My Tickets</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Ticket size={20} className="text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">—</div>
          <a href="/my-tickets" className="text-xs text-primary hover:underline mt-2 block">
            View tickets →
          </a>
        </div>

        {/* Transactions */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm">Transactions</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <History size={20} className="text-primary" />
            </div>
          </div>
          {txLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold text-foreground">{transactions?.length || 0}</div>
          )}
          <a href="/transactions" className="text-xs text-primary hover:underline mt-2 block">
            View history →
          </a>
        </div>
      </div>

      {/* Recent Lotteries */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Active Lotteries</h2>
            <a href="/lotteries" className="text-sm text-primary hover:underline">View all</a>
          </div>
          {lotteriesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : activeLotteries && activeLotteries.length > 0 ? (
            <div className="space-y-3">
              {activeLotteries.slice(0, 4).map((lottery) => (
                <div key={lottery.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                  <div>
                    <div className="font-medium text-foreground text-sm">{lottery.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {Number(lottery.totalTicketsSold)}/{Number(lottery.maxTickets)} tickets sold
                    </div>
                  </div>
                  <a href={`/lotteries/${lottery.id}/buy`}>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
                      Buy Ticket
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No active lotteries</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Recent Transactions</h2>
            <a href="/transactions" className="text-sm text-primary hover:underline">View all</a>
          </div>
          {txLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx) => {
                const type = Object.keys(tx.transactionType)[0] || 'unknown';
                const isCredit = ['add_balance', 'win', 'adminBonus', 'referralBonus', 'cashback', 'loyaltyReward', 'festivalCampaign', 'firstUserDiscount'].includes(type);
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                    <div>
                      <div className="font-medium text-foreground text-sm capitalize">{type.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-muted-foreground">{tx.description}</div>
                    </div>
                    <div className={`font-bold text-sm ${isCredit ? 'text-green-500' : 'text-red-400'}`}>
                      {isCredit ? '+' : '-'}{formatCoins(Number(tx.amount))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
