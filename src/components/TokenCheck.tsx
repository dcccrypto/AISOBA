import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey, Commitment } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import dynamic from 'next/dynamic';

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

interface TokenCheckProps {
  requiredAmount: number;
  onVerification: (hasEnough: boolean) => void;
}

export default function TokenCheck({ requiredAmount, onVerification }: TokenCheckProps) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkBalance() {
      if (!publicKey) {
        setTokenBalance(0);
        onVerification(false);
        setIsLoading(false);
        return;
      }

      try {
        const sobaTokenMint = new PublicKey('25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH');
        const tokenAccount = await getAssociatedTokenAddress(
          sobaTokenMint,
          publicKey
        );

        try {
          const account = await getAccount(connection, tokenAccount);
          // Convert from raw amount (considering 9 decimals)
          const rawBalance = Number(account.amount);
          const balance = rawBalance / 1e6; // Divide by 10^6 for proper decimal handling
          setTokenBalance(balance);
          onVerification(balance >= requiredAmount);
        } catch (e) {
          // Account doesn't exist
          setTokenBalance(0);
          onVerification(false);
        }
      } catch (error) {
        console.error('Error checking token balance:', error);
        setTokenBalance(0);
        onVerification(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkBalance();
  }, [publicKey, connection, requiredAmount, onVerification]);

  return (
    <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#ff6b00]/10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            Connect Wallet & Check $SOBA Balance
          </h2>
          <p className="text-gray-400">
            You need at least {requiredAmount} $SOBA tokens to generate images
          </p>
        </div>

        <div className="flex items-center gap-4">
          {publicKey && !isLoading && (
            <div className="text-right">
              <p className="text-sm text-gray-400">Balance:</p>
              <p className={`font-bold ${tokenBalance >= requiredAmount ? 'text-green-500' : 'text-red-500'}`}>
                {tokenBalance.toFixed(2)} $SOBA
              </p>
            </div>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </div>
  );
} 