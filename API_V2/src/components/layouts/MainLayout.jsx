import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Box,
  Fab,
  Menu,
  MenuItem,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  Zoom,
  Avatar,
  Stack,
  Paper,
  ListItemIcon,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from "@mui/material";

// Icons
import HomeIcon from "@mui/icons-material/Home";
import SpeedIcon from "@mui/icons-material/Speed";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import SecurityIcon from "@mui/icons-material/Security";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MonitorIcon from "@mui/icons-material/MonitorHeart";
import PasswordIcon from "@mui/icons-material/Password";
import ApiIcon from "@mui/icons-material/Api";
import ReportIcon from "@mui/icons-material/Report";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";

// Composants d'aide et de tutoriel
import { ContextualTooltip, UserGuide, InteractiveTutorial } from "../help";

// Menu items with nested structure
const menuItems = [
  {
    text: "Accueil",
    icon: <HomeIcon />,
    path: "/",
    exact: true,
  },
  {
    text: "Capacity Dashboard",
    icon: <SpeedIcon />,
    path: "/capacity",
    priority: "Haute",
    color: "#1976d2",
  },
  {
    text: "Health Dashboard",
    icon: <HealthAndSafetyIcon />,
    path: "/health",
    priority: "Haute",
    color: "#2e7d32",
  },
  {
    text: "Security & Compliance",
    icon: <SecurityIcon />,
    path: "/security",
    priority: "Haute",
    color: "#d32f2f",
  },
  {
    text: "Privileged Accounts",
    icon: <AccountCircleIcon />,
    path: "/privileged-accounts",
    priority: "Moyenne",
    color: "#7b1fa2",
  },
  {
    text: "Session Monitoring",
    icon: <MonitorIcon />,
    path: "/sessions",
    priority: "Moyenne",
    color: "#ff9800",
  },
  {
    text: "Password Rotation",
    icon: <PasswordIcon />,
    path: "/password-rotation",
    priority: "Moyenne",
    color: "#0097a7",
  },
  {
    text: "Applications & API",
    icon: <ApiIcon />,
    path: "/application-usage",
    priority: "Basse",
    color: "#5d4037",
  },
  {
    text: "Incident Response",
    icon: <ReportIcon />,
    path: "/incident-response",
    priority: "Basse",
    color: "#e91e63",
  },
  {
    text: "Adoption & Efficiency",
    icon: <AssessmentIcon />,
    path: "/adoption-efficiency",
    priority: "Basse",
    color: "#009688",
  },
];

const MainContent = styled("main")(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
}));

// Style du titre flottant minimal
const PageTitle = styled(Paper)(({ theme }) => ({
  position: "absolute",
  top: 16,
  left: 16,
  padding: theme.spacing(1, 2),
  display: "flex",
  alignItems: "center",
  borderRadius: 30,
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  zIndex: 100,
  backgroundColor: theme.palette.background.paper,
  "& .MuiIconButton-root": {
    marginRight: theme.spacing(1),
  },
}));

// Menu de navigation flottant
const NavigationFab = styled(Fab)(({ theme }) => ({
  position: "fixed",
  left: theme.spacing(2),
  bottom: theme.spacing(2),
  zIndex: 1000,
}));

const MenuContainer = styled(Menu)(({ theme }) => ({
  "& .MuiMenu-paper": {
    maxWidth: 320,
    maxHeight: "80vh",
    borderRadius: theme.spacing(1),
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
}));

function MainLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  // État pour le menu flottant
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showBackButton, setShowBackButton] = useState(false);

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

  // Grouper les éléments par priorité
  const highPriorityItems = menuItems.filter(
    (item) => item.priority === "Haute"
  );
  const mediumPriorityItems = menuItems.filter(
    (item) => item.priority === "Moyenne"
  );
  const lowPriorityItems = menuItems.filter(
    (item) => item.priority === "Basse"
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
  };

  // Vérifier si un chemin est actif
  const isPathActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Déterminer le titre de la page actuelle
  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find((item) => isPathActive(item.path));
    return currentItem ? currentItem.text : "CyberArk Capacity Planning";
  };

  // Gérer la navigation vers la page d'accueil
  const handleGoHome = () => {
    navigate("/");
  };

  // Afficher le bouton de retour si on n'est pas sur la page d'accueil
  React.useEffect(() => {
    setShowBackButton(!isHomePage);
  }, [location.pathname, isHomePage]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Titre minimaliste flottant */}
      <PageTitle elevation={2}>
        {showBackButton && (
          <IconButton
            size="small"
            onClick={handleGoHome}
            aria-label="retour à l'accueil"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        <Typography variant="subtitle1" component="h1" fontWeight="500">
          {getCurrentPageTitle()}
        </Typography>

        {/* Aide contextuelle à droite du titre */}
        <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
          <UserGuide
            dashboardType={currentDashboardType}
            buttonVariant="text"
            buttonProps={{
              size: "small",
              sx: { minWidth: 0, p: 0.5 },
            }}
          />

          <ContextualTooltip
            title="Besoin d'aide ?"
            placement="bottom"
            showIcon={true}
          />
        </Stack>
      </PageTitle>

      {/* Contenu principal */}
      <MainContent>
        {children}

        {/* Tutoriel interactif */}
        <InteractiveTutorial
          tutorialType={currentDashboardType === "home" ? "home" : "dashboard"}
          autoStart={false}
          showButton={true}
        />
      </MainContent>

      {/* Menu de navigation flottant */}
      <NavigationFab color="primary" aria-label="menu" onClick={handleMenuOpen}>
        <MenuIcon />
      </NavigationFab>

      <MenuContainer
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        {/* Accueil */}
        <MenuItem
          onClick={() => handleNavigation("/")}
          selected={isPathActive("/")}
          sx={{
            borderLeft: isPathActive("/") ? "4px solid #1976d2" : "none",
            pl: isPathActive("/") ? 2 : 3,
          }}
        >
          <ListItemIcon>
            <HomeIcon color={isPathActive("/") ? "primary" : "inherit"} />
          </ListItemIcon>
          <Typography variant="body1">Accueil</Typography>
        </MenuItem>

        <Divider sx={{ my: 1 }} />
        <MenuItem disabled dense>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="bold"
          >
            PRIORITÉ HAUTE
          </Typography>
        </MenuItem>

        {highPriorityItems.map((item) => (
          <MenuItem
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={isPathActive(item.path)}
            sx={{
              borderLeft: isPathActive(item.path)
                ? `4px solid ${item.color}`
                : "none",
              pl: isPathActive(item.path) ? 2 : 3,
            }}
          >
            <ListItemIcon sx={{ color: item.color }}>{item.icon}</ListItemIcon>
            <Typography
              variant="body1"
              sx={{ color: isPathActive(item.path) ? item.color : "inherit" }}
            >
              {item.text}
            </Typography>
          </MenuItem>
        ))}

        <Divider sx={{ my: 1 }} />
        <MenuItem disabled dense>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="bold"
          >
            PRIORITÉ MOYENNE
          </Typography>
        </MenuItem>

        {mediumPriorityItems.map((item) => (
          <MenuItem
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={isPathActive(item.path)}
            sx={{
              borderLeft: isPathActive(item.path)
                ? `4px solid ${item.color}`
                : "none",
              pl: isPathActive(item.path) ? 2 : 3,
            }}
          >
            <ListItemIcon sx={{ color: item.color }}>{item.icon}</ListItemIcon>
            <Typography
              variant="body1"
              sx={{ color: isPathActive(item.path) ? item.color : "inherit" }}
            >
              {item.text}
            </Typography>
          </MenuItem>
        ))}

        <Divider sx={{ my: 1 }} />
        <MenuItem disabled dense>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="bold"
          >
            PRIORITÉ BASSE
          </Typography>
        </MenuItem>

        {lowPriorityItems.map((item) => (
          <MenuItem
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={isPathActive(item.path)}
            sx={{
              borderLeft: isPathActive(item.path)
                ? `4px solid ${item.color}`
                : "none",
              pl: isPathActive(item.path) ? 2 : 3,
            }}
          >
            <ListItemIcon sx={{ color: item.color }}>{item.icon}</ListItemIcon>
            <Typography
              variant="body1"
              sx={{ color: isPathActive(item.path) ? item.color : "inherit" }}
            >
              {item.text}
            </Typography>
          </MenuItem>
        ))}

        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleMenuClose} sx={{ justifyContent: "center" }}>
          <IconButton size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </MenuItem>
      </MenuContainer>
    </Box>
  );
}

export default MainLayout;
