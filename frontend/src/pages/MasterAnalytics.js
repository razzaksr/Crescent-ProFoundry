import React, { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "jspdf-autotable";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import autoTable from "jspdf-autotable";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Button,
  TextField,
  MenuItem,
  alpha,
  useTheme,
  Zoom,
  Grow,
  Fade,
  LinearProgress,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  FileDownload,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import FilterListIcon from "@mui/icons-material/FilterList";
import { fetchStudents, sendStudentRankings } from "../axios";
import AdminDashboard from "./AdminDashboard";
import Admin_Dash from "../components/AdminDash";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

// Define theme colors
const themeColors = {
  primary: "#2563eb",
  primaryLight: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#059669",
  warning: "#d97706",
  error: "#dc2626",
  background: "#f8fafc",
  paper: "#ffffff",
  cardGradient:
    "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)",
};

// Performance categories colors
const PERFORMANCE_COLORS = {
  Excellent: "#059669",
  "Very Good": "#10b981",
  Good: "#34d399",
  Satisfactory: "#fbbf24",
  Pass: "#f97316",
  "Needs Improvement": "#dc2626",
  "Not Attended": "#6b7280",
};

// DailyPerformanceCharts Component
const DailyPerformanceCharts = ({
  filteredStudents,
  selectedCollege,
  selectedModule,
  selectedPoc,
}) => {
  const chartRefs = useRef({});
  const [pdfGenerating, setPdfGenerating] = React.useState(false);

  // Process data to group by test dates
  const getDailyData = () => {
    const testDates = [
      ...new Set(
        filteredStudents.flatMap((student) =>
          student.tests.map((test) => test.date)
        )
      ),
    ].sort();

    return testDates.map((date) => {
      const dailyScores = filteredStudents
        .map((student) => {
          const test = student.tests.find((t) => t.date === date);
          return {
            name: student.user_name,
            score: test ? test.scored_mark : 0,
            total: test ? test.total_mark : 0,
          };
        })
        .filter((data) => data.total > 0);

      dailyScores.sort((a, b) => b.score - a.score);
      return { date, data: dailyScores };
    });
  };

  // Chart options
  const getChartOptions = (totalStudents) => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: themeColors.primary,
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: themeColors.primaryLight,
          borderWidth: 1,
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${context.raw} / ${context.dataset.maxScores[context.dataIndex]
              }`,
            title: (tooltipItems) => {
              return (
                filteredStudents.find(
                  (s) => s.user_name === tooltipItems[0].label
                )?.user_name || tooltipItems[0].label
              );
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Students",
            color: themeColors.primary,
            font: { size: 14, weight: "bold" },
          },
          ticks: {
            color: "#4b5563",
            display: false, // Remove student names under columns
          },
        },
        y: {
          title: {
            display: true,
            text: "Score",
            color: themeColors.primary,
            font: { size: 14, weight: "bold" },
          },
          ticks: { color: "#4b5563" },
          beginAtZero: true,
        },
      },
    };
  };

  // Generate PDF with charts properly sized and positioned
  const generatePDF = async () => {
    if (!filteredStudents.some((student) => student.tests.length > 0)) {
      alert("No test data available to generate the PDF.");
      return null;
    }

    setPdfGenerating(true);
    try {
      const pdf = new jsPDF("landscape", "pt", "a4");
      const dailyData = getDailyData();
      let isFirstPage = true;
      let yOffset;

      // A4 landscape dimensions: 842pt width, 595pt height
      const pageWidth = 842;
      const pageHeight = 595;
      const margin = 40;
      const maxChartHeight = 350; // Reduced to fit within page
      const maxChartWidth = pageWidth - 2 * margin; // 762pt

      // Title page content
      const addTitlePageContent = () => {
        yOffset = margin; // Start at top margin
        pdf.setFontSize(20);
        pdf.setTextColor(33, 33, 33);
        pdf.text("Student Performance Report - Daily Charts", margin, yOffset, {
          align: "left",
        });
        yOffset += 30;

        // Filters
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        if (selectedCollege) {
          pdf.text(`College: ${selectedCollege}`, margin, yOffset);
          yOffset += 15;
        }
        if (selectedModule) {
          pdf.text(`Module: ${selectedModule}`, margin, yOffset);
          yOffset += 15;
        }
        if (selectedPoc) {
          pdf.text(`POC: ${selectedPoc}`, margin, yOffset);
          yOffset += 15;
        }

        // Date
        pdf.text(
          `Generated on: ${new Date().toLocaleDateString()}`,
          margin,
          yOffset
        );
        yOffset += 30;
      };

      // Add charts starting from first page
      for (const { date, data } of dailyData) {
        if (!isFirstPage) {
          pdf.addPage();
        }
        yOffset = margin;

        // Add title page content only on first page before chart
        if (isFirstPage) {
          addTitlePageContent();
        } else {
          yOffset += 20; // Smaller top margin for subsequent pages
        }

        // Date header
        pdf.setFontSize(14);
        pdf.setTextColor(37, 99, 235);
        pdf.text(`Test Date: ${date}`, margin, yOffset);
        yOffset += 25;

        // Check available space
        const remainingHeight = pageHeight - yOffset - margin;
        if (remainingHeight < maxChartHeight + 30) {
          pdf.addPage();
          yOffset = margin;
          pdf.setFontSize(14);
          pdf.setTextColor(37, 99, 235);
          pdf.text(`Test Date: ${date}`, margin, yOffset);
          yOffset += 25;
        }

        // Add chart
        if (chartRefs.current[date]) {
          const canvas = chartRefs.current[date].canvas;
          if (canvas) {
            const imgData = canvas.toDataURL("image/png", 1.0);
            pdf.addImage(
              imgData,
              "PNG",
              margin,
              yOffset,
              maxChartWidth,
              maxChartHeight,
              undefined,
              "FAST"
            );
            yOffset += maxChartHeight + 20;
          } else {
            console.warn(`No canvas found for date: ${date}`);
            pdf.setFontSize(12);
            pdf.setTextColor(220, 38, 38);
            pdf.text(`Chart not available for ${date}`, margin, yOffset);
            yOffset += 20;
          }
        } else {
          console.warn(`No chart reference for date: ${date}`);
          pdf.setFontSize(12);
          pdf.setTextColor(220, 38, 38);
          pdf.text(`Chart not available for ${date}`, margin, yOffset);
          yOffset += 20;
        }

        // Add student count
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Total Students: ${data.length}`, margin, yOffset);

        isFirstPage = false;
      }

      // Handle no data case
      if (dailyData.length === 0) {
        if (!isFirstPage) {
          pdf.addPage();
        }
        addTitlePageContent();
        pdf.setFontSize(14);
        pdf.setTextColor(220, 38, 38);
        pdf.text(
          "No test data available for the selected filters.",
          margin,
          yOffset
        );
      }

      return pdf.output("blob"); // Return PDF as blob for external handling
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error generating PDF for Daily Charts. Please try again.");
      return null;
    } finally {
      setPdfGenerating(false);
    }
  };

  // No data state
  if (
    filteredStudents.length === 0 ||
    !filteredStudents.some((student) => student.tests.length > 0)
  ) {
    return (
      <Box sx={{ py: 5 }}>
        <Alert
          severity="info"
          variant="filled"
          sx={{
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            No test data available for the selected filters
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please adjust the filters or ensure student data includes test
            results.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const dailyData = getDailyData();

  return (

    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            bgcolor: `${themeColors.secondary}1A`,
            p: 1,
            borderRadius: 1.5,
            mr: 1.5,
            display: "flex",
          }}
        >
          <BarChartIcon sx={{ fontSize: 22, color: themeColors.secondary }} />
        </Box>
        <Typography variant="h5" fontWeight="600">
          Daily Student Performance Charts
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Performance data for all test dates based on selected filters
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<FileDownload />}
          onClick={async () => {
            const pdfBlob = await generatePDF();
            if (pdfBlob) {
              const url = URL.createObjectURL(pdfBlob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `Performance_DailyCharts_${selectedModule || "AllModules"
                }_${new Date().toISOString().split("T")[0]}.pdf`;
              link.click();
              URL.revokeObjectURL(url);
            }
          }}
          disabled={pdfGenerating}
          sx={{
            bgcolor: themeColors.primary,
            "&:hover": { bgcolor: themeColors.primaryLight },
            borderRadius: 2,
            boxShadow: "0 4px 6px rgba(37, 99, 235, 0.1)",
          }}
        >
          {pdfGenerating ? "Generating..." : "Export to PDF"}
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {dailyData.map(({ date, data }, index) => {
          const totalStudents = data.length;
          const chartData = {
            labels: data.map((item) => item.name),
            datasets: [
              {
                label: "Score",
                data: data.map((item) => item.score),
                maxScores: data.map((item) => item.total),
                backgroundColor: data.map((item) => {
                  const percentage = item.score / item.total;
                  if (percentage >= 0.8) return themeColors.success;
                  if (percentage >= 0.6) return themeColors.warning;
                  return themeColors.error;
                }),
                borderColor: themeColors.paper,
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 40,
              },
            ],
          };

          return (
            <Grid item xs={12} md={6} key={date}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${themeColors.primary}1A`,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="500"
                  sx={{ color: themeColors.primary, mb: 2 }}
                >
                  Test Date: {date}
                </Typography>
                <Box
                  sx={{
                    height: 400,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Bar
                    data={chartData}
                    options={getChartOptions(totalStudents)}
                    ref={(el) => (chartRefs.current[date] = el)}
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, textAlign: "center" }}
                >
                  Showing {totalStudents} students
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      {dailyData.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 2, mt: 3 }}>
          <Typography variant="body2">
            No data available for the selected filters.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

// ClassPerformance Component
const ClassPerformance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState("");
  const [modules, setModules] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [pocs, setPocs] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedPoc, setSelectedPoc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadedData, setLoadedData] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  // Performance category based on percentage
  const getPerformanceCategory = (percentage) => {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 75) return "Very Good";
    if (percentage >= 60) return "Good";
    if (percentage >= 45) return "Satisfactory";
    if (percentage >= 30) return "Pass";
    return "Needs Improvement";
  };

  const getColor = (name) => {
    const normalized = name.trim().toLowerCase();
    const normalizedColors = {
      excellent: "#059669",
      "very good": "#10b981",
      good: "#34d399",
      satisfactory: "#fbbf24",
      pass: "#f97316",
      "needs improvement": "#dc2626",
    };
    return normalizedColors[normalized] || "#8884d8";
  };

  const getAggregateScore = (student) => {
    const tests = student.tests || [];
    let totalScored = 0;
    let totalPossible = 0;

    tests.forEach((test) => {
      totalScored += test.scored_mark || 0;
      totalPossible += test.total_mark || 0;
    });

    const scale = student.details?.aggregate_score;

    if (!scale || totalPossible === 0) {
      return {
        score: totalScored,
        maxScore: totalPossible,
        aggregateScore: 0,
      };
    }

    const scaledAggregateScore = (totalScored / totalPossible) * scale;

    return {
      score: totalScored,
      maxScore: totalPossible,
      aggregateScore: parseFloat(scaledAggregateScore.toFixed(2)),
    };
  };

  const RANGE_COLORS = [
    "#059669",
    "#10b981",
    "#34d399",
    "#fbbf24",
    "#f97316",
    "#dc2626",
  ];

  const calculatePerformanceDistribution = () => {
    if (!filteredStudents || !Array.isArray(filteredStudents)) return [];

    const studentScores = filteredStudents
      .map((student) => {
        const { aggregateScore } = getAggregateScore(student);
        return { ...student, aggregateScore };
      })
      .filter(
        (s) =>
          typeof s.details?.aggregate_score === "number" &&
          s.details.aggregate_score > 0
      );

    if (studentScores.length === 0) return [];

    const maxScore = Math.max(...studentScores.map((s) => s.aggregateScore));
    const steps = 6;
    const stepSize = Math.ceil(maxScore / steps);
    const distribution = [];

    for (let i = 0; i < steps; i++) {
      const lower = i * stepSize;
      const upper = (i + 1) * stepSize;
      const label = `${lower} - ${upper}`;
      distribution.push({
        label,
        lower,
        upper,
        count: 0,
        color: RANGE_COLORS[i % RANGE_COLORS.length],
      });
    }

    studentScores.forEach(({ aggregateScore }) => {
      const bucketIndex = Math.min(
        Math.floor(aggregateScore / stepSize),
        steps - 1
      );
      distribution[bucketIndex].count++;
    });

    return distribution
      .filter((bucket) => bucket.count > 0)
      .map((bucket) => ({
        name: bucket.label,
        label: bucket.label,
        value: bucket.count,
        count: bucket.count,
        percentage: ((bucket.count / studentScores.length) * 100).toFixed(1),
        fill: bucket.color,
      }));
  };

  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        const data = await fetchStudents();

        const enhancedData = data.map((student) => {
          const totalScoredMarks = student.tests.reduce(
            (sum, test) => sum + test.scored_mark,
            0
          );
          const totalMarks = student.tests.reduce(
            (sum, test) => sum + test.total_mark,
            0
          );
          const totalTestDays = student.tests.length;

          const totalDays = student.details?.total_days || 0;
          const attendTestDays = student.details?.attend_test_days || 0;
          const notAttendTestDays = student.details?.not_attend_test_days || 0;

          return {
            ...student,
            totalScoredMarks,
            totalMarks,
            totalTestDays,
            totalDays,
            attendTestDays,
            notAttendTestDays,
          };
        });

        setStudents(enhancedData);

        const uniqueColleges = [
          ...new Set(enhancedData.map((s) => s.college_name)),
        ];
        setColleges(uniqueColleges);

        setLoading(false);

        setTimeout(() => {
          setLoadedData(true);
        }, 300);

        if (selectedCollege) {
          const filtered = enhancedData.filter(
            (student) => student.college_name === selectedCollege
          );

          const uniqueModules = [
            ...new Set(filtered.map((s) => s.module_name)),
          ];

          const pocMap = new Map();
          filtered.forEach((s) => {
            if (!pocMap.has(s.module_poc_name)) {
              pocMap.set(s.module_poc_name, s.module_poc_id);
            }
          });

          const uniquePocs = Array.from(pocMap, ([name, id]) => ({ name, id }));

          setModules(uniqueModules);
          setPocs(uniquePocs);
        } else {
          setModules([]);
          setPocs([]);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchStudentsData();

    setSelectedModule("");
    setSelectedPoc("");
  }, [selectedCollege]);

  // Filter students by college, module, POC, and search query
  const filteredStudents = students.filter((student) => {
    const matchesFilters =
      (!selectedCollege || student.college_name === selectedCollege) &&
      (!selectedModule || student.module_name === selectedModule) &&
      (!selectedPoc || student.module_poc_name === selectedPoc);

    const matchesSearch =
      searchQuery === "" ||
      (student.user_name &&
        student.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.module_name &&
        student.module_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilters && matchesSearch;
  });

  const sendStudentRankingsHandler = async (pocId) => {
    try {
      const studentNames = [...filteredStudents]
        .map((student) => {
          const { score } = getAggregateScore(student);
          return {
            name: student.user_name,
            score,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((student) => student.name);

      await sendStudentRankings(pocId, studentNames);
      alert("Top 10 student rankings sent successfully!");
    } catch (error) {
      console.error("Error sending student rankings:", error);
      alert("Error sending student rankings. Please try again.");
    }
  };
  // Calculate class metrics
  const calculateClassMetrics = () => {
    if (filteredStudents.length === 0)
      return {
        avgScore: 0,
        avgPercentage: 0,
        totalStudents: 0,
        totalMarks: 0,
      };

    let totalScoredMarks = 0;
    let totalPossibleMarks = 0;

    filteredStudents.forEach((student) => {
      const { score, maxScore } = getAggregateScore(student);
      totalScoredMarks += score;
      totalPossibleMarks += maxScore;
    });

    const avgScore = totalScoredMarks / filteredStudents.length;
    const avgPercentage = (totalScoredMarks / totalPossibleMarks) * 100;
    const avgTotalMarks = totalPossibleMarks / filteredStudents.length;

    return {
      avgScore: avgScore.toFixed(1),
      avgPercentage: avgPercentage.toFixed(1),
      totalStudents: filteredStudents.length,
      totalMarks: avgTotalMarks,
    };
  };

  // Generate PDF for Daily Performance Breakdown
  const generateDailyPerformancePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Daily Performance Breakdown", 14, 22);

    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${date}`, 14, 30);

    let yPos = 40;
    const testDates = [
      ...new Set(
        filteredStudents.flatMap((student) =>
          student.tests.map((test) => test.date)
        )
      ),
    ].sort();

    testDates.forEach((date, dateIndex) => {
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(`Day ${dateIndex + 1} - ${date}`, 14, yPos);

      const tableData = filteredStudents
        .map((student) => {
          const test = student.tests.find((t) => t.date === date);
          if (!test) {
            return {
              ...student,
              score: 0,
              maxScore: 0,
              percentage: 0,
              performance: "Not Attended",
            };
          }
          const percentage =
            test.total_mark > 0
              ? (test.scored_mark / test.total_mark) * 100
              : 0;
          const performance = getPerformanceCategory(percentage);
          return {
            ...student,
            score: test.scored_mark,
            maxScore: test.total_mark,
            percentage,
            performance,
          };
        })
        .sort((a, b) => b.score - a.score)
        .map((student) => [
          student.user_name,
          `${student.score} / ${student.maxScore}`,
          `${student.percentage.toFixed(1)}%`,
          student.performance,
        ]);

      autoTable(doc, {
        startY: yPos + 5,
        head: [["Student Name", "Total Score", "Percentage", "Performance"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [220, 230, 241],
          textColor: [50, 63, 82],
          fontStyle: "bold",
        },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: "center" },
          2: { cellWidth: 40, halign: "center" },
          3: { cellWidth: 50, halign: "center" },
        },
      });

      yPos = doc.lastAutoTable.finalY + 15;
      if (yPos > 250 && dateIndex < testDates.length - 1) {
        doc.addPage();
        yPos = 20;
      }
    });

    return doc.output("blob");
  };

  // Generate PDF for Performance Distribution
  const generatePerformanceDistributionPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const usableWidth = pageWidth - margin * 2;

    // Header
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, pageWidth, 25, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text("Performance Distribution Report", pageWidth / 2, 15, {
      align: "center",
    });

    let yPos = 35;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.text(
      selectedModule ? `Module: ${selectedModule}` : "All Modules",
      pageWidth / 2,
      yPos,
      { align: "center" }
    );

    if (selectedCollege) {
      yPos += 7;
      pdf.setFontSize(12);
      pdf.text(`College: ${selectedCollege}`, pageWidth / 2, yPos, {
        align: "center",
      });
      if (selectedPoc) {
        yPos += 7;
        pdf.text(`POC: ${selectedPoc}`, pageWidth / 2, yPos, {
          align: "center",
        });
      }
    }

    yPos += 7;
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPos);

    yPos += 8;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 8;
    pdf.setTextColor(139, 92, 246);
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("Performance Distribution", margin, yPos);

    yPos += 12;
    const chartWidth = usableWidth / 2;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");

    const tableStartX = margin + chartWidth + 10;
    let tableY = yPos;
    pdf.setFillColor(245, 247, 250);
    pdf.rect(tableStartX, tableY, usableWidth - chartWidth - 10, 8, "F");
    pdf.text("Performance", tableStartX + 5, tableY + 5.5);
    pdf.text(
      "Count",
      tableStartX + (usableWidth - chartWidth - 10) - 50,
      tableY + 5.5
    );
    pdf.text(
      "Percentage",
      tableStartX + (usableWidth - chartWidth - 10) - 25,
      tableY + 5.5
    );
    tableY += 8;

    pdf.setFont("helvetica", "normal");
    let alternateRow = false;
    const performanceData = calculatePerformanceDistribution();

    performanceData.forEach((data) => {
      if (alternateRow) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(tableStartX, tableY, usableWidth - chartWidth - 10, 7, "F");
      }
      const rgb = hexToRgb(data.fill);
      pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      pdf.circle(tableStartX + 3, tableY + 3.5, 2, "F");
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.name, tableStartX + 8, tableY + 5);
      pdf.text(
        data.value.toString(),
        tableStartX + (usableWidth - chartWidth - 10) - 50,
        tableY + 5
      );
      pdf.text(
        `${data.percentage}%`,
        tableStartX + (usableWidth - chartWidth - 10) - 25,
        tableY + 5
      );
      tableY += 7;
      alternateRow = !alternateRow;
    });

    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.rect(
      tableStartX,
      yPos,
      usableWidth - chartWidth - 10,
      tableY - yPos,
      "S"
    );

    const chartRadius = 30;
    const chartCenterX = margin + chartWidth / 2;
    const chartCenterY = yPos + 30;
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.circle(chartCenterX, chartCenterY, chartRadius, "S");

    let startAngle = 0;
    const totalValue = performanceData.reduce(
      (sum, item) => sum + item.value,
      0
    );

    performanceData.forEach((data) => {
      const rgb = hexToRgb(data.fill);
      const sliceAngle = (data.value / totalValue) * 360;
      const endAngle = startAngle + sliceAngle;
      drawPieSliceWithTriangles(
        pdf,
        chartCenterX,
        chartCenterY,
        chartRadius,
        startAngle,
        endAngle,
        rgb
      );
      const labelAngleRad =
        ((startAngle + sliceAngle / 2 - 90) * Math.PI) / 180;
      const labelRadius = chartRadius + 15;
      const labelX = chartCenterX + Math.cos(labelAngleRad) * labelRadius;
      const labelY = chartCenterY + Math.sin(labelAngleRad) * labelRadius;
      const lineEndX = chartCenterX + Math.cos(labelAngleRad) * chartRadius;
      const lineEndY = chartCenterY + Math.sin(labelAngleRad) * chartRadius;
      pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
      pdf.setLineWidth(0.7);
      pdf.line(lineEndX, lineEndY, labelX, labelY);
      pdf.setFillColor(255, 255, 255);
      pdf.setTextColor(rgb.r, rgb.g, rgb.b);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      const textToDisplay = `${data.percentage}%`;
      const textAlign = labelX > chartCenterX ? "left" : "right";
      const textX = labelX + (textAlign === "left" ? 2 : -2);
      pdf.text(textToDisplay, textX, labelY, { align: textAlign });
      startAngle = endAngle;
    });

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text(
      "Student Distribution",
      chartCenterX,
      chartCenterY + chartRadius + 25,
      { align: "center" }
    );

    yPos = Math.max(tableY + 10, chartCenterY + chartRadius + 35);
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text(
      `Generated for ${selectedCollege || "All Colleges"}`,
      margin,
      pageHeight - 15
    );
    pdf.text("Page 1 of 1", pageWidth - margin, pageHeight - 15, {
      align: "right",
    });

    return pdf.output("blob");
  };

  // Export to PDF for all sections
  const exportToPDF = async () => {
    setLoading(true);
    try {
      // Generate Performance Distribution PDF
      const performanceBlob = generatePerformanceDistributionPDF();
      const performanceUrl = URL.createObjectURL(performanceBlob);
      const performanceLink = document.createElement("a");
      performanceLink.href = performanceUrl;
      performanceLink.download = `Performance_Distribution_${selectedModule || "all_modules"
        }_${new Date().toISOString().split("T")[0]}.pdf`;
      performanceLink.click();
      URL.revokeObjectURL(performanceUrl);

      // Generate Daily Performance Breakdown PDF
      const dailyBreakdownBlob = generateDailyPerformancePDF();
      const dailyBreakdownUrl = URL.createObjectURL(dailyBreakdownBlob);
      const dailyBreakdownLink = document.createElement("a");
      dailyBreakdownLink.href = dailyBreakdownUrl;
      dailyBreakdownLink.download = `Daily_Performance_Breakdown_${selectedModule || "all_modules"
        }_${new Date().toISOString().split("T")[0]}.pdf`;
      dailyBreakdownLink.click();
      URL.revokeObjectURL(dailyBreakdownUrl);

      // Generate Daily Performance Charts PDF
      const chartsBlob = await document
        .querySelector("#daily-performance-charts button")
        .click(); // Trigger the existing button click
      // Note: The DailyPerformanceCharts PDF is handled by its own generatePDF function
    } catch (err) {
      console.error("Error generating PDFs:", err);
      alert("Error generating one or more PDFs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  function drawPieSliceWithTriangles(
    pdf,
    centerX,
    centerY,
    radius,
    startAngle,
    endAngle,
    rgb
  ) {
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const numTriangles = Math.max(8, Math.floor((endAngle - startAngle) / 5));

    for (let i = 0; i < numTriangles; i++) {
      const currAngle = startRad + (i / numTriangles) * (endRad - startRad);
      const nextAngle =
        startRad + ((i + 1) / numTriangles) * (endRad - startRad);
      const x1 = centerX + radius * Math.cos(currAngle);
      const y1 = centerY + radius * Math.sin(currAngle);
      const x2 = centerX + radius * Math.cos(nextAngle);
      const y2 = centerY + radius * Math.sin(nextAngle);
      pdf.triangle(centerX, centerY, x1, y1, x2, y2, "F");
    }

    pdf.setDrawColor(rgb.r * 0.8, rgb.g * 0.8, rgb.b * 0.8);
    pdf.setLineWidth(0.2);
    const arcSteps = Math.max(8, Math.floor((endAngle - startAngle) / 5));
    for (let i = 0; i < arcSteps; i++) {
      const currAngle = startRad + (i / arcSteps) * (endRad - startRad);
      const nextAngle = startRad + ((i + 1) / arcSteps) * (endRad - startRad);
      const x1 = centerX + radius * Math.cos(currAngle);
      const y1 = centerY + radius * Math.sin(currAngle);
      const x2 = centerX + radius * Math.cos(nextAngle);
      const y2 = centerY + radius * Math.sin(nextAngle);
      pdf.line(x1, y1, x2, y2);
    }

    const startX = centerX + radius * Math.cos(startRad);
    const startY = centerY + radius * Math.sin(startRad);
    const endX = centerX + radius * Math.cos(endRad);
    const endY = centerY + radius * Math.sin(endRad);
    pdf.line(centerX, centerY, startX, startY);
    pdf.line(centerX, centerY, endX, endY);
  }

  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
  }

  // StatBox Component
  const StatBox = ({ title, value, subtitle, icon, color }) => (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        background: themeColors.cardGradient,
        borderRadius: 3,
        border: `1px solid ${alpha(themeColors.primary, 0.1)}`,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              fontWeight="medium"
            >
              {title}
            </Typography>
            <Box
              sx={{
                backgroundColor: alpha(color, 0.1),
                p: 0.8,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </Box>
          </Box>
          <Typography variant="h4" fontWeight="bold" color={color} gutterBottom>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" mt="auto">
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  // PerformanceBadge Component
  const PerformanceBadge = ({ label }) => {
    return (
      <Chip
        label={label}
        size="small"
        sx={{
          fontWeight: "bold",
          backgroundColor: PERFORMANCE_COLORS[label] || themeColors.error,
          color: "white",
          px: 0.5,
          borderRadius: "8px",
          boxShadow: `0 2px 8px ${alpha(
            PERFORMANCE_COLORS[label] || themeColors.error,
            0.3
          )}`,
        }}
      />
    );
  };

  // Loading state
  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: themeColors.background,
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ color: themeColors.primary, mb: 3 }}
        />
        <Typography variant="h5" fontWeight="500" color="text.primary">
          Loading class performance data...
        </Typography>
        <Box sx={{ width: "300px", mt: 3 }}>
          <LinearProgress
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(themeColors.primary, 0.1),
              "& .MuiLinearProgress-bar": {
                backgroundColor: themeColors.primary,
              },
            }}
          />
        </Box>
      </Box>
    );

  // Error state
  if (error)
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert
          severity="error"
          variant="filled"
          sx={{
            mt: 4,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            {error}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please check your connection and try again.
          </Typography>
        </Alert>
      </Container>
    );

  // No data state
  if (students.length === 0)
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert
          severity="info"
          variant="filled"
          sx={{
            mt: 4,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            No student data available
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please add student data or select different filters.
          </Typography>
        </Alert>
      </Container>
    );

  const performanceData = calculatePerformanceDistribution();
  const classMetrics = calculateClassMetrics();
  const allFiltersSelected = selectedCollege && selectedModule && selectedPoc;

  return (
   <>
   <Admin_Dash/>
    <Box
      sx={{
        bgcolor: themeColors.background,
        minHeight: "100vh",
        py: 4,
        backgroundImage:
          "radial-gradient(circle at 25px 25px, rgba(59,130,246,0.03) 1%, transparent 0%)",
        backgroundSize: "32px 32px",
      }}
    >
      <Container maxWidth="lg">
        <Fade in={loadedData} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              mb: 4,
              borderRadius: 3,
              border: `1px solid ${alpha(themeColors.primary, 0.1)}`,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              overflow: "hidden",
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "start", md: "center" },
                mb: 4,
              }}
            >
              <Grow in={loadedData} timeout={800}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: { xs: 2, md: 0 },
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: alpha(themeColors.primary, 0.1),
                      p: 1.5,
                      borderRadius: 2,
                      mr: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SchoolIcon
                      sx={{ fontSize: 32, color: '#fc7a46' }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      component="h1"
                      fontWeight="600"
                      color="text.primary"
                    >
                      Class Performance Overview
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {selectedModule
                        ? `Viewing data for ${selectedModule}`
                        : "Select filters to view performance data"}
                    </Typography>
                  </Box>
                </Box>
              </Grow>

              {allFiltersSelected && (
                <Grow in={loadedData} timeout={1000}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={exportToPDF}
                    startIcon={<DownloadIcon />}
                    sx={{
                      px: 3,
                      py: 1.2,
                      borderRadius: 2,
                      backgroundColor: themeColors.primary,
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                      "&:hover": {
                        backgroundColor: alpha(themeColors.primary, 0.9),
                        boxShadow: "0 6px 16px rgba(37, 99, 235, 0.3)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Export PDF
                  </Button>
                </Grow>
              )}
            </Box>

            {/* Search & Filters Section */}
            <Grow in={loadedData} timeout={1200}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 3,
                  backgroundColor: alpha(themeColors.secondary, 0.03),
                  border: `1px solid ${alpha(themeColors.secondary, 0.1)}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <FilterListIcon
                    sx={{ mr: 1, color: themeColors.secondary }}
                  />
                  <Typography
                    variant="h6"
                    fontWeight="500"
                    color="text.primary"
                  >
                    Filters & Search
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Select College"
                      value={selectedCollege}
                      onChange={(e) => {
                        setSelectedCollege(e.target.value);
                        setSelectedModule("");
                        setSelectedPoc("");
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "white",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: alpha(themeColors.primary, 0.2),
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: themeColors.primary,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: themeColors.primary,
                          },
                        },
                      }}
                    >
                      <MenuItem value="">All Colleges</MenuItem>
                      {colleges.map((college, idx) => (
                        <MenuItem key={idx} value={college}>
                          {college}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  {selectedCollege && (
                    <>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          select
                          fullWidth
                          label="Select Module"
                          value={selectedModule}
                          onChange={(e) => {
                            setSelectedModule(e.target.value);
                            setSelectedPoc("");
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: "white",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: alpha(themeColors.primary, 0.2),
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: themeColors.primary,
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                              {
                                borderColor: themeColors.primary,
                              },
                            },
                          }}
                        >
                          <MenuItem value="">All Modules</MenuItem>
                          {modules.map((mod, idx) => (
                            <MenuItem key={idx} value={mod}>
                              {mod}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          select
                          fullWidth
                          label="Select POC"
                          value={selectedPoc}
                          onChange={(e) => {
                            const selectedName = e.target.value;
                            setSelectedPoc(selectedName);
                            const selected = pocs.find(
                              (poc) => poc.name === selectedName
                            );
                            if (selected) {
                              console.log(
                                "Selected module_poc_id:",
                                selected.id
                              );
                            }
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: "white",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: alpha(themeColors.primary, 0.2),
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: themeColors.primary,
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                              {
                                borderColor: themeColors.primary,
                              },
                            },
                          }}
                        >
                          <MenuItem value="">All POCs</MenuItem>
                          {pocs.map((poc, idx) => (
                            <MenuItem key={idx} value={poc.name}>
                              {poc.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </>
                  )}
                </Grid>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    sx={{
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      fontWeight: "600",
                      color: themeColors.secondary,
                      borderColor: themeColors.secondary,
                      textTransform: "none",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: alpha(themeColors.secondary, 0.1),
                        borderColor: themeColors.secondary,
                        transform: "translateY(-2px)",
                      },
                    }}
                    onClick={() => {
                      const matchedStudent = students.find(
                        (student) =>
                          student.module_name === selectedModule &&
                          student.module_poc_name === selectedPoc &&
                          (selectedCollege === "" ||
                            student.college_name === selectedCollege)
                      );
                      if (!matchedStudent) {
                        alert(
                          "No matching student data found for the selected filters."
                        );
                        return;
                      }
                      const { module_id, module_poc_id } = matchedStudent;
                      navigate(
                        `/attendance?module_id=${module_id}&module_poc_id=${module_poc_id}`
                      );
                    }}
                  >
                    View Attendance
                  </Button>
                </Box>
              </Paper>
            </Grow>

            {/* Conditionally render sections based on filter selection */}
            {allFiltersSelected ? (
              <>
                {/* Class Statistics Cards */}
                <Grow in={loadedData} timeout={1400}>
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <GroupIcon
                        sx={{ mr: 1, fontSize: 24, color: themeColors.primary }}
                      />
                      <Typography variant="h5" fontWeight="600">
                        {selectedModule
                          ? `${selectedModule} Statistics`
                          : "Class Statistics"}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatBox
                          title="Total Students"
                          value={classMetrics.totalStudents}
                          icon={
                            <GroupIcon sx={{ color: themeColors.primary }} />
                          }
                          color={themeColors.primary}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatBox
                          title="Average Score"
                          value={parseFloat(classMetrics.avgScore).toFixed(1)}
                          subtitle={`out of ${classMetrics.totalMarks
                              ? classMetrics.totalMarks.toFixed(0)
                              : 0
                            }`}
                          icon={
                            <TrendingUpIcon
                              sx={{ color: themeColors.secondary }}
                            />
                          }
                          color={themeColors.secondary}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatBox
                          title="Average Percentage"
                          value={`${parseFloat(
                            classMetrics.avgPercentage
                          ).toFixed(1)}%`}
                          icon={
                            <PieChartIcon sx={{ color: themeColors.success }} />
                          }
                          color={themeColors.success}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card
                          elevation={0}
                          sx={{
                            height: "100%",
                            background: themeColors.cardGradient,
                            borderRadius: 3,
                            border: `1px solid ${alpha(
                              themeColors.primary,
                              0.1
                            )}`,
                            transition:
                              "transform 0.3s ease, box-shadow 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-3px)",
                              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                            },
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 2,
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  color="text.secondary"
                                  fontWeight="medium"
                                >
                                  Class Performance
                                </Typography>
                                <Box
                                  sx={{
                                    backgroundColor: alpha(
                                      PERFORMANCE_COLORS[
                                      getPerformanceCategory(
                                        classMetrics.avgPercentage
                                      )
                                      ],
                                      0.1
                                    ),
                                    p: 0.8,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <EmojiEventsIcon
                                    sx={{
                                      color:
                                        PERFORMANCE_COLORS[
                                        getPerformanceCategory(
                                          classMetrics.avgPercentage
                                        )
                                        ],
                                    }}
                                  />
                                </Box>
                              </Box>
                              <Box
                                sx={{
                                  my: 2,
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <Chip
                                  label={getPerformanceCategory(
                                    classMetrics.avgPercentage
                                  )}
                                  sx={{
                                    fontWeight: "bold",
                                    fontSize: "1.2rem",
                                    py: 2,
                                    px: 2,
                                    backgroundColor:
                                      PERFORMANCE_COLORS[
                                      getPerformanceCategory(
                                        classMetrics.avgPercentage
                                      )
                                      ],
                                    color: "white",
                                    borderRadius: "12px",
                                    boxShadow: `0 3px 10px ${alpha(
                                      PERFORMANCE_COLORS[
                                      getPerformanceCategory(
                                        classMetrics.avgPercentage
                                      )
                                      ],
                                      0.4
                                    )}`,
                                  }}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Grow>

                {/* Performance Distribution Pie Chart */}
                <Grow in={loadedData} timeout={1600}>
                  <Card
                    elevation={0}
                    sx={{
                      mb: 4,
                      p: { xs: 2, md: 3 },
                      borderRadius: 3,
                      border: `1px solid ${alpha(themeColors.primary, 0.1)}`,
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Box
                          sx={{
                            bgcolor: alpha(themeColors.secondary, 0.1),
                            p: 1,
                            borderRadius: 1.5,
                            mr: 1.5,
                            display: "flex",
                          }}
                        >
                          <PieChartIcon
                            sx={{ fontSize: 22, color: themeColors.secondary }}
                          />
                        </Box>
                        <Typography variant="h5" fontWeight="600">
                          Performance Distribution
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Distribution of students across different performance
                        categories
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ height: 300, width: "100%" }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={performanceData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={100}
                                  dataKey="value"
                                  label={({ index }) =>
                                    `${performanceData[index].label}: ${performanceData[index].percentage}%`
                                  }
                                >
                                  {performanceData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.fill || "#8884d8"}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value, name) => {
                                    const dataItem = performanceData.find(
                                      (item) => item.name === name
                                    );
                                    return [
                                      `${value} students (${dataItem?.percentage}%)`,
                                      dataItem?.label,
                                    ];
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{
                              maxHeight: 350,
                              borderRadius: 2,
                              border: `1px solid ${alpha(
                                themeColors.primary,
                                0.1
                              )}`,
                            }}
                          >
                            <Table>
                              <TableHead>
                                <TableRow
                                  sx={{
                                    bgcolor: alpha(themeColors.primary, 0.03),
                                  }}
                                >
                                  <TableCell
                                    sx={{
                                      fontWeight: "600",
                                      color: "text.primary",
                                      fontSize: "0.9rem",
                                      borderBottom: `2px solid ${alpha(
                                        themeColors.primary,
                                        0.1
                                      )}`,
                                    }}
                                  >
                                    Performance Category
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{
                                      fontWeight: "600",
                                      color: "text.primary",
                                      fontSize: "0.9rem",
                                      borderBottom: `2px solid ${alpha(
                                        themeColors.primary,
                                        0.1
                                      )}`,
                                    }}
                                  >
                                    Number of Students
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{
                                      fontWeight: "600",
                                      color: "text.primary",
                                      fontSize: "0.9rem",
                                      borderBottom: `2px solid ${alpha(
                                        themeColors.primary,
                                        0.1
                                      )}`,
                                    }}
                                  >
                                    Percentage
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {performanceData.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={3} align="center">
                                      No data available
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  performanceData.map((row) => (
                                    <TableRow
                                      key={row.name}
                                      sx={{
                                        transition:
                                          "background-color 0.2s ease",
                                        "&:hover": {
                                          bgcolor: alpha(
                                            themeColors.primary,
                                            0.03
                                          ),
                                        },
                                      }}
                                    >
                                      <TableCell>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              width: 12,
                                              height: 12,
                                              borderRadius: "50%",
                                              bgcolor: row.fill,
                                              mr: 1.5,
                                            }}
                                          />
                                          {row.name}
                                        </Box>
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        sx={{ fontWeight: "medium" }}
                                      >
                                        {row.count}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        sx={{ fontWeight: "medium" }}
                                      >
                                        {row.percentage}%
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grow>

                {/* Student Rankings */}
                <Grow in={loadedData} timeout={1800}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: 3,
                      border: `1px solid ${alpha(themeColors.primary, 0.1)}`,
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Box
                          sx={{
                            bgcolor: alpha(themeColors.primary, 0.1),
                            p: 1,
                            borderRadius: 1.5,
                            mr: 1.5,
                            display: "flex",
                          }}
                        >
                          <GroupIcon
                            sx={{ fontSize: 22, color: themeColors.primary }}
                          />
                        </Box>
                        <Typography variant="h5" fontWeight="600">
                          Student Rankings
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Individual student performance ranked by aggregated
                        total score
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                          maxHeight: 500,
                          overflowY: "auto",
                          bgcolor: "background.paper",
                          borderRadius: 2,
                          border: `1px solid ${alpha(
                            themeColors.primary,
                            0.1
                          )}`,
                        }}
                      >
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow
                              sx={{ bgcolor: alpha(themeColors.primary, 0.03) }}
                            >
                              <TableCell
                                sx={{
                                  fontWeight: "600",
                                  fontSize: "0.9rem",
                                  borderBottom: `2px solid ${alpha(
                                    themeColors.primary,
                                    0.1
                                  )}`,
                                }}
                              >
                                Rank
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: "600",
                                  fontSize: "0.9rem",
                                  borderBottom: `2px solid ${alpha(
                                    themeColors.primary,
                                    0.1
                                  )}`,
                                }}
                              >
                                Name
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: "600",
                                  fontSize: "0.9rem",
                                  borderBottom: `2px solid ${alpha(
                                    themeColors.primary,
                                    0.1
                                  )}`,
                                }}
                              >
                                Aggregate Score
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: "600",
                                  fontSize: "0.9rem",
                                  borderBottom: `2px solid ${alpha(
                                    themeColors.primary,
                                    0.1
                                  )}`,
                                }}
                              >
                                Total Score
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: "600",
                                  fontSize: "0.9rem",
                                  borderBottom: `2px solid ${alpha(
                                    themeColors.primary,
                                    0.1
                                  )}`,
                                }}
                              >
                                Percentage
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: "600",
                                  fontSize: "0.9rem",
                                  borderBottom: `2px solid ${alpha(
                                    themeColors.primary,
                                    0.1
                                  )}`,
                                }}
                              >
                                Performance
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: "600",
                                  fontSize: "0.9rem",
                                  borderBottom: `2px solid ${alpha(
                                    themeColors.primary,
                                    0.1
                                  )}`,
                                }}
                              >
                                Module
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredStudents.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  align="center"
                                  sx={{ py: 4 }}
                                >
                                  <Typography
                                    variant="body1"
                                    color="text.secondary"
                                  >
                                    No student data available with current
                                    filters
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              [...filteredStudents]
                                .map((student) => {
                                  const { score, maxScore, aggregateScore } =
                                    getAggregateScore(student);
                                  const percentage =
                                    maxScore > 0 ? (score / maxScore) * 100 : 0;
                                  const performance =
                                    getPerformanceCategory(percentage);
                                  return {
                                    ...student,
                                    score,
                                    maxScore,
                                    aggregateScore,
                                    percentage,
                                    performance,
                                  };
                                })
                                .sort((a, b) => b.score - a.score)
                                .map((student, index) => (
                                  <TableRow
                                    key={student.studentId || index}
                                    sx={{
                                      position: "relative",
                                      transition: "all 0.2s ease",
                                      "&:hover": {
                                        bgcolor: alpha(
                                          themeColors.primary,
                                          0.03
                                        ),
                                        "& .MuiTableCell-root": {
                                          color: themeColors.primary,
                                        },
                                      },
                                      ...(index < 3 && {
                                        bgcolor: alpha(
                                          index === 0
                                            ? "#f59e0b"
                                            : index === 1
                                              ? "#94a3b8"
                                              : "#d97706",
                                          0.08
                                        ),
                                      }),
                                    }}
                                  >
                                    <TableCell>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          width: 28,
                                          height: 28,
                                          borderRadius: "50%",
                                          fontWeight: "bold",
                                          bgcolor:
                                            index < 3
                                              ? index === 0
                                                ? alpha("#f59e0b", 0.2)
                                                : index === 1
                                                  ? alpha("#94a3b8", 0.2)
                                                  : alpha("#d97706", 0.2)
                                              : "transparent",
                                          color:
                                            index < 3
                                              ? index === 0
                                                ? "#f59e0b"
                                                : index === 1
                                                  ? "#64748b"
                                                  : "#d97706"
                                              : "text.primary",
                                        }}
                                      >
                                        {index + 1}
                                      </Box>
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        color: themeColors.primary,
                                        fontWeight: "500",
                                        cursor: "pointer",
                                        transition: "color 0.2s ease",
                                        "&:hover": {
                                          color: themeColors.secondary,
                                          textDecoration: "underline",
                                        },
                                      }}
                                      onClick={() =>
                                        navigate(
                                          `/student/${student.report_id}`
                                        )
                                      }
                                    >
                                      {student.user_name}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography fontWeight="medium">
                                        {student.aggregateScore} /{" "}
                                        {student.details?.aggregate_score}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography fontWeight="medium">
                                        {student.score} / {student.maxScore}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography fontWeight="medium">
                                        {student.percentage.toFixed(1)}%
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <PerformanceBadge
                                        label={student.performance}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography fontWeight="medium" noWrap>
                                        {student.module_name}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        p: 2,
                        borderTop: `1px solid ${alpha(
                          themeColors.primary,
                          0.1
                        )}`,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          const selectedPocData = pocs.find(
                            (poc) => poc.name === selectedPoc
                          );
                          const pocId = selectedPocData
                            ? selectedPocData.id
                            : null;
                          if (pocId) {
                            sendStudentRankingsHandler(pocId);
                          } else {
                            alert("Please select a POC first");
                          }
                        }}
                      >
                        Send Student Rankings
                      </Button>
                    </Box>
                  </Card>
                </Grow>

                {/* Daily Performance Charts */}
                <Grow in={loadedData} timeout={2000}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 2, md: 3 },
                      mt: 4,
                      borderRadius: 3,
                      border: `1px solid ${alpha(themeColors.primary, 0.1)}`,
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <CardContent id="daily-performance-charts">
                      <DailyPerformanceCharts
                        filteredStudents={filteredStudents}
                        selectedCollege={selectedCollege}
                        selectedModule={selectedModule}
                        selectedPoc={selectedPoc}
                      />
                    </CardContent>
                  </Card>
                </Grow>

                {/* Daily Performance Breakdown */}
                <Grow in={loadedData} timeout={2200}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 2, md: 3 },
                      mt: 4,
                      borderRadius: 3,
                      border: `1px solid ${alpha(themeColors.primary, 0.1)}`,
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Box
                          sx={{
                            bgcolor: alpha(themeColors.secondary, 0.1),
                            p: 1,
                            borderRadius: 1.5,
                            mr: 1.5,
                            display: "flex",
                          }}
                        >
                          <BarChartIcon
                            sx={{ fontSize: 22, color: themeColors.secondary }}
                          />
                        </Box>
                        <Typography variant="h5" fontWeight="600">
                          Daily Performance Breakdown
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Detailed performance metrics for each test day
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mb: 3,
                        }}
                      >
                        <Button
                          variant="contained"
                          startIcon={<PictureAsPdfIcon />}
                          onClick={async () => {
                            const pdfBlob = generateDailyPerformancePDF();
                            const url = URL.createObjectURL(pdfBlob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = `Daily_Performance_Breakdown_${selectedModule || "all_modules"
                              }_${new Date().toISOString().split("T")[0]}.pdf`;
                            link.click();
                            URL.revokeObjectURL(url);
                          }}
                          sx={{
                            bgcolor: themeColors.primary,
                            "&:hover": { bgcolor: themeColors.primaryLight },
                            borderRadius: 2,
                            boxShadow: "0 4px 6px rgba(37, 99, 235, 0.1)",
                          }}
                        >
                          Export to PDF
                        </Button>
                      </Box>
                      {/* // Continuation from the truncated code in the Daily
                      Performance Breakdown section */}
                      {filteredStudents.length === 0 ? (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          <Typography variant="body2">
                            No student data available for the selected filters.
                          </Typography>
                        </Alert>
                      ) : (
                        <>
                          {[
                            ...new Set(
                              filteredStudents.flatMap((student) =>
                                student.tests.map((test) => test.date)
                              )
                            ),
                          ]
                            .sort()
                            .map((date, dateIndex) => (
                              <Box key={date} sx={{ mb: 4 }}>
                                <Typography
                                  variant="h6"
                                  fontWeight="500"
                                  sx={{ color: themeColors.primary, mb: 2 }}
                                >
                                  Day {dateIndex + 1} - {date}
                                </Typography>
                                <TableContainer
                                  component={Paper}
                                  elevation={0}
                                  sx={{
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(
                                      themeColors.primary,
                                      0.1
                                    )}`,
                                  }}
                                >
                                  <Table>
                                    <TableHead>
                                      <TableRow
                                        sx={{
                                          bgcolor: alpha(
                                            themeColors.primary,
                                            0.03
                                          ),
                                        }}
                                      >
                                        <TableCell
                                          sx={{
                                            fontWeight: "600",
                                            fontSize: "0.9rem",
                                            borderBottom: `2px solid ${alpha(
                                              themeColors.primary,
                                              0.1
                                            )}`,
                                          }}
                                        >
                                          Student Name
                                        </TableCell>
                                        <TableCell
                                          align="center"
                                          sx={{
                                            fontWeight: "600",
                                            fontSize: "0.9rem",
                                            borderBottom: `2px solid ${alpha(
                                              themeColors.primary,
                                              0.1
                                            )}`,
                                          }}
                                        >
                                          Total Score
                                        </TableCell>
                                        <TableCell
                                          align="center"
                                          sx={{
                                            fontWeight: "600",
                                            fontSize: "0.9rem",
                                            borderBottom: `2px solid ${alpha(
                                              themeColors.primary,
                                              0.1
                                            )}`,
                                          }}
                                        >
                                          Percentage
                                        </TableCell>
                                        <TableCell
                                          align="center"
                                          sx={{
                                            fontWeight: "600",
                                            fontSize: "0.9rem",
                                            borderBottom: `2px solid ${alpha(
                                              themeColors.primary,
                                              0.1
                                            )}`,
                                          }}
                                        >
                                          Performance
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {filteredStudents
                                        .map((student) => {
                                          const test = student.tests.find(
                                            (t) => t.date === date
                                          );
                                          if (!test) {
                                            return {
                                              ...student,
                                              score: 0,
                                              maxScore: 0,
                                              percentage: 0,
                                              performance: "Not Attended",
                                            };
                                          }
                                          const percentage =
                                            test.total_mark > 0
                                              ? (test.scored_mark /
                                                test.total_mark) *
                                              100
                                              : 0;
                                          const performance =
                                            getPerformanceCategory(percentage);
                                          return {
                                            ...student,
                                            score: test.scored_mark,
                                            maxScore: test.total_mark,
                                            percentage,
                                            performance,
                                          };
                                        })
                                        .sort((a, b) => b.score - a.score)
                                        .map((student, index) => (
                                          <TableRow
                                            key={`${student.studentId}-${date}-${index}`}
                                            sx={{
                                              transition:
                                                "background-color 0.2s ease",
                                              "&:hover": {
                                                bgcolor: alpha(
                                                  themeColors.primary,
                                                  0.03
                                                ),
                                              },
                                            }}
                                          >
                                            <TableCell>
                                              <Typography
                                                sx={{
                                                  color: themeColors.primary,
                                                  fontWeight: "500",
                                                  cursor: "pointer",
                                                  "&:hover": {
                                                    color:
                                                      themeColors.secondary,
                                                    textDecoration: "underline",
                                                  },
                                                }}
                                                onClick={() =>
                                                  navigate(
                                                    `/student/${student.report_id}`
                                                  )
                                                }
                                              >
                                                {student.user_name}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                              <Typography fontWeight="medium">
                                                {student.score} /{" "}
                                                {student.maxScore}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                              <Typography fontWeight="medium">
                                                {student.percentage.toFixed(1)}%
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                              <PerformanceBadge
                                                label={student.performance}
                                              />
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Box>
                            ))}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grow>
              </>
            ) : (
              <Grow in={loadedData} timeout={1400}>
                <Alert
                  severity="info"
                  variant="filled"
                  sx={{
                    mt: 4,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)', // custom background
                    color: 'white', // makes text readable
                    boxShadow: '0 4px 12px rgba(12, 131, 200, 0.3)', // subtle blue shadow
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="medium">
                    Please select all filters
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Select a college, module, and POC to view detailed performance data.
                  </Typography>
                </Alert>
              </Grow>

            )}
          </Paper>
        </Fade>
      </Container>
    </Box>
   </>
  );
};

export default ClassPerformance;
