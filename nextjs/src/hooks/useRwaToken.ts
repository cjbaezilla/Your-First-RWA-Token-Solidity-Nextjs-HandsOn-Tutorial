import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { TOKEN_CONTRACT } from '../contracts/MyFirstTokenERC20RWA';
import { useCallback } from 'react';

export function useRwaToken() {
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read functions
  const useTokenBalance = (address: string | undefined) => {
    return useReadContract({
      ...TOKEN_CONTRACT,
      functionName: 'balanceOf',
      args: address ? [address as `0x${string}`] : undefined,
      query: {
        enabled: !!address,
      },
    });
  };

  const useTokenSupply = () => {
    return useReadContract({
      ...TOKEN_CONTRACT,
      functionName: 'totalSupply',
    });
  };

  const useIsUserAllowed = (address: string | undefined) => {
    return useReadContract({
      ...TOKEN_CONTRACT,
      functionName: 'isUserAllowed',
      args: address ? [address as `0x${string}`] : undefined,
      query: {
        enabled: !!address,
      },
    });
  };

  // Write functions
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

  return {
    // Hooks
    useTokenBalance,
    useTokenSupply,
    useIsUserAllowed,
    // Actions
    mint,
    freeze,
    allowUser,
    disallowUser,
    // Status
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    writeError,
  };
}
