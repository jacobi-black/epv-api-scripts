import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Collapse,
  Tooltip,
} from "@mui/material";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
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
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";

const drawerWidth = 260;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

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

function MainLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!isMobile);
  const [openGroups, setOpenGroups] = useState({
    high: true,
    medium: isMobile ? false : true,
    low: isMobile ? false : true,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleGroupToggle = (group) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

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
  const otherItems = menuItems.filter((item) => !item.priority);

  // Vérifier si un chemin est actif (pour la sélection dans le menu)
  const isPathActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBarStyled position="fixed" open={open} color="primary">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            CyberArk Capacity Planning Dashboard
          </Typography>
          <Tooltip title="À propos">
            <IconButton color="inherit">
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBarStyled>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "1rem",
            }}
          >
            <SecurityIcon color="primary" fontSize="large" />
            <Typography
              variant="h6"
              component="div"
              color="primary"
              sx={{ ml: 1 }}
            >
              CyberArk EPV Dashboard
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />

        <List sx={{ p: 0 }}>
          {/* Items sans priorité */}
          {otherItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isPathActive(item.path)}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) handleDrawerClose();
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          {/* Groupe Priorité Haute */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleGroupToggle("high")}>
              <ListItemText
                primary="Priorité Haute"
                sx={{ color: theme.palette.primary.main, fontWeight: "bold" }}
              />
              {openGroups.high ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openGroups.high} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {highPriorityItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={isPathActive(item.path)}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) handleDrawerClose();
                    }}
                    sx={{
                      pl: 4,
                      borderLeft: isPathActive(item.path)
                        ? `4px solid ${item.color}`
                        : "none",
                    }}
                  >
                    <ListItemIcon sx={{ color: item.color }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* Groupe Priorité Moyenne */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleGroupToggle("medium")}>
              <ListItemText
                primary="Priorité Moyenne"
                sx={{ color: theme.palette.warning.main, fontWeight: "bold" }}
              />
              {openGroups.medium ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openGroups.medium} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {mediumPriorityItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={isPathActive(item.path)}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) handleDrawerClose();
                    }}
                    sx={{
                      pl: 4,
                      borderLeft: isPathActive(item.path)
                        ? `4px solid ${item.color}`
                        : "none",
                    }}
                  >
                    <ListItemIcon sx={{ color: item.color }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* Groupe Priorité Basse */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleGroupToggle("low")}>
              <ListItemText
                primary="Priorité Basse"
                sx={{ color: theme.palette.text.secondary, fontWeight: "bold" }}
              />
              {openGroups.low ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openGroups.low} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {lowPriorityItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={isPathActive(item.path)}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) handleDrawerClose();
                    }}
                    sx={{
                      pl: 4,
                      borderLeft: isPathActive(item.path)
                        ? `4px solid ${item.color}`
                        : "none",
                    }}
                  >
                    <ListItemIcon sx={{ color: item.color }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
      </Drawer>

      <Main open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}

export default MainLayout;
