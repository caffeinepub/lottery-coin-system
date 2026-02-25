import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Upload, CheckCircle, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSubmitBalanceRequest } from "../hooks/useQueries";

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export default function AddBalance() {
  const navigate = useNavigate();
  const submitRequest = useSubmitBalanceRequest();

  const [amount, setAmount] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(amount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!screenshotUrl.trim()) {
      toast.error("Please provide a payment screenshot URL");
      return;
    }

    try {
      await submitRequest.mutateAsync({ amount: amt, paymentScreenshotUrl: screenshotUrl.trim() });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit request");
    }
  };

  if (submitted) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Request Submitted!</h2>
        <p className="text-muted-foreground">
          Your balance request has been submitted and is pending admin approval.
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
            Go to Dashboard
          </Button>
          <Button onClick={() => { setSubmitted(false); setAmount(""); setScreenshotUrl(""); }}>
            Submit Another
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: "/dashboard" })} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Wallet className="w-8 h-8 text-primary" />
          Add Balance
        </h1>
        <p className="text-muted-foreground mt-1">Submit a balance top-up request</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div>
          <Label>Amount (coins) *</Label>
          <Input
            type="number"
            min={1}
            className="mt-1"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="flex gap-2 mt-2 flex-wrap">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(String(a))}
                className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                  amount === String(a)
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Payment Screenshot URL *</Label>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Paste screenshot URL here..."
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Upload your payment screenshot and paste the URL here
          </p>
        </div>

        <Button
          type="submit"
          className="w-full btn-primary"
          disabled={submitRequest.isPending}
        >
          {submitRequest.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" />Submit Request</>
          )}
        </Button>
      </form>
    </main>
  );
}
