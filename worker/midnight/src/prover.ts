import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { randomBytes } from 'crypto';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { MidnightProviders, WalletProvider, MidnightProvider, UnboundTransaction, Transaction } from '@midnight-ntwrk/midnight-js-types';
import { PolkadotNodeClient, makeConfig } from '@midnight-ntwrk/wallet-sdk-node-client';
import { UnshieldedWallet, createKeystore, PublicKey } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { InMemoryTransactionHistoryStorage, NetworkId, TransactionHistoryStorage, SerializedTransaction } from '@midnight-ntwrk/wallet-sdk-abstractions';

// Helper to convert hex strings to 32-byte Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const paddedHex = cleanHex.padStart(64, '0');
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(paddedHex.substring(i * 2, (i + 1) * 2), 16);
  }
  return bytes;
}

async function run() {
  // Parse command line arguments
  const projectIdHex = process.argv[2];
  const attestationHashHex = process.argv[3];
  const securityScore = parseInt(process.argv[4], 10);
  const timestamp = parseInt(process.argv[5], 10);
  const repositoryIdHex = process.argv[6];
  const commitHashHex = process.argv[7];
  const authorSignatureHex = process.argv[8];

  if (!projectIdHex || !attestationHashHex || isNaN(securityScore) || isNaN(timestamp) || !repositoryIdHex || !commitHashHex || !authorSignatureHex) {
    console.error(JSON.stringify({
      error: 'Missing or invalid parameters. Expected: <projectIdHex> <attestationHashHex> <securityScore> <timestamp> <repositoryIdHex> <commitHashHex> <authorSignatureHex>'
    }));
    process.exit(1);
  }

  // Convert inputs to expected formats
  const projectId = hexToBytes(projectIdHex);
  const attestationHash = hexToBytes(attestationHashHex);
  const repositoryId = hexToBytes(repositoryIdHex);
  const commitHash = hexToBytes(commitHashHex);
  const authorSignature = hexToBytes(authorSignatureHex);

  // Set Midnight network to undeployed1 (local devnet v4)
  setNetworkId('undeployed1');

  // Read from environment or default to local devnet
  const MIDNIGHT_INDEXER_HTTP = process.env.MIDNIGHT_INDEXER_HTTP || "http://127.0.0.1:8088/api/v4/v1/graphql";
  const MIDNIGHT_INDEXER_WS = process.env.MIDNIGHT_INDEXER_WS || "ws://127.0.0.1:8088/api/v4/v1/graphql/ws";
  const MIDNIGHT_NODE_WS = process.env.MIDNIGHT_NODE_WS || "ws://127.0.0.1:9944";
  const MIDNIGHT_PROOF_SERVER = process.env.MIDNIGHT_PROOF_SERVER || "http://127.0.0.1:6300";

  // Initialize Providers
  const zkConfigProvider = new NodeZkConfigProvider('./dist');
  
  const publicDataProvider = indexerPublicDataProvider(
    MIDNIGHT_INDEXER_HTTP,
    MIDNIGHT_INDEXER_WS
  );
  
  const proofProvider = httpClientProofProvider(
    MIDNIGHT_PROOF_SERVER,
    zkConfigProvider
  );

  const privateStateProvider = levelPrivateStateProvider({
    privateStoragePasswordProvider: async () => Promise.resolve(process.env.MIDNIGHT_PRIVATE_STORE_PASSWORD || 'zkcap-default-secure-password'),
    accountId: "zkcap-test-wallet-id", // <-- Add this line
    midnightDbName: 'zkcap-private-state-db',
  });

  // Programmatic Wallet setup for headless signing
  const dummyEntropy = randomBytes(32);
  const indexerHttpUrl = MIDNIGHT_INDEXER_HTTP;
  const indexerWsUrl = MIDNIGHT_INDEXER_WS;

  const walletConfig = {
    networkId: 'undeployed1' as any,
    indexerClientConnection: {
      indexerWsUrl,
      indexerHttpUrl,
    },
    txHistoryStorage: new InMemoryTransactionHistoryStorage(TransactionHistoryStorage.TransactionHistoryCommonSchema),
  };

  const keystore = createKeystore(dummyEntropy, walletConfig.networkId);
  const wallet = UnshieldedWallet(walletConfig).startWithPublicKey(PublicKey.fromKeyStore(keystore));

  const customWalletProvider: WalletProvider = {
    getCoinPublicKey: () => keystore.getPublicKey(),
    getEncryptionPublicKey: () => keystore.getPublicKey(),
    balanceTx: async (tx: UnboundTransaction, ttl?: Date) => {
      const balancedTx = await wallet.balanceUnboundTransaction(tx);
      if (!balancedTx) {
        throw new Error('Failed to balance transaction: wallet returned undefined');
      }
      const signedTx = await wallet.signUnboundTransaction(balancedTx, (data) => keystore.signData(data));
      return signedTx.bind();
    }
  };

  const customMidnightProvider: MidnightProvider = {
    submitTx: async (tx: Transaction<any, any, any>) => {
      const serialized = SerializedTransaction.from(tx);
      const nodeClient = await PolkadotNodeClient.init(
        makeConfig({ nodeURL: new URL(MIDNIGHT_NODE_WS) })
      );
      try {
        await nodeClient.sendMidnightTransactionAndWait(serialized, 'InBlock');
        return "on-chain-tx";
      } finally {
        await nodeClient.close();
      }
    }
  };

  const providers: MidnightProviders = {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider: customWalletProvider,
    midnightProvider: customMidnightProvider
  };

  // // Pre-flight check to ensure the indexer is reachable
  // try {
  //   await fetch(indexerHttpUrl, { method: 'GET' });
  // } catch (error) {
  //   console.error('\\n[!] Cannot connect to Midnight indexer at ' + indexerHttpUrl);
  //   console.error('[!] Please ensure your local Midnight node/indexer is running via Docker.');
  //   console.error('[!] Or provide valid testnet endpoints via MIDNIGHT_RPC_ENDPOINT.');
  //   process.exit(1);
  // }

  // Start the wallet syncing
  try {
    await wallet.start();
  } catch (error) {
    console.error('\\n[!] Failed to sync with the Midnight network.');
    process.exit(1);
  }

  // Load the compiled Compact contract module
  // Note: The build script outputs artifacts to `./dist`
  const contractModule = await import('../dist/contract/index.js');
  const compiledContract = CompiledContract.withWitnesses(
    CompiledContract.make('zkcap', contractModule.Contract),
    {
      get_private_commit_data: (context: any) => {
        return [
          context.privateState,
          {
            repository_id: repositoryId,
            commit_hash: commitHash,
            author_signature: authorSignature
          }
        ];
      }
    }
  ) as any;

  // Locate or Deploy the contract
  const contractAddress = process.env.MIDNIGHT_CONTRACT_ADDRESS;
  let contractInstance;

  if (contractAddress) {
    contractInstance = await findDeployedContract(providers, {
      compiledContract,
      contractAddress,
      privateStateId: 'zkcap-private-state'
    });
  } else {
    // Deploy new contract instance
    contractInstance = await deployContract(providers, {
      compiledContract,
      args: [],
      privateStateId: 'zkcap-private-state',
      initialPrivateState: {
        commitData: {
          repository_id: new Uint8Array(32),
          commit_hash: new Uint8Array(32),
          author_signature: new Uint8Array(32)
        }
      }
    });
  }

  // Call the verify_and_anchor_attestation circuit with private inputs passed via witness
  const tx = await contractInstance.callTx.verify_and_anchor_attestation(
    projectId,
    attestationHash,
    BigInt(securityScore),
    BigInt(timestamp)
  );

  // Return the resulting transaction ID
  console.log(JSON.stringify({
    success: true,
    midnight_tx_id: tx.public.txId,
    contract_address: contractInstance.deployTxData.public.contractAddress
  }));
}

run().catch((error) => {
  if (String(error).includes("Wallet.Sync") || (error instanceof Error && error.message.includes("Wallet.Sync"))) {
    console.error(JSON.stringify({
        success: false, 
        error: "Wallet Sync Failed: Ensure local node is running and wallet has tNIGHT funds."
    }));
    process.exit(1);
  }
  console.error("ERROR STACK TRACE:", error);
  console.error(JSON.stringify({
    success: false,
    error: error.message || String(error)
  }));
  process.exit(1);
});
