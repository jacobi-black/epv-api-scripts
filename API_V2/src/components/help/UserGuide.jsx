import React, { useState } from "react";
import {
  Drawer,
  IconButton,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  styled,
  Paper,
  Button,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";

// Style pour les sections du guide
const GuideSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
}));

// Données des guides pour chaque type de dashboard
const guideContent = {
  capacity: {
    title: "Guide du Dashboard de Capacité",
    sections: [
      {
        title: "Vue d'ensemble",
        content:
          "Ce dashboard vous permet de surveiller l'utilisation des ressources système, la capacité des sessions PSM et l'espace de stockage des coffres.",
        icon: <InfoIcon color="primary" />,
      },
      {
        title: "Fichiers requis",
        content:
          "Pour utiliser ce dashboard, importez les fichiers générés par les scripts System-Health.ps1 et Get-Safes.ps1.",
        icon: <MenuBookIcon color="primary" />,
      },
      {
        title: "Comment interpréter les graphiques",
        content:
          "Les graphiques montrent l'utilisation CPU, mémoire et disque des serveurs. Les valeurs supérieures à 80% sont en rouge pour indiquer un risque de surcharge.",
        icon: <TipsAndUpdatesIcon color="primary" />,
      },
      {
        title: "FAQ",
        content:
          "Q: Comment puis-je exporter les données?\nR: Utilisez le bouton d'export en haut à droite de chaque graphique pour télécharger les données en format CSV.",
        icon: <LiveHelpIcon color="primary" />,
      },
    ],
  },
  health: {
    title: "Guide du Dashboard de Santé",
    sections: [
      {
        title: "Vue d'ensemble",
        content:
          "Ce dashboard vous permet de surveiller l'état des services CyberArk, la connectivité entre composants et la validité des certificats.",
        icon: <InfoIcon color="primary" />,
      },
      {
        title: "Fichiers requis",
        content:
          "Pour utiliser ce dashboard, importez les fichiers générés par les scripts Service-Status.ps1 et Certificate-Check.ps1.",
        icon: <MenuBookIcon color="primary" />,
      },
      {
        title: "Comment interpréter les graphiques",
        content:
          "Les services sont affichés en vert s'ils sont opérationnels et en rouge s'ils sont arrêtés. Les certificats expirant dans moins de 30 jours sont marqués en orange.",
        icon: <TipsAndUpdatesIcon color="primary" />,
      },
      {
        title: "FAQ",
        content:
          "Q: Que faire si un service est arrêté?\nR: Vérifiez les logs du service concerné et redémarrez-le si nécessaire.",
        icon: <LiveHelpIcon color="primary" />,
      },
    ],
  },
  // Guides pour les autres dashboards pourraient être ajoutés ici
};

/**
 * Composant affichant un guide utilisateur complet accessible depuis un bouton
 *
 * @param {Object} props - Propriétés du composant
 * @param {string} props.dashboardType - Type de dashboard pour afficher le guide approprié
 * @param {string} props.buttonVariant - Variante du bouton MUI (outlined, contained, text)
 * @param {Object} props.buttonProps - Propriétés supplémentaires pour le bouton
 */
const UserGuide = ({
  dashboardType = "capacity",
  buttonVariant = "outlined",
  buttonProps = {},
}) => {
  const [open, setOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const guide = guideContent[dashboardType] || {
    title: "Guide d'utilisation",
    sections: [
      {
        title: "Information",
        content: "Guide non disponible pour ce dashboard.",
        icon: <InfoIcon color="primary" />,
      },
    ],
  };

  const handleToggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        startIcon={<MenuBookIcon />}
        onClick={() => setOpen(true)}
        {...buttonProps}
      >
        Guide d'utilisation
      </Button>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 450 },
            padding: 2,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h2" fontWeight="500">
            {guide.title}
          </Typography>
          <IconButton onClick={() => setOpen(false)} aria-label="fermer">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List>
          {guide.sections.map((section, index) => (
            <React.Fragment key={index}>
              <ListItem
                button
                onClick={() => handleToggleSection(index)}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  bgcolor:
                    expandedSection === index
                      ? "action.selected"
                      : "transparent",
                }}
              >
                <ListItemIcon>{section.icon}</ListItemIcon>
                <ListItemText primary={section.title} />
                {expandedSection === index ? (
                  <ExpandMoreIcon />
                ) : (
                  <ChevronRightIcon />
                )}
              </ListItem>

              <Collapse
                in={expandedSection === index}
                timeout="auto"
                unmountOnExit
              >
                <GuideSection elevation={1}>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      pl: 2,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {section.content}
                  </Typography>
                </GuideSection>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default UserGuide;
