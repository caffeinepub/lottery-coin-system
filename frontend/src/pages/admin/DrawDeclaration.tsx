import React, { useState } from 'react';
import { Trophy, Loader2, Hash, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useListActiveLotteryPools, useGetDrawResult, useDeclareWinner, type WinnerRecord } from '../../hooks/useQueries';
import { formatCoins } from '../../lib/utils';

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
    case 1: return '🥇 1st Place';
    case 2: return '🥈 2nd Place';
    case 3: return '🥉 3rd Place';
    default: return `#${rank}`;
  }
}

interface PrizeBreakdownRowProps {
  label: string;
  value: string;
  highlight?: 'gold' | 'silver' | 'bronze' | 'profit' | 'default';
}

function PrizeBreakdownRow({ label, value, highlight = 'default' }: PrizeBreakdownRowProps) {
  const valueClass =
    highlight === 'gold' ? 'text-yellow-500 font-bold' :
    highlight === 'silver' ? 'text-gray-400 font-bold' :
    highlight === 'bronze' ? 'text-amber-700 font-bold' :
    highlight === 'profit' ? 'text-amber-500 font-bold' :
    'text-foreground font-semibold';

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function DrawDeclaration() {
  const { data: lotteries, isLoading: lotteriesLoading } = useListActiveLotteryPools();
  const declareDraw = useDeclareWinner();

  const [selectedLotteryId, setSelectedLotteryId] = useState('');
  const [winningNumber, setWinningNumber] = useState('');
  const [declaredLotteryId, setDeclaredLotteryId] = useState('');

  const { data: drawResult, isLoading: resultLoading } = useGetDrawResult(declaredLotteryId);

  const handleDeclare = async () => {
    if (!selectedLotteryId) {
      toast.error('Please select a lottery');
      return;
    }
    const num = parseInt(winningNumber);
    if (!winningNumber || isNaN(num)) {
      toast.error('Please enter a valid winning number');
      return;
    }

    try {
      await declareDraw.mutateAsync({ poolId: selectedLotteryId, winningNumber: num });
      toast.success('Draw declared successfully!');
      setDeclaredLotteryId(selectedLotteryId);
      setSelectedLotteryId('');
      setWinningNumber('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to declare draw');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Trophy className="w-7 h-7 text-primary" />
          Declare Draw
        </h1>
        <p className="text-muted-foreground mt-1">Select a lottery and declare the winning number</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div>
          <Label className="text-foreground">Select Lottery *</Label>
          {lotteriesLoading ? (
            <Skeleton className="h-10 mt-1" />
          ) : (
            <Select value={selectedLotteryId} onValueChange={setSelectedLotteryId}>
              <SelectTrigger className="mt-1 bg-background border-border text-foreground">
                <SelectValue placeholder="Choose a lottery pool" />
              </SelectTrigger>
              <SelectContent>
                {(lotteries || []).map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name} ({Number(l.totalTicketsSold)} tickets)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <Label className="text-foreground">Winning Number *</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="number"
              placeholder="Enter winning number"
              value={winningNumber}
              onChange={(e) => setWinningNumber(e.target.value)}
              className="flex-1 bg-background border-border text-foreground"
            />
            <Button
              variant="outline"
              onClick={() => {
                const digits = 6;
                const min = Math.pow(10, digits - 1);
                const max = Math.pow(10, digits) - 1;
                setWinningNumber(String(Math.floor(Math.random() * (max - min + 1)) + min));
              }}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              <Hash className="w-4 h-4 mr-1" />
              Random
            </Button>
          </div>
        </div>

        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleDeclare}
          disabled={declareDraw.isPending || !selectedLotteryId || !winningNumber}
        >
          {declareDraw.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Declaring...</>
          ) : (
            <><Trophy className="w-4 h-4 mr-2" />Declare Draw</>
          )}
        </Button>
      </div>

      {/* Results */}
      {declaredLotteryId && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
            <Trophy className="w-5 h-5 text-primary" />
            Draw Results
          </h2>
          {resultLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : !drawResult ? (
            <p className="text-muted-foreground text-center py-4">No results yet.</p>
          ) : (
            <div className="space-y-4">
              {/* Winning Number */}
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                <Hash className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Winning Number:</span>
                <span className="text-xl font-bold text-primary tracking-widest">
                  {String(Number(drawResult.winningNumber)).padStart(6, '0')}
                </span>
              </div>

              {/* Basic Stats */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-background border border-border rounded-xl p-3 text-center">
                  <p className="text-muted-foreground text-xs">Total Tickets</p>
                  <p className="font-bold text-foreground">{Number(drawResult.totalTickets)}</p>
                </div>
                <div className="bg-background border border-border rounded-xl p-3 text-center">
                  <p className="text-muted-foreground text-xs">Prize Distributed</p>
                  <p className="font-bold text-primary">{formatCoins(Number(drawResult.totalPrizeDistributed))}</p>
                </div>
              </div>

              {/* Prize Distribution Breakdown */}
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Prize Distribution Breakdown</h3>
                </div>
                <div className="space-y-0">
                  {drawResult.systemProfitRetained !== undefined && (
                    <PrizeBreakdownRow
                      label="💰 System Profit Retained"
                      value={`${formatCoins(Number(drawResult.systemProfitRetained))}`}
                      highlight="profit"
                    />
                  )}
                  {drawResult.firstPrizeCredited !== undefined && (
                    <PrizeBreakdownRow
                      label="🥇 1st Place Prize"
                      value={`${formatCoins(Number(drawResult.firstPrizeCredited))}`}
                      highlight="gold"
                    />
                  )}
                  {drawResult.secondPrizeCredited !== undefined && (
                    <PrizeBreakdownRow
                      label="🥈 2nd Place Prize"
                      value={`${formatCoins(Number(drawResult.secondPrizeCredited))}`}
                      highlight="silver"
                    />
                  )}
                  {drawResult.thirdPrizeCredited !== undefined && (
                    <PrizeBreakdownRow
                      label="🥉 3rd Place Prize"
                      value={`${formatCoins(Number(drawResult.thirdPrizeCredited))}`}
                      highlight="bronze"
                    />
                  )}
                  {drawResult.otherWinnersPerPrize !== undefined && Number(drawResult.otherWinnersPerPrize) > 0 && (
                    <PrizeBreakdownRow
                      label="🎖️ Per-winner Prize (4th+)"
                      value={`${formatCoins(Number(drawResult.otherWinnersPerPrize))}`}
                      highlight="default"
                    />
                  )}
                </div>
              </div>

              {/* Winners List */}
              {drawResult.winners && drawResult.winners.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Winners ({drawResult.winners.length})
                  </h3>
                  {drawResult.winners.map((winner: WinnerRecord, idx: number) => {
                    const rankNum = Number(winner.rank);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-xl border ${getRankStyle(rankNum)}`}
                      >
                        <div>
                          <p className="font-semibold text-sm">{getRankLabel(rankNum)}</p>
                          <p className="text-xs opacity-70">{winner.username} — Ticket #{Number(winner.ticketNumber)}</p>
                        </div>
                        <p className="font-bold text-sm">+{formatCoins(Number(winner.prizeAmount))}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {drawResult.winners && drawResult.winners.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No winners for this draw.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
