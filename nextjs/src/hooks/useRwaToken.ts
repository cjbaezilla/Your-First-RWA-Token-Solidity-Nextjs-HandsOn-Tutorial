import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useAccount, usePublicClient } from 'wagmi';
import { TOKEN_CONTRACT, MY_FIRST_TOKEN_ABI } from '../contracts/MyFirstTokenERC20RWA';
import { useCallback, useState, useEffect } from 'react';
import { decodeEventLog, type Log } from 'viem';

export const ROLES = {
  ADMIN: '0x0000000000000000000000000000000000000000000000000000000000000000',
  PAUSER: '0x65d175404fa3028d689658516d25816fd5656ca895101662c19e5d6d9c49caee', // keccak256("PAUSER_ROLE")
  MINTER: '0x9f2df0da571034f45f091cd2003c23de3b02005f0373d5494191c0453d862f92', // keccak256("MINTER_ROLE")
  FREEZER: '0xe1db091c5213600bef1832049e6f3d9ed360e2ce1c28c89d2d0b5713437c6883', // keccak256("FREEZER_ROLE")
  LIMITER: '0x272b380bf9d2d9ab04f2f099f6f34e3215904bb61480f27f00e57204481358da', // keccak256("LIMITER_ROLE")
  RECOVERY: '0x8110b930d413348003612807f7c66cb17c2f0d61efb5e5fb595f560e7ee68058', // keccak256("RECOVERY_ROLE")
} as const;

export function useRwaToken() {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
  const [events, setEvents] = useState<any[]>([]);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Fetch initial logs
  useEffect(() => {
    const fetchInitialLogs = async () => {
      if (!publicClient || !TOKEN_CONTRACT.address) return;

      try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock > BigInt(1000) ? currentBlock - BigInt(1000) : BigInt(0);

        const logs = await publicClient.getLogs({
          address: TOKEN_CONTRACT.address,
          fromBlock: fromBlock,
        });

        const decodedLogs = logs.map(log => {
          try {
            const decoded = decodeEventLog({
              abi: MY_FIRST_TOKEN_ABI,
              data: log.data,
              topics: log.topics,
            });
            return {
              ...decoded,
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber,
            };
          } catch (e) {
            return null;
          }
        }).filter(Boolean).reverse(); // Reverse so newest is at the top

        setEvents(decodedLogs);
      } catch (error) {
        console.error('Error fetching initial logs:', error);
      }
    };

    fetchInitialLogs();
  }, [publicClient]);

  // Event Watching - Watch all events by omitting eventName
  useWatchContractEvent({
    ...TOKEN_CONTRACT,
    pollingInterval: 1_000,
    onLogs(logs: Log[]) {
      const decodedLogs = logs.map(log => {
        try {
          const decoded = decodeEventLog({
            abi: MY_FIRST_TOKEN_ABI,
            data: log.data,
            topics: log.topics,
          });
          return {
            ...decoded,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
      
      setEvents(prev => [...decodedLogs, ...prev].slice(0, 50));
    },
  });

  // Read hooks
  const useTokenBalance = (address: string | undefined) => {
    return useReadContract({
      ...TOKEN_CONTRACT,
      functionName: 'balanceOf',
      args: address ? [address as `0x${string}`] : undefined,
      query: { 
        enabled: !!address,
        refetchInterval: 5000,
      },
    });
  };

  const useTokenSupply = () => {
    return useReadContract({
      ...TOKEN_CONTRACT,
      functionName: 'totalSupply',
      query: { 
        refetchInterval: 5000,
      },
    });
  };

  const useIsUserAllowed = (address: string | undefined) => {
    return useReadContract({
      ...TOKEN_CONTRACT,
      functionName: 'isUserAllowed',
      args: address ? [address as `0x${string}`] : undefined,
      query: { enabled: !!address },
    });
  };

  const usePaused = () => {
    return useReadContract({
      ...TOKEN_CONTRACT,
      functionName: 'paused',
      query: { 
        refetchInterval: 5000,
      },
    });
  };

  const useFrozenAmount = (address: string | undefined) => {
    return useReadContract({
      ...TOKEN_CONTRACT,
      functionName: 'frozen',
      args: address ? [address as `0x${string}`] : undefined,
      query: { enabled: !!address },
    });
  };

  const useHasRole = (role: string, address: string | undefined) => {
    return useReadContract({
      ...TOKEN_CONTRACT,
      functionName: 'hasRole',
      args: address ? [role as `0x${string}`, address as `0x${string}`] : undefined,
      query: { enabled: !!address && !!role },
    });
  };

  // Write actions
  const mint = useCallback((to: string, amount: bigint) => {
    writeContract({
      ...TOKEN_CONTRACT,
      functionName: 'mint',
      args: [to as `0x${string}`, amount],
    });
  }, [writeContract]);

  const freeze = useCallback((user: string, amount: bigint) => {
    writeContract({
      ...TOKEN_CONTRACT,
      functionName: 'freeze',
      args: [user as `0x${string}`, amount],
    });
  }, [writeContract]);

  const allowUser = useCallback((user: string) => {
    writeContract({
      ...TOKEN_CONTRACT,
      functionName: 'allowUser',
      args: [user as `0x${string}`],
    });
  }, [writeContract]);

  const disallowUser = useCallback((user: string) => {
    writeContract({
      ...TOKEN_CONTRACT,
      functionName: 'disallowUser',
      args: [user as `0x${string}`],
    });
  }, [writeContract]);

  const pause = useCallback(() => {
    writeContract({
      ...TOKEN_CONTRACT,
      functionName: 'pause',
    });
  }, [writeContract]);

  const unpause = useCallback(() => {
    writeContract({
      ...TOKEN_CONTRACT,
      functionName: 'unpause',
    });
  }, [writeContract]);

  const forcedTransfer = useCallback((from: string, to: string, amount: bigint) => {
    writeContract({
      ...TOKEN_CONTRACT,
      functionName: 'forcedTransfer',
      args: [from as `0x${string}`, to as `0x${string}`, amount],
    });
  }, [writeContract]);

  const transfer = useCallback((to: string, amount: bigint) => {
    writeContract({
      ...TOKEN_CONTRACT,
      functionName: 'transfer',
      args: [to as `0x${string}`, amount],
    });
  }, [writeContract]);

  const burn = useCallback((amount: bigint) => {
    writeContract({
      ...TOKEN_CONTRACT,
      functionName: 'burn',
      args: [amount],
    });
  }, [writeContract]);

  const burnFrom = useCallback((account: string, amount: bigint) => {
    writeContract({
      ...TOKEN_CONTRACT,
      functionName: 'burnFrom',
      args: [account as `0x${string}`, amount],
    });
  }, [writeContract]);

  const approve = useCallback((spender: string, amount: bigint) => {
    writeContract({
      ...TOKEN_CONTRACT,
      functionName: 'approve',
      args: [spender as `0x${string}`, amount],
    });
  }, [writeContract]);

  const transferFrom = useCallback((from: string, to: string, amount: bigint) => {
    writeContract({
      ...TOKEN_CONTRACT,
      functionName: 'transferFrom',
      args: [from as `0x${string}`, to as `0x${string}`, amount],
    });
  }, [writeContract]);

  return {
    // Hooks
    useTokenBalance,
    useTokenSupply,
    useIsUserAllowed,
    usePaused,
    useFrozenAmount,
    useHasRole,
    // Actions
    mint,
    freeze,
    allowUser,
    disallowUser,
    pause,
    unpause,
    forcedTransfer,
    transfer,
    burn,
    burnFrom,
    approve,
    transferFrom,
    // State
    events,
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    writeError,
    userAddress,
  };
}
