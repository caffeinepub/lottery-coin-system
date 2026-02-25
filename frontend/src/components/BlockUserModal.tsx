import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useBlockUser } from "../hooks/useQueries";

interface BlockUserModalProps {
  open: boolean;
  onClose: () => void;
  user: { id: string; name: string; principal: any } | null;
}

export default function BlockUserModal({ open, onClose, user }: BlockUserModalProps) {
  const [reason, setReason] = useState("");
  const blockUser = useBlockUser();

  const handleConfirm = async () => {
    if (!user) return;
    try {
      await blockUser.mutateAsync({ userId: user.principal, reason: reason.trim() || undefined });
      toast.success(`User "${user.name}" has been blocked.`);
      setReason("");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to block user");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Block User
          </DialogTitle>
          <DialogDescription>
            You are about to block <strong>{user?.name}</strong>. Blocked users cannot log in, purchase tickets, make withdrawals, or receive bonuses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="block-reason">Reason (optional)</Label>
            <Textarea
              id="block-reason"
              placeholder="Enter reason for blocking this user..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={blockUser.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={blockUser.isPending}
          >
            {blockUser.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Blocking...
              </>
            ) : (
              "Block User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
