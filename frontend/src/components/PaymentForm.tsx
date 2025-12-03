import { useState } from "react";
import { processPayment } from "../lib/api";
import type { MeteringInfo } from "../App";
import { ArrowLeft, CreditCard, Loader2, CheckCircle2, AlertCircle, Wallet, MapPin, User, Mail, Phone, ExternalLink, Hash, DollarSign } from "lucide-react";

type PaymentFormData = {
  customer: {
    first_name: string;
    last_name: string;
    email_address: string;
    telephone_number: string;
    mailing_address: {
      address_line1: string;
      city: string;
      state: string;
      postal_code: string;
      country_code: string;
    };
  };
  payment: {
    amount: string; // Will be converted to cents
    currency: string;
    recipient: string;
    description: string;
  };
};

type PaymentResult = {
  success: boolean;
  payrollId: string;
  status: string;
  steps: {
    payroll_created: boolean;
    payments_created: boolean;
    treasury_checked: boolean;
    onchain_requested: boolean;
    onchain_executed: boolean;
    rail_processed: boolean;
  };
  transactions?: {
    request_tx_hashes?: string[];
    execute_tx_hashes?: string[];
  };
  rail?: {
    withdrawal_id?: string;
    status?: string;
  };
  errors?: Array<{
    step: string;
    error: string;
  }>;
};

function PaymentForm({ onBack, onSuccess }: { onBack?: () => void; onSuccess?: (payrollId: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequired, setPaymentRequired] = useState<MeteringInfo | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [step, setStep] = useState<string>("");

  const [formData, setFormData] = useState<PaymentFormData>({
    customer: {
      first_name: "",
      last_name: "",
      email_address: "",
      telephone_number: "+15551234567",
      mailing_address: {
        address_line1: "",
        city: "",
        state: "",
        postal_code: "",
        country_code: "US",
      },
    },
    payment: {
      amount: "",
      currency: "USD",
      recipient: "",
      description: "",
    },
  });

  const handleInputChange = (
    section: "customer" | "payment",
    field: string,
    value: string
  ) => {
    if (section === "customer") {
      if (field.startsWith("address_")) {
        const addressField = field.replace("address_", "");
        setFormData((prev) => ({
          ...prev,
          customer: {
            ...prev.customer,
            mailing_address: {
              ...prev.customer.mailing_address,
              [addressField]: value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          customer: {
            ...prev.customer,
            [field]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        payment: {
          ...prev.payment,
          [field]: value,
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setPaymentRequired(null);
    setStep("");

    try {
      // Validate form
      if (!formData.customer.first_name || !formData.customer.last_name) {
        throw new Error("First name and last name are required");
      }
      if (!formData.customer.email_address) {
        throw new Error("Email address is required");
      }
      if (!formData.payment.amount || parseFloat(formData.payment.amount) <= 0) {
        throw new Error("Payment amount must be greater than 0");
      }

      // Convert amount to cents
      const amountInCents = Math.round(parseFloat(formData.payment.amount) * 100);

      setStep("Submitting payment request...");

      // Send with demo-token from the start to avoid 402 error
      const response = await processPayment(
        {
          customer: formData.customer,
          payment: {
            amount: amountInCents,
            currency: formData.payment.currency,
            recipient: formData.payment.recipient || undefined,
            description: formData.payment.description || undefined,
          },
        },
        "demo-token" // Always send demo-token to avoid 402
      );

      if (!response.success) {
        // If we still get 402, show payment required UI
        if (response.status === 402 && response.error.metering) {
          const meteringInfo: MeteringInfo = {
            ...(response.error.metering as MeteringInfo),
            meterId: response.error.meterId || "payment_process",
          };
          setPaymentRequired(meteringInfo);
          setStep("Payment required - please complete payment...");
          return; // Don't throw error, let user complete payment
        }
        throw new Error(response.error.message || "Payment processing failed");
      }

      setResult(response.data);
      setStep("Payment processed successfully!");

      if (response.data.success && onSuccess) {
        onSuccess(response.data.payrollId);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to process payment";
      console.error("Payment processing error:", err);
      setError(errorMessage);
      setStep("Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {onBack && (
        <button 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium mb-8" 
          onClick={onBack}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <CreditCard size={24} />
              </div>
          <div>
                <h2 className="text-xl font-bold text-slate-900">Process Payment</h2>
                <p className="text-slate-500 text-sm">Rail API + Blockchain Integration</p>
          </div>
        </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-3">
                  <AlertCircle className="shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-bold text-sm">Error Processing Payment</h4>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
          </div>
        )}

        {paymentRequired && (
                <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-100 flex items-start gap-3">
                  <AlertCircle className="shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-bold text-sm">Payment Required: {paymentRequired.price} {paymentRequired.asset}</h4>
                    <p className="text-sm mt-1 text-yellow-700">Using demo-token for testnet execution.</p>
                  </div>
          </div>
        )}

              <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User size={16} className="text-slate-400" />
                    Customer Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">First Name</label>
                <input
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  type="text"
                  value={formData.customer.first_name}
                  onChange={(e) => handleInputChange("customer", "first_name", e.target.value)}
                  required
                />
              </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Last Name</label>
                <input
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  type="text"
                  value={formData.customer.last_name}
                  onChange={(e) => handleInputChange("customer", "last_name", e.target.value)}
                  required
                />
              </div>
            </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" /> Email Address
                      </label>
                <input
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  type="email"
                  value={formData.customer.email_address}
                  onChange={(e) => handleInputChange("customer", "email_address", e.target.value)}
                  required
                />
              </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" /> Phone Number
                      </label>
                <input
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  type="tel"
                  value={formData.customer.telephone_number}
                  onChange={(e) => handleInputChange("customer", "telephone_number", e.target.value)}
                  placeholder="+15551234567"
                />
                    </div>
              </div>
            </div>

            {/* Mailing Address */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    Mailing Address
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Address Line 1</label>
                <input
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  type="text"
                  value={formData.customer.mailing_address.address_line1}
                  onChange={(e) => handleInputChange("customer", "address_address_line1", e.target.value)}
                  required
                />
              </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">City</label>
                  <input
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    type="text"
                    value={formData.customer.mailing_address.city}
                    onChange={(e) => handleInputChange("customer", "address_city", e.target.value)}
                    required
                  />
                </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">State</label>
                  <input
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    type="text"
                    value={formData.customer.mailing_address.state}
                    onChange={(e) => handleInputChange("customer", "address_state", e.target.value)}
                    required
                  />
                </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Postal Code</label>
                  <input
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    type="text"
                    value={formData.customer.mailing_address.postal_code}
                    onChange={(e) => handleInputChange("customer", "address_postal_code", e.target.value)}
                    required
                  />
                </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Country Code</label>
                  <input
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    type="text"
                    value={formData.customer.mailing_address.country_code}
                    onChange={(e) => handleInputChange("customer", "address_country_code", e.target.value)}
                    required
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Wallet size={16} className="text-slate-400" />
                    Payment Details
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <DollarSign size={14} className="text-slate-400" /> Amount (USD)
                      </label>
                <input
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.payment.amount}
                  onChange={(e) => handleInputChange("payment", "amount", e.target.value)}
                  required
                />
              </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Currency</label>
                <select
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  value={formData.payment.currency}
                  onChange={(e) => handleInputChange("payment", "currency", e.target.value)}
                >
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Hash size={14} className="text-slate-400" /> Recipient Address (Optional)
                      </label>
              <input
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                type="text"
                value={formData.payment.recipient}
                onChange={(e) => handleInputChange("payment", "recipient", e.target.value)}
                placeholder="0x..."
              />
            </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Description (Optional)</label>
              <input
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                type="text"
                value={formData.payment.description}
                onChange={(e) => handleInputChange("payment", "description", e.target.value)}
                placeholder="Payment description"
              />
                    </div>
            </div>
          </div>

          <button
            type="submit"
                  className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
            disabled={loading}
          >
            {loading ? (
              <>
                      <Loader2 className="animate-spin" size={24} />
                      Processing...
              </>
            ) : (
              <>
                Process Payment
                      <ArrowLeft className="rotate-180" size={20} />
              </>
            )}
          </button>
        </form>
              </div>
              </div>
            </div>

        {/* Results Sidebar */}
        <div className="md:col-span-1">
          {step && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-900">Status</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-6">
                  {loading ? (
                    <Loader2 className="animate-spin text-blue-500" size={20} />
                  ) : result?.success ? (
                    <CheckCircle2 className="text-green-500" size={20} />
                  ) : error ? (
                    <AlertCircle className="text-red-500" size={20} />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>
                  )}
                  <span className="text-sm font-medium text-slate-700">{step}</span>
            </div>

                {result && (
                  <div className="space-y-6">
                  <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Progress Steps</h4>
                      <ul className="space-y-3">
                        {[
                          { label: "Payroll Created", status: result.steps.payroll_created },
                          { label: "Payments Created", status: result.steps.payments_created },
                          { label: "Treasury Checked", status: result.steps.treasury_checked },
                          { label: "On-Chain Requested", status: result.steps.onchain_requested },
                          { label: "On-Chain Executed", status: result.steps.onchain_executed },
                          { label: "Rail Processed", status: result.steps.rail_processed },
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-sm">
                            {item.status ? (
                              <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0"></div>
                            )}
                            <span className={item.status ? "text-slate-700 font-medium" : "text-slate-400"}>
                              {item.label}
                            </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                    {(result.transactions?.request_tx_hashes?.length || 0) > 0 && (
                  <div>
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Transactions</h4>
                         <div className="space-y-1">
                           {result.transactions?.request_tx_hashes?.map((hash, idx) => (
                             <a
                               key={idx}
                            href={`https://testnet.snowtrace.io/tx/${hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                               className="flex items-center gap-1 text-xs text-blue-600 hover:underline truncate"
                          >
                               <ExternalLink size={10} />
                               <span className="truncate">{hash}</span>
                          </a>
                      ))}
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}

export default PaymentForm;
