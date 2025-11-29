const hre = require("hardhat");
const { ethers } = hre;

// Deployed contract address
const TREASURY_ADDRESS = "0xcba2318C6C4d9c98f7732c5fDe09D1BAe12c27be";

// Minimal contract ABI
const TREASURY_ABI = [
  "function owner() view returns (address)",
  "function router() view returns (address)",
  "function swapAllowances(address, address) view returns (uint256)",
  "function requestPayment(address payee, uint256 amount, address token)",
  "function authorizeSwap(address fromToken, address toToken, uint256 maxAmount)",
  "function executePayment(address payer, address payee, uint256 amount, address token)",
  "function getTokenBalance(address token) view returns (uint256)",
  "event PaymentRequested(address indexed payer, address indexed payee, uint256 amount, address token)",
  "event PaymentExecuted(address indexed payer, address indexed payee, uint256 amount, address token)",
  "event PaymentFailed(address indexed payer, address indexed payee, uint256 amount, address token, string reason)",
  "event SwapAuthorized(address indexed owner, address indexed fromToken, address indexed toToken, uint256 maxAmount)",
];

async function main() {
  console.log("🧪 Starting SnowRailTreasury contract tests...\n");

  // Get the signer (your wallet)
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  console.log(`📝 Connected wallet: ${signerAddress}`);
  console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(signerAddress))} AVAX\n`);

  // Connect to the contract
  const treasury = new ethers.Contract(TREASURY_ADDRESS, TREASURY_ABI, signer);
  console.log(`📄 Contract: ${TREASURY_ADDRESS}\n`);

  // 1. Read contract information
  console.log("1️⃣ Reading contract information...");
  try {
    const owner = await treasury.owner();
    const router = await treasury.router();
    console.log(`   ✅ Owner: ${owner}`);
    console.log(`   ✅ Router: ${router}`);
    console.log(`   ${owner.toLowerCase() === signerAddress.toLowerCase() ? "✅ You are the owner" : "❌ You are NOT the owner"}\n`);
  } catch (error) {
    console.log(`   ❌ Error reading contract: ${error.message}\n`);
  }

  // 2. Test requestPayment (doesn't require owner, only emits event)
  console.log("2️⃣ Testing requestPayment...");
  try {
    // Use a test address as payee (valid address)
    // Using a known valid address (Trader Joe Router as example)
    const testPayee = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4"; // Example valid address
    const testAmount = ethers.parseEther("1.0"); // 1 token (assuming 18 decimals)
    const testToken = ethers.getAddress("0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"); // USDC on Avalanche (6 decimals)
    
    console.log(`   📤 Sending requestPayment...`);
    console.log(`      Payee: ${testPayee}`);
    console.log(`      Amount: ${ethers.formatEther(testAmount)} tokens`);
    console.log(`      Token: ${testToken}`);
    
    const tx = await treasury.requestPayment(testPayee, testAmount, testToken);
    console.log(`   ⏳ Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`   ✅ Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(`   💸 Gas used: ${receipt.gasUsed.toString()}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // 3. Test getTokenBalance (view function, doesn't require transaction)
  console.log("3️⃣ Testing getTokenBalance...");
  try {
    const usdcAddress = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"; // USDC on Avalanche
    const balance = await treasury.getTokenBalance(usdcAddress);
    console.log(`   ✅ USDC balance in treasury: ${balance.toString()} (raw)`);
    console.log(`   💰 Formatted balance: ${ethers.formatUnits(balance, 6)} USDC\n`); // USDC has 6 decimals
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // 4. Test authorizeSwap (only owner can do this)
  console.log("4️⃣ Testing authorizeSwap (owner only)...");
  try {
    const fromToken = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"; // USDC
    const toToken = "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"; // USDT on Avalanche
    const maxAmount = ethers.parseUnits("1000", 6); // 1000 USDC (6 decimals)
    
    console.log(`   📤 Authorizing swap...`);
    console.log(`      From: ${fromToken} (USDC)`);
    console.log(`      To: ${toToken} (USDT)`);
    console.log(`      Max Amount: ${ethers.formatUnits(maxAmount, 6)} USDC`);
    
    const tx = await treasury.authorizeSwap(fromToken, toToken, maxAmount);
    console.log(`   ⏳ Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`   ✅ Swap authorized in block: ${receipt.blockNumber}`);
    console.log(`   💸 Gas used: ${receipt.gasUsed.toString()}`);
    
    // Verify it was saved correctly
    const allowance = await treasury.swapAllowances(fromToken, toToken);
    console.log(`   ✅ Allowance saved: ${ethers.formatUnits(allowance, 6)} USDC\n`);
  } catch (error) {
    if (error.message.includes("Not owner")) {
      console.log(`   ⚠️  You are not the owner, this function requires owner permissions\n`);
    } else {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  // 5. Verify swapAllowances
  console.log("5️⃣ Verifying swapAllowances...");
  try {
    const fromToken = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"; // USDC
    const toToken = "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"; // USDT
    const allowance = await treasury.swapAllowances(fromToken, toToken);
    console.log(`   ✅ Allowance USDC -> USDT: ${ethers.formatUnits(allowance, 6)} USDC\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log("✨ Tests completed!");
  console.log(`\n🔍 View transactions on Snowtrace:`);
  console.log(`   https://snowtrace.io/address/${TREASURY_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

