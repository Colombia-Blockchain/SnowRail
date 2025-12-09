import { useState } from "react";
import { testContract } from "../lib/api";
import type { MeteringInfo } from "../App";
import { ArrowLeft, Activity, ExternalLink, CheckCircle2, XCircle, Zap, Database, Shield, Clock } from "lucide-react";
import { SpotlightCard } from "./ui/spotlight-card";
import { motion } from "framer-motion";

type TestResult = {
  step: string;
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
  data?: any;
  balance?: string;
  formatted?: string;
  allowance?: string;
};

type TestSummary = {
  total: number;
  successful: number;
  failed: number;
};

function ContractTest({ onBack }: { onBack?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [transactionHashes, setTransactionHashes] = useState<string[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [paymentRequired, setPaymentRequired] = useState<MeteringInfo | null>(null);
  const [step, setStep] = useState<string>("");

  const executeTest = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    setTransactionHashes([]);
    setSummary(null);
    setPaymentRequired(null);
    setStep("");

    try {
      // Step 1: Try without payment (expect 402)
      setStep("Requesting test (checking payment requirement)...");
      const result = await testContract();

      if (!result.success && result.status === 402) {
        // Payment required - show metering info
        if (result.error.metering) {
          const meteringInfo: MeteringInfo = {
            ...(result.error.metering as MeteringInfo),
            meterId: result.error.meterId || "contract_test",
          };
          setPaymentRequired(meteringInfo);
          setStep("Payment required - submitting with demo-token...");
          
          // Step 2: Retry with demo-token
          const paidResult = await testContract("demo-token");
          
          if (!paidResult.success) {
            throw new Error(paidResult.error.message || "Test failed");
          }

          // Step 3: Extract results
          setStep("Extracting results...");
          setResults(paidResult.data.results);
          setTransactionHashes(paidResult.data.transactionHashes);
          setSummary(paidResult.data.summary);
          setStep("Test completed!");
        } else {
          throw new Error("Payment required but no metering info provided");
        }
      } else if (result.success) {
        // Already paid or no payment required
        setResults(result.data.results);
        setTransactionHashes(result.data.transactionHashes);
        setSummary(result.data.summary);
        setStep("Test completed!");
      } else {
        throw new Error(result.error.message || "Test failed");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to execute contract test";
      console.error("Contract test error:", err);
      setError(errorMessage);
      setStep("Test failed");
      
      // If it's a network error, suggest checking backend
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("404")) {
        setError(`${errorMessage}. Make sure the backend server is running on port 4000.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {onBack && (
        <button 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium mb-8" 
          onClick={onBack}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Test Area */}
        <div className="md:col-span-2 space-y-8">
          <SpotlightCard className="overflow-hidden bg-navy-800/50">
            <div className="p-6 border-b border-white/10 flex items-center gap-3 bg-white/5 text-white">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Activity size={24} className="text-purple-400" />
              </div>
          <div>
                <h2 className="text-xl font-bold">Contract Test</h2>
                <p className="text-gray-400 text-sm">Treasury Operations Verification</p>
          </div>
        </div>

            <div className="p-8">
        {step && (
                <div className="flex items-center gap-3 mb-6 p-4 bg-purple-500/10 text-purple-300 rounded-xl border border-purple-500/20">
                  {loading ? <Clock className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  <span className="font-medium">{step}</span>
          </div>
        )}

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 flex items-start gap-3">
                  <XCircle className="shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-bold text-sm">Test Failed</h4>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

        {paymentRequired && (
                <div className="mb-6 p-4 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20 flex items-start gap-3">
                  <Shield className="shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-bold text-sm">Payment Required: {paymentRequired.price} {paymentRequired.asset}</h4>
                    <p className="text-sm mt-1 text-yellow-300/70">Using demo-token for testnet execution.</p>
                  </div>
          </div>
        )}

        <button
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-purple-600/20 hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={executeTest}
          disabled={loading}
        >
          {loading ? (
            <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Running Test Suite...
            </>
          ) : (
            <>
                    <Zap size={20} />
              Run Contract Test
            </>
          )}
        </button>
            </div>
          </SpotlightCard>

          {/* Results List */}
        {results.length > 0 && (
            <SpotlightCard className="overflow-hidden bg-navy-800/50">
              <div className="p-6 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-white">Operation Logs</h3>
              </div>
              <div className="divide-y divide-white/5">
            {results.map((result, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={index} 
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${result.success ? "text-green-400" : "text-red-400"}`}>
                        {result.success ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${result.success ? "text-white" : "text-red-400"}`}>
                          {result.step}
                        </h4>
                        
                        <div className="mt-2 space-y-1 text-xs text-gray-400 font-mono">
                {result.transactionHash && (
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-gray-500">TX:</span>
                    <a
                      href={`https://testnet.snowtrace.io/tx/${result.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                                className="text-electric-blue hover:text-white hover:underline flex items-center gap-0.5 transition-colors"
                    >
                                {result.transactionHash.substring(0, 10)}...{result.transactionHash.substring(result.transactionHash.length - 8)}
                                <ExternalLink size={10} />
                    </a>
                  </div>
                )}
                {result.formatted && (
                            <div><span className="font-semibold text-gray-500">Balance:</span> {result.formatted}</div>
                )}
                {result.allowance && (
                            <div><span className="font-semibold text-gray-500">Allowance:</span> {result.allowance}</div>
                )}
                {result.error && (
                            <div className="text-red-400 bg-red-500/10 p-2 rounded mt-1 font-sans border border-red-500/20">{result.error}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
          </SpotlightCard>
        )}
        </div>

        {/* Sidebar Summary */}
        <div className="md:col-span-1 space-y-6">
          {summary && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-24"
            >
              <SpotlightCard className="overflow-hidden bg-navy-800/50">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <h3 className="font-bold text-white">Test Summary</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{summary.total}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Total Operations</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl text-center border border-green-500/20">
                      <div className="text-xl font-bold text-green-400">{summary.successful}</div>
                      <div className="text-[10px] text-green-500/70 uppercase tracking-wider font-medium">Success</div>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl text-center border border-red-500/20">
                      <div className="text-xl font-bold text-red-400">{summary.failed}</div>
                      <div className="text-[10px] text-red-500/70 uppercase tracking-wider font-medium">Failed</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                      <Database size={14} />
                      <span>Transaction History</span>
                    </div>
                    <div className="space-y-2">
                      {transactionHashes.slice(0, 5).map((hash, index) => (
                        <a
                          key={index}
                      href={`https://testnet.snowtrace.io/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                          className="block text-xs font-mono text-electric-blue hover:text-white hover:underline truncate transition-colors"
                    >
                          {hash}
                    </a>
                      ))}
                      {transactionHashes.length > 5 && (
                        <div className="text-xs text-gray-600 text-center italic">
                          + {transactionHashes.length - 5} more transactions
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </SpotlightCard>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}

export default ContractTest;
