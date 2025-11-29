/**
 * Rail Client Service (mock)
 * Simulates fiat payouts for the payroll flow.
 */

export type RailPaymentInput = {
  payrollId: string;
  amount: number;
  currency: string;
};

export type RailPaymentResult = {
  id: string;
  status: "PROCESSING" | "PAID" | "FAILED";
  createdAt: string;
  failureReason?: string;
};

// Create a Rail payment (mocked)
export async function createRailPayment(
  input: RailPaymentInput,
): Promise<RailPaymentResult> {
  // Simulate latency between 1–2 seconds
  const delay = 1000 + Math.random() * 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const id = `rail_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;

  // 90% success rate
  const success = Math.random() > 0.1;
  if (!success) {
    return {
      id,
      status: "FAILED",
      createdAt: new Date().toISOString(),
      failureReason: "MOCK_RANDOM_FAILURE",
    };
  }

  return {
    id,
    status: "PAID",
    createdAt: new Date().toISOString(),
  };
}


