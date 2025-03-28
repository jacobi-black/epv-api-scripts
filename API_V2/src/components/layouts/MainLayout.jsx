import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { styled, alpha } from "@mui/material/styles";
import {
  Box,
  Menu,
  MenuItem,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  Zoom,
  Fade,
  ListItemIcon,
  Chip,
  Tooltip,
  Fab,
} from "@mui/material";

// Icons
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SpeedIcon from "@mui/icons-material/Speed";
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import PasswordRoundedIcon from "@mui/icons-material/PasswordRounded";
import ApiRoundedIcon from "@mui/icons-material/ApiRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";

// Palette de couleurs très simplifiée - principalement des teintes de bleu et gris
const colorPalette = {
  primary: "#1976d2",
  primaryLight: "#42a5f5",
  primaryVeryLight: "#bbdefb",
  primaryDark: "#0d47a1",
  primaryVeryDark: "#002171",
  // Un seul accent pour les éléments importants
  accent: "#2e7d32",
  // Nuances de gris
  grey50: "#fafafa",
  grey100: "#f5f5f5",
  grey200: "#eeeeee",
  grey300: "#e0e0e0",
  grey400: "#bdbdbd",
  grey500: "#9e9e9e",
  grey600: "#757575",
  grey700: "#616161",
  grey800: "#424242",
  grey900: "#212121",
};

// Menu items with nested structure
const menuItems = [
  {
    text: "Accueil",
    icon: <HomeRoundedIcon />,
    path: "/",
    exact: true,
    color: colorPalette.primary,
  },
  {
    text: "Capacity Dashboard",
    icon: <SpeedIcon />,
    path: "/capacity",
    color: colorPalette.primaryDark,
  },
  {
    text: "Health Dashboard",
    icon: <HealthAndSafetyRoundedIcon />,
    path: "/health",
    color: colorPalette.primary,
  },
  {
    text: "Security & Compliance",
    icon: <SecurityRoundedIcon />,
    path: "/security",
    color: colorPalette.primaryDark,
  },
  {
    text: "Privileged Accounts",
    icon: <AccountCircleRoundedIcon />,
    path: "/privileged-accounts",
    color: colorPalette.primary,
  },
  {
    text: "Session Monitoring",
    icon: <MonitorHeartRoundedIcon />,
    path: "/sessions",
    color: colorPalette.primaryLight,
  },
  {
    text: "Password Rotation",
    icon: <PasswordRoundedIcon />,
    path: "/password-rotation",
    color: colorPalette.primaryDark,
  },
  {
    text: "Applications & API",
    icon: <ApiRoundedIcon />,
    path: "/application-usage",
    color: colorPalette.grey600,
  },
  {
    text: "Incident Response",
    icon: <ReportProblemRoundedIcon />,
    path: "/incident-response",
    color: colorPalette.primary,
  },
  {
    text: "Adoption & Efficiency",
    icon: <AssessmentRoundedIcon />,
    path: "/adoption-efficiency",
    color: colorPalette.primaryLight,
  },
];

// Contenu principal avec effet de fondu et padding dynamique
const MainContent = styled("main")(({ theme, haspadding }) => ({
  flexGrow: 1,
  padding: haspadding === "true" ? theme.spacing(4, 3, 3, 3) : 0,
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflowX: "hidden",
}));

// Bouton d'accueil flottant
const HomeButton = styled(Fab)(({ theme, isdarkmode }) => ({
  position: "fixed",
  top: theme.spacing(3),
  left: theme.spacing(3),
  zIndex: 100,
  backgroundColor:
    isdarkmode === "true"
      ? alpha(theme.palette.background.paper, 0.5)
      : alpha(theme.palette.background.paper, 0.8),
  color:
    isdarkmode === "true"
      ? alpha(theme.palette.common.white, 0.9)
      : colorPalette.primary,
  backdropFilter: "blur(5px)",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  "&:hover": {
    backgroundColor:
      isdarkmode === "true"
        ? alpha(theme.palette.background.paper, 0.7)
        : alpha(theme.palette.background.paper, 0.95),
    transform: "translateY(-2px)",
    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
  },
}));

// Bouton de changement de thème
const ThemeToggleButton = styled(Fab)(({ theme, isdarkmode }) => ({
  position: "fixed",
  bottom: theme.spacing(3),
  left: theme.spacing(3),
  zIndex: 100,
  backgroundColor:
    isdarkmode === "true"
      ? alpha(theme.palette.background.paper, 0.5)
      : alpha(theme.palette.background.paper, 0.8),
  color:
    isdarkmode === "true"
      ? alpha(theme.palette.common.white, 0.9)
      : colorPalette.grey600,
  backdropFilter: "blur(5px)",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  "&:hover": {
    backgroundColor:
      isdarkmode === "true"
        ? alpha(theme.palette.background.paper, 0.7)
        : alpha(theme.palette.background.paper, 0.95),
  },
}));

const MenuContainer = styled(Menu)(({ theme, isdarkmode }) => ({
  "& .MuiMenu-paper": {
    maxWidth: 340,
    maxHeight: "80vh",
    borderRadius: theme.spacing(2),
    backdropFilter: "blur(10px)",
    backgroundColor:
      isdarkmode === "true"
        ? alpha(theme.palette.background.paper, 0.9)
        : alpha(theme.palette.background.paper, 0.95),
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    overflow: "hidden",
    padding: theme.spacing(1, 0),
  },
  "& .MuiList-padding": {
    padding: theme.spacing(1, 0),
  },
  "& .MuiMenuItem-root": {
    transition: "all 0.2s ease",
    padding: theme.spacing(1, 2),
    margin: theme.spacing(0.3, 1),
    borderRadius: theme.spacing(1),
    "&:hover": {
      backgroundColor: alpha(colorPalette.primary, 0.08),
    },
    "&.Mui-selected": {
      backgroundColor: alpha(colorPalette.primary, 0.12),
      "&:hover": {
        backgroundColor: alpha(colorPalette.primary, 0.15),
      },
    },
  },
}));

const AnimatedMenuItem = styled(MenuItem)(
  ({ theme, color, active, isdarkmode }) => ({
    borderRadius: theme.spacing(1.5),
    margin: theme.spacing(0.5, 1),
    padding: theme.spacing(1, 1.5),
    transition: "all 0.2s ease",
    backgroundColor: active
      ? alpha(color || colorPalette.primary, isdarkmode === "true" ? 0.15 : 0.1)
      : "transparent",
    "&:hover": {
      backgroundColor: alpha(
        color || colorPalette.primary,
        isdarkmode === "true" ? 0.2 : 0.15
      ),
      transform: "translateX(4px)",
    },
    "&:active": {
      transform: "scale(0.98)",
    },
  })
);

const PriorityLabel = styled(Chip)(({ theme, color, isdarkmode }) => ({
  fontWeight: 600,
  fontSize: "0.7rem",
  height: 24,
  borderRadius: 12,
  backgroundColor: alpha(
    color || colorPalette.grey,
    isdarkmode === "true" ? 0.2 : 0.15
  ),
  color: color || theme.palette.text.secondary,
  border: `1px solid ${alpha(
    color || colorPalette.grey,
    isdarkmode === "true" ? 0.3 : 0.2
  )}`,
  "& .MuiChip-label": {
    padding: theme.spacing(0, 1),
  },
}));

function MainLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  // États
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favorites, setFavorites] = useState([
    "/capacity",
    "/health",
    "/security",
  ]);

  // Déterminer le type de dashboard actuel pour le guide et le tutoriel
  const getCurrentDashboardType = () => {
    const path = location.pathname.split("/")[1];
    if (!path) return "home";

    if (path === "capacity") return "capacity";
    if (path === "health") return "health";
    if (path === "security") return "security";
    if (path === "privileged-accounts") return "privileged";
    if (path === "sessions") return "sessions";
    if (path === "password-rotation") return "password";
    if (path === "application-usage") return "application";
    if (path === "incident-response") return "incident";
    if (path === "adoption-efficiency") return "adoption";

    return "home";
  };

  const currentDashboardType = getCurrentDashboardType();

  // Vérifier si on est sur la page d'accueil
  const isHomePage = location.pathname === "/";

  // Favoris
  const favoriteItems = menuItems.filter((item) =>
    favorites.includes(item.path)
  );

  // Gérer l'ouverture et la fermeture du menu
  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Naviguer et fermer le menu
  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Vérifier si un chemin est actif
  const isPathActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Gérer la navigation vers la page d'accueil
  const handleGoHome = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Ajouter/retirer des favoris
  const toggleFavorite = (path) => {
    setFavorites((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  // Basculer le mode sombre/clair
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
        background: isDarkMode
          ? `linear-gradient(to bottom right, ${colorPalette.grey900}, ${colorPalette.grey800})`
          : `linear-gradient(to bottom right, ${colorPalette.grey50}, ${colorPalette.grey100})`,
        transition: "background 0.5s ease",
      }}
    >
      {/* Contenu principal avec transition */}
      <Fade in={true} timeout={500}>
        <MainContent haspadding="true">
          <Box
            sx={{
              minHeight: "calc(100vh - 80px)",
              transition: "all 0.3s ease",
              filter: Boolean(menuAnchor) ? "blur(3px)" : "none",
              transform: Boolean(menuAnchor) ? "scale(0.98)" : "scale(1)",
            }}
          >
            {children}
          </Box>
        </MainContent>
      </Fade>

      {/* Bouton de mode sombre/clair */}
      <ThemeToggleButton
        size="small"
        onClick={toggleDarkMode}
        aria-label={
          isDarkMode ? "passer en mode clair" : "passer en mode sombre"
        }
        isdarkmode={isDarkMode.toString()}
      >
        {isDarkMode ? (
          <LightModeRoundedIcon fontSize="small" />
        ) : (
          <DarkModeRoundedIcon fontSize="small" />
        )}
      </ThemeToggleButton>

      {/* Menu complet */}
      <MenuContainer
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        isdarkmode={isDarkMode.toString()}
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        {/* Accueil */}
        <AnimatedMenuItem
          onClick={() => handleNavigation("/")}
          active={isPathActive("/")}
          color={colorPalette.primary}
          isdarkmode={isDarkMode.toString()}
        >
          <ListItemIcon sx={{ color: colorPalette.primary }}>
            <HomeRoundedIcon />
          </ListItemIcon>
          <Typography
            variant="body1"
            sx={{
              fontWeight: isPathActive("/") ? 600 : 400,
              color: isDarkMode
                ? theme.palette.common.white
                : theme.palette.text.primary,
            }}
          >
            Accueil
          </Typography>
        </AnimatedMenuItem>

        {/* Favoris */}
        {favorites.length > 0 && (
          <>
            <Box
              sx={{
                px: 3,
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
                sx={{
                  fontSize: "0.7rem",
                  letterSpacing: 1,
                  opacity: 0.7,
                }}
              >
                FAVORIS
              </Typography>
              <PriorityLabel
                label={`${favorites.length}`}
                size="small"
                color={colorPalette.primaryLight}
                isdarkmode={isDarkMode.toString()}
              />
            </Box>

            {favoriteItems.map((item) => (
              <AnimatedMenuItem
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                active={isPathActive(item.path)}
                color={item.color}
                isdarkmode={isDarkMode.toString()}
              >
                <ListItemIcon sx={{ color: item.color }}>
                  {item.icon}
                </ListItemIcon>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: isPathActive(item.path) ? 600 : 400,
                    color: isDarkMode
                      ? theme.palette.common.white
                      : theme.palette.text.primary,
                    flexGrow: 1,
                  }}
                >
                  {item.text}
                </Typography>
                <Tooltip title="Retirer des favoris" arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.path);
                    }}
                    sx={{
                      ml: 1,
                      p: 0.5,
                      color: item.color,
                    }}
                  >
                    <FavoriteRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </AnimatedMenuItem>
            ))}

            <Divider sx={{ my: 1, mx: 2 }} />
          </>
        )}

        {/* Tous les dashboards */}
        <Box
          sx={{
            px: 3,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="bold"
            sx={{
              fontSize: "0.7rem",
              letterSpacing: 1,
              opacity: 0.7,
            }}
          >
            DASHBOARDS
          </Typography>
          <PriorityLabel
            label={`${menuItems.length - 1}`}
            size="small"
            color={colorPalette.primary}
            isdarkmode={isDarkMode.toString()}
          />
        </Box>

        {menuItems
          .filter((item) => item.path !== "/")
          .map((item) => (
            <AnimatedMenuItem
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              active={isPathActive(item.path)}
              color={item.color}
              isdarkmode={isDarkMode.toString()}
            >
              <ListItemIcon sx={{ color: item.color }}>
                {item.icon}
              </ListItemIcon>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: isPathActive(item.path) ? 600 : 400,
                  color: isDarkMode
                    ? theme.palette.common.white
                    : theme.palette.text.primary,
                  flexGrow: 1,
                }}
              >
                {item.text}
              </Typography>
              <Tooltip
                title={
                  favorites.includes(item.path)
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris"
                }
                arrow
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.path);
                  }}
                  sx={{
                    ml: 1,
                    p: 0.5,
                    color: favorites.includes(item.path)
                      ? item.color
                      : colorPalette.greyLight,
                  }}
                >
                  <FavoriteRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </AnimatedMenuItem>
          ))}

        <Divider sx={{ my: 1, mx: 2 }} />

        {/* Fermeture */}
        <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
          <Tooltip title="Fermer" arrow>
            <IconButton size="small" onClick={handleMenuClose}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </MenuContainer>
    </Box>
  );
}

export default MainLayout;
