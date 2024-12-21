import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Commitment } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletMultiButtonDynamic } from '@solana/wallet-adapter-react';

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
    <div className="card p-8 bg-[#2a2a2a] border border-[#ff6b00]/10 rounded-lg overflow-hidden relative z-10">
      <div className="relative">
        {!publicKey && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
                Create Your SOBA Chimp
              </h2>
              <p className="text-gray-400">
                Connect your wallet to start generating your unique SOBA chimpanzee PFP
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <WalletMultiButtonDynamic className="!bg-[#ff6b00] hover:!bg-[#ff8533] transition-colors !h-auto !py-3 !px-6" />
            </div>
          </div>
        )}

        {publicKey && tokenBalance !== null && tokenBalance < requiredAmount && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white">Get More $SOBA</h2>
              <p className="text-gray-400">
                You need at least {requiredAmount} $SOBA tokens to create your custom SOBA chimp PFP
              </p>
              <div className="flex items-center gap-2 justify-center md:justify-start text-sm text-gray-400">
                <span>Current Balance:</span>
                <span className="text-[#ff6b00] font-medium">{tokenBalance} $SOBA</span>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <a
                href="https://jup.ag/swap/SOL-soba"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-8 py-3"
              >
                Get $SOBA Tokens
              </a>
            </div>
          </div>
        )}

        {publicKey && tokenBalance !== null && tokenBalance >= requiredAmount && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="text-2xl font-bold text-[#ff6b00]">Ready to Create!</h2>
              <p className="text-gray-400">
                You have enough $SOBA tokens. Start creating your SOBA chimp PFP below.
              </p>
              <div className="flex items-center gap-2 justify-center md:justify-start text-sm text-gray-400">
                <span>Current Balance:</span>
                <span className="text-[#ff6b00] font-medium">{tokenBalance} $SOBA</span>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="bg-[#ff6b00]/10 rounded-lg px-4 py-2">
                <span className="text-[#ff6b00] font-medium">✓ Verified</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-center md:text-left text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 