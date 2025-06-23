import React, { useState, useEffect } from "react";
import { StandardFonts } from "pdf-lib";
import { PDFDocument, rgb } from "pdf-lib";
import {
  Box,
  MenuItem,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { ClipboardMinus } from "lucide-react";
import jsPDF from "jspdf";
import { fetchPocReportById, generateReport } from "../axios"; // Import the API functions
import { useTheme, useMediaQuery } from '@mui/material';


// Import the logos from the assets folder
import zealousLogo from "../assests/Crescent.png";
import crescentLogo from "../assests/Crescent.png";
import college from "../assests/MECLogo.jpg";
import AdminDashboard from "./AdminDashboard";
import Admin_Dash from "../components/AdminDash";

const companyOptions = ["Zealous Tech Corp", "Crescent edTech"];

const TrainingForm = () => {
  const [formData, setFormData] = useState({
    mod_id: "",
    mod_poc_id: "",
    title: "",
    background: "",
    address: "",
    schedule: "",
    executiondates: "",
    scopeOfTheTraining: "",
    totalStrength: "",
    pointOfContact: {
      name: "",
      role: "",
      email: "",
      contact: "",
      test_details: "",
      summary: [
        {
          day: "",
          topicsCovered: "",
          technicalTasksPerformed: "",
          gitLink: "",
          attendancePresent: "",
          attendanceAbsent: "",
        },
      ],
    },
    expertDetails: [
      {
        name: "",
        role: "",
        company: "",
        email: "",
      },
    ],
    eventPhotos: [],
    attendanceReport: [],
    statisticsChart: [],
    individualProgress: [],
    overallColumnChart: [],
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [isFetched, setIsFetched] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [zealousLogoBase64, setZealousLogoBase64] = useState("");
  const [crescentLogoBase64, setCrescentLogoBase64] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Convert image to base64
  const convertImageToBase64 = (imageUrl, callback) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.height = img.naturalHeight;
      canvas.width = img.naturalWidth;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      const base64 = dataURL.split(",")[1];
      callback(base64);
    };
    img.onerror = (err) => {
      console.error("Error loading image:", err);
      callback(null);
    };
    img.src = imageUrl;
  };

  // Convert logos to base64 on mount
  useEffect(() => {
    convertImageToBase64(zealousLogo, (base64) => {
      if (base64) setZealousLogoBase64(base64);
      else console.error("Failed to convert Zealous Tech Corp logo to base64");
    });

    convertImageToBase64(crescentLogo, (base64) => {
      if (base64) setCrescentLogoBase64(base64);
      else console.error("Failed to convert Crescent edTech logo to base64");
    });
  }, []);

  const fetchDetails = async () => {
    try {
      const res = await fetchPocReportById(formData.mod_poc_id);

      const reportData = res.report || {};
      const pointOfContact = reportData.pointOfContact || {};
      const expertDetails = reportData.expertDetails || {};

      setFormData((prev) => ({
        ...prev,
        mod_id: reportData.mod_id || "",
        address: reportData.address || "",
        title: reportData.title || "",
        background: reportData.background || "",
        scopeOfTheTraining: reportData.scopeOfTheTraining || "",
        totalStrength: reportData.totalStrength || 0,
        schedule: reportData.schedule || "",
        student_ranking: reportData.student_ranking || [],
        executiondates: reportData.executiondates || "",
        pointOfContact: {
          name: pointOfContact.name || "",
          role: pointOfContact.role || "",
          email: pointOfContact.email || "",
          contact: pointOfContact.contact || "",
          test_details: pointOfContact.test_details || "",
          summary: pointOfContact.summary || [],
        },
        expertDetails: expertDetails
          ? [expertDetails]
          : [
              {
                name: "",
                role: "",
                company: "",
                email: "",
              },
            ],
      }));

      setIsFetched(true);
    } catch (err) {
      console.error("Error fetching report details:", err);
      setError("Failed to fetch report details");
    }
  };

  const handleChange = (e, index = null, field = null, section = null) => {
    const { name, value } = e.target;

    if (section === "expertDetails" && index !== null) {
      setFormData((prev) => {
        const newExpertDetails = [...prev.expertDetails];
        newExpertDetails[index][field] = value;
        return { ...prev, expertDetails: newExpertDetails };
      });
    } else if (index !== null && field && section === "summary") {
      setFormData((prev) => {
        const newSummary = [...prev.pointOfContact.summary];
        newSummary[index][field] = value;
        return {
          ...prev,
          pointOfContact: { ...prev.pointOfContact, summary: newSummary },
        };
      });
    } else if (
      ["name", "role", "email", "contact", "test_details"].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        pointOfContact: { ...prev.pointOfContact, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addSummaryField = () => {
    setFormData((prev) => ({
      ...prev,
      pointOfContact: {
        ...prev.pointOfContact,
        summary: [
          ...prev.pointOfContact.summary,
          {
            day: "",
            topicsCovered: "",
            technicalTasksPerformed: "",
            gitLink: "",
            attendancePresent: "",
            attendanceAbsent: "",
          },
        ],
      },
    }));
  };

  const deleteSummaryField = (index) => {
    setFormData((prev) => {
      const updatedSummary = [...prev.pointOfContact.summary];
      updatedSummary.splice(index, 1);
      return {
        ...prev,
        pointOfContact: { ...prev.pointOfContact, summary: updatedSummary },
      };
    });
  };

  const handleFileUpload = (e, field) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], ...files],
      }));
    }
  };

  const removeFile = (field, index) => {
    setFormData((prev) => {
      const updatedFiles = [...prev[field]];
      updatedFiles.splice(index, 1);
      return { ...prev, [field]: updatedFiles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formattedSummary = formData.pointOfContact.summary.map((item) => ({
        ...item,
        attendancePresent: Array.isArray(item.attendancePresent)
          ? item.attendancePresent
          : item.attendancePresent
          ? item.attendancePresent.split(",").map((name) => name.trim())
          : [],
        attendanceAbsent: Array.isArray(item.attendanceAbsent)
          ? item.attendanceAbsent
          : item.attendanceAbsent
          ? item.attendanceAbsent.split(",").map((name) => name.trim())
          : [],
      }));

      const reportData = {
        title: formData.title,
        background: formData.background,
        address: formData.address,
        scopeOfTheTraining: formData.scopeOfTheTraining,
        totalStrength: parseInt(formData.totalStrength) || 0,
        company: formData.expertDetails[0]?.company || "",
        email: formData.expertDetails[0]?.email || "",
        summary: formattedSummary,
      };

      const res = await generateReport(formData.mod_poc_id, reportData);

      setResponse(res.updatedReport);
      alert("Report generated successfully!");
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.message);
    }
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const readImageAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generatePDF = async () => {
    try {
      setGeneratingPdf(true);

      // Initialize PDF document
      const doc = new jsPDF({ unit: "pt" });
      const A4_WIDTH = 595.28;
      const A4_HEIGHT = 841.89;
      const MARGIN = 50;
      let yPos = MARGIN + 50;

      // Calculate actual footer height early
      const addressLines = formData.address
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);
      const footerLineHeight = 15;
      const footerTop = 80;
      const totalAddressLines = addressLines.reduce((count, line) => {
        const wrappedLines = doc.splitTextToSize(line, A4_WIDTH - 2 * MARGIN - 10);
        return count + wrappedLines.length;
      }, 0);
      const FOOTER_SPACE = footerTop + (totalAddressLines * footerLineHeight) + 10; // Add padding

      // Load logos for jsPDF
      const loadImageFromPath = (path) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));
          img.src = path;
        });
      };

      let crescentLogoImg, collegeLogoImg;
      try {
        crescentLogoImg = await loadImageFromPath(
          crescentLogo
        );
        collegeLogoImg = await loadImageFromPath(college);
      } catch (err) {
        console.error("Error loading logos:", err);
      }

      // Convert logos to base64 for pdf-lib
      const convertImageToBase64 = (imageUrl) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.height = img.naturalHeight;
            canvas.width = img.naturalWidth;
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL("image/png");
            const base64 = dataURL.split(",")[1];
            resolve(base64);
          };
          img.onerror = (err) => reject(err);
          img.src = imageUrl;
        });
      };

      let crescentLogoBase64, collegeLogoBase64;
      try {
        crescentLogoBase64 = await convertImageToBase64(
          crescentLogo
        );
        collegeLogoBase64 = await convertImageToBase64(college);
      } catch (err) {
        console.error("Error converting logos to base64:", err);
      }

      // Function to add header and footer to a page (for pdf-lib)
      const addHeaderFooter = async (pdfDoc, page, embedImages = true) => {
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        if (embedImages) {
          // Embed logos for pdf-lib
          let crescentLogoImage, collegeLogoImage;
          if (crescentLogoBase64) {
            crescentLogoImage = await pdfDoc.embedPng(crescentLogoBase64);
          }
          if (collegeLogoBase64) {
            collegeLogoImage = await pdfDoc.embedPng(collegeLogoBase64);
          }

          // Draw logos in header
          if (crescentLogoImage) {
            page.drawImage(crescentLogoImage, {
              x: MARGIN,
              y: pageHeight - 50,
              width: 80,
              height: 30,
            });
          }
          if (collegeLogoImage) {
            page.drawImage(collegeLogoImage, {
              x: pageWidth - MARGIN - 80,
              y: pageHeight - 50,
              width: 40,
              height: 30,
            });
          }
        }

        // Draw header line
        page.drawLine({
          start: { x: MARGIN, y: pageHeight - 55 },
          end: { x: pageWidth - MARGIN, y: pageHeight - 55 },
          thickness: 1.5,
          color: rgb(0.27, 0.51, 0.71),
        });

        // Draw footer line
        page.drawLine({
          start: { x: MARGIN, y: footerTop },
          end: { x: pageWidth - MARGIN, y: footerTop },
          thickness: 1.5,
          color: rgb(0.27, 0.51, 0.71),
        });

        // Draw footer address below the footer line
        let footerY = footerTop - 15;
        for (const line of addressLines.reverse()) {
          const wrappedLines = doc.splitTextToSize(line, A4_WIDTH - 2 * MARGIN - 10);
          for (const wrappedLine of wrappedLines.reverse()) {
            const textWidth = (helveticaFont.widthOfTextAtSize(wrappedLine, 11) * 1000) / 1000;
            page.drawText(wrappedLine, {
              x: (pageWidth - textWidth) / 2,
              y: footerY,
              size: 11,
              font: helveticaFont,
              color: rgb(0, 0, 0),
            });
            footerY -= 15;
          }
        }
      };

      // Placeholder for page tracking
      const jsPDFPageMarker = () => {
        // Headers/footers added using pdf-lib
      };

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      const titleText = `Master Report: ${formData.title}`;
      const titleLines = doc.splitTextToSize(titleText, A4_WIDTH - 2 * MARGIN);
      const titleWidth = Math.max(
        ...titleLines.map(
          (line) => (doc.getStringUnitWidth(line) * 20) / doc.internal.scaleFactor
        )
      );
      doc.text(titleLines, (A4_WIDTH - titleWidth) / 2, yPos);
      yPos += titleLines.length * 25 + 25;

      // Background Section
      if (yPos > A4_HEIGHT - FOOTER_SPACE) {
        doc.addPage();
        yPos = MARGIN + 50;
        jsPDFPageMarker();
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Background:", MARGIN + 5, yPos + 10);
      const bgWidth =
        (doc.getStringUnitWidth("Background:") * 16) / doc.internal.scaleFactor;
      doc.line(MARGIN + 5, yPos + 12, MARGIN + 5 + bgWidth, yPos + 12);
      yPos += 30;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const backgroundLines = doc.splitTextToSize(formData.background, A4_WIDTH - 2 * MARGIN - 10);
      doc.text(backgroundLines, MARGIN + 5, yPos);
      yPos += backgroundLines.length * 15 + 25;

      // Schedule Section
      if (yPos > A4_HEIGHT - FOOTER_SPACE) {
        doc.addPage();
        yPos = MARGIN + 50;
        jsPDFPageMarker();
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Schedule:", MARGIN + 5, yPos + 10);
      const schedWidth =
        (doc.getStringUnitWidth("Schedule:") * 16) / doc.internal.scaleFactor;
      doc.line(MARGIN + 5, yPos + 12, MARGIN + 5 + schedWidth, yPos + 12);
      yPos += 30;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const scheduleLines = doc.splitTextToSize(formData.schedule, A4_WIDTH - 2 * MARGIN - 10);
      doc.text(scheduleLines, MARGIN + 5, yPos);
      yPos += scheduleLines.length * 15 + 25;

      // Execution Dates Section
      if (yPos > A4_HEIGHT - FOOTER_SPACE) {
        doc.addPage();
        yPos = MARGIN + 50;
        jsPDFPageMarker();
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Execution Dates:", MARGIN + 5, yPos + 10);
      const execWidth =
        (doc.getStringUnitWidth("Execution Dates:") * 16) / doc.internal.scaleFactor;
      doc.line(MARGIN + 5, yPos + 12, MARGIN + 5 + execWidth, yPos + 12);
      yPos += 30;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const executionLines = doc.splitTextToSize(formData.executiondates, A4_WIDTH - 2 * MARGIN - 10);
      doc.text(executionLines, MARGIN + 5, yPos);
      yPos += executionLines.length * 15 + 25;

      // Scope of the Training Section
      if (yPos > A4_HEIGHT - FOOTER_SPACE) {
        doc.addPage();
        yPos = MARGIN + 50;
        jsPDFPageMarker();
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Scope of the Training:", MARGIN + 5, yPos + 10);
      const scopeWidth =
        (doc.getStringUnitWidth("Scope of the Training:") * 16) / doc.internal.scaleFactor;
      doc.line(MARGIN + 5, yPos + 12, MARGIN + 5 + scopeWidth, yPos + 12);
      yPos += 30;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      let scopeLines = [];
      if (formData.scopeOfTheTraining.includes("\n")) {
        const scopeItems = formData.scopeOfTheTraining.split("\n").filter((item) => item.trim());
        scopeItems.forEach((item, index) => {
          const numberedItem = `${index + 1}. ${item.trim()}`;
          scopeLines.push(...doc.splitTextToSize(numberedItem, A4_WIDTH - 2 * MARGIN - 15));
        });
      } else {
        scopeLines = doc.splitTextToSize(formData.scopeOfTheTraining, A4_WIDTH - 2 * MARGIN - 10);
      }
      doc.text(scopeLines, MARGIN + 5, yPos);
      yPos += scopeLines.length * 15 + 25;

      // Point of Contact Section
      if (yPos > A4_HEIGHT - FOOTER_SPACE) {
        doc.addPage();
        yPos = MARGIN + 50;
        jsPDFPageMarker();
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Point of Contact:", MARGIN + 5, yPos + 10);
      const pocWidth =
        (doc.getStringUnitWidth("Point of Contact:") * 16) / doc.internal.scaleFactor;
      doc.line(MARGIN + 5, yPos + 12, MARGIN + 5 + pocWidth, yPos + 12);
      yPos += 30;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Name: ${formData.pointOfContact.name}`, MARGIN + 5, yPos);
      yPos += 15;
      doc.text(`Role: ${formData.pointOfContact.role}`, MARGIN + 5, yPos);
      yPos += 15;
      doc.text(`Email: ${formData.pointOfContact.email}`, MARGIN + 5, yPos);
      yPos += 15;
      doc.text(`Contact: ${formData.pointOfContact.contact}`, MARGIN + 5, yPos);
      yPos += 25;

      // Expert Details Section
      if (yPos > A4_HEIGHT - FOOTER_SPACE) {
        doc.addPage();
        yPos = MARGIN + 50;
        jsPDFPageMarker();
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Expert Details:", MARGIN + 5, yPos + 10);
      const expertWidth =
        (doc.getStringUnitWidth("Expert Details:") * 16) / doc.internal.scaleFactor;
      doc.line(MARGIN + 5, yPos + 12, MARGIN + 5 + expertWidth, yPos + 12);
      yPos += 30;
      formData.expertDetails.forEach((expert) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Name: ${expert.name}`, MARGIN + 5, yPos);
        yPos += 15;
        doc.text(`Role: ${expert.role}`, MARGIN + 5, yPos);
        yPos += 15;
        doc.text(`Company: ${expert.company}`, MARGIN + 5, yPos);
        yPos += 15;
        doc.text(`Email: ${expert.email}`, MARGIN + 5, yPos);
        yPos += 25;
      });

      // Total Strength Section
      if (yPos > A4_HEIGHT - FOOTER_SPACE) {
        doc.addPage();
        yPos = MARGIN + 50;
        jsPDFPageMarker();
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Total Strength:", MARGIN + 5, yPos + 10);
      const strengthWidth =
        (doc.getStringUnitWidth("Total Strength:") * 16) / doc.internal.scaleFactor;
      doc.line(MARGIN + 5, yPos + 12, MARGIN + 5 + strengthWidth, yPos + 12);
      yPos += 30;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Batch 1 - ${formData.totalStrength}`, MARGIN + 5, yPos);
      yPos += 25;

// Program Coverage - Table
if (yPos > A4_HEIGHT - FOOTER_SPACE - 50) {
  doc.addPage();
  yPos = MARGIN + 30;
  jsPDFPageMarker();
} else {
  yPos += 15;
}

doc.setFont("helvetica", "bold");
doc.setFontSize(16);
doc.text("Program Coverage:", MARGIN, yPos);
const progWidth = doc.getStringUnitWidth("Program Coverage:") * 16 / doc.internal.scaleFactor;
doc.line(MARGIN, yPos + 2, MARGIN + progWidth, yPos + 2);
yPos += 25;

const headers = [
  "Day",
  "Topics Covered",
  "Technical Tasks Performed",
  "Git Link",
  "Present",
  "Absent"
];

const usableWidth = A4_WIDTH - (2 * MARGIN);
const columnWidths = [
  Math.floor(usableWidth * 0.08),
  Math.floor(usableWidth * 0.20),
  Math.floor(usableWidth * 0.35),
  Math.floor(usableWidth * 0.17),
  Math.floor(usableWidth * 0.10),
  Math.floor(usableWidth * 0.10)
];

const tableX = MARGIN;
let tableY = yPos;
const LINE_HEIGHT = 14; // Height per line of text
const CELL_PADDING = 6; // Padding inside each cell
const HEADER_CONTENT_GAP = 4; // Additional gap between header and content

// Function to draw table header
const drawTableHeader = () => {
  doc.setFillColor(220, 230, 240);
  doc.rect(tableX, tableY, usableWidth, 18, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  let colX = tableX;
  headers.forEach((header, i) => {
    doc.text(
      header,
      colX + (columnWidths[i] / 2),
      tableY + 12,
      { align: "center" }
    );
    colX += columnWidths[i];
  });

  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);

  doc.line(tableX, tableY, tableX + usableWidth, tableY);
  doc.line(tableX, tableY + 18, tableX + usableWidth, tableY + 18);

  colX = tableX;
  for (let i = 0; i <= columnWidths.length; i++) {
    doc.line(colX, tableY, colX, tableY + 18);
    if (i < columnWidths.length) colX += columnWidths[i];
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  tableY += 18;
};

// Draw initial table header
drawTableHeader();

if (formData.pointOfContact?.summary && Array.isArray(formData.pointOfContact.summary)) {
  let availableSpace = A4_HEIGHT - FOOTER_SPACE - tableY; // Track remaining space on the page

  formData.pointOfContact.summary.forEach((item, rowIndex) => {
    // Prepare row data
    const rowData = [
      item.day || "",
      item.topicsCovered || "",
      item.technicalTasksPerformed || "",
      item.gitLink || "",
      (typeof item.attendancePresent === "string" ?
        item.attendancePresent :
        Array.isArray(item.attendancePresent) ?
          item.attendancePresent.join(", ") : ""),
      (typeof item.attendanceAbsent === "string" ?
        item.attendanceAbsent :
        Array.isArray(item.attendanceAbsent) ?
          item.attendanceAbsent.join(", ") : "")
    ];

    // Format technical tasks with bullets
    const wrappedCells = rowData.map((text, colIndex) => {
      if (colIndex === 2 && text) {
        const tasks = text.split("\n")
          .map(t => t.trim())
          .filter(t => t.length > 0)
          .map(t => {
            if (t.startsWith("-") || t.startsWith("•")) return t;
            return `• ${t}`;
          });
        text = tasks.join("\n");
      }
      return doc.splitTextToSize(text, columnWidths[colIndex] - 6);
    });

    // Calculate total row height if rendered fully
    const maxLines = Math.max(...wrappedCells.map(cell => cell.length));
    const fullRowHeight = Math.max(maxLines * LINE_HEIGHT, 20) + CELL_PADDING + HEADER_CONTENT_GAP;

    // Determine how many lines can fit in the remaining space
    const linesThatFit = Math.floor((availableSpace - CELL_PADDING - HEADER_CONTENT_GAP) / LINE_HEIGHT);
    const canFitFully = linesThatFit >= maxLines;

    // Start of the row
    let rowStartY = tableY;

    if (canFitFully) {
      // If the entire row fits, render it fully
      let colX = tableX;
      for (let colIndex = 0; colIndex < rowData.length; colIndex++) {
        const cellX = colX + 3;
        let cellY = tableY + 6 + HEADER_CONTENT_GAP; // Add gap between header and content
        wrappedCells[colIndex].forEach((line, lineIndex) => {
          doc.text(line, cellX, cellY + (lineIndex * LINE_HEIGHT));
        });
        colX += columnWidths[colIndex];
      }

      // Draw row borders
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.2);
      doc.line(tableX, tableY + fullRowHeight, tableX + usableWidth, tableY + fullRowHeight);

      colX = tableX; // Reset colX for drawing vertical borders
      for (let i = 0; i <= columnWidths.length; i++) {
        doc.line(colX, tableY, colX, tableY + fullRowHeight);
        if (i < columnWidths.length) colX += columnWidths[i];
      }

      tableY += fullRowHeight;
      availableSpace -= fullRowHeight;
    } else {
      // If the row doesn't fit fully, split it across pages
      let remainingLines = wrappedCells.map(cell => [...cell]); // Copy of lines to render
      let linesRendered = 0;

      while (remainingLines.some(cell => cell.length > 0)) {
        const linesToRenderThisPage = Math.min(linesThatFit, maxLines - linesRendered);
        if (linesToRenderThisPage <= 0) break; // Safety check

        const partialRowHeight = (linesToRenderThisPage * LINE_HEIGHT) + CELL_PADDING + HEADER_CONTENT_GAP;

        // Render the lines that fit on this page
        let colX = tableX;
        for (let colIndex = 0; colIndex < rowData.length; colIndex++) {
          const cellX = colX + 3;
          let cellY = tableY + 6 + HEADER_CONTENT_GAP; // Add gap between header and content
          for (let i = 0; i < linesToRenderThisPage && remainingLines[colIndex].length > 0; i++) {
            const line = remainingLines[colIndex][0];
            doc.text(line, cellX, cellY + (i * LINE_HEIGHT));
            remainingLines[colIndex].shift(); // Remove the rendered line
          }
          colX += columnWidths[colIndex];
        }

        // Draw partial row borders
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.2);
        doc.line(tableX, tableY + partialRowHeight, tableX + usableWidth, tableY + partialRowHeight);

        colX = tableX; // Reset colX for drawing vertical borders
        for (let i = 0; i <= columnWidths.length; i++) {
          doc.line(colX, tableY, colX, tableY + partialRowHeight);
          if (i < columnWidths.length) colX += columnWidths[i];
        }

        // Draw vertical lines for this portion of the row
        colX = tableX;
        for (let i = 0; i <= columnWidths.length; i++) {
          doc.line(colX, rowStartY, colX, tableY + partialRowHeight);
          if (i < columnWidths.length) colX += columnWidths[i];
        }

        linesRendered += linesToRenderThisPage;
        tableY += partialRowHeight;
        availableSpace -= partialRowHeight;

        // If there are more lines to render, add a new page
        if (remainingLines.some(cell => cell.length > 0)) {
          doc.addPage();
          tableY = MARGIN + 30;
          yPos = tableY;
          jsPDFPageMarker();

          // Redraw table header on new page
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.text("Program Coverage (continued):", MARGIN, tableY);
          const contProgWidth = doc.getStringUnitWidth("Program Coverage (continued):") * 16 / doc.internal.scaleFactor;
          doc.line(MARGIN, tableY + 2, MARGIN + contProgWidth, tableY + 2);
          tableY += 25;

          drawTableHeader();
          availableSpace = A4_HEIGHT - FOOTER_SPACE - tableY; // Reset available space
          rowStartY = tableY; // Reset rowStartY for the continued row
        }
      }

      // Ensure the final bottom border of the row is drawn
      if (!remainingLines.some(cell => cell.length > 0)) {
        let colX = tableX; // Reset colX for final vertical borders
        for (let i = 0; i <= columnWidths.length; i++) {
          doc.line(colX, rowStartY, colX, tableY);
          if (i < columnWidths.length) colX += columnWidths[i];
        }
      }
    }
  });
} else {
  doc.setFontSize(10);
  doc.text("No data available", tableX + (usableWidth / 2), tableY + 15, { align: "center" });
  tableY += 30;
  doc.line(tableX, tableY, tableX + usableWidth, tableY);
}

yPos = tableY;

      // Student rankings section
      if (formData.student_ranking) {
        if (yPos > A4_HEIGHT - FOOTER_SPACE - 50) {
          doc.addPage();
          jsPDFPageMarker();
          yPos = MARGIN + 30;
        } else {
          yPos += 30;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Top Performers:", MARGIN, yPos);
        const rankWidth = doc.getStringUnitWidth("Top Performers:") * 16 / doc.internal.scaleFactor;
        doc.line(MARGIN, yPos + 2, MARGIN + rankWidth, yPos + 2);
        yPos += 20;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        let rankingText = String(formData.student_ranking || "");
        let performers = [];
        if (rankingText.includes("\n")) {
          performers = rankingText.split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0);
        } else if (rankingText.includes(",")) {
          performers = rankingText.split(",")
            .map(name => name.trim())
            .filter(name => name.length > 0);
        } else if (rankingText.trim().length > 0) {
          performers = [rankingText.trim()];
        }

        performers.forEach((performer, index) => {
          if (yPos > A4_HEIGHT - FOOTER_SPACE - 20) {
            doc.addPage();
            jsPDFPageMarker();
            yPos = MARGIN + 30;
            doc.setFont("helvetica", "bold");
            doc.text("Top Performers (continued):", MARGIN, yPos);
            doc.line(MARGIN, yPos + 2, MARGIN + rankWidth + 80, yPos + 2);
            yPos += 20;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
          }
          doc.text(`${index + 1}. ${performer}`, MARGIN, yPos);
          yPos += 18;
        });
      }

      // Assessment Details Section
      const testDetailsInput = formData.pointOfContact.test_details;
      const testDetailsArray = typeof testDetailsInput === "string"
        ? testDetailsInput.split("\n").filter(item => item.trim()).map(item => item.trim())
        : Array.isArray(testDetailsInput) ? testDetailsInput : [];

      if (testDetailsArray.length > 0) {
        if (yPos > A4_HEIGHT - FOOTER_SPACE - 20) {
          doc.addPage();
          yPos = MARGIN + 50;
          jsPDFPageMarker();
        } else {
          yPos += 25;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Details of Assessment's Day Wise:", MARGIN + 5, yPos + 10);
        const headerWidth =
          (doc.getStringUnitWidth("Details of Assessment's Day Wise:") * 16) /
          doc.internal.scaleFactor;
        doc.line(MARGIN + 5, yPos + 12, MARGIN + 5 + headerWidth, yPos + 12);
        yPos += 30;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        testDetailsArray.forEach((testDetail, index) => {
          if (yPos > A4_HEIGHT - FOOTER_SPACE - 20) {
            doc.addPage();
            yPos = MARGIN + 50;
            jsPDFPageMarker();
          }
          const displayText = `${index + 1}. ${testDetail}`;
          const testLines = doc.splitTextToSize(displayText, A4_WIDTH - 2 * MARGIN - 15);
          doc.text(testLines, MARGIN + 15, yPos);
          yPos += testLines.length * 15;
        });
        yPos += 25;
      }

      // Convert jsPDF to pdf-lib
      const mainPdfBytes = doc.output("arraybuffer");
      const pdfDoc = await PDFDocument.load(mainPdfBytes);

      // Apply headers and footers to main content pages
      for (const page of pdfDoc.getPages()) {
        await addHeaderFooter(pdfDoc, page);
      }

      // Calculate actual footer height for attachments
      const actualFooterHeight = FOOTER_SPACE;

      // Handle PDF and image attachments
      const pdfCategories = [
        {
          name: "Event Photos",
          field: "eventPhotos",
          files: formData.eventPhotos,
          isImageSupported: true,
        },
        {
          name: "Attendance Report with Graph Chart",
          field: "attachmentReport",
          files: formData.attendanceReport,
          isImageSupported: false,
        },
        {
          name: "Statistics of Each Day in Pie Chart",
          field: "statisticsChart",
          files: formData.statisticsChart,
          isImageSupported: false,
        },
        {
          name: "Individual's Progress in Each Day as Grid",
          field: "individualProgress",
          files: formData.individualProgress,
          isImageSupported: false,
        },
        {
          name: "Overall Column Chart for Total Test Mark",
          field: "overallColumnChart",
          files: formData.overallColumnChart,
          isImageSupported: false,
        },
      ].filter((category) => category.files && category.files.length > 0);

      // Track attachment page indices
      const attachmentPageIndices = [];
      let startingPageCount = pdfDoc.getPageCount();

      for (const category of pdfCategories) {
        if (category.field === "eventPhotos" && category.isImageSupported) {
          // Handle images for eventPhotos (dynamically fit as many as possible per page)
          const imageFiles = category.files.filter((file) =>
            file.type.startsWith("image/")
          );

          let currentY = A4_HEIGHT - 130; // Start below the title
          let currentPage = null;
          let imagesOnPage = 0;
          let imageIndex = 0;

          while (imageIndex < imageFiles.length) {
            // If no page exists or there's not enough space, create a new page
            const TITLE_HEIGHT = 40;
            const TITLE_MARGIN_TOP = 130;
            const CONTENT_MARGIN_TOP = 40;
            const GAP_BETWEEN_IMAGES = 10;
            const MIN_IMAGE_SPACE = 150; // Minimum space needed for an image

            if (!currentPage || currentY < (actualFooterHeight + MIN_IMAGE_SPACE + GAP_BETWEEN_IMAGES)) {
              if (currentPage) {
                await addHeaderFooter(pdfDoc, currentPage);
              }

              currentPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
              attachmentPageIndices.push(startingPageCount + attachmentPageIndices.length);
              currentY = A4_HEIGHT - TITLE_MARGIN_TOP;
              imagesOnPage = 0;

              // Draw title bar
              currentPage.drawRectangle({
                x: MARGIN,
                y: A4_HEIGHT - TITLE_MARGIN_TOP,
                width: A4_WIDTH - 2 * MARGIN,
                height: TITLE_HEIGHT,
                color: rgb(0.12, 0.47, 0.8),
              });

              const fileTitle = `Event Photos (Images ${imageIndex + 1}-${Math.min(imageIndex + 2, imageFiles.length)} of ${imageFiles.length})`;
              const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
              const titleWidth = helveticaFont.widthOfTextAtSize(fileTitle, 12);
              currentPage.drawText(fileTitle, {
                x: (A4_WIDTH - titleWidth) / 2,
                y: A4_HEIGHT - TITLE_MARGIN_TOP + (TITLE_HEIGHT - 12) / 2,
                size: 12,
                font: helveticaFont,
                color: rgb(1, 1, 1),
              });

              currentY -= (TITLE_HEIGHT + CONTENT_MARGIN_TOP);
            }

            // Process the current image
            try {
              const file = imageFiles[imageIndex];
              const imageBytes = await readImageAsBase64(file);
              let image;
              if (file.type.includes("png")) {
                image = await pdfDoc.embedPng(imageBytes);
              } else if (file.type.includes("jpeg") || file.type.includes("jpg")) {
                image = await pdfDoc.embedJpg(imageBytes);
              } else {
                throw new Error(`Unsupported image type: ${file.type}`);
              }

              const origWidth = image.width;
              const origHeight = image.height;
              const widthScale = (A4_WIDTH - 3 * MARGIN) / origWidth;
              const availableHeight = currentY - actualFooterHeight - GAP_BETWEEN_IMAGES;
              const heightScale = availableHeight / origHeight;
              const scale = Math.min(widthScale, heightScale);

              const scaledWidth = origWidth * scale;
              const scaledHeight = origHeight * scale;
              const x = (A4_WIDTH - scaledWidth) / 2;
              const y = currentY - scaledHeight;

              // Only place the image if it fits above the footer
              if (y > actualFooterHeight) {
                currentPage.drawImage(image, {
                  x,
                  y,
                  width: scaledWidth,
                  height: scaledHeight,
                });

                currentY = y - GAP_BETWEEN_IMAGES;
                imagesOnPage++;
                imageIndex++;
              } else {
                // Not enough space, move to the next page
                currentY = actualFooterHeight;
              }
            } catch (err) {
              console.error(`Error embedding image ${imageFiles[imageIndex].name}:`, err);
              currentPage.drawText(`Error: Could not embed image "${imageFiles[imageIndex].name}"`, {
                x: MARGIN + 20,
                y: currentY - 20,
                size: 12,
                font: await pdfDoc.embedFont(StandardFonts.Helvetica),
                color: rgb(1, 0, 0),
              });
              currentY -= 40;
              imageIndex++;
            }
          }

          // Add header and footer to the last page
          if (currentPage) {
            await addHeaderFooter(pdfDoc, currentPage);
          }

          // Handle PDFs for eventPhotos
          const pdfFiles = category.files.filter((file) =>
            file.type === "application/pdf"
          );
          for (let fileIndex = 0; fileIndex < pdfFiles.length; fileIndex++) {
            const file = pdfFiles[fileIndex];
            try {
              const pdfBytes = await readFileAsArrayBuffer(file);
              const attachmentPdf = await PDFDocument.load(pdfBytes);
              const pageIndices = attachmentPdf.getPageIndices();

              for (const index of pageIndices) {
                const newPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
                attachmentPageIndices.push(
                  startingPageCount + attachmentPageIndices.length
                );

                const [embeddedPage] = await pdfDoc.embedPdf(attachmentPdf, [index]);
                const origWidth = embeddedPage.width;
                const origHeight = embeddedPage.height;

                const TITLE_HEIGHT = 40;
                const TITLE_MARGIN_TOP = 130;
                const CONTENT_MARGIN_TOP = 40;
                const availableHeight =
                  A4_HEIGHT - TITLE_MARGIN_TOP - TITLE_HEIGHT - CONTENT_MARGIN_TOP - actualFooterHeight;

                const widthScale = (A4_WIDTH - 2 * MARGIN) / origWidth;
                const heightScale = availableHeight / origHeight;
                const scale = Math.min(widthScale, heightScale);

                const scaledWidth = origWidth * scale;
                const scaledHeight = origHeight * scale;
                const x = (A4_WIDTH - scaledWidth) / 2;
                const y =
                  A4_HEIGHT - TITLE_MARGIN_TOP - TITLE_HEIGHT - CONTENT_MARGIN_TOP - scaledHeight;

                newPage.drawPage(embeddedPage, {
                  x,
                  y,
                  width: scaledWidth,
                  height: scaledHeight,
                });

                const fileTitle =
                  pdfFiles.length > 1
                    ? `Event Photos (PDF File ${fileIndex + 1}/${pdfFiles.length}: ${file.name})`
                    : `Event Photos (PDF: ${file.name})`;

                const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
                newPage.drawRectangle({
                  x: MARGIN,
                  y: A4_HEIGHT - TITLE_MARGIN_TOP,
                  width: A4_WIDTH - 2 * MARGIN,
                  height: TITLE_HEIGHT,
                  color: rgb(0.12, 0.47, 0.8),
                });

                const titleWidth = helveticaFont.widthOfTextAtSize(fileTitle, 12);
                newPage.drawText(fileTitle, {
                  x: (A4_WIDTH - titleWidth) / 2,
                  y: A4_HEIGHT - TITLE_MARGIN_TOP + (TITLE_HEIGHT - 12) / 2,
                  size: 12,
                  font: helveticaFont,
                  color: rgb(1, 1, 1),
                });

                await addHeaderFooter(pdfDoc, newPage);
              }
            } catch (err) {
              console.error(`Error embedding PDF ${file.name}:`, err);
              const errorPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
              const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

              const TITLE_HEIGHT = 40;
              const TITLE_MARGIN_TOP = 130;

              errorPage.drawRectangle({
                x: MARGIN,
                y: A4_HEIGHT - TITLE_MARGIN_TOP,
                width: A4_WIDTH - 2 * MARGIN,
                height: TITLE_HEIGHT,
                color: rgb(0.12, 0.47, 0.8),
              });

              const errorTitle = `Error: Event Photos (PDF)`;
              const titleWidth = helveticaFont.widthOfTextAtSize(errorTitle, 12);
              errorPage.drawText(errorTitle, {
                x: (A4_WIDTH - titleWidth) / 2,
                y: A4_HEIGHT - TITLE_MARGIN_TOP + (TITLE_HEIGHT - 12) / 2,
                size: 12,
                font: helveticaFont,
                color: rgb(1, 1, 1),
              });

              errorPage.drawText(
                `The file "${file.name}" could not be embedded.`,
                {
                  x: MARGIN + 20,
                  y: A4_HEIGHT - TITLE_MARGIN_TOP - TITLE_HEIGHT - 40,
                  size: 12,
                  font: helveticaFont,
                }
              );

              await addHeaderFooter(pdfDoc, errorPage);
            }
          }
        } else {
          // Handle other PDF categories
          for (let fileIndex = 0; fileIndex < category.files.length; fileIndex++) {
            const file = category.files[fileIndex];
            try {
              const pdfBytes = await readFileAsArrayBuffer(file);
              const attachmentPdf = await PDFDocument.load(pdfBytes);
              const pageIndices = attachmentPdf.getPageIndices();

              for (const index of pageIndices) {
                const newPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
                attachmentPageIndices.push(
                  startingPageCount + attachmentPageIndices.length
                );

                const [embeddedPage] = await pdfDoc.embedPdf(attachmentPdf, [index]);
                const origWidth = embeddedPage.width;
                const origHeight = embeddedPage.height;

                const TITLE_HEIGHT = 40;
                const TITLE_MARGIN_TOP = 130;
                const CONTENT_MARGIN_TOP = 40;
                const availableHeight =
                  A4_HEIGHT - TITLE_MARGIN_TOP - TITLE_HEIGHT - CONTENT_MARGIN_TOP - actualFooterHeight;

                const widthScale = (A4_WIDTH - 2 * MARGIN) / origWidth;
                const heightScale = availableHeight / origHeight;
                const scale = Math.min(widthScale, heightScale);

                const scaledWidth = origWidth * scale;
                const scaledHeight = origHeight * scale;
                const x = (A4_WIDTH - scaledWidth) / 2;
                const y =
                  A4_HEIGHT - TITLE_MARGIN_TOP - TITLE_HEIGHT - CONTENT_MARGIN_TOP - scaledHeight;

                newPage.drawPage(embeddedPage, {
                  x,
                  y,
                  width: scaledWidth,
                  height: scaledHeight,
                });

                const fileTitle =
                  category.files.length > 1
                    ? `${category.name} (File ${fileIndex + 1}/${category.files.length}: ${file.name})`
                    : category.name;

                const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
                newPage.drawRectangle({
                  x: MARGIN,
                  y: A4_HEIGHT - TITLE_MARGIN_TOP,
                  width: A4_WIDTH - 2 * MARGIN,
                  height: TITLE_HEIGHT,
                  color: rgb(0.12, 0.47, 0.8),
                });

                const titleWidth = helveticaFont.widthOfTextAtSize(fileTitle, 12);
                newPage.drawText(fileTitle, {
                  x: (A4_WIDTH - titleWidth) / 2,
                  y: A4_HEIGHT - TITLE_MARGIN_TOP + (TITLE_HEIGHT - 12) / 2,
                  size: 12,
                  font: helveticaFont,
                  color: rgb(1, 1, 1),
                });

                await addHeaderFooter(pdfDoc, newPage);
              }
            } catch (err) {
              console.error(`Error embedding PDF ${file.name}:`, err);
              const errorPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
              const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

              const TITLE_HEIGHT = 40;
              const TITLE_MARGIN_TOP = 130;

              errorPage.drawRectangle({
                x: MARGIN,
                y: A4_HEIGHT - TITLE_MARGIN_TOP,
                width: A4_WIDTH - 2 * MARGIN,
                height: TITLE_HEIGHT,
                color: rgb(0.12, 0.47, 0.8),
              });

              const errorTitle = `Error: ${category.name}`;
              const titleWidth = helveticaFont.widthOfTextAtSize(errorTitle, 12);
              errorPage.drawText(errorTitle, {
                x: (A4_WIDTH - titleWidth) / 2,
                y: A4_HEIGHT - TITLE_MARGIN_TOP + (TITLE_HEIGHT - 12) / 2,
                size: 12,
                font: helveticaFont,
                color: rgb(1, 1, 1),
              });

              errorPage.drawText(
                `The file "${file.name}" could not be embedded.`,
                {
                  x: MARGIN + 20,
                  y: A4_HEIGHT - TITLE_MARGIN_TOP - TITLE_HEIGHT - 40,
                  size: 12,
                  font: helveticaFont,
                }
              );

              await addHeaderFooter(pdfDoc, errorPage);
            }
          }
        }
      }

      // Add watermark if logo available
      const selectedCompany = formData.expertDetails[0]?.company || "";
      let logoImage;
      if (selectedCompany === "Zealous Tech Corp" && zealousLogoBase64) {
        logoImage = await pdfDoc.embedPng(zealousLogoBase64);
      } else if (selectedCompany === "Crescent edTech" && crescentLogoBase64) {
        logoImage = await pdfDoc.embedPng(crescentLogoBase64);
      }
      if (logoImage) {
        for (const page of pdfDoc.getPages()) {
          const logoWidth = logoImage.width;
          const logoHeight = logoImage.height;
          const maxWidth = A4_WIDTH * 0.5;
          const maxHeight = A4_HEIGHT * 0.5;
          const scale = Math.min(maxWidth / logoWidth, maxHeight / logoHeight);
          const scaledLogoWidth = logoWidth * scale;
          const scaledLogoHeight = logoHeight * scale;
          const logoX = (A4_WIDTH - scaledLogoWidth) / 2;
          const logoY = (A4_HEIGHT - scaledLogoHeight) / 2;
          page.drawImage(logoImage, {
            x: logoX,
            y: logoY,
            width: scaledLogoWidth,
            height: scaledLogoHeight,
            opacity: 0.2,
          });
        }
      }

      // Save and download PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Master_Report_with_Attachments.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setGeneratingPdf(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF: " + error.message);
      setGeneratingPdf(false);
    }
  };


  const renderFileList = (field, fieldName) => {
    if (formData[field].length === 0) return null;
    return (
      <List dense>
        {formData[field].map((file, idx) => (
          <ListItem key={idx}>
            <ListItemText primary={file.name} />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => removeFile(field, idx)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };
const styles = {
  root: {
    padding: { xs: 2, sm: 3, md: 4 },
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
    animation: 'fadeIn 0.5s ease-in',
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },
  paper: {
    padding: { xs: 2, sm: 3, md: 4 },
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 20px rgba(12, 131, 200, 0.08)',
    maxWidth: 800,
    margin: 'auto',
    border: 'none',
  },
  title: {
    fontWeight: 700,
    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
    mb: 2,
  },
  subtitle: {
    fontWeight: 600,
    color: '#0c83c8',
    fontSize: { xs: '1rem', sm: '1.2rem' },
    mt: 3,
    mb: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      '&:hover fieldset': {
        borderColor: '#fc7a46',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#0c83c8',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#0c83c8',
      '&.Mui-focused': {
        color: '#fc7a46',
      },
    },
    '& .MuiFormHelperText-root': {
      color: '#4b5563',
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
    },
    '& .Mui-error fieldset': {
      borderColor: '#dc2626',
    },
  },
  button: {
    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
    color: '#ffffff',
    '&:hover': {
      background: 'linear-gradient(90deg, #fc7a46, #0c83c8)',
    },
    fontWeight: 500,
    px: 3,
    py: 1,
    textTransform: 'none',
    borderRadius: '8px',
    '&:disabled': {
      background: '#b0bec5',
      color: '#ffffff',
    },
  },
  outlinedButton: {
    color: '#0c83c8',
    borderColor: '#0c83c8',
    fontWeight: 500,
    px: 3,
    py: 1,
    textTransform: 'none',
    borderRadius: '8px',
    '&:hover': {
      borderColor: '#fc7a46',
      color: '#fc7a46',
      backgroundColor: '#e3f2fd',
    },
  },
  sectionBox: {
    pl: 2,
    pr: 2,
    pb: 2,
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    mb: 3,
  },
  errorText: {
    color: '#dc2626',
    fontSize: { xs: '0.875rem', sm: '1rem' },
    mt: 2,
  },
  successText: {
    color: '#2e7d32',
    fontSize: { xs: '0.875rem', sm: '1rem' },
    mt: 2,
  },
};
  return (
    <>
      <Admin_Dash />
      <Box sx={styles.root}>
        <Paper sx={styles.paper}>
          <Paper
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
            color: '#ffffff',
            borderRadius: '16px',
            textAlign: 'center',
            opacity: 0,
            animation: 'fadeIn 0.5s forwards',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <ClipboardMinus sx={{ fontSize: isMobile ? 20 : 24 }} />
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              fontWeight={600}
              sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}
            >
              Create Master Report
            </Typography>
          </Box>
          
        </Paper>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              margin="normal"
              sx={styles.textField}
              aria-label="Training Title"
            />
            <TextField
              label="Module ID"
              name="mod_id"
              value={formData.mod_id}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              sx={styles.textField}
              aria-label="Module ID"
            />
            <TextField
              label="POC ID"
              name="mod_poc_id"
              value={formData.mod_poc_id}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              sx={styles.textField}
              aria-label="POC ID"
            />
            <Button
              variant="outlined"
              onClick={fetchDetails}
              fullWidth
              sx={{ ...styles.outlinedButton, mt: 1, mb: 2 }}
              aria-label="Fetch Details"
            >
              Fetch Details
            </Button>
            <TextField
              label="Schedule"
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={styles.textField}
              aria-label="Schedule"
            />
            <TextField
              label="Execution Dates"
              name="executiondates"
              value={formData.executiondates}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={styles.textField}
              aria-label="Execution Dates"
            />
            <TextField
              label="Background"
              name="background"
              value={formData.background}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              margin="normal"
              sx={styles.textField}
              aria-label="Background"
            />
            <TextField
              label="Scope of the Training"
              name="scopeOfTheTraining"
              value={formData.scopeOfTheTraining}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              margin="normal"
              helperText="Enter each scope item on a new line for automatic numbering"
              sx={styles.textField}
              aria-label="Scope of the Training"
            />
            <TextField
              label="Total Strength"
              name="totalStrength"
              value={formData.totalStrength}
              onChange={handleChange}
              fullWidth
              type="number"
              margin="normal"
              sx={styles.textField}
              aria-label="Total Strength"
            />
            <Typography variant="h6" sx={styles.subtitle}>
              Point of Contact Details
            </Typography>
            <Box sx={styles.sectionBox}>
              <TextField
                label="Name"
                name="name"
                value={formData.pointOfContact.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={styles.textField}
                aria-label="POC Name"
              />
              <TextField
                label="Role"
                name="role"
                value={formData.pointOfContact.role}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={styles.textField}
                aria-label="POC Role"
              />
              <TextField
                label="Email"
                name="email"
                value={formData.pointOfContact.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={styles.textField}
                aria-label="POC Email"
              />
              <TextField
                label="Contact"
                name="contact"
                value={formData.pointOfContact.contact}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={styles.textField}
                aria-label="POC Contact"
              />
              <TextField
                label="Details of Assessment day wise"
                name="test_details"
                value={formData.pointOfContact.test_details}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                helperText="Enter each test item on a new line for automatic numbering"
                sx={styles.textField}
                aria-label="Assessment Details"
              />
              <TextField
                label="Top performers"
                name="student_ranking"
                value={formData.student_ranking}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                helperText="Enter each scope item on a new line for automatic numbering"
                sx={styles.textField}
                aria-label="Top Performers"
              />
            </Box>
            <Typography variant="h6" sx={styles.subtitle}>
              Expert Details
            </Typography>
            {formData.expertDetails.map((expert, index) => (
              <Box key={index} sx={styles.sectionBox}>
                <TextField
                  label="Name"
                  value={expert.name}
                  onChange={(e) => handleChange(e, index, "name", "expertDetails")}
                  fullWidth
                  margin="normal"
                  sx={styles.textField}
                  aria-label={`Expert ${index + 1} Name`}
                />
                <TextField
                  label="Role"
                  value={expert.role}
                  onChange={(e) => handleChange(e, index, "role", "expertDetails")}
                  fullWidth
                  margin="normal"
                  sx={styles.textField}
                  aria-label={`Expert ${index + 1} Role`}
                />
                <TextField
                  label="Email"
                  value={expert.email}
                  onChange={(e) => handleChange(e, index, "email", "expertDetails")}
                  fullWidth
                  margin="normal"
                  sx={styles.textField}
                  aria-label={`Expert ${index + 1} Email`}
                />
                <TextField
                  select
                  label="Company"
                  value={expert.company}
                  onChange={(e) => handleChange(e, index, "company", "expertDetails")}
                  fullWidth
                  margin="normal"
                  sx={styles.textField}
                  aria-label={`Expert ${index + 1} Company`}
                >
                  {companyOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                  helperText="Enter each address line separately for proper formatting"
                  sx={styles.textField}
                  aria-label="Address"
                />
              </Box>
            ))}
            <Typography variant="h6" sx={styles.subtitle}>
              Daily Summary
              <IconButton
                color="primary"
                onClick={addSummaryField}
                aria-label="Add Daily Summary"
              >
                <AddIcon />
              </IconButton>
            </Typography>
            {formData.pointOfContact.summary.map((item, index) => (
              <Box key={index} sx={styles.sectionBox}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" sx={{ color: '#0c83c8' }}>
                    Day {index + 1}
                  </Typography>
                  <IconButton
                    color="error"
                    onClick={() => deleteSummaryField(index)}
                    aria-label={`Delete Day ${index + 1} Summary`}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <TextField
                  label="Day"
                  value={item.day}
                  onChange={(e) => handleChange(e, index, "day", "summary")}
                  fullWidth
                  margin="normal"
                  sx={styles.textField}
                  aria-label={`Day ${index + 1}`}
                />
                <TextField
                  label="Topics Covered"
                  value={item.topicsCovered}
                  onChange={(e) =>
                    handleChange(e, index, "topicsCovered", "summary")
                  }
                  fullWidth
                  multiline
                  rows={2}
                  margin="normal"
                  sx={styles.textField}
                  aria-label={`Day ${index + 1} Topics Covered`}
                />
                <TextField
                  label="Technical Tasks Performed"
                  value={item.technicalTasksPerformed}
                  onChange={(e) =>
                    handleChange(e, index, "technicalTasksPerformed", "summary")
                  }
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                  helperText="Enter each task on a new line for automatic bullet points"
                  sx={styles.textField}
                  aria-label={`Day ${index + 1} Technical Tasks`}
                />
                <TextField
                  label="Git Link"
                  value={item.gitLink}
                  onChange={(e) => handleChange(e, index, "gitLink", "summary")}
                  fullWidth
                  margin="normal"
                  sx={styles.textField}
                  aria-label={`Day ${index + 1} Git Link`}
                />
                <TextField
                  label="Attendance Present (comma separated)"
                  value={item.attendancePresent}
                  onChange={(e) =>
                    handleChange(e, index, "attendancePresent", "summary")
                  }
                  fullWidth
                  margin="normal"
                  sx={styles.textField}
                  aria-label={`Day ${index + 1} Attendance Present`}
                />
                <TextField
                  label="Attendance Absent (comma separated)"
                  value={item.attendanceAbsent}
                  onChange={(e) =>
                    handleChange(e, index, "attendanceAbsent", "summary")
                  }
                  fullWidth
                  margin="normal"
                  sx={styles.textField}
                  aria-label={`Day ${index + 1} Attendance Absent`}
                />
              </Box>
            ))}
            <Typography variant="h6" sx={styles.subtitle}>
              Attachments
            </Typography>
            <Box sx={styles.sectionBox}>
              <Typography variant="subtitle1" sx={{ color: '#0c83c8', mb: 1 }}>
                Event Photos (PDFs and Images)
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<AddIcon />}
                sx={{ ...styles.button, mb: 1 }}
                aria-label="Add Event Photos"
              >
                Add Files
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  multiple
                  hidden
                  onChange={(e) => handleFileUpload(e, "eventPhotos")}
                />
              </Button>
              {renderFileList("eventPhotos", "Event Photos")}
            </Box>
            <Box sx={styles.sectionBox}>
              <Typography variant="subtitle1" sx={{ color: '#0c83c8', mb: 1 }}>
                Attendance Report with Graph Chart
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<AddIcon />}
                sx={{ ...styles.button, mb: 1 }}
                aria-label="Add Attendance Report"
              >
                Add Files
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  hidden
                  onChange={(e) => handleFileUpload(e, "attendanceReport")}
                />
              </Button>
              {renderFileList("attendanceReport", "Attendance Report")}
            </Box>
            <Box sx={styles.sectionBox}>
              <Typography variant="subtitle1" sx={{ color: '#0c83c8', mb: 1 }}>
                Statistics of Each Day in Pie Chart
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<AddIcon />}
                sx={{ ...styles.button, mb: 1 }}
                aria-label="Add Statistics Chart"
              >
                Add Files
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  hidden
                  onChange={(e) => handleFileUpload(e, "statisticsChart")}
                />
              </Button>
              {renderFileList("statisticsChart", "Statistics Chart")}
            </Box>
            <Box sx={styles.sectionBox}>
              <Typography variant="subtitle1" sx={{ color: '#0c83c8', mb: 1 }}>
                Individual's Progress in Each Day as Grid
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<AddIcon />}
                sx={{ ...styles.button, mb: 1 }}
                aria-label="Add Individual Progress"
              >
                Add Files
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  hidden
                  onChange={(e) => handleFileUpload(e, "individualProgress")}
                />
              </Button>
              {renderFileList("individualProgress", "Individual Progress")}
            </Box>
            <Box sx={styles.sectionBox}>
              <Typography variant="subtitle1" sx={{ color: '#0c83c8', mb: 1 }}>
                Overall Column Chart for Total Test Mark
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<AddIcon />}
                sx={{ ...styles.button, mb: 1 }}
                aria-label="Add Overall Column Chart"
              >
                Add Files
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  hidden
                  onChange={(e) => handleFileUpload(e, "overallColumnChart")}
                />
              </Button>
              {renderFileList("overallColumnChart", "Overall Column Chart")}
            </Box>
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                sx={styles.button}
                fullWidth
                aria-label="Generate Report"
              >
                Generate Report
              </Button>
              <Button
                variant="contained"
                sx={{
                  ...styles.button,
                  background: generatingPdf
                    ? '#b0bec5'
                    : 'linear-gradient(90deg, #fc7a46, #0c83c8)',
                  '&:hover': {
                    background: generatingPdf
                      ? '#b0bec5'
                      : 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  },
                }}
                fullWidth
                onClick={generatePDF}
                startIcon={generatingPdf ? null : <AddIcon />}
                disabled={generatingPdf}
                aria-label="Create Master PDF"
              >
                {generatingPdf ? 'Generating PDF...' : 'Create Master PDF'}
              </Button>
            </Box>
            {error && (
              <Typography sx={styles.errorText}>
                {error}
              </Typography>
            )}
            {response && (
              <Typography sx={styles.successText}>
                Report Generated: {response.title}
              </Typography>
            )}
          </form>
        </Paper>
      </Box>
    </>
  );
};

export default TrainingForm;  