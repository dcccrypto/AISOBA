import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

interface TokenCheckProps {
  requiredAmount: number;
  onVerification: (hasEnough: boolean) => void;
}

// Update token mint address to the actual mainnet token
const TOKEN_MINT_ADDRESS = new PublicKey('25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH');
const TOKEN_DECIMALS = 6; // Add decimals constant

export default function TokenCheck({ requiredAmount, onVerification }: TokenCheckProps) {
  const { publicKey } = useWallet();
  const { connection } = useConnection(); // Use connection from context
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  useEffect(() => {
    if (publicKey) {
      checkTokenBalance();
    } else {
      onVerification(false);
      setTokenBalance(null);
      setError(null);
    }
  }, [publicKey]);

  const checkTokenBalance = async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const tokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT_ADDRESS,
        publicKey
      );

      try {
        const account = await getAccount(connection, tokenAccount);
        const balance = Number(account.amount) / Math.pow(10, TOKEN_DECIMALS);
        setTokenBalance(balance);
        
        const hasEnoughTokens = balance >= requiredAmount;
        onVerification(hasEnoughTokens);
        
        if (!hasEnoughTokens) {
          setError(`Insufficient token balance. You need at least ${requiredAmount} tokens.`);
        }
      } catch (e) {
        setTokenBalance(0);
        onVerification(false);
        setError(`No tokens found. You need at least ${requiredAmount} tokens.`);
      }
    } catch (error) {
      console.error('Error checking token balance:', error);
      setError('Error checking token balance. Please try again.');
      onVerification(false);
    } finally {
      setLoading(false);
    }
  };

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