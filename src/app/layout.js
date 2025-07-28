// app/layout.js
import AuthProvider from '../components/AuthProvider';
import Navbar from '../components/Navbar';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  // ...
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster position="bottom-center" /> 
          <Navbar />
          <main style={{ padding: '1rem' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}