import { Clock, Ticket, TrendingUp, Trophy, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGetLotteryLiveStats } from '../hooks/useQueries';
import { formatCoins, formatTimeRemaining, drawIntervalLabel, drawIntervalColor } from '../lib/utils';

interface LotteryCardProps {
  lottery: any;
}

function getDigitBadge(drawInterval: any): { label: string; color: string } {
  if (!drawInterval) return { label: '6-Digit', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  const key = typeof drawInterval === 'object' ? Object.keys(drawInterval)[0] : drawInterval;
  switch (key) {
    case 'h1':
    case 'h3':
    case 'h5':
    case 'h12':
      return { label: '6-Digit', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    case 'daily':
      return { label: '9-Digit', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    case 'weekly':
      return { label: '12-Digit', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    default:
      return { label: '6-Digit', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  }
}

export default function LotteryCard({ lottery }: LotteryCardProps) {
  const { data: liveStats } = useGetLotteryLiveStats(lottery.id);

  const ticketsSold = liveStats ? Number(liveStats.ticketsSold) : Number(lottery.totalTicketsSold || 0);
  const maxTickets = Number(lottery.maxTickets || 0);
  const totalPoolAmount = liveStats ? Number(liveStats.totalPoolAmount) : Number(lottery.totalPoolAmount || 0);
  const drawTime = liveStats ? liveStats.drawTime : lottery.drawTime;
  const currentStatus = liveStats ? liveStats.currentStatus : lottery.status;

  const fillPercent = maxTickets > 0 ? Math.round((ticketsSold / maxTickets) * 100) : 0;

  const isCompleted = currentStatus && (
    typeof currentStatus === 'object'
      ? 'completed' in currentStatus
      : currentStatus === 'completed'
  );

  const intervalKey = lottery.drawInterval
    ? typeof lottery.drawInterval === 'object'
      ? Object.keys(lottery.drawInterval)[0]
      : lottery.drawInterval
    : 'daily';

  const digitBadge = getDigitBadge(lottery.drawInterval);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-bold text-lg text-foreground leading-tight">{lottery.name}</h3>
          <div className="flex flex-col gap-1 items-end shrink-0">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${drawIntervalColor(intervalKey)}`}>
              {drawIntervalLabel(intervalKey)}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${digitBadge.color}`}>
              <Hash className="w-3 h-3" />
              {digitBadge.label}
            </span>
          </div>
        </div>

        {lottery.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{lottery.description}</p>
        )}

        {/* Prize Pool */}
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Prize Pool:</span>
          <span className="font-bold text-primary">{formatCoins(totalPoolAmount)}</span>
        </div>

        {/* Ticket Price */}
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Ticket Price:</span>
          <span className="font-semibold text-foreground">{formatCoins(Number(lottery.ticketPrice || 0))}</span>
        </div>

        {/* Draw Time */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Draw in:</span>
          <span className="font-semibold text-foreground">{formatTimeRemaining(drawTime)}</span>
        </div>

        {/* Pool Fill Progress */}
        <div className="mb-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {ticketsSold} / {maxTickets} tickets
            </span>
            <span>{fillPercent}% filled</span>
          </div>
          <Progress value={fillPercent} className="h-2" />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5">
        {isCompleted ? (
          <a href={`/results/${lottery.id}`}>
            <Button variant="outline" className="w-full">
              <Trophy className="w-4 h-4 mr-2" />
              View Results
            </Button>
          </a>
        ) : (
          <a href={`/lotteries/${lottery.id}/buy`}>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Ticket className="w-4 h-4 mr-2" />
              Buy Ticket
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
