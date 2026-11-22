import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import AppShell from '../components/AppShell';

export const metadata = {
  title: 'Lost & Found Platform',
  description: 'Register, track, and recover lost items',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <PreferencesProvider>
            <AppShell>{children}</AppShell>
          </PreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
