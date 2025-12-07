import { useCallback, useEffect, useMemo, useState } from "react";
import type { CoreWalletProvider } from "../types/core-wallet";

type WalletStatus = "idle" | "connecting" | "connected" | "error";

const getProvider = (): CoreWalletProvider | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.avalanche ?? window.core ?? null;
};

const truncateAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export function CoreWalletButton() {
  const [provider, setProvider] = useState<CoreWalletProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [status, setStatus] = useState<WalletStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProvider(getProvider());
  }, []);

  useEffect(() => {
    if (!provider?.on) {
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      const nextAccount = accounts[0] ?? null;
      setAccount(nextAccount);
      setStatus(nextAccount ? "connected" : "idle");
    };

    provider.on("accountsChanged", handleAccountsChanged);
    return () => provider.removeListener?.("accountsChanged", handleAccountsChanged);
  }, [provider]);

  const connectWallet = useCallback(async () => {
    setError(null);
    if (!provider) {
      setStatus("error");
      setError("Core Wallet no detectada.");
      return;
    }

    try {
      setStatus("connecting");
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const connectedAccount = accounts?.[0];

      if (!connectedAccount) {
        setStatus("idle");
        return;
      }

      setAccount(connectedAccount);
      setStatus("connected");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "No se pudo conectar con Core Wallet.");
    }
  }, [provider]);

  const label = useMemo(() => {
    if (status === "connecting") {
      return "Conectando...";
    }

    if (account) {
      return `Core • ${truncateAddress(account)}`;
    }

    return "Conectar Core Wallet";
  }, [account, status]);

  const indicatorColor = useMemo(() => {
    if (status === "connected") return "bg-emerald-500";
    if (status === "error") return "bg-rose-500";
    if (status === "connecting") return "bg-amber-500";
    return "bg-slate-400";
  }, [status]);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={connectWallet}
        disabled={status === "connecting"}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-teal-200 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className={`h-2 w-2 rounded-full ${indicatorColor}`}></span>
        {label}
      </button>
      {error && (
        <span className="text-xs text-rose-600">
          {error}
        </span>
      )}
    </div>
  );
}
