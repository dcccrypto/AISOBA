import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Commitment } from '@solana/web3.js';
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
      const tokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT_ADDRESS,
        publicKey,
        false
      );

      try {
        // First check if account exists
        const accountInfo = await connection.getAccountInfo(
          tokenAccount,
          'confirmed' as Commitment
        );

        if (!accountInfo) {
          setTokenBalance(0);
          onVerification(false);
          setError(`No tokens found. You need at least ${requiredAmount} tokens.`);
          return;
        }

        // Then get token account data
        try {
          const account = await getAccount(connection, tokenAccount);
          const balance = Number(account.amount) / Math.pow(10, TOKEN_DECIMALS);
          setTokenBalance(balance);
          
          const hasEnoughTokens = balance >= requiredAmount;
          onVerification(hasEnoughTokens);
          
          if (!hasEnoughTokens) {
            setError(`Insufficient token balance. You need at least ${requiredAmount} tokens.`);
          }
        } catch (tokenError) {
          console.error('Error getting token account:', tokenError);
          setError('Error retrieving token balance');
          onVerification(false);
        }
      } catch (accountError) {
        console.error('Error getting account info:', accountError);
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

  useEffect(() => {
    if (publicKey) {
      checkTokenBalance();
    } else {
      setTokenBalance(null);
      setError(null);
      onVerification(false);
    }
  }, [publicKey]);

  return (
    <div className="card transform hover:scale-[1.01] transition-transform duration-300">
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
        Token Verification
      </h2>
      
      {publicKey ? (
        <>
          {loading ? (
            <div className="flex items-center space-x-3 text-gray-400">
              <div className="loading-spinner" />
              <p>Checking token balance...</p>
            </div>
          ) : (
            <>
              {tokenBalance !== null && (
                <div className="mb-4 p-4 rounded-lg bg-[#1a1a1a]/50">
                  <p className="text-lg">
                    Current Balance: 
                    <span className="font-bold ml-2 text-[#ff6b00]">
                      {tokenBalance}
                    </span> 
                    <span className="text-gray-400 ml-1">tokens</span>
                  </p>
                </div>
              )}
              {error ? (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                tokenBalance !== null && tokenBalance >= requiredAmount && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-[#ff6b00] flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Sufficient token balance
                    </p>
                  </div>
                )
              )}
              <button
                onClick={checkTokenBalance}
                className="btn-secondary mt-4 w-full sm:w-auto"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Balance
                </span>
              </button>
            </>
          )}
        </>
      ) : (
        <div className="p-4 rounded-lg bg-[#1a1a1a]/50 text-center">
          <p className="text-gray-400">Please connect your wallet to check token balance</p>
        </div>
      )}
    </div>
  );
} 