/**
 * ERC-8004 Agent Identity Card
 * Part of Sovereign Agent Stack: Identity & Reputation Layer
 * 
 * This card allows other AI agents to discover SnowRail's capabilities
 * and interact with it programmatically.
 */

import { config } from '../config/env.js';

export interface ERC8004AgentCard {
  // Standard version
  erc8004Version: string;
  
  // Agent identification
  agent: {
    id: string;
    name: string;
    description: string;
    version: string;
    
    // What this agent can do
    capabilities: string[];
    
    // Protocols this agent supports
    protocols: string[];
    
    // Networks this agent operates on
    networks: string[];
    
    // Validation method
    validation: {
      type: 'SMART_CONTRACT' | 'TEE' | 'REPUTATION' | 'ECONOMIC_STAKE';
      address?: string;
      chainId?: number;
      trustLevel?: number; // 1-5
    };
  };
  
  // API endpoints
  endpoints: {
    baseUrl: string;
    health: string;
    identity: string;
    x402Facilitator: string;
    payrollExecute: string;
    paymentProcess: string;
  };
  
  // x402 metering configuration
  metering: {
    protocol: 'x402';
    version: string;
    resources: Array<{
      id: string;
      price: string;
      asset: string;
      chain: string;
      description: string;
    }>;
  };
  
  // Contact & metadata
  contact: {
    website?: string;
    documentation?: string;
    github?: string;
    discord?: string;
  };
  
  // Compliance & audit
  audit: {
    permanentStorage: boolean;
    storageProtocol?: string;
    auditTrail: boolean;
  };
  
  createdAt: string;
  updatedAt: string;
}

/**
 * SnowRail's ERC-8004 compliant agent identity card
 */
export const SNOWRAIL_AGENT_CARD: ERC8004AgentCard = {
  erc8004Version: '1.0',
  
  agent: {
    id: 'snowrail-treasury-v1',
    name: 'SnowRail Treasury Agent',
    description: 'Autonomous treasury orchestration for cross-border payroll. Bridges crypto (Avalanche) with fiat (bank accounts) using x402 protocol for machine-to-machine payments.',
    version: '1.0.0',
    
    capabilities: [
      'treasury_management',
      'cross_border_payments',
      'payroll_execution',
      'crypto_to_fiat_bridge',
      'x402_payments',
      'eip3009_authorization',
      'dex_swaps',
      'payment_batching',
      'autonomous_operations'
    ],
    
    protocols: [
      'x402',           // HTTP 402 Payment Required
      'erc8004',        // Agent metering standard
      'eip3009',        // transferWithAuthorization
      'a2a',            // Agent-to-Agent protocol
      'rail_api'        // Fiat payment infrastructure
    ],
    
    networks: [
      'avalanche',      // Mainnet
      'avalanche-fuji'  // Testnet
    ],
    
    validation: {
      type: 'SMART_CONTRACT',
      address: config.treasuryContractAddress || undefined,
      chainId: config.network === 'fuji' ? 43113 : 43114,
      trustLevel: 3 // 1=low, 5=high (3=medium for testnet MVP)
    }
  },
  
  endpoints: {
    baseUrl: `http://localhost:${config.port}`,
    health: '/api/health',
    identity: '/agent/identity',
    x402Facilitator: '/facilitator/health',
    payrollExecute: '/api/payroll/execute',
    paymentProcess: '/api/payment/process'
  },
  
  metering: {
    protocol: 'x402',
    version: '8004-alpha',
    resources: [
      {
        id: 'payroll_execute',
        price: '1',
        asset: 'USDC',
        chain: config.network,
        description: 'Execute international payroll for up to 10 freelancers'
      },
      {
        id: 'payment_process',
        price: '0.1',
        asset: 'USDC',
        chain: config.network,
        description: 'Complete payment flow: Rail + Blockchain + Facilitator integration'
      },
      {
        id: 'contract_test',
        price: '0.1',
        asset: 'USDC',
        chain: config.network,
        description: 'Test Treasury contract operations'
      },
      {
        id: 'payment_single',
        price: '0.1',
        asset: 'USDC',
        chain: config.network,
        description: 'Execute a single payment to one recipient'
      },
      {
        id: 'swap_execute',
        price: '0.5',
        asset: 'USDC',
        chain: config.network,
        description: 'Execute a token swap through DEX'
      }
    ]
  },
  
  contact: {
    website: 'https://snowrail.xyz',
    documentation: 'https://github.com/yourorg/snowrail/blob/main/README.md',
    github: 'https://github.com/yourorg/snowrail'
  },
  
  audit: {
    permanentStorage: true,
    storageProtocol: 'arweave',
    auditTrail: true
  },
  
  createdAt: '2025-12-04T00:00:00Z',
  updatedAt: new Date().toISOString()
};

/**
 * Get agent identity card (for API endpoint)
 */
export function getAgentIdentity(): ERC8004AgentCard {
  return {
    ...SNOWRAIL_AGENT_CARD,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Validate if another agent card is compatible with SnowRail
 */
export function isCompatibleAgent(card: ERC8004AgentCard): boolean {
  // Check if agent supports x402
  if (!card.agent.protocols.includes('x402')) {
    return false;
  }
  
  // Check if agent operates on compatible networks
  const hasCompatibleNetwork = card.agent.networks.some(network => 
    SNOWRAIL_AGENT_CARD.agent.networks.includes(network)
  );
  
  return hasCompatibleNetwork;
}

