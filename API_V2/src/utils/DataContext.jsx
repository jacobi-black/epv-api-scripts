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
  // État pour les données standard
  const [accountsData, setAccountsData] = useState([]);
  const [safesData, setSafesData] = useState([]);
  const [systemHealthData, setSystemHealthData] = useState([]);

  // État pour les données spécifiques aux dashboards avancés
  const [usersData, setUsersData] = useState([]);
  const [sessionsData, setSessionsData] = useState([]);
  const [certificatesData, setCertificatesData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [applicationsData, setApplicationsData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [accessData, setAccessData] = useState([]);
  const [usageData, setUsageData] = useState([]);

  // État pour les statistiques calculées
  const [accountsStats, setAccountsStats] = useState(null);
  const [safesStats, setSafesStats] = useState(null);
  const [systemHealthStats, setSystemHealthStats] = useState(null);
  const [usersStats, setUsersStats] = useState(null);
  const [sessionsStats, setSessionsStats] = useState(null);
  const [riskStats, setRiskStats] = useState(null);

  // Function to reset all data
  const resetAllData = () => {
    // Réinitialiser les données standard
    setAccountsData([]);
    setSafesData([]);
    setSystemHealthData([]);

    // Réinitialiser les données spécifiques
    setUsersData([]);
    setSessionsData([]);
    setCertificatesData([]);
    setRiskData([]);
    setPendingData([]);
    setApplicationsData([]);
    setPerformanceData([]);
    setAccessData([]);
    setUsageData([]);

    // Réinitialiser les statistiques
    setAccountsStats(null);
    setSafesStats(null);
    setSystemHealthStats(null);
    setUsersStats(null);
    setSessionsStats(null);
    setRiskStats(null);
  };

  // Vérifie si les données requises pour un dashboard spécifique sont disponibles
  const hasDashboardData = (dashboardType) => {
    switch (dashboardType) {
      case "capacity":
        return systemHealthData.length > 0 && safesData.length > 0;
      case "health":
        return systemHealthData.length > 0 && certificatesData.length > 0;
      case "security":
        return riskData.length > 0 && accountsData.length > 0;
      case "privileged-accounts":
        return accountsData.length > 0 && usersData.length > 0;
      case "sessions":
        return sessionsData.length > 0 && riskData.length > 0;
      case "password-rotation":
        return safesData.length > 0 && pendingData.length > 0;
      case "application-usage":
        return applicationsData.length > 0 && performanceData.length > 0;
      case "incident-response":
        return riskData.length > 0 && systemHealthData.length > 0;
      case "adoption-efficiency":
        return usersData.length > 0 && usageData.length > 0;
      default:
        return false;
    }
  };

  // The context value
  const value = {
    // Données standard
    accountsData,
    setAccountsData,
    safesData,
    setSafesData,
    systemHealthData,
    setSystemHealthData,

    // Données spécifiques
    usersData,
    setUsersData,
    sessionsData,
    setSessionsData,
    certificatesData,
    setCertificatesData,
    riskData,
    setRiskData,
    pendingData,
    setPendingData,
    applicationsData,
    setApplicationsData,
    performanceData,
    setPerformanceData,
    accessData,
    setAccessData,
    usageData,
    setUsageData,

    // Statistiques
    accountsStats,
    setAccountsStats,
    safesStats,
    setSafesStats,
    systemHealthStats,
    setSystemHealthStats,
    usersStats,
    setUsersStats,
    sessionsStats,
    setSessionsStats,
    riskStats,
    setRiskStats,

    // Fonctions utilitaires
    resetAllData,
    hasDashboardData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
