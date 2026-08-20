import React, { useState } from 'react';
import { AdminPanel } from '../components/AdminPanel';
import { AdminLogin } from '../components/AdminLogin';

export const AdminPage: React.FC = () => {
  // Always require authentication on every page visit / refresh
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleExit = () => {
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#121316] text-[#F2EEE8] selection:bg-[#FF2D85]/30">
      {isAuthenticated ? (
        <AdminPanel onClose={handleExit} />
      ) : (
        <AdminLogin
          onSuccess={handleLoginSuccess}
          onCancel={() => {
            window.location.href = '/';
          }}
        />
      )}
    </div>
  );
};
