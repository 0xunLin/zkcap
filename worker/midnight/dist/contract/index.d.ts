import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type MilestoneRecord = { project_id: Uint8Array;
                                security_score: bigint;
                                timestamp: bigint
                              };

export type PrivateCommitData = { repository_id: Uint8Array;
                                  commit_hash: Uint8Array;
                                  author_signature: Uint8Array
                                };

export type Witnesses<PS> = {
  get_private_commit_data(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, PrivateCommitData];
}

export type ImpureCircuits<PS> = {
  register_project(context: __compactRuntime.CircuitContext<PS>,
                   project_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verify_and_anchor_attestation(context: __compactRuntime.CircuitContext<PS>,
                                project_id_0: Uint8Array,
                                attestation_hash_0: Uint8Array,
                                security_score_0: bigint,
                                timestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  register_project(context: __compactRuntime.CircuitContext<PS>,
                   project_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verify_and_anchor_attestation(context: __compactRuntime.CircuitContext<PS>,
                                project_id_0: Uint8Array,
                                attestation_hash_0: Uint8Array,
                                security_score_0: bigint,
                                timestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  register_project(context: __compactRuntime.CircuitContext<PS>,
                   project_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verify_and_anchor_attestation(context: __compactRuntime.CircuitContext<PS>,
                                project_id_0: Uint8Array,
                                attestation_hash_0: Uint8Array,
                                security_score_0: bigint,
                                timestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  registered_projects: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  verified_milestones: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): MilestoneRecord;
    [Symbol.iterator](): Iterator<[Uint8Array, MilestoneRecord]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
