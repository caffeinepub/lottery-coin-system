import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUnblockUser } from "../hooks/useQueries";

interface UnblockUserModalProps {
  open: boolean;
  onClose: () => void;
  user: { id: string; name: string; principal: any } | null;
}

export default function UnblockUserModal({ open, onClose, user }: UnblockUserModalProps) {
  const unblockUser = useUnblockUser();

  const handleConfirm = async () => {
    if (!user) return;
    try {
      await unblockUser.mutateAsync({ userId: user.principal });
      toast.success(`User "${user.name}" has been unblocked.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to unblock user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-500">
            <CheckCircle className="w-5 h-5" />
            Unblock User
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to unblock <strong>{user?.name}</strong>? They will regain full access to the platform.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={unblockUser.isPending}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleConfirm}
            disabled={unblockUser.isPending}
          >
            {unblockUser.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Unblocking...
              </>
            ) : (
              "Unblock User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
