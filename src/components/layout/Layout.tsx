import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.tsx';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
