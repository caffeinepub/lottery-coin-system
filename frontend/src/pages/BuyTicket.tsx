import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Ticket, Zap, AlertTriangle, CheckCircle, Loader2, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  useGetLotteryPool,
  useGetLotteryLiveStats,
  useListTicketsForPool,
  useBuyTicket,
  useGetCallerUserProfile,
  useGetActivePromotions,
} from '../hooks/useQueries';
import { formatCoins, drawIntervalLabel } from '../lib/utils';

function getDigitCount(drawInterval: any): number {
  if (!drawInterval) return 6;
  const key = typeof drawInterval === 'object' ? Object.keys(drawInterval)[0] : drawInterval;
  switch (key) {
    case 'h1': case 'h3': case 'h5': case 'h12': return 6;
    case 'daily': return 9;
    case 'weekly': return 12;
    default: return 6;
  }
}

function getDigitLabel(drawInterval: any): string {
  const count = getDigitCount(drawInterval);
  const key = typeof drawInterval === 'object' ? Object.keys(drawInterval)[0] : drawInterval;
  const intervalLabel = drawIntervalLabel(key);
  return `${count}-Digit ${intervalLabel} Draw`;
}

function getApplicablePromo(promotions: any[], _lotteryId: string) {
  if (!promotions) return null;
  const nowNs = Date.now() * 1_000_000;
  return promotions.find((p: any) => {
    if (!p.isActive) return false;
    const start = typeof p.startTime === 'bigint' ? Number(p.startTime) : p.startTime;
    if (nowNs < start) return false;
    if (p.endTime?.[0]) {
      const end = typeof p.endTime[0] === 'bigint' ? Number(p.endTime[0]) : p.endTime[0];
      if (nowNs > end) return false;
    }
    const key = typeof p.promoType === 'object' ? Object.keys(p.promoType)[0] : p.promoType;
    return ['firstUserDiscount', 'limitedDiscount', 'cashback', 'festivalCampaign'].includes(key);
  }) ?? null;
}

export default function BuyTicket() {
  // Use the correct route param path registered in App.tsx
  const { id: lotteryId } = useParams({ from: '/lotteries/$id/buy' });
  const navigate = useNavigate();

  const { data: lottery, isLoading: lotteryLoading } = useGetLotteryPool(lotteryId);
  const { data: liveStats } = useGetLotteryLiveStats(lotteryId);
  const { data: myTickets } = useListTicketsForPool(lotteryId);
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: activePromotions } = useGetActivePromotions();
  const buyTicketMutation = useBuyTicket();

  const digitCount = getDigitCount(lottery?.drawInterval);
  const [ticketNumber, setTicketNumber] = useState('');

  const applicablePromo = getApplicablePromo(activePromotions || [], lotteryId);
  const discountPercent = applicablePromo?.discountPercent?.[0]
    ? Number(applicablePromo.discountPercent[0])
    : 0;
  const originalPrice = lottery ? Number(lottery.ticketPrice) : 0;
  const discountedPrice = discountPercent > 0
    ? Math.floor(originalPrice * (100 - discountPercent) / 100)
    : originalPrice;

  const ticketsSold = liveStats ? Number(liveStats.ticketsSold) : Number(lottery?.totalTicketsSold || 0);
  const maxTickets = lottery ? Number(lottery.maxTickets) : 0;
  const remainingTickets = liveStats
    ? Number(liveStats.remainingTickets)
    : maxTickets - ticketsSold;

  const myTicketCount = myTickets?.length || 0;
  const maxPerUser = lottery ? Number(lottery.ticketsPerUserMax) : 0;
  const fillPercent = maxTickets > 0 ? Math.round((ticketsSold / maxTickets) * 100) : 0;

  const isAtLimit = maxPerUser > 0 && myTicketCount >= maxPerUser;
  const isNearLimit = maxPerUser > 0 && myTicketCount >= maxPerUser - 2 && !isAtLimit;
  const isPoolFull = remainingTickets <= 0;
  const hasInsufficientBalance = userProfile
    ? Number(userProfile.coinsBalance) < discountedPrice
    : false;
  const isBlocked = userProfile?.isBlocked ?? false;

  const handleAutoGenerate = () => {
    const digits = Array.from({ length: digitCount }, () =>
      Math.floor(Math.random() * 10).toString()
    );
    setTicketNumber(digits.join(''));
  };

  const handleBuy = async () => {
    if (!ticketNumber || ticketNumber.length !== digitCount) {
      toast.error(`Please enter a valid ${digitCount}-digit number`);
      return;
    }
    const num = parseInt(ticketNumber, 10);
    if (isNaN(num)) {
      toast.error('Invalid ticket number');
      return;
    }
    try {
      await buyTicketMutation.mutateAsync({ poolId: lotteryId, ticketNumber: num });
      toast.success('Ticket purchased successfully!');
      setTicketNumber('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to purchase ticket');
    }
  };

  if (lotteryLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-48 bg-muted rounded-2xl" />
          <div className="h-32 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!lottery) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground mb-4">Lottery not found.</p>
        <Button variant="outline" onClick={() => navigate({ to: '/lotteries' })}>
          Back to Lotteries
        </Button>
      </div>
    );
  }

  const intervalKey = lottery.drawInterval
    ? typeof lottery.drawInterval === 'object'
      ? Object.keys(lottery.drawInterval)[0]
      : lottery.drawInterval
    : 'daily';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/lotteries' })} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Lotteries
      </Button>

      {/* Lottery Info */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{lottery.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">{lottery.description}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
            {drawIntervalLabel(intervalKey)}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Hash className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{getDigitLabel(lottery.drawInterval)}</span>
        </div>

        {/* Pool fill */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{ticketsSold} / {maxTickets} tickets sold</span>
            <span>{fillPercent}% filled</span>
          </div>
          <Progress value={fillPercent} className="h-2" />
        </div>

        {/* Price */}
        <div className="mt-4 flex items-center gap-3">
          <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2">
            {discountPercent > 0 ? (
              <div>
                <span className="text-xs text-muted-foreground line-through">{formatCoins(originalPrice)}</span>
                <span className="text-lg font-bold text-primary ml-2">{formatCoins(discountedPrice)}</span>
                <span className="text-xs text-green-400 ml-1">-{discountPercent}%</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-primary">{formatCoins(originalPrice)} per ticket</span>
            )}
          </div>
          {applicablePromo && (
            <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-2 py-1">
              🎉 Promo applied!
            </span>
          )}
        </div>
      </div>

      {/* Warnings */}
      {isBlocked && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">Your account is blocked. You cannot purchase tickets.</p>
        </div>
      )}
      {isPoolFull && !isBlocked && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">This lottery pool is full. No more tickets available.</p>
        </div>
      )}
      {isAtLimit && !isPoolFull && !isBlocked && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">You've reached the maximum tickets per user ({maxPerUser}) for this lottery.</p>
        </div>
      )}
      {isNearLimit && !isAtLimit && !isBlocked && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-500">
            You're near the ticket limit. {maxPerUser - myTicketCount} ticket(s) remaining.
          </p>
        </div>
      )}
      {hasInsufficientBalance && !isBlocked && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="text-sm text-destructive">Insufficient balance. You need {formatCoins(discountedPrice)} coins.</p>
            <a href="/add-balance" className="text-xs text-primary hover:underline mt-1 block">Add balance →</a>
          </div>
        </div>
      )}

      {/* Ticket Number Input */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Choose Your Number</h2>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
            {myTicketCount}/{maxPerUser > 0 ? maxPerUser : '∞'} tickets
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={digitCount}
            value={ticketNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, digitCount);
              setTicketNumber(val);
            }}
            placeholder={`Enter ${digitCount}-digit number`}
            className="flex-1 h-12 rounded-xl border border-border bg-background text-foreground px-4 text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAutoGenerate}
            className="h-12 px-4 border-border text-muted-foreground hover:text-foreground"
          >
            <Zap className="w-4 h-4 mr-1" />
            Auto
          </Button>
        </div>

        {ticketNumber.length > 0 && ticketNumber.length < digitCount && (
          <p className="text-xs text-muted-foreground">
            {digitCount - ticketNumber.length} more digit(s) needed
          </p>
        )}
        {ticketNumber.length === digitCount && (
          <p className="text-xs text-green-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Valid {digitCount}-digit number
          </p>
        )}

        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base"
          onClick={handleBuy}
          disabled={
            buyTicketMutation.isPending ||
            ticketNumber.length !== digitCount ||
            isAtLimit ||
            isPoolFull ||
            hasInsufficientBalance ||
            isBlocked
          }
        >
          {buyTicketMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Purchasing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Buy Ticket — {formatCoins(discountedPrice)}
            </span>
          )}
        </Button>
      </div>

      {/* My tickets for this lottery */}
      {myTickets && myTickets.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-3">Your Tickets</h2>
          <div className="space-y-2">
            {myTickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm font-medium">
                    #{String(Number(t.ticketNumber)).padStart(digitCount, '0')}
                  </span>
                </div>
                {t.isWinner && (
                  <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">
                    🏆 Winner +{formatCoins(Number(t.prizeAmount))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
