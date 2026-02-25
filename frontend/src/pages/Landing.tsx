import React from 'react';
import { Trophy, Coins, Ticket, Shield, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: "url('/assets/generated/hero-bg.dim_1440x900.png')" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img
                src="/assets/generated/gold-coin.dim_128x128.png"
                alt="LuckyCoins"
                className="w-24 h-24 rounded-full shadow-2xl shadow-primary/30 animate-pulse"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight">
              Win Big with{' '}
              <span className="text-primary">LuckyCoins</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              The premier blockchain-powered lottery platform. Buy tickets, win prizes, and experience transparent draws on the Internet Computer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/lotteries">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25">
                  <Trophy className="mr-2" size={20} />
                  Browse Lotteries
                </Button>
              </a>
              <a href="/login">
                <Button size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 text-lg px-8 py-6 rounded-xl">
                  <Coins className="mr-2" size={20} />
                  Get Started
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-card border-y border-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Active Lotteries', value: '10+', icon: <Trophy className="text-primary" size={28} /> },
              { label: 'Total Players', value: '5,000+', icon: <Users className="text-primary" size={28} /> },
              { label: 'Prizes Distributed', value: '₹10L+', icon: <Coins className="text-primary" size={28} /> },
              { label: 'Daily Draws', value: '24/7', icon: <Zap className="text-primary" size={28} /> },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                {stat.icon}
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose LuckyCoins?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built on the Internet Computer for maximum transparency, security, and fairness.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Shield size={40} className="text-primary" />,
              title: 'Blockchain Transparent',
              desc: 'Every draw is recorded on-chain. No manipulation, no hidden fees — just pure fairness.',
            },
            {
              icon: <Zap size={40} className="text-primary" />,
              title: 'Instant Results',
              desc: 'Draw results are published instantly. Winners receive their prizes directly to their wallet.',
            },
            {
              icon: <Ticket size={40} className="text-primary" />,
              title: 'Multiple Lottery Types',
              desc: 'Choose from hourly, daily, and weekly lotteries with varying prize pools and ticket prices.',
            },
            {
              icon: <Coins size={40} className="text-primary" />,
              title: 'Coin Rewards',
              desc: 'Earn bonus coins through referrals, loyalty rewards, and special promotions.',
            },
            {
              icon: <Users size={40} className="text-primary" />,
              title: 'Referral Program',
              desc: 'Invite friends and earn bonus coins for every successful referral.',
            },
            {
              icon: <Trophy size={40} className="text-primary" />,
              title: 'Big Prize Pools',
              desc: 'Compete for massive prize pools that grow with every ticket sold.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-card border border-border rounded-2xl p-8 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Get started in just 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign in with Internet Identity — no passwords, no email required.' },
              { step: '02', title: 'Add Coins', desc: 'Top up your wallet with coins to participate in lotteries.' },
              { step: '03', title: 'Win Prizes', desc: 'Buy tickets, wait for the draw, and collect your winnings instantly.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-3xl p-12">
          <img
            src="/assets/generated/lottery-ticket.dim_400x200.png"
            alt="Lottery Ticket"
            className="w-48 mx-auto mb-6 rounded-xl opacity-80"
          />
          <h2 className="text-4xl font-bold text-foreground mb-4">Ready to Win?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join thousands of players and try your luck today. Your next big win could be just one ticket away.
          </p>
          <a href="/lotteries">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-10 py-6 rounded-xl shadow-lg shadow-primary/25">
              <Trophy className="mr-2" size={20} />
              Start Playing Now
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="/assets/generated/gold-coin.dim_128x128.png" alt="LuckyCoins" className="w-6 h-6 rounded-full" />
            <span className="font-bold text-primary">LuckyCoins</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} LuckyCoins. Built with{' '}
            <span className="text-red-400">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'luckycoins')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
