import type { AppProps } from 'next/app'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo } from 'react'

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css')

export default function App({ Component, pageProps }: AppProps) {
  // Changed to correct enum value
  const network = WalletAdapterNetwork.Mainnet
  const endpoint = useMemo(() => 
    'https://solana-mainnet.g.alchemy.com/v2/4hNmNbgU4S5nb-f6Aq7vo2TF5MC-0lTb' || // Replace with your Alchemy API key
    'https://mainnet.helius-rpc.com/?api-key=e568033d-06d6-49d1-ba90-b3564c91851b' || // Replace with your Helius API key
    'https://api.mainnet-beta.solana.com', // Fallback to public endpoint
  []);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
} 