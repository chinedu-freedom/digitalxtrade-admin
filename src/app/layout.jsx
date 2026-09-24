import './globals.css';
import { Inter, Righteous } from 'next/font/google';
import Script from 'next/script';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import FaviconGuard from '../components/FaviconGuard';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: false,
  preload: false,
});

const righteous = Righteous({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-righteous',
  display: 'swap',
  fallback: ['system-ui', 'cursive'],
  adjustFontFallback: false,
  preload: false,
});

export const metadata = {
  title: 'DigitalXTrade Admin Control Portal',
  description: 'Manage users, investments, deposits, withdrawals, and system settings for DigitalXTrade.',
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${righteous.variable}`}>
      <head />
      <body className={`${inter.className} bg-[#07193b] text-slate-100 antialiased min-h-screen font-sans`}>
        <FaviconGuard />
        <AdminAuthProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AdminAuthProvider>
      </body>
    </html>
  );
}
