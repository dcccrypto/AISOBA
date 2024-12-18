import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

interface TokenCheckProps {
  requiredAmount: number;
  onVerification: (hasEnough: boolean) => void;
}

const TOKEN_MINT_ADDRESS = new PublicKey('25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH');
const TOKEN_DECIMALS = 6;

export default function TokenCheck({ requiredAmount, onVerification }: TokenCheckProps) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  const checkTokenBalance = async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const retryCount = 3;
      let lastError;

      for (let i = 0; i < retryCount; i++) {
        try {
          const tokenAccount = await getAssociatedTokenAddress(
            TOKEN_MINT_ADDRESS,
            publicKey
          );

          const account = await getAccount(connection, tokenAccount);
          const balance = Number(account.amount) / Math.pow(10, TOKEN_DECIMALS);
          setTokenBalance(balance);
          
          const hasEnoughTokens = balance >= requiredAmount;
          onVerification(hasEnoughTokens);
          
          if (!hasEnoughTokens) {
            setError(`Insufficient token balance. You need at least ${requiredAmount} tokens.`);
          }
          return;
        } catch (e: any) {
          lastError = e;
          if (e.message?.includes('could not find account')) {
            setTokenBalance(0);
            onVerification(false);
            setError(`No tokens found. You need at least ${requiredAmount} tokens.`);
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.error('Error checking token balance:', lastError);
      setError('Network error. Please try again.');
      onVerification(false);
    } catch (error) {
      console.error('Error checking token balance:', error);
      setError('Error checking token balance. Please try again.');
      onVerification(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      checkTokenBalance();
    } else {
      onVerification(false);
      setTokenBalance(null);
      setError(null);
    }
  }, [publicKey]);

  return (
    <div className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-2xl mb-4">Token Verification</h2>
      
      {publicKey ? (
        <>
          {loading ? (
            <p className="text-gray-600">Checking token balance...</p>
          ) : (
            <>
              {tokenBalance !== null && (
                <p className="mb-2">
                  Current Balance: <span className="font-bold">{tokenBalance}</span> tokens
                </p>
              )}
              {error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                tokenBalance !== null && tokenBalance >= requiredAmount && (
                  <p className="text-green-500">✓ Sufficient token balance</p>
                )
              )}
              <button
                onClick={checkTokenBalance}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh Balance
              </button>
            </>
          )}
        </>
      ) : (
        <p className="text-gray-600">Please connect your wallet to check token balance</p>
      )}
    </div>
  );
} 