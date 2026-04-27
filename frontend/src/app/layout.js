import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: { default: 'Hotel Booking', template: '%s | Hotel Booking' },
  description: 'Book hotel rooms easily',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-gray-50 font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </AuthProvider>
      </body>
    </html>
  );
}
