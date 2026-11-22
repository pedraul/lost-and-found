'use client';

import Navbar from './Navbar';
import Footer from './Footer';

export default function AppShell({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
