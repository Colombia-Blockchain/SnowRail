/**
 * Recent Payments Component
 * Displays list of recent payments received
 */

import { ExternalLink, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { RecentPayment } from "../../types/dashboard-types.js";
import { SpotlightCard } from "../ui/spotlight-card";
import { motion } from "framer-motion";

type RecentPaymentsProps = {
  payments: RecentPayment[];
};

function getStatusIcon(status: RecentPayment["status"]) {
  switch (status) {
    case "CONFIRMED_ONCHAIN":
      return <CheckCircle2 size={16} className="text-green-500" />;
    case "PENDING_X402":
      return <Clock size={16} className="text-yellow-500" />;
    case "FAILED":
      return <XCircle size={16} className="text-red-500" />;
    default:
      return <Clock size={16} className="text-gray-500" />;
  }
}

function getStatusLabel(status: RecentPayment["status"]) {
  switch (status) {
    case "CONFIRMED_ONCHAIN":
      return "Confirmed";
    case "PENDING_X402":
      return "Pending";
    case "FAILED":
      return "Failed";
    default:
      return status;
  }
}

function getStatusColor(status: RecentPayment["status"]) {
  switch (status) {
    case "CONFIRMED_ONCHAIN":
      return "text-green-400 bg-green-500/10 border-green-500/20";
    case "PENDING_X402":
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    case "FAILED":
      return "text-red-400 bg-red-500/10 border-red-500/20";
    default:
      return "text-gray-400 bg-white/5 border-white/10";
  }
}

function truncateHash(hash: string | null, length: number = 8): string {
  if (!hash) return "-";
  if (hash.length <= length * 2 + 2) return hash;
  return `${hash.substring(0, length + 2)}...${hash.substring(hash.length - length)}`;
}

/**
 * Normalize transaction hash to standard format
 */
function normalizeHash(hash: string | null): string | null {
  if (!hash) return null;
  
  let cleaned = hash.trim();
  
  if (!cleaned.startsWith('0x')) {
    cleaned = `0x${cleaned}`;
  }
  
  const hexPart = cleaned.substring(2);
  const hexOnly = hexPart.replace(/[^0-9a-fA-F]/g, '');
  
  if (hexOnly.length === 0) return null;
  
  if (hexOnly.length < 64) {
    const padded = hexOnly.padEnd(64, '0');
    return `0x${padded}`;
  }
  
  if (hexOnly.length === 64) {
    return `0x${hexOnly}`;
  }
  
  if (hexOnly.length > 64) {
    return `0x${hexOnly.substring(0, 64)}`;
  }
  
  return `0x${hexOnly}`;
}

/**
 * Check if hash looks valid
 */
function isLikelyValidHash(hash: string | null): boolean {
  if (!hash) return false;
  const normalized = normalizeHash(hash);
  if (!normalized) return false;
  return normalized.startsWith('0x') && normalized.length >= 12;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
  if (payments.length === 0) {
    return (
      <SpotlightCard className="p-8 bg-navy-800/30">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Payments</h3>
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No payments received yet</p>
          <p className="text-xs mt-1">Payments will appear here once received</p>
        </div>
      </SpotlightCard>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <SpotlightCard className="p-8 bg-navy-800/30">
      <h3 className="text-lg font-semibold text-white mb-6">Recent Payments</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Token
              </th>
              <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                USD
              </th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Transaction
              </th>
            </tr>
          </thead>
          <motion.tbody 
            variants={container}
            initial="hidden"
            whileInView="show"
            className="divide-y divide-white/5"
          >
            {payments.map((payment) => (
              <motion.tr 
                key={payment.id} 
                variants={item}
                className="hover:bg-white/5 transition-colors group"
              >
                <td className="py-3 px-2 text-sm text-gray-300">
                  {formatDate(payment.createdAt)}
                </td>
                <td className="py-3 px-2 text-sm font-medium text-white">
                  {payment.token}
                </td>
                <td className="py-3 px-2 text-sm text-gray-300 text-right">
                  {payment.amountToken.toFixed(6)}
                </td>
                <td className="py-3 px-2 text-sm font-semibold text-white text-right">
                  ${payment.amountUsd.toFixed(2)}
                </td>
                <td className="py-3 px-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {getStatusIcon(payment.status)}
                    {getStatusLabel(payment.status)}
                  </span>
                </td>
                <td className="py-3 px-2">
                  {payment.txHash ? (
                    (() => {
                      // Normalize the hash first
                      const normalizedHash = normalizeHash(payment.txHash);
                      const isValid = normalizedHash && normalizedHash.length === 66;
                      const isLikelyValid = isLikelyValidHash(payment.txHash);
                      
                      // Use normalized hash if available, otherwise use original
                      const hashToUse = normalizedHash || payment.txHash;
                      
                      if (isValid) {
                        return (
                          <a
                            href={`https://testnet.snowtrace.io/tx/${hashToUse}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-electric-blue hover:text-white font-mono hover:underline transition-colors"
                            title={`View transaction: ${hashToUse}`}
                          >
                            {truncateHash(hashToUse)}
                            <ExternalLink size={12} />
                          </a>
                        );
                      } else if (isLikelyValid) {
                        return (
                          <a
                            href={`https://testnet.snowtrace.io/tx/${hashToUse}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-yellow-500 hover:text-yellow-300 font-mono hover:underline transition-colors"
                            title={`View transaction: ${hashToUse}${normalizedHash !== payment.txHash ? ` (normalized from ${payment.txHash})` : ''}`}
                          >
                            {truncateHash(hashToUse)}
                            <ExternalLink size={12} />
                          </a>
                        );
                      } else {
                        return (
                          <span className="text-xs text-gray-500 font-mono" title={`Hash: ${payment.txHash}`}>
                            {truncateHash(payment.txHash)}
                          </span>
                        );
                      }
                    })()
                  ) : (
                    <span className="text-xs text-gray-600">-</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </SpotlightCard>
  );
}
