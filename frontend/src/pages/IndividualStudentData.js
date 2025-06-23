import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ThemeProvider,
  createTheme,
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  TablePagination,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import BarChartIcon from "@mui/icons-material/BarChart";
import SchoolIcon from "@mui/icons-material/School";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Admin_Dash from "../components/AdminDash";

const BASE_URL = "http://localhost:8086";

// Create a custom theme
const theme = createTheme({
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#f5f5f5",
          fontWeight: "bold",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

// Function to export Performance Summary and Bar Chart as PDF
const exportBarChartPDF = async (chartRef, student) => {
  if (!chartRef.current) {
    console.error("Chart ref is missing");
    alert("Cannot generate PDF: Chart is not rendered.");
    return;
  }
  if (!student || !student.daily_results || student.daily_results.length === 0) {
    console.error("No student data available");
    alert("Cannot generate PDF: No student data available.");
    return;
  }

  const pdf = new jsPDF("portrait", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  try {
    // Solid Color Header
    pdf.setFillColor(25, 118, 210); // #1976d2
    pdf.rect(0, 0, pageWidth, 25, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${student.name}'s Performance Report`, margin, 15);
    pdf.setFontSize(10);
    pdf.text("Performance Analytics", pageWidth - margin - 40, 15); // Logo placeholder

    // Add shadow below header
    pdf.setFillColor(0, 0, 0, 0.1);
    pdf.rect(0, 25, pageWidth, 2, "F");

    // Performance Summary Section
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Performance Summary", margin, 35);
    pdf.setDrawColor(25, 118, 210);
    pdf.setLineWidth(0.5);
    pdf.line(margin, 37, pageWidth - margin, 37);

    // Summary table
    pdf.setFontSize(10);
    const summaryY = 42;
    const colWidth = contentWidth / 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Total Score", margin, summaryY);
    pdf.text("Percentage", margin + colWidth, summaryY);
    pdf.text("Performance", margin + colWidth * 2, summaryY);
    pdf.text("Module", margin + colWidth * 3, summaryY);
    pdf.text("POC", margin + colWidth * 4, summaryY);

    pdf.setFont("helvetica", "normal");
    pdf.text(`${student.scored_mark}/${student.total_possible_mark}`, margin, summaryY + 6);
    pdf.text(`${student.percentage_score}%`, margin + colWidth, summaryY + 6);
    const performance = student.percentage_score >= 90 ? "Excellent" :
                        student.percentage_score >= 80 ? "Very Good" :
                        student.percentage_score >= 70 ? "Good" :
                        student.percentage_score >= 60 ? "Satisfactory" :
                        student.percentage_score >= 50 ? "Pass" : "Needs Improvement";
    pdf.text(performance, margin + colWidth * 2, summaryY + 6);
    pdf.text(student.report_module, margin + colWidth * 3, summaryY + 6);
    pdf.text(student.report_poc, margin + colWidth * 4, summaryY + 6);

    // Border around summary
    pdf.setDrawColor(25, 118, 210);
    pdf.setLineWidth(0.8);
    pdf.rect(margin, summaryY - 3, contentWidth, 12);

    // Bar Chart Section
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Daily Performance Comparison", margin, 60);
    pdf.setDrawColor(25, 118, 210);
    pdf.line(margin, 62, pageWidth - margin, 62);

    // Capture bar chart
    const chartCanvas = await html2canvas(chartRef.current, {
      scale: 4, // Higher resolution for sharpness
      useCORS: true,
      backgroundColor: "#FFFFFF",
    });
    const chartImg = chartCanvas.toDataURL("image/png", 1.0);
    pdf.addImage(chartImg, "PNG", margin, 67, contentWidth, 120);

    // Border around chart
    pdf.setDrawColor(25, 118, 210);
    pdf.setLineWidth(0.8);
    pdf.rect(margin, 67, contentWidth, 120);

    // Footer
    pdf.setDrawColor(25, 118, 210);
    pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, pageHeight - 10);
    pdf.text("© Performance Analytics System", pageWidth - margin - 40, pageHeight - 10);

    pdf.save(`${student.name}_barchart_report.pdf`);
  } catch (error) {
    console.error("Error generating Bar Chart PDF:", error);
    alert("Failed to generate Bar Chart PDF. Please try again.");
  }
};

// Function to export Performance Summary and Table as PDF
const exportTablePDF = async (student) => {
  if (!student || !student.daily_results || student.daily_results.length === 0) {
    console.error("No student data available");
    alert("Cannot generate PDF: No student data available.");
    return;
  }

  const pdf = new jsPDF("portrait", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  try {
    // Solid Color Header
    pdf.setFillColor(25, 118, 210); // #1976d2
    pdf.rect(0, 0, pageWidth, 25, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${student.name}'s Performance Report`, margin, 15);
    pdf.setFontSize(10);
    pdf.text("Performance Analytics", pageWidth - margin - 40, 15); // Logo placeholder

    // Add shadow below header
    pdf.setFillColor(0, 0, 0, 0.1);
    pdf.rect(0, 25, pageWidth, 2, "F");

    // Performance Summary Section
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Performance Summary", margin, 35);
    pdf.setDrawColor(25, 118, 210);
    pdf.setLineWidth(0.5);
    pdf.line(margin, 37, pageWidth - margin, 37);

    // Summary table
    pdf.setFontSize(10);
    const summaryY = 42;
    const colWidth = contentWidth / 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Total Score", margin, summaryY);
    pdf.text("Percentage", margin + colWidth, summaryY);
    pdf.text("Performance", margin + colWidth * 2, summaryY);
    pdf.text("Module", margin + colWidth * 3, summaryY);
    pdf.text("POC", margin + colWidth * 4, summaryY);

    pdf.setFont("helvetica", "normal");
    pdf.text(`${student.scored_mark}/${student.total_possible_mark}`, margin, summaryY + 6);
    pdf.text(`${student.percentage_score}%`, margin + colWidth, summaryY + 6);
    const performance = student.percentage_score >= 90 ? "Excellent" :
                        student.percentage_score >= 80 ? "Very Good" :
                        student.percentage_score >= 70 ? "Good" :
                        student.percentage_score >= 60 ? "Satisfactory" :
                        student.percentage_score >= 50 ? "Pass" : "Needs Improvement";
    pdf.text(performance, margin + colWidth * 2, summaryY + 6);
    pdf.text(student.report_module, margin + colWidth * 3, summaryY + 6);
    pdf.text(student.report_poc, margin + colWidth * 4, summaryY + 6);

    // Border around summary
    pdf.setDrawColor(25, 118, 210);
    pdf.setLineWidth(0.8);
    pdf.rect(margin, summaryY - 3, contentWidth, 12);

    // Table Section
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Daily Performance Details", margin, 60);
    pdf.setDrawColor(25, 118, 210);
    pdf.line(margin, 62, pageWidth - margin, 62);

    // Table headers
    const tableY = 67;
    const tableColWidth = contentWidth / 4;
    pdf.setFillColor(230, 240, 255); // Light blue for header
    pdf.rect(margin, tableY, contentWidth, 7, "F");
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(25, 118, 210);
    pdf.text("Day", margin + 3, tableY + 5);
    pdf.text("MCQ", margin + tableColWidth + 3, tableY + 5);
    pdf.text("Coding", margin + tableColWidth * 2 + 3, tableY + 5);
    pdf.text("Total", margin + tableColWidth * 3 + 3, tableY + 5);

    // Table data with grid lines
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    let rowY = tableY + 7;
    const displayRecords = student.daily_results.slice(0, 20); // Up to 20 rows to fit

    displayRecords.forEach((day, index) => {
      const isEven = index % 2 === 0;
      if (isEven) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, rowY, contentWidth, 7, "F");
      }

      pdf.text(day.day, margin + 3, rowY + 5);
      pdf.text(day.mcq_score.toString(), margin + tableColWidth + 3, rowY + 5);
      pdf.text(day.coding_score.toString(), margin + tableColWidth * 2 + 3, rowY + 5);
      pdf.text(day.totalDay_Score.toString(), margin + tableColWidth * 3 + 3, rowY + 5);

      // Draw horizontal grid line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.2);
      pdf.line(margin, rowY + 7, pageWidth - margin, rowY + 7);

      rowY += 7;
    });

    // Draw vertical grid lines
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);
    pdf.line(margin + tableColWidth, tableY, margin + tableColWidth, rowY);
    pdf.line(margin + tableColWidth * 2, tableY, margin + tableColWidth * 2, rowY);
    pdf.line(margin + tableColWidth * 3, tableY, margin + tableColWidth * 3, rowY);

    // Border around table
    pdf.setDrawColor(25, 118, 210);
    pdf.setLineWidth(0.8);
    pdf.rect(margin, tableY, contentWidth, rowY - tableY);

    // Footer
    pdf.setDrawColor(25, 118, 210);
    pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, pageHeight - 10);
    pdf.text("© Performance Analytics System", pageWidth - margin - 40, pageHeight - 10);

    pdf.save(`${student.name}_table_report.pdf`);
  } catch (error) {
    console.error("Error generating Table PDF:", error);
    alert("Failed to generate Table PDF. Please try again.");
  }
};

const Individual = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const chartRef = useRef(null);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const { report_id } = useParams();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/individual_gateway/individual/get-by-report-id/${report_id}`
        );
        const data = response.data;

        const totalScored = data.tests.reduce((sum, test) => sum + test.scored_mark, 0);
        const totalPossible = data.tests.reduce((sum, test) => sum + test.total_mark, 0);

        const mappedStudent = {
          student_id: data.user_id,
          name: data.user_name,
          report_module: data.module_name,
          report_poc: data.module_poc_name,
          scored_mark: totalScored,
          total_possible_mark: totalPossible,
          percentage_score: ((totalScored / totalPossible) * 100).toFixed(2),
          daily_results: data.tests.map((test, index) => ({
            day: `Day ${index + 1}`,
            mcq_score: test.result_mcq_score,
            coding_score: test.result_coding_score,
            totalDay_Score: test.scored_mark,
            max_possible_score: test.total_mark,
          })),
        };

        setStudent(mappedStudent);
      } catch (err) {
        console.error("Error fetching student report:", err);
        setError("Failed to load student report.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [report_id]);

  // Performance categories based on percentage score
  const getPerformanceCategory = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Satisfactory";
    if (score >= 50) return "Pass";
    return "Needs Improvement";
  };

  // Performance color based on category
  const getPerformanceColor = (score) => {
    if (score >= 90) return "#2e7d32"; // green
    if (score >= 80) return "#388e3c"; // green-light
    if (score >= 70) return "#689f38"; // lime
    if (score >= 60) return "#ffa000"; // amber
    if (score >= 50) return "#f57c00"; // orange
    return "#d32f2f"; // red
  };

  // Colors for chart bars
  const CHART_COLORS = {
    mcq: "#98D2C0",
    coding: "#3D8D7A",
    total: "#FE4F2D",
  };

  // Prepare data for the column chart
  const prepareChartData = (student) => {
    if (!student) return [];

    return student.daily_results.map((day) => ({
      name: day.day,
      MCQ: day.mcq_score,
      "Coding Score": day.coding_score,
      Total: day.totalDay_Score,
    }));
  };

  // Calculate averages for the student
  const calculateAverages = (student) => {
    if (!student) return { mcq: 0, coding: 0, total: 0 };

    const avgMCQ =
      student.daily_results.reduce((sum, day) => sum + day.mcq_score, 0) /
      student.daily_results.length;

    const avgCoding =
      student.daily_results.reduce((sum, day) => sum + day.coding_score, 0) /
      student.daily_results.length;

    const avgTotal =
      student.daily_results.reduce((sum, day) => sum + day.totalDay_Score, 0) /
      student.daily_results.length;

    return {
      mcq: avgMCQ.toFixed(1),
      coding: avgCoding.toFixed(1),
      total: avgTotal.toFixed(1),
    };
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportBarChartPDF = () => {
    exportBarChartPDF(chartRef, student);
  };

  const handleExportTablePDF = () => {
    exportTablePDF(student);
  };

  if (loading)
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading student report...
          </Typography>
        </Box>
      </ThemeProvider>
    );

  if (error)
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        </Container>
      </ThemeProvider>
    );

  if (!student)
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Alert severity="info" sx={{ mt: 4 }}>
            No student report available
          </Alert>
        </Container>
      </ThemeProvider>
    );

  const averages = calculateAverages(student);

  return (
    <>
    <Admin_Dash/>
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <SchoolIcon sx={{ fontSize: 36, mr: 2, color: "primary.main" }} />
              <Typography variant="h4" component="h1" fontWeight="500">
                {student.report_module || "Programming Course"} Results
              </Typography>
            </Box>

            {/* Performance Summary - Enlarged */}
            <Card sx={{ mb: 4, p: { xs: 2, md: 3 } }}>
              <CardContent>
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{ mb: 3, fontWeight: 500, textAlign: "center" }}
                >
                  {student.name}'s Performance Summary
                </Typography>

                <Grid container spacing={4} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 3,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        Total Score
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" color="primary.main">
                        {student.scored_mark}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        out of {student.total_possible_mark}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 3,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        Percentage
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {student.percentage_score}%
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 3,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        Performance
                      </Typography>
                      <Chip
                        label={getPerformanceCategory(student.percentage_score)}
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.25rem",
                          py: 2.5,
                          bgcolor: getPerformanceColor(student.percentage_score),
                          color: "white",
                          alignSelf: "center",
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Additional Module Information */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h6" color="text.secondary">
                        Module
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {student.report_module}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h6" color="text.secondary">
                        Point of Contact
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {student.report_poc}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Column Chart - Full Width Row */}
            <Card sx={{ mb: 4, p: { xs: 2, md: 3 } }} ref={chartRef}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <BarChartIcon
                      sx={{ mr: 1, fontSize: 28, color: "primary.main" }}
                    />
                    <Typography variant="h5" fontWeight="500">
                      Daily Performance Comparison
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleExportBarChartPDF}
                    sx={{
                      color: "primary.main",
                      "&:hover": { bgcolor: "primary.light", color: "white" },
                    }}
                    title="Download Bar Chart PDF"
                  >
                    <PictureAsPdfIcon />
                  </IconButton>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Breakdown of scores across MCQ and Coding for each day
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: isMobile ? 350 : 400, width: "100%", backgroundColor: "#FFFFFF" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareChartData(student)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="MCQ"
                        name="MCQ"
                        fill={CHART_COLORS.mcq}
                      />
                      <Bar
                        dataKey="Coding Score"
                        name="Coding"
                        fill={CHART_COLORS.coding}
                      />
                      <Bar
                        dataKey="Total"
                        name="Daily Total"
                        fill={CHART_COLORS.total}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Daily Performance Table - Full Width Row */}
            <Card sx={{ p: { xs: 2, md: 3 } }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CalendarTodayIcon
                      sx={{ mr: 1, fontSize: 28, color: "primary.main" }}
                    />
                    <Typography variant="h5" fontWeight="500">
                      Daily Performance Details
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleExportTablePDF}
                    sx={{
                      color: "primary.main",
                      "&:hover": { bgcolor: "primary.light", color: "white" },
                    }}
                    title="Download Table PDF"
                  >
                    <PictureAsPdfIcon />
                  </IconButton>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Detailed breakdown of performance scores by day
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    maxHeight: 500,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Table stickyHeader size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: "bold", fontSize: "1rem" }}
                        >
                          Day
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", fontSize: "1rem" }}
                        >
                          MCQ
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", fontSize: "1rem" }}
                        >
                          Coding
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", fontSize: "1rem" }}
                        >
                          Total
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {student.daily_results
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((day, index) => (
                          <TableRow
                            key={day.day}
                            hover
                            sx={{
                              "&:nth-of-type(odd)": {
                                bgcolor: "rgba(0, 0, 0, 0.02)",
                              },
                              transition: "background-color 0.2s",
                              "&:hover": {
                                bgcolor: "rgba(25, 118, 210, 0.08) !important",
                              },
                            }}
                          >
                            <TableCell
                              component="th"
                              scope="row"
                              sx={{ fontWeight: 500 }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <CalendarTodayIcon
                                  fontSize="small"
                                  sx={{ mr: 1, color: "text.secondary" }}
                                />
                                {day.day}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={day.mcq_score}
                                size="small"
                                sx={{
                                  bgcolor: `rgba(25, 118, 210, 0.1)`,
                                  color: day.mcq_score > 5 ? "primary.main" : "black",
                                  minWidth: "40px",
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={day.coding_score}
                                size="small"
                                sx={{
                                  bgcolor: `rgba(46, 125, 50, 0.1)`,
                                  color: day.coding_score > 5 ? "success.main" : "black",
                                  minWidth: "40px",
                                }}
                              />
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold" }}
                            >
                              <Chip
                                label={day.totalDay_Score}
                                sx={{
                                  bgcolor: `rgba(156, 39, 176, 0.1)`,
                                  color: day.totalDay_Score > 15 ? "secondary.main" : "black",
                                  minWidth: "50px",
                                  fontWeight: "bold",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={student.daily_results.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </CardContent>
            </Card>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
    </>
  );
};

export default Individual;