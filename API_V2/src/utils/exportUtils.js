/**
 * Utilitaires pour l'export des données et la génération de rapports
 * Implémente le point 7.4 du roadmap - Fonctionnalités d'Export et Rapports
 */

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Exporte les données au format Excel avec formatage
 * @param {Array} data - Données à exporter
 * @param {string} filename - Nom du fichier (sans extension)
 * @param {Object} options - Options de formatage
 */
export const exportToExcel = (data, filename, options = {}) => {
  if (!data || !data.length) {
    console.warn("Aucune donnée à exporter");
    return;
  }

  const {
    sheetName = "Données",
    dateFormat = "dd/MM/yyyy",
    numberFormat = "0.00",
    columnWidths = {},
    headerStyle = {
      font: { bold: true, color: { rgb: "000000" } },
      fill: { fgColor: { rgb: "EEEEEE" } },
    },
  } = options;

  try {
    // Création d'un classeur Excel
    const workbook = XLSX.utils.book_new();

    // Conversion des données en feuille de calcul
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Formatage des cellules
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Appliquer les largeurs de colonnes si spécifiées
    const columnSettings = {};
    Object.entries(columnWidths).forEach(([col, width]) => {
      const colIndex = XLSX.utils.decode_col(col);
      columnSettings[col] = { width };
    });
    worksheet["!cols"] = columnSettings;

    // Ajout de la feuille au classeur
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Génération du fichier Excel
    const today = format(new Date(), "yyyy-MM-dd");
    const fullFilename = `${filename}_${today}.xlsx`;
    XLSX.writeFile(workbook, fullFilename);

    console.log(`Exportation Excel réussie: ${fullFilename}`);
    return fullFilename;
  } catch (error) {
    console.error("Erreur lors de l'exportation Excel:", error);
    throw error;
  }
};

/**
 * Exporte un dashboard au format PDF avec mise en forme professionnelle
 * @param {HTMLElement} element - Élément DOM à exporter
 * @param {string} filename - Nom du fichier (sans extension)
 * @param {Object} options - Options d'export
 */
export const exportToPDF = (element, filename, options = {}) => {
  if (!element) {
    console.warn("Élément DOM non fourni pour l'export PDF");
    return;
  }

  const {
    orientation = "landscape",
    format = "a4",
    title = "Rapport CyberArk",
    subtitle = "",
    includeDate = true,
    includePageNumbers = true,
    headerImageUrl = null,
    footerText = "Document confidentiel - CyberArk Capacity Planning Dashboard",
  } = options;

  try {
    // Création du document PDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: format,
    });

    // Ajout des métadonnées
    pdf.setProperties({
      title: title,
      subject: subtitle,
      author: "CyberArk Capacity Planning Dashboard",
      creator: "CyberArk API Explorer",
    });

    // En-tête avec logo si fourni
    if (headerImageUrl) {
      pdf.addImage(headerImageUrl, "JPEG", 10, 10, 50, 20);
    }

    // Titre
    pdf.setFontSize(18);
    pdf.text(title, 10, headerImageUrl ? 40 : 20);

    // Sous-titre
    if (subtitle) {
      pdf.setFontSize(12);
      pdf.text(subtitle, 10, headerImageUrl ? 48 : 28);
    }

    // Date
    if (includeDate) {
      const today = format(new Date(), "dd MMMM yyyy", { locale: fr });
      pdf.setFontSize(10);
      pdf.text(`Date: ${today}`, 10, headerImageUrl ? 55 : 35);
    }

    // Conversion HTML vers PDF
    const startY = headerImageUrl ? 65 : 45;

    // Utilisation de html2canvas pour la conversion (implémentation simplifiée)
    // En pratique, il faudrait utiliser une bibliothèque comme html2canvas
    pdf.html(element, {
      callback: function (pdf) {
        // Ajout du pied de page
        const pageCount = pdf.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);

          // Pied de page
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);

          // Texte du pied de page
          const footerY = pdf.internal.pageSize.height - 10;
          pdf.text(footerText, 10, footerY);

          // Numéros de page
          if (includePageNumbers) {
            const pageNumberText = `Page ${i} / ${pageCount}`;
            const pageNumberX = pdf.internal.pageSize.width - 20;
            pdf.text(pageNumberText, pageNumberX, footerY, { align: "right" });
          }
        }

        // Génération du fichier PDF
        const today = format(new Date(), "yyyy-MM-dd");
        const fullFilename = `${filename}_${today}.pdf`;
        pdf.save(fullFilename);

        console.log(`Exportation PDF réussie: ${fullFilename}`);
        return fullFilename;
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'exportation PDF:", error);
    throw error;
  }
};

/**
 * Génère un rapport complet à partir des données
 * @param {Array} data - Données pour le rapport
 * @param {Object} reportConfig - Configuration du rapport
 * @param {string} filename - Nom du fichier (sans extension)
 * @param {string} format - Format d'export ('pdf' ou 'excel')
 */
export const generateReport = (
  data,
  reportConfig,
  filename,
  format = "pdf"
) => {
  if (!data || !data.length) {
    console.warn("Aucune donnée pour générer le rapport");
    return;
  }

  const {
    title = "Rapport CyberArk",
    subtitle = "",
    sections = [],
    filters = {},
  } = reportConfig;

  try {
    // Filtrage des données selon les critères
    const filteredData = applyFilters(data, filters);

    // Traitement spécifique en fonction du format
    if (format.toLowerCase() === "excel") {
      return exportToExcel(filteredData, filename, {
        sheetName: title,
      });
    } else {
      // Pour PDF, il faudrait créer un élément DOM temporaire
      // et y intégrer les données formatées selon les sections définies
      const reportElement = document.createElement("div");

      // Création du contenu du rapport
      const titleElement = document.createElement("h1");
      titleElement.textContent = title;
      reportElement.appendChild(titleElement);

      if (subtitle) {
        const subtitleElement = document.createElement("h2");
        subtitleElement.textContent = subtitle;
        reportElement.appendChild(subtitleElement);
      }

      // Parcourir et générer les sections
      sections.forEach((section) => {
        const sectionElement = document.createElement("div");
        sectionElement.className = "report-section";

        const sectionTitle = document.createElement("h3");
        sectionTitle.textContent = section.title;
        sectionElement.appendChild(sectionTitle);

        // Selon le type de section, générer le contenu approprié
        if (section.type === "table") {
          const tableElement = generateTableElement(
            filteredData,
            section.columns
          );
          sectionElement.appendChild(tableElement);
        } else if (section.type === "summary") {
          const summaryElement = generateSummaryElement(
            filteredData,
            section.metrics
          );
          sectionElement.appendChild(summaryElement);
        }

        reportElement.appendChild(sectionElement);
      });

      // Export vers PDF
      return exportToPDF(reportElement, filename, {
        title: title,
        subtitle: subtitle,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la génération du rapport:", error);
    throw error;
  }
};

/**
 * Applique des filtres aux données
 * @param {Array} data - Données à filtrer
 * @param {Object} filters - Critères de filtrage
 * @returns {Array} Données filtrées
 */
const applyFilters = (data, filters) => {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }

  return data.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      // Cas simple: filtrage par égalité
      if (typeof value !== "object") {
        return item[key] === value;
      }

      // Cas avec opérateurs de comparaison
      if (value.operator && value.value !== undefined) {
        switch (value.operator) {
          case "eq":
            return item[key] === value.value;
          case "neq":
            return item[key] !== value.value;
          case "gt":
            return item[key] > value.value;
          case "gte":
            return item[key] >= value.value;
          case "lt":
            return item[key] < value.value;
          case "lte":
            return item[key] <= value.value;
          case "contains":
            return String(item[key]).includes(value.value);
          case "startsWith":
            return String(item[key]).startsWith(value.value);
          case "endsWith":
            return String(item[key]).endsWith(value.value);
          default:
            return true;
        }
      }

      return true;
    });
  });
};

/**
 * Génère un élément de tableau HTML à partir des données
 * @param {Array} data - Données pour le tableau
 * @param {Array} columns - Configuration des colonnes
 * @returns {HTMLElement} Élément tableau généré
 */
const generateTableElement = (data, columns) => {
  const table = document.createElement("table");
  table.className = "report-table";

  // En-tête du tableau
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  columns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column.label || column.field;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Corps du tableau
  const tbody = document.createElement("tbody");

  data.forEach((item) => {
    const row = document.createElement("tr");

    columns.forEach((column) => {
      const td = document.createElement("td");
      const value = item[column.field];

      // Formatage selon le type
      if (column.format) {
        td.textContent = column.format(value, item);
      } else {
        td.textContent = value !== undefined ? value : "";
      }

      row.appendChild(td);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  return table;
};

/**
 * Génère un élément de résumé HTML avec des métriques clés
 * @param {Array} data - Données pour le résumé
 * @param {Array} metrics - Métriques à calculer
 * @returns {HTMLElement} Élément résumé généré
 */
const generateSummaryElement = (data, metrics) => {
  const summary = document.createElement("div");
  summary.className = "report-summary";

  metrics.forEach((metric) => {
    const metricDiv = document.createElement("div");
    metricDiv.className = "metric";

    const labelSpan = document.createElement("span");
    labelSpan.className = "metric-label";
    labelSpan.textContent = metric.label;

    const valueSpan = document.createElement("span");
    valueSpan.className = "metric-value";

    // Calcul de la valeur selon le type de métrique
    let value;

    switch (metric.type) {
      case "count":
        value = data.length;
        break;
      case "sum":
        value = data.reduce(
          (sum, item) => sum + (parseFloat(item[metric.field]) || 0),
          0
        );
        break;
      case "average":
        value =
          data.length > 0
            ? data.reduce(
                (sum, item) => sum + (parseFloat(item[metric.field]) || 0),
                0
              ) / data.length
            : 0;
        break;
      case "min":
        value =
          data.length > 0
            ? Math.min(
                ...data.map((item) => parseFloat(item[metric.field]) || 0)
              )
            : 0;
        break;
      case "max":
        value =
          data.length > 0
            ? Math.max(
                ...data.map((item) => parseFloat(item[metric.field]) || 0)
              )
            : 0;
        break;
      default:
        value = "N/A";
    }

    // Formatage de la valeur
    if (metric.format && typeof metric.format === "function") {
      valueSpan.textContent = metric.format(value);
    } else {
      valueSpan.textContent = value;
    }

    metricDiv.appendChild(labelSpan);
    metricDiv.appendChild(valueSpan);
    summary.appendChild(metricDiv);
  });

  return summary;
};
