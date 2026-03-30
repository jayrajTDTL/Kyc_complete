import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import '../styles/Layout.css';

export const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 992 : false
  );
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > 992 : true
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 992;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div
      className={`layout ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'} ${
        isMobile ? 'is-mobile' : ''
      }`}
    >
      <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} isMobile={isMobile} />
      <div className="layout-body">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          isMobile={isMobile}
        />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};
