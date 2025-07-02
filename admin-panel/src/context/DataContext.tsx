import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DataContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DataContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </DataContext.Provider>
  );
};