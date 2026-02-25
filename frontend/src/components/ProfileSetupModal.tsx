import React, { useState } from 'react';
import { useActor } from '@/hooks/useActor';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, AlertCircle } from 'lucide-react';

interface ProfileSetupModalProps {
  onComplete: () => void;
}

export default function ProfileSetupModal({ onComplete }: ProfileSetupModalProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !identity) return;
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const principal = identity.getPrincipal();
      const now = BigInt(Date.now()) * BigInt(1_000_000);

      // First, try to register the user via the backend.
      // The backend's saveCallerUserProfile requires an existing user record.
      // We attempt it and handle the "User record not found" error gracefully.
      await actor.saveCallerUserProfile({
        id: principal.toString(),
        name: name.trim(),
        email: email.trim(),
        coinsBalance: BigInt(0),
        createdAt: now,
        role: 'user',
        isVerified: false,
        isBlocked: false,
        blockedAt: undefined,
        referralCode: '',
      });

      // Success — dismiss modal and refresh profile
      onComplete();
    } catch (err: any) {
      console.error('Profile setup error:', err);
      const msg: string = err?.message || String(err) || '';

      if (
        msg.toLowerCase().includes('user record not found') ||
        msg.toLowerCase().includes('not found')
      ) {
        // Backend requires registration first — this is a known limitation.
        // Show a helpful message to the user.
        setError(
          'Your account needs to be initialized. Please log out and log in again to complete registration.'
        );
      } else if (msg.toLowerCase().includes('unauthorized')) {
        setError('You are not authorized to create a profile. Please log in again.');
      } else {
        setError(err?.message || 'Failed to save profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="bg-card border-border sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-bold">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Welcome to LuckyCoins! Please set up your profile to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="pl-9 bg-background border-border text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email{' '}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="pl-9 bg-background border-border text-foreground"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Get Started'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
