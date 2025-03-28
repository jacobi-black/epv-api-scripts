import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Paper,
  IconButton,
  styled,
  Fab,
  Slide,
  Backdrop,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HelpIcon from "@mui/icons-material/Help";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Style pour l'élément surligné dans le tutoriel
const HighlightOverlay = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1299,
  pointerEvents: "none",
}));

const Highlight = styled(Box)(({ theme }) => ({
  position: "absolute",
  borderRadius: "4px",
  boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`,
  zIndex: 1300,
  animation: "pulse 1.5s infinite",
  "@keyframes pulse": {
    "0%": {
      boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 0 ${theme.palette.primary.main}`,
    },
    "70%": {
      boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 10px rgba(76, 175, 80, 0)`,
    },
    "100%": {
      boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(76, 175, 80, 0)`,
    },
  },
}));

const TutorialFab = styled(Fab)(({ theme }) => ({
  position: "fixed",
  right: theme.spacing(3),
  bottom: theme.spacing(3),
  zIndex: 1000,
}));

// Définition des étapes de tutoriel pour différentes sections de l'application
const tutorialSteps = {
  home: [
    {
      title: "Bienvenue dans CyberArk Capacity Planning!",
      content:
        "Ce tutoriel rapide vous guidera dans l'utilisation de l'application. Cliquez sur \"Suivant\" pour commencer.",
      target: null, // Pas de cible spécifique pour la première étape
    },
    {
      title: "Sélection des dashboards",
      content:
        "Choisissez le dashboard que vous souhaitez consulter parmi les différentes options disponibles.",
      target: ".dashboard-card", // Sélecteur CSS de l'élément à mettre en évidence
    },
    {
      title: "Import de fichiers",
      content:
        "Pour chaque dashboard, vous devrez importer les fichiers générés par les scripts CyberArk correspondants.",
      target: ".file-upload-zone",
    },
    {
      title: "Navigation",
      content:
        "Utilisez le menu latéral pour naviguer entre les différentes sections et sous-dashboards.",
      target: ".sidebar-navigation",
    },
    {
      title: "C'est terminé!",
      content:
        "Vous connaissez maintenant les bases de l'application. Vous pouvez relancer ce tutoriel à tout moment en cliquant sur le bouton d'aide en bas à droite.",
      target: null,
    },
  ],
  dashboard: [
    {
      title: "Bienvenue dans le Dashboard",
      content:
        'Ce tutoriel vous guidera dans l\'utilisation du dashboard. Cliquez sur "Suivant" pour commencer.',
      target: null,
    },
    {
      title: "Indicateurs clés",
      content: "Ces cartes affichent les KPIs principaux pour ce dashboard.",
      target: ".dashboard-kpis",
    },
    {
      title: "Graphiques",
      content:
        "Les graphiques vous permettent de visualiser les données importantes. Survolez les éléments pour plus de détails.",
      target: ".chart-container",
    },
    {
      title: "Filtres",
      content:
        "Utilisez ces contrôles pour filtrer les données affichées dans les graphiques et tableaux.",
      target: ".filter-controls",
    },
    {
      title: "Export des données",
      content:
        "Cliquez sur ces boutons pour exporter les données au format CSV.",
      target: ".export-button",
    },
    {
      title: "Tutoriel terminé!",
      content:
        "Vous connaissez maintenant les fonctionnalités principales du dashboard.",
      target: null,
    },
  ],
};

/**
 * Composant de tutoriel interactif qui guide l'utilisateur à travers l'application
 *
 * @param {Object} props - Propriétés du composant
 * @param {string} props.tutorialType - Type de tutoriel à afficher (home, dashboard, etc.)
 * @param {boolean} props.autoStart - Démarrer automatiquement le tutoriel
 * @param {boolean} props.showButton - Afficher ou non le bouton flottant du tutoriel
 */
const InteractiveTutorial = ({
  tutorialType = "home",
  autoStart = false,
  showButton = true,
}) => {
  const [open, setOpen] = useState(autoStart);
  const [activeStep, setActiveStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  // Récupère les étapes du tutoriel en fonction du type
  const steps = tutorialSteps[tutorialType] || tutorialSteps.home;

  // Gestion de la navigation dans le tutoriel
  const handleNext = () => {
    setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleClose = () => {
    setOpen(false);
    setActiveStep(0);
  };

  // Positionnement de la mise en évidence sur l'élément cible
  useEffect(() => {
    if (!open) return;

    const currentStep = steps[activeStep];
    if (!currentStep.target) {
      setHighlightPosition({ top: 0, left: 0, width: 0, height: 0 });
      return;
    }

    const targetElement = document.querySelector(currentStep.target);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [activeStep, open, steps]);

  return (
    <>
      {/* Bouton flottant pour démarrer le tutoriel */}
      {showButton && (
        <TutorialFab
          color="primary"
          aria-label="tutoriel"
          onClick={() => setOpen(true)}
        >
          <SchoolIcon />
        </TutorialFab>
      )}

      {/* Overlay de surlignage */}
      {open && steps[activeStep].target && (
        <HighlightOverlay>
          <Highlight
            sx={{
              width: `${highlightPosition.width}px`,
              height: `${highlightPosition.height}px`,
              top: `${highlightPosition.top}px`,
              left: `${highlightPosition.left}px`,
            }}
          />
        </HighlightOverlay>
      )}

      {/* Boîte de dialogue du tutoriel */}
      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth
        onClose={handleClose}
        sx={{
          "& .MuiDialog-paper": {
            position: "fixed",
            bottom: 32,
            right: 32,
            m: 0,
            width: { xs: "calc(100% - 64px)", sm: 450 },
            maxHeight: 500,
            borderRadius: 2,
            boxShadow: 8,
          },
          zIndex: 1301,
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" component="div">
              {steps[activeStep].title}
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleClose}
              aria-label="fermer"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body1" gutterBottom>
            {steps[activeStep].content}
          </Typography>

          <Box sx={{ mt: 3, mb: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepLabel />
                </Step>
              ))}
            </Stepper>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBackIcon />}
          >
            Précédent
          </Button>
          <Box sx={{ flex: 1 }} />
          {activeStep === steps.length - 1 ? (
            <Button
              onClick={handleClose}
              variant="contained"
              color="success"
              endIcon={<CheckCircleIcon />}
            >
              Terminer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="contained"
              color="primary"
              endIcon={<ArrowForwardIcon />}
            >
              Suivant
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InteractiveTutorial;
