import React, { createContext, useContext, useState, useEffect } from "react";
import { retrieveData } from "./csvParser";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load data from session storage on initial render
  useEffect(() => {
    try {
      const accounts = retrieveData("accounts");
      const safes = retrieveData("safes");
      const systemHealth = retrieveData("systemHealth");

      if (accounts) setAccountsData(accounts);
      if (safes) setSafesData(safes);
      if (systemHealth) setSystemHealthData(systemHealth);

      // Check if we have any data
      setLastUpdated(sessionStorage.getItem("lastUpdated") || null);
      setLoading(false);
    } catch (err) {
      setError("Error loading data from storage");
      setLoading(false);
      console.error("Error loading data:", err);
    }
  }, []);

  // Function to update a specific data type
  const updateData = (type, data) => {
    try {
      if (type === "accounts") {
        setAccountsData(data);
      } else if (type === "safes") {
        setSafesData(data);
      } else if (type === "systemHealth") {
        setSystemHealthData(data);
      }

      // Update last updated timestamp
      const timestamp = new Date().toISOString();
      setLastUpdated(timestamp);
      sessionStorage.setItem("lastUpdated", timestamp);
    } catch (err) {
      setError(`Error updating ${type} data`);
      console.error(`Error updating ${type} data:`, err);
    }
  };

  // Function to clear all data
  const clearData = () => {
    setAccountsData([]);
    setSafesData([]);
    setSystemHealthData([]);
    setLastUpdated(null);
    sessionStorage.clear();
  };

  // The context value
  const value = {
    accountsData,
    setAccountsData,
    safesData,
    setSafesData,
    systemHealthData,
    setSystemHealthData,
    loading,
    error,
    lastUpdated,
    updateData,
    clearData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
