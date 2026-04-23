import { useState } from "react";
import { participationApi } from "../api/participation.api";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card";
import { CheckCircle2, CreditCard, AlertCircle } from "lucide-react";

interface PaymentModuleProps {
  config: any;
  participation: any;
  isLastStep?: boolean;
  onAdvanced: (data: any) => void;
}

export default function PaymentModule({ config, participation, isLastStep, onAdvanced }: PaymentModuleProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Requirement 6: Skip if already PAID
  const isPaid = participation.status === 'REGISTERED' || participation.status === 'APPROVED';

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const scriptLoaded = await new Promise<boolean>((resolve) => {
        if ((window as any).Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!scriptLoaded) {
        throw new Error('Payment gateway failed to load');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(Number(config.price || 0) * 100),
        currency: config.currency || 'INR',
        order_id: participation.razorpayOrderId,
        name: "Atria Events",
        description: `Payment for ${participation.event?.title || 'Event'}`,
        handler: async (response: any) => {
          try {
            await participationApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            // On success, advance the workflow
            const advanceRes = await participationApi.advance(participation._id);
            onAdvanced(advanceRes.data.data.participation);
          } catch (err) {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: participation.user.name,
          email: participation.user.email,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || "An error occurred while launching payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPaid) {
    return (
      <Card className="border-emerald-100 bg-emerald-50/30">
        <CardHeader>
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 size={20} />
            <CardTitle className="text-lg">Payment Successful</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border border-emerald-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-secondary uppercase font-bold tracking-wider">Transaction ID</p>
              <p className="font-mono text-sm mt-1">{participation.razorpayPaymentId || "Verified"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-secondary uppercase font-bold tracking-wider">Amount Paid</p>
              <p className="font-bold text-slate-900 mt-1">₹{Number(config.price || 0).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
           <Button 
             className="w-full" 
             variant="outline" 
             onClick={() => {
               participationApi.advance(participation._id).then(res => onAdvanced(res.data.data.participation));
             }}
           >
             Proceed
           </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="text-primary" />
          Payment Required
        </CardTitle>
        <p className="text-sm text-secondary">Complete your payment of ₹{Number(config.price || 0).toLocaleString()} to proceed.</p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-danger/10 text-danger p-3 rounded-lg flex items-center gap-2 text-sm mb-4 border border-danger/20">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4">
           <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1 leading-tight">Test Mode Active</p>
           <p className="text-[11px] text-amber-700 leading-snug">
             Use card <span className="font-mono bg-white px-1 rounded border border-amber-200">4111 1111 1111 1111</span> for dummy payments. <br/>
             <span className="font-bold">Pro-tip:</span> Select <span className="underline">Netbanking</span> for the easiest domestic test exit.
           </p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-secondary/10 text-center">
            <p className="text-secondary text-sm mb-1 uppercase font-bold tracking-widest">Total Payable</p>
            <h2 className="text-4xl font-extrabold text-slate-900">₹{Number(config.price || 0).toLocaleString()}</h2>
            <p className="text-xs text-secondary mt-2">Secure payment via Razorpay</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full shadow-lg h-12 text-lg" onClick={handlePayment} disabled={isProcessing}>
          {isProcessing ? "Launching Gateway..." : "Pay Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}
