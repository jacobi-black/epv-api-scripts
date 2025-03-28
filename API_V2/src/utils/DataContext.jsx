import React, { createContext, useContext, useState } from "react";

// Create the context
const DataContext = createContext();

// Custom hook to use the context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

// Context provider component
export const DataProvider = ({ children }) => {
  // State for different types of data
  const [accountsData, setAccountsData] = useState([]);
  const [safesData, setSafesData] = useState([]);
  const [systemHealthData, setSystemHealthData] = useState([]);

  // State for statistics
  const [accountsStats, setAccountsStats] = useState(null);
  const [safesStats, setSafesStats] = useState(null);
  const [systemHealthStats, setSystemHealthStats] = useState(null);

  // Function to reset all data
  const resetAllData = () => {
    setAccountsData([]);
    setSafesData([]);
    setSystemHealthData([]);
    setAccountsStats(null);
    setSafesStats(null);
    setSystemHealthStats(null);
  };

  // The context value
  const value = {
    accountsData,
    setAccountsData,
    safesData,
    setSafesData,
    systemHealthData,
    setSystemHealthData,
    accountsStats,
    setAccountsStats,
    safesStats,
    setSafesStats,
    systemHealthStats,
    setSystemHealthStats,
    resetAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
