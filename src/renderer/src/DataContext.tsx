// DataContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DataContextProps {
  selectedValue: string;
  setSelectedValueContext: (value: string) => void;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  const setSelectedValueContext = (value: string) => {
    setSelectedValue(value);
  };

  return (
    <DataContext.Provider value={{ selectedValue, setSelectedValueContext }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
