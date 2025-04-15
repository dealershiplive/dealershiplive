import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SettingsProvider } from '../contexts/SettingsContext';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <SettingsProvider>
        <Component {...pageProps} />
      </SettingsProvider>
      <Toaster position="top-right" />
    </SessionProvider>
  );
}

export default MyApp; 