/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CancellationStage =
  | 'UNFUNDED'
  | 'PRE_DEPARTURE'
  | 'IN_TRANSIT'
  | 'DELIVERED';

export type CancellationPolicy = {
  allowed: boolean;
  refundType: 'FULL' | 'PARTIAL' | 'DISPUTED' | 'NONE';
  authorizedBy: 'IMPORTER_ONLY' | 'BOTH_PARTIES_MARITRADE' | 'MARITRADE_ARBITRATION' | 'NONE';
};

/**
 * Evaluates the policy for safe escrow cancellation based on the active shipment voyage progress stage.
 * Standardizes rules for BDAO escrows on the Stellar ledger.
 */
export function getCancellationPolicy(stage: CancellationStage): CancellationPolicy {
  switch (stage) {
    case 'UNFUNDED':
      return { 
        allowed: true, 
        refundType: 'FULL', 
        authorizedBy: 'IMPORTER_ONLY' 
      };
    case 'PRE_DEPARTURE':
      return { 
        allowed: true, 
        refundType: 'PARTIAL', 
        authorizedBy: 'BOTH_PARTIES_MARITRADE' 
      };
    case 'IN_TRANSIT':
      return { 
        allowed: true, 
        refundType: 'DISPUTED', 
        authorizedBy: 'MARITRADE_ARBITRATION' 
      };
    case 'DELIVERED':
    default:
      return { 
        allowed: false, 
        refundType: 'NONE', 
        authorizedBy: 'NONE' 
      };
  }
}
