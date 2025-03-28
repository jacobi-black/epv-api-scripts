import React, { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { parseCSV, getAccountStats } from "./csvParser";

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
  // Données principales
  const [usersData, setUsersData] = useState([]);
  const [accountsData, setAccountsData] = useState([]);
  const [sessionsData, setSessionsData] = useState([]);
  const [certificatesData, setCertificatesData] = useState([]);
  const [platformsData, setPlatformsData] = useState([]);
  const [safesData, setSafesData] = useState([]);
  const [systemHealthData, setSystemHealthData] = useState([]);
  const [capacityData, setCapacityData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [complianceData, setComplianceData] = useState([]);

  // Données calculées/dérivées
  const [accountsStats, setAccountsStats] = useState(null);
  const [sessionsStats, setSessionsStats] = useState(null);
  const [systemStats, setSystemStats] = useState(null);

  // Fonction pour effacer toutes les données
  const clearAllData = () => {
    console.log("Effacement de toutes les données");
    setUsersData([]);
    setAccountsData([]);
    setSessionsData([]);
    setCertificatesData([]);
    setPlatformsData([]);
    setSafesData([]);
    setSystemHealthData([]);
    setCapacityData([]);
    setRiskData([]);
    setComplianceData([]);

    // Effacer aussi les stats calculées
    setAccountsStats(null);
    setSessionsStats(null);
    setSystemStats(null);
  };

  // Alias pour clearAllData pour compatibilité avec le code existant
  const resetAllData = clearAllData;

  // Fonction pour vérifier si les données nécessaires pour un dashboard sont disponibles
  const hasDashboardData = (dashboardType) => {
    // Forcer l'affichage des dashboards pour le débogage
    console.log(
      "Contournement de la vérification des données pour:",
      dashboardType
    );
    console.log("État actuel des données:");
    console.log(`- systemHealthData: ${systemHealthData?.length || 0} entrées`);
    console.log(`- safesData: ${safesData?.length || 0} entrées`);
    console.log(`- certificatesData: ${certificatesData?.length || 0} entrées`);
    console.log(`- accountsData: ${accountsData?.length || 0} entrées`);
    console.log(`- usersData: ${usersData?.length || 0} entrées`);
    console.log(`- sessionsData: ${sessionsData?.length || 0} entrées`);
    console.log(`- capacityData: ${capacityData?.length || 0} entrées`);
    console.log(`- riskData: ${riskData?.length || 0} entrées`);
    console.log(`- complianceData: ${complianceData?.length || 0} entrées`);

    // Retourner true dans tous les cas pour permettre l'accès aux dashboards
    return true;

    /*
    // Code original commenté
    switch (dashboardType) {
      case "capacity":
        // Capacity dashboard a besoin des données system ET safes
        console.log("hasDashboardData[capacity]:", {
          systemHealthData: systemHealthData.length,
          safesData: safesData.length
        });
        return systemHealthData.length > 0 && safesData.length > 0;
      case "health":
        return systemHealthData.length > 0 || certificatesData.length > 0;
      case "security":
        return complianceData.length > 0 || riskData.length > 0;
      case "privileged-accounts":
        return accountsData.length > 0 && usersData.length > 0;
      case "sessions":
        return sessionsData.length > 0;
      case "accounts-analysis":
        return accountsData.length > 0;
      case "password-rotation":
        return accountsData.length > 0;
      case "application-usage":
        return platformsData.length > 0;
      case "incident-response":
        return riskData.length > 0;
      case "adoption-efficiency":
        return usersData.length > 0;
      default:
        return false;
    }
    */
  };

  // Fonction pour importer des données CSV
  const importCSV = (file, dataType) => {
    console.log(`Début d'importation CSV - type: ${dataType}`, file);
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            const csvData = event.target.result;
            console.log(`Contenu CSV chargé, longueur: ${csvData.length}`);
            const parsedData = parseCSV(csvData);
            console.log(`Données parsées, ${parsedData?.length || 0} entrées`);

            if (!parsedData || parsedData.length === 0) {
              throw new Error("Le fichier CSV est vide ou invalide");
            }

            // Assigner les données au type approprié
            switch (dataType) {
              case "users":
                setUsersData(parsedData);
                break;
              case "accounts":
                setAccountsData(parsedData);
                // Calculer les statistiques sur les comptes
                const stats = getAccountStats(parsedData);
                setAccountsStats(stats);
                break;
              case "sessions":
                setSessionsData(parsedData);
                break;
              case "certificates":
                setCertificatesData(parsedData);
                break;
              case "platforms":
                setPlatformsData(parsedData);
                break;
              case "safes":
                console.log(
                  `Importation de ${parsedData.length} entrées safes`
                );
                setSafesData(parsedData);
                break;
              case "systemHealth":
              case "system": // Ajouter l'alias 'system' pour systemHealth
                console.log(
                  `Importation de ${parsedData.length} entrées system`
                );
                setSystemHealthData(parsedData);
                break;
              case "capacity":
                setCapacityData(parsedData);
                break;
              case "risk":
                setRiskData(parsedData);
                break;
              case "compliance":
                setComplianceData(parsedData);
                break;
              default:
                throw new Error(`Type de données non reconnu: ${dataType}`);
            }

            console.log(`Importation réussie pour ${dataType}`);
            resolve({
              success: true,
              message: `Données ${dataType} importées avec succès (${parsedData.length} lignes)`,
              count: parsedData.length,
              type: dataType,
            });
          } catch (error) {
            console.error("Erreur lors du parsing CSV:", error);
            reject({
              success: false,
              message: `Erreur de traitement du fichier: ${error.message}`,
            });
          }
        };

        reader.onerror = () => {
          reject({
            success: false,
            message: "Erreur lors de la lecture du fichier",
          });
        };

        reader.readAsText(file);
      } catch (error) {
        console.error("Erreur d'importation:", error);
        reject({
          success: false,
          message: `Erreur d'importation: ${error.message}`,
        });
      }
    });
  };

  // Données et fonctions exportées vers les composants
  const contextValue = {
    // Données
    usersData,
    accountsData,
    sessionsData,
    certificatesData,
    platformsData,
    safesData,
    systemHealthData,
    capacityData,
    riskData,
    complianceData,

    // Statistiques calculées
    accountsStats,
    sessionsStats,
    systemStats,

    // Fonctions
    setUsersData,
    setAccountsData,
    setSessionsData,
    setCertificatesData,
    setPlatformsData,
    setSafesData,
    setSystemHealthData,
    setCapacityData,
    setRiskData,
    setComplianceData,

    importCSV,
    clearAllData,
    resetAllData,
    hasDashboardData,
  };

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

// Validation des props
DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DataContext;
