import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {isAuthenticated && <Sidebar />}
        <main 
          style={{ 
            flex: 1, 
            padding: isAuthenticated ? '1.75rem 2rem' : '2.5rem 1.5rem', 
            maxWidth: isAuthenticated ? 'calc(100vw - 250px)' : '1440px', 
            margin: '0 auto', 
            width: '100%',
            overflowX: 'hidden'
          }}
        >
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
