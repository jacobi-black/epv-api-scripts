import React, { useState } from "react";
import {
  Box,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TableChartIcon from "@mui/icons-material/TableChart";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import GetAppIcon from "@mui/icons-material/GetApp";
import InfoIcon from "@mui/icons-material/Info";
import SettingsIcon from "@mui/icons-material/Settings";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

/**
 * Composant amélioré d'outils d'exportation pour les dashboards
 * Permet d'exporter les données et visualisations en différents formats
 * avec des options de personnalisation avancées
 */
const ExportTools = ({
  data = [],
  containerRef = null,
  title = "Dashboard",
  filename = "export",
  dashboardType = "",
  exportOptions = { pdf: true, csv: true, excel: true },
  metadata = {},
}) => {
  const [open, setOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [exportSettings, setExportSettings] = useState({
    includeCharts: true,
    includeData: true,
    includeSummary: true,
    includeTimestamp: true,
    includeMetadata: true,
    orientation: "landscape",
    paperSize: "a4",
    maxDataRows: 100,
    logo: true,
    customTitle: "",
    theme: "default",
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Ouvrir/Fermer le SpeedDial
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Fermer la notification
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  // Afficher une notification
  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  // Ouvrir la boîte de dialogue d'export avec le type spécifié
  const openExportDialog = (type) => {
    setExportType(type);
    setExportDialogOpen(true);
  };

  // Mettre à jour les paramètres d'exportation
  const handleSettingsChange = (event) => {
    const { name, value, checked } = event.target;
    const newValue = event.target.type === "checkbox" ? checked : value;
    setExportSettings({
      ...exportSettings,
      [name]: newValue,
    });
  };

  // Générer un résumé des données basé sur le type de dashboard
  const generateSummary = () => {
    if (!data || data.length === 0) return "";

    try {
      // Déterminer le type de résumé à générer selon le dashboard
      switch (dashboardType) {
        case "capacity":
          return {
            title: "Résumé de la capacité",
            content: `Total des safes: ${data.length}\nStockage total: ${data
              .reduce((acc, curr) => acc + (parseFloat(curr.Size) || 0), 0)
              .toFixed(2)} MB\nTaux de croissance moyen: ${
              metadata.growthRate || "N/A"
            }`,
          };
        case "health":
          const serviceStatus = {
            healthy: data.filter((item) => item.Status === "Healthy").length,
            warning: data.filter((item) => item.Status === "Warning").length,
            critical: data.filter((item) => item.Status === "Critical").length,
          };
          return {
            title: "Résumé de la santé système",
            content: `Composants sains: ${
              serviceStatus.healthy
            }\nComposants en alerte: ${
              serviceStatus.warning
            }\nComposants critiques: ${
              serviceStatus.critical
            }\nDisponibilité: ${metadata.availability || "N/A"}`,
          };
        case "security":
          return {
            title: "Résumé de la sécurité",
            content: `Comptes conformes: ${
              metadata.compliantAccounts || "N/A"
            }\nViolations identifiées: ${
              metadata.violations || "N/A"
            }\nNiveau de risque global: ${metadata.riskLevel || "N/A"}`,
          };
        default:
          // Résumé générique
          const keys = Object.keys(data[0]).slice(0, 3);
          return {
            title: "Résumé des données",
            content: `Nombre d'enregistrements: ${
              data.length
            }\nPériode couverte: ${
              metadata.period || "N/A"
            }\nDate de génération: ${new Date().toLocaleDateString("fr-FR")}`,
          };
      }
    } catch (error) {
      console.error("Erreur lors de la génération du résumé:", error);
      return {
        title: "Résumé",
        content: `Nombre d'enregistrements: ${data.length}`,
      };
    }
  };

  // Exporter en PDF avec options avancées
  const exportToPDF = async () => {
    if (!containerRef) {
      showNotification("Erreur: Référence du conteneur manquante", "error");
      return;
    }

    try {
      setLoading(true);
      setProgress(10);
      const container = containerRef.current;

      // Créer un nouveau document PDF avec les options choisies
      const pdf = new jsPDF(
        exportSettings.orientation,
        "mm",
        exportSettings.paperSize
      );

      // Ajouter un titre personnalisé ou par défaut
      const displayTitle = exportSettings.customTitle || title;
      pdf.setFontSize(18);
      pdf.text(displayTitle, 14, 15);

      setProgress(20);

      // Ajouter la date si demandé
      if (exportSettings.includeTimestamp) {
        pdf.setFontSize(10);
        pdf.text(`Généré le: ${new Date().toLocaleString("fr-FR")}`, 14, 22);
      }

      // Ajouter les métadonnées si demandé
      if (exportSettings.includeMetadata && Object.keys(metadata).length > 0) {
        pdf.setFontSize(10);
        let yPos = 26;

        Object.entries(metadata)
          .slice(0, 3)
          .forEach(([key, value]) => {
            pdf.text(`${key}: ${value}`, 14, yPos);
            yPos += 4;
          });
      }

      setProgress(30);

      // Ajouter le logo si demandé (simulé ici)
      if (exportSettings.logo) {
        // Emplacement pour un logo - À remplacer par votre code de logo
        pdf.setFillColor(200, 200, 200);
        pdf.rect(180, 10, 20, 10, "F");
        pdf.setFontSize(8);
        pdf.text("LOGO", 185, 16);
      }

      setProgress(40);

      // Capturer et ajouter les graphiques si demandé
      let currentY = 35; // Position Y de départ après les en-têtes

      if (exportSettings.includeCharts) {
        try {
          // Capturer le contenu du dashboard
          const canvas = await html2canvas(container, {
            scale: 2,
            logging: false,
            useCORS: true,
          });

          setProgress(60);

          // Adapter la taille en fonction de l'orientation
          const pageWidth =
            exportSettings.orientation === "landscape" ? 277 : 190;
          const margin = 14; // marge de chaque côté
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Ajouter l'image au PDF
          pdf.addImage(
            canvas.toDataURL("image/png"),
            "PNG",
            margin,
            currentY,
            imgWidth,
            imgHeight
          );

          currentY += imgHeight + 10; // Mettre à jour la position Y
        } catch (err) {
          console.error("Erreur lors de la capture des graphiques:", err);
          pdf.text("Impossible de capturer les graphiques", 14, currentY);
          currentY += 10;
        }
      }

      setProgress(70);

      // Ajouter un résumé si demandé
      if (exportSettings.includeSummary) {
        // Vérifier s'il faut ajouter une nouvelle page
        if (
          currentY > (exportSettings.orientation === "landscape" ? 180 : 260)
        ) {
          pdf.addPage();
          currentY = 20;
        }

        const summary = generateSummary();
        pdf.setFontSize(14);
        pdf.text(summary.title, 14, currentY);

        currentY += 8;
        pdf.setFontSize(10);

        // Diviser le contenu en lignes
        const lines = summary.content.split("\n");
        lines.forEach((line) => {
          pdf.text(line, 14, currentY);
          currentY += 5;
        });

        currentY += 10;
      }

      setProgress(80);

      // Ajouter des données tabulaires si demandé
      if (exportSettings.includeData && data.length > 0) {
        // Ajouter une nouvelle page pour les données
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.text("Données détaillées", 14, 15);

        // Préparer les en-têtes
        const headers = Object.keys(data[0]);

        // Calculer la largeur des colonnes (selon l'orientation)
        const tableWidth =
          exportSettings.orientation === "landscape" ? 270 : 180;
        const cellWidth = Math.min(tableWidth / headers.length, 30);
        let startY = 25;

        // Ajouter les en-têtes
        pdf.setFontSize(10);
        pdf.setFont(undefined, "bold");
        headers.forEach((header, index) => {
          const x = 14 + index * cellWidth;
          // Ne pas dépasser la largeur de la page
          if (x < tableWidth + 14) {
            pdf.text(header.slice(0, 15), x, startY);
          }
        });

        // Ajouter les données
        pdf.setFont(undefined, "normal");
        const maxRows = Math.min(data.length, exportSettings.maxDataRows);

        data.slice(0, maxRows).forEach((row, rowIndex) => {
          startY += 7;

          // Vérifier si on doit passer à une nouvelle page
          if (
            startY > (exportSettings.orientation === "landscape" ? 180 : 270)
          ) {
            pdf.addPage();
            startY = 25;

            // Réimprimer les en-têtes sur la nouvelle page
            pdf.setFont(undefined, "bold");
            headers.forEach((header, index) => {
              const x = 14 + index * cellWidth;
              if (x < tableWidth + 14) {
                pdf.text(header.slice(0, 15), x, startY);
              }
            });
            pdf.setFont(undefined, "normal");
            startY += 7;
          }

          headers.forEach((header, colIndex) => {
            const x = 14 + colIndex * cellWidth;
            // Ne pas dépasser la largeur de la page
            if (x < tableWidth + 14) {
              const cellValue =
                row[header] !== null && row[header] !== undefined
                  ? String(row[header]).slice(0, 18)
                  : "";
              pdf.text(cellValue, x, startY);
            }
          });
        });

        // Ajouter une note si toutes les données n'ont pas été incluses
        if (data.length > maxRows) {
          startY += 10;
          pdf.setFont(undefined, "italic");
          pdf.text(
            `Note: Affichage limité à ${maxRows} lignes sur ${data.length} au total.`,
            14,
            startY
          );
        }
      }

      setProgress(90);

      // Ajouter un pied de page
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `${title} - Page ${i} sur ${totalPages}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Générer le PDF
      pdf.save(`${filename}_${new Date().toISOString().split("T")[0]}.pdf`);
      showNotification("PDF exporté avec succès");
      setProgress(100);
      setLoading(false);
      setExportDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      showNotification(`Erreur d'export: ${error.message}`, "error");
      setLoading(false);
    }
  };

  // Exporter en CSV
  const exportToCSV = () => {
    try {
      setLoading(true);
      setProgress(30);

      if (data.length === 0) {
        showNotification("Aucune donnée à exporter", "warning");
        setLoading(false);
        return;
      }

      // Créer le contenu CSV
      const headers = Object.keys(data[0]);
      let csvContent = headers.join(",") + "\n";

      data.forEach((row, index) => {
        if (index % 100 === 0) {
          setProgress(30 + Math.min(60 * (index / data.length), 60));
        }

        const values = headers.map((header) => {
          const cell = row[header];
          // Échapper les virgules et les guillemets
          return cell !== null && cell !== undefined
            ? `"${String(cell).replace(/"/g, '""')}"`
            : "";
        });
        csvContent += values.join(",") + "\n";
      });

      setProgress(90);

      // Ajouter des métadonnées en en-tête si demandé
      if (exportSettings.includeMetadata) {
        let metadataContent = "";
        metadataContent += `"# Titre","${title}"\n`;
        metadataContent += `"# Date d'export","${new Date().toLocaleString(
          "fr-FR"
        )}"\n`;

        Object.entries(metadata).forEach(([key, value]) => {
          metadataContent += `"# ${key}","${value}"\n`;
        });

        metadataContent += "\n";
        csvContent = metadataContent + csvContent;
      }

      // Créer un blob et télécharger
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${filename}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setProgress(100);
      showNotification("CSV exporté avec succès");
      setLoading(false);
      setExportDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      showNotification(`Erreur d'export: ${error.message}`, "error");
      setLoading(false);
    }
  };

  // Exporter en Excel avec des fonctionnalités avancées
  const exportToExcel = () => {
    try {
      setLoading(true);
      setProgress(20);

      if (data.length === 0) {
        showNotification("Aucune donnée à exporter", "warning");
        setLoading(false);
        return;
      }

      // Créer un classeur
      const workbook = XLSX.utils.book_new();

      // Données principales
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Ajuster les largeurs de colonnes
      const columnsWidth = [];
      Object.keys(data[0]).forEach((key) => {
        let maxWidth = key.length;
        data.forEach((row) => {
          const cellValue = String(row[key] || "");
          maxWidth = Math.max(maxWidth, Math.min(cellValue.length, 50));
        });
        columnsWidth.push({ wch: maxWidth + 2 });
      });

      worksheet["!cols"] = columnsWidth;

      setProgress(60);

      // Ajouter la feuille principale
      XLSX.utils.book_append_sheet(workbook, worksheet, "Données");

      // Ajouter une feuille de métadonnées si demandé
      if (exportSettings.includeMetadata) {
        const metadataArray = [
          ["Titre", title],
          ["Type de dashboard", dashboardType],
          ["Date d'export", new Date().toLocaleString("fr-FR")],
          ["Nombre d'enregistrements", data.length.toString()],
        ];

        // Ajouter les métadonnées personnalisées
        Object.entries(metadata).forEach(([key, value]) => {
          metadataArray.push([key, value]);
        });

        const metadataSheet = XLSX.utils.aoa_to_sheet(metadataArray);
        XLSX.utils.book_append_sheet(workbook, metadataSheet, "Métadonnées");
      }

      // Ajouter une feuille de résumé si demandé
      if (exportSettings.includeSummary) {
        const summary = generateSummary();
        const summaryArray = [
          [summary.title],
          [""],
          ...summary.content.split("\n").map((line) => [line]),
        ];

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryArray);
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Résumé");
      }

      setProgress(80);

      // Générer le fichier Excel
      XLSX.writeFile(
        workbook,
        `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      setProgress(100);
      showNotification("Excel exporté avec succès");
      setLoading(false);
      setExportDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      showNotification(`Erreur d'export: ${error.message}`, "error");
      setLoading(false);
    }
  };

  // Lancer l'export selon le type choisi
  const handleExport = () => {
    switch (exportType) {
      case "pdf":
        exportToPDF();
        break;
      case "csv":
        exportToCSV();
        break;
      case "excel":
        exportToExcel();
        break;
      default:
        showNotification("Type d'export non supporté", "error");
    }
  };

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <SpeedDial
          ariaLabel="Export Options"
          icon={
            <SpeedDialIcon icon={<GetAppIcon />} openIcon={<MoreHorizIcon />} />
          }
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          direction="up"
        >
          {exportOptions.pdf && (
            <SpeedDialAction
              icon={<PictureAsPdfIcon />}
              tooltipTitle="Exporter en PDF"
              onClick={() => {
                handleClose();
                openExportDialog("pdf");
              }}
            />
          )}
          {exportOptions.excel && (
            <SpeedDialAction
              icon={<TableChartIcon />}
              tooltipTitle="Exporter en Excel"
              onClick={() => {
                handleClose();
                openExportDialog("excel");
              }}
            />
          )}
          {exportOptions.csv && (
            <SpeedDialAction
              icon={<FileDownloadIcon />}
              tooltipTitle="Exporter en CSV"
              onClick={() => {
                handleClose();
                openExportDialog("csv");
              }}
            />
          )}
        </SpeedDial>
      </Box>

      {/* Boîte de dialogue d'export avec options avancées */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {`Options d'export ${
            exportType === "pdf"
              ? "PDF"
              : exportType === "excel"
              ? "Excel"
              : "CSV"
          }`}
        </DialogTitle>

        <DialogContent>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 3,
                mb: 3,
              }}
            >
              <CircularProgress
                variant="determinate"
                value={progress}
                size={60}
              />
              <Typography variant="body1" sx={{ mt: 2 }}>
                {progress < 100 ? "Export en cours..." : "Export terminé !"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progress < 30
                  ? "Préparation des données..."
                  : progress < 60
                  ? "Traitement en cours..."
                  : progress < 90
                  ? "Génération du fichier..."
                  : "Finalisation..."}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Contenu à inclure
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportSettings.includeCharts}
                            onChange={handleSettingsChange}
                            name="includeCharts"
                          />
                        }
                        label="Graphiques et visualisations"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportSettings.includeData}
                            onChange={handleSettingsChange}
                            name="includeData"
                          />
                        }
                        label="Données brutes"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportSettings.includeSummary}
                            onChange={handleSettingsChange}
                            name="includeSummary"
                          />
                        }
                        label="Résumé analytique"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportSettings.includeTimestamp}
                            onChange={handleSettingsChange}
                            name="includeTimestamp"
                          />
                        }
                        label="Date et heure"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportSettings.includeMetadata}
                            onChange={handleSettingsChange}
                            name="includeMetadata"
                          />
                        }
                        label="Métadonnées"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportSettings.logo}
                            onChange={handleSettingsChange}
                            name="logo"
                          />
                        }
                        label="Logo"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {exportType === "pdf" && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Options de mise en page
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Titre personnalisé"
                          name="customTitle"
                          value={exportSettings.customTitle}
                          onChange={handleSettingsChange}
                          placeholder={title}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="orientation-label">
                            Orientation
                          </InputLabel>
                          <Select
                            labelId="orientation-label"
                            name="orientation"
                            value={exportSettings.orientation}
                            onChange={handleSettingsChange}
                            label="Orientation"
                          >
                            <MenuItem value="landscape">Paysage</MenuItem>
                            <MenuItem value="portrait">Portrait</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="paper-size-label">Format</InputLabel>
                          <Select
                            labelId="paper-size-label"
                            name="paperSize"
                            value={exportSettings.paperSize}
                            onChange={handleSettingsChange}
                            label="Format"
                          >
                            <MenuItem value="a4">A4</MenuItem>
                            <MenuItem value="a3">A3</MenuItem>
                            <MenuItem value="letter">Letter</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {(exportType === "excel" || exportType === "csv") && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Options des données
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nombre maximum de lignes"
                          name="maxDataRows"
                          type="number"
                          value={exportSettings.maxDataRows}
                          onChange={handleSettingsChange}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            inputProps: { min: 10, max: 10000 },
                          }}
                        />
                      </Grid>
                      {exportType === "excel" && (
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel id="theme-label">Thème</InputLabel>
                            <Select
                              labelId="theme-label"
                              name="theme"
                              value={exportSettings.theme}
                              onChange={handleSettingsChange}
                              label="Thème"
                            >
                              <MenuItem value="default">Par défaut</MenuItem>
                              <MenuItem value="professional">
                                Professionnel
                              </MenuItem>
                              <MenuItem value="minimal">Minimaliste</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <InfoIcon
                      sx={{
                        fontSize: "0.9rem",
                        mr: 0.5,
                        verticalAlign: "middle",
                      }}
                    />
                    Ces options d'export sont spécifiques au dashboard "{title}
                    ".
                    {data.length > 0 &&
                      ` ${data.length} enregistrements seront exportés.`}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setExportDialogOpen(false)}
            color="primary"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            color="primary"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Export en cours..." : "Exporter"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification de status */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleNotificationClose}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExportTools;
