import type { AppProps } from 'next/app'
import WalletContextProvider from '../components/WalletProvider'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletContextProvider>
      <Component {...pageProps} />
    </WalletContextProvider>
  )
} 