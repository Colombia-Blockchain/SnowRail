/**
 * Balance Card Component
 * Displays total balance and balances by token
 */

import { DollarSign } from "lucide-react";
import type { DashboardData } from "../../types/dashboard-types.js";
import { SpotlightCard } from "../ui/spotlight-card";

type BalanceCardProps = {
  data: DashboardData;
};

export function BalanceCard({ data }: BalanceCardProps) {
  const { balances } = data;

  return (
    <SpotlightCard className="p-8 bg-navy-800/30">
      {/* Total Balance */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-electric-blue/10 rounded-lg text-electric-blue">
            <DollarSign size={20} />
          </div>
          <span className="text-sm font-medium text-gray-400">Total Balance</span>
        </div>
        <h2 className="text-4xl font-bold text-white">
          ${balances.totalUsd.toFixed(2)} USD
        </h2>
        <p className="text-sm text-gray-500 mt-1">Available for withdrawal</p>
      </div>

      {/* Balances by Token */}
      {balances.byToken.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Balances by Token</h3>
          {balances.byToken.map((balance) => (
            <div
              key={balance.token}
              className="flex items-center justify-between p-4 bg-navy-900/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
            >
              <div>
                <div className="font-semibold text-white">{balance.token}</div>
                <div className="text-sm text-gray-500">
                  {balance.balanceToken.toFixed(6)} tokens
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">
                  ${balance.balanceUsd.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">USD</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No balances yet</p>
          <p className="text-xs mt-1">Start receiving payments to see balances here</p>
        </div>
      )}
    </SpotlightCard>
  );
}
