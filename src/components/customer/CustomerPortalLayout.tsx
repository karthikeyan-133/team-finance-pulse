
import React from 'react';

interface CustomerPortalLayoutProps {
  children: React.ReactNode;
}

const CustomerPortalLayout: React.FC<CustomerPortalLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-sm mx-auto">
      {children}
    </div>
  );
};

export default CustomerPortalLayout;
