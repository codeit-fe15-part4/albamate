import './globals.css';

// dynamic 없이 일반 import
import ModalManager from '@common/modal/ModalManager';
import { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';

import { Providers } from '@/app/providers';
import ClientGnbWrapper from '@/shared/components/common/gnb/ClientGnbWrapper';
import EditPopup from '@/shared/components/common/popup/EditPopup';

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  variable: '--font-pretendard',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Albamate',
  description: 'Albamate application', // 추후 변경 가능
  authors: [{ name: 'Albamate Team' }],
  keywords: ['알바', '채용', '구인', '구직', 'Albamate'],
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning lang="ko">
      <body className={`${pretendard.className} dark:bg-gray-900`}>
        <SessionProvider>
          <ThemeProvider enableSystem attribute="class" defaultTheme="system">
            <Providers>
              <ClientGnbWrapper />
              {children}
              <ModalManager />
              <EditPopup />
            </Providers>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
