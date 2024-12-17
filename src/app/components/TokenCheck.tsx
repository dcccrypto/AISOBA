import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

interface TokenCheckProps {
  requiredAmount: number;
  onVerification: (hasEnough: boolean) => void;
}

export default function TokenCheck({ requiredAmount, onVerification }: TokenCheckProps) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number>(0);

  const TOKEN_MINT_ADDRESS = 'YOUR_TOKEN_MINT_ADDRESS';

  useEffect(() => {
    const checkBalance = async () => {
      if (!publicKey) return;

      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        const userToken = tokenAccounts.value.find(
          (account) => account.account.data.parsed.info.mint === TOKEN_MINT_ADDRESS
        );

        if (userToken) {
          const balance = Number(userToken.account.data.parsed.info.tokenAmount.amount);
          setBalance(balance);
          onVerification(balance >= requiredAmount);
        }
      } catch (error) {
        console.error('Error checking token balance:', error);
      }
    };

    checkBalance();
  }, [publicKey, connection]);

  return (
    <div className="mb-8">
      <h2 className="text-2xl mb-4">Token Verification</h2>
      <p>Your balance: {balance} tokens</p>
      <p>Required amount: {requiredAmount} tokens</p>
    </div>
  );
} 