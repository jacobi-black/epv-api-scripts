import React, { createContext, useState, useContext, useEffect } from "react";
import { muiTheme, antdTheme, darkModeOverrides } from "./dashboardTheme";
import { ConfigProvider } from "antd";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { merge } from "lodash";

// Création du contexte pour le thème
const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {},
});

// Hook personnalisé pour utiliser le contexte de thème
export const useTheme = () => useContext(ThemeContext);

/**
 * Fournisseur de thème pour l'application
 * Gère le thème global et le mode sombre
 */
export const ThemeContextProvider = ({ children }) => {
  // État pour le mode sombre
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Détecter les préférences système pour le mode sombre
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener("change", handleChange);

    return () => {
      darkModeMediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Fonction pour basculer le mode sombre
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Créer le thème MUI en fonction du mode
  const currentMuiTheme = createTheme(
    isDarkMode
      ? merge({}, muiTheme, {
          palette: { mode: "dark" },
          ...darkModeOverrides.mui,
        })
      : muiTheme
  );

  // Créer le thème Ant Design en fonction du mode
  const currentAntdTheme = isDarkMode
    ? merge({}, antdTheme, {
        token: {
          colorBgBase: "#242424",
          colorTextBase: "rgba(255, 255, 255, 0.85)",
        },
        components: darkModeOverrides.antd.components,
      })
    : antdTheme;

  // Valeur fournie par le contexte
  const themeContextValue = {
    isDarkMode,
    toggleDarkMode,
    setDarkMode: setIsDarkMode,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={currentMuiTheme}>
        <ConfigProvider theme={currentAntdTheme}>{children}</ConfigProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
