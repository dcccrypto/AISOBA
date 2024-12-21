import '../styles/globals.css';
import '../styles/wallet-adapter.css';
import type { AppProps } from 'next/app'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/router'
import * as gtag from '../lib/gtag'

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css')

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

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
            <div className="relative min-h-screen">
              <Component {...pageProps} />
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  )
} 