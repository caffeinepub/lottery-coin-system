import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Trophy, ArrowLeft, Hash, Users, Coins, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetDrawResult, useGetLotteryPool, type WinnerRecord } from '../hooks/useQueries';
import { formatCoins, formatDate } from '../lib/utils';

function getRankStyle(rank: number) {
  switch (rank) {
    case 1: return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500';
    case 2: return 'bg-gray-400/20 border-gray-400/40 text-gray-400';
    case 3: return 'bg-amber-700/20 border-amber-700/40 text-amber-700';
    default: return 'bg-muted border-border text-muted-foreground';
  }
}

function getRankLabel(rank: number) {
  switch (rank) {
    case 1: return '🥇 1st';
    case 2: return '🥈 2nd';
    case 3: return '🥉 3rd';
    default: return `#${rank}`;
  }
}

export default function DrawResults() {
  const { lotteryId } = useParams({ from: '/results/$lotteryId' });
  const navigate = useNavigate();

  const { data: drawResult, isLoading: resultLoading } = useGetDrawResult(lotteryId);
  const { data: lottery, isLoading: lotteryLoading } = useGetLotteryPool(lotteryId);

  const isLoading = resultLoading || lotteryLoading;

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </main>
    );
  }

  if (!drawResult) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 text-center space-y-4">
        <p className="text-muted-foreground">No draw results found for this lottery.</p>
        <Button variant="outline" onClick={() => navigate({ to: '/lotteries' })}>
          Back to Lotteries
        </Button>
      </main>
    );
  }

  const winningNum = Number(drawResult.winningNumber);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/lotteries' })} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Lotteries
      </Button>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-1">{lottery?.name || 'Lottery'} Results</h1>
        <p className="text-muted-foreground text-sm mb-4">Draw completed</p>

        {/* Winning Number */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-xl px-6 py-3">
          <Hash className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">Winning Number:</span>
          <span className="text-2xl font-bold text-primary tracking-widest">
            {String(winningNum).padStart(6, '0')}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Users className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Total Tickets</p>
          <p className="font-bold">{Number(drawResult.totalTickets)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Coins className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Prize Distributed</p>
          <p className="font-bold text-primary">{formatCoins(Number(drawResult.totalPrizeDistributed))}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Draw Time</p>
          <p className="font-bold text-sm">{formatDate(drawResult.drawTime)}</p>
        </div>
      </div>

      {/* Winners */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Winners
        </h2>
        {!drawResult.winners || drawResult.winners.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No winners for this draw.</p>
        ) : (
          <div className="space-y-3">
            {drawResult.winners.map((winner: WinnerRecord, idx: number) => {
              const rankNum = Number(winner.rank);
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-xl border ${getRankStyle(rankNum)}`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getRankStyle(rankNum)}>
                      {getRankLabel(rankNum)}
                    </Badge>
                    <div>
                      <p className="font-semibold text-sm">{winner.username}</p>
                      <p className="text-xs opacity-70">
                        Ticket #{Number(winner.ticketNumber)}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold">+{formatCoins(Number(winner.prizeAmount))}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
