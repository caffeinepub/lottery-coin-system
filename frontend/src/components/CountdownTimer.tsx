import React, { useState, useEffect } from 'react';
import { formatTime } from '../utils/validation';

interface CountdownTimerProps {
  targetTime: bigint;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(targetTime: bigint): TimeLeft {
  const target = formatTime(targetTime).getTime();
  const now = Date.now();
  const total = target - now;

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((total % (1000 * 60)) / 1000),
    total,
  };
}

export default function CountdownTimer({ targetTime, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  if (timeLeft.total <= 0) {
    return <span className={`text-muted-foreground text-sm ${className}`}>Draw Completed</span>;
  }

  const isUrgent = timeLeft.total < 3600000; // less than 1 hour

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className={`flex items-center gap-1 text-sm font-mono ${isUrgent ? 'text-destructive' : 'text-gold'} ${className}`}>
      {timeLeft.days > 0 && (
        <>
          <span className="font-bold">{timeLeft.days}d</span>
          <span className="opacity-50">:</span>
        </>
      )}
      <span className="font-bold">{pad(timeLeft.hours)}h</span>
      <span className="opacity-50">:</span>
      <span className="font-bold">{pad(timeLeft.minutes)}m</span>
      <span className="opacity-50">:</span>
      <span className="font-bold">{pad(timeLeft.seconds)}s</span>
    </div>
  );
}
