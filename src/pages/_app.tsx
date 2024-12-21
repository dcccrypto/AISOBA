import '../styles/globals.css';
import type { AppProps } from 'next/app'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css')

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  // Changed to correct enum value
  const network = WalletAdapterNetwork.Mainnet
  const endpoint = useMemo(() => {
    // Use a single reliable RPC endpoint
    return 'https://mainnet.helius-rpc.com/?api-key=e568033d-06d6-49d1-ba90-b3564c91851b';
  }, []);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Component {...pageProps} />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  )
} 