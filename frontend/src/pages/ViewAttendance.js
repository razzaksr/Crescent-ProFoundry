import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Container, Typography, Paper, Box, Grid, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Card, CardContent, CircularProgress, 
  Chip, IconButton, Tabs, Tab, Divider, Alert, Tooltip, Button
} from "@mui/material";
import {
  CalendarMonth, Person, School, Refresh, PictureAsPdf, FileDownload,
  PeopleAlt, CheckCircle, Cancel, TrendingUp
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip as ChartTooltip, Legend, Filler
} from "chart.js";
import html2canvas from 'html2canvas';
import { useLocation } from "react-router-dom";
import jsPDF from 'jspdf';
import { fetchAttendanceData } from "../axios"; // Import the API function
import Admin_Dash from "../components/AdminDash";

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, ChartTooltip, Legend, Filler
);

// Custom theme with updated color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: "#3D8D7A", // New teal color
      light: "#65B2A1",
      dark: "#2D6A5B",
    },
    secondary: {
      main: "#FE4F2D", // New coral color
      light: "#FF7A60",
      dark: "#D63920",
    },
    background: {
      default: "#F7F9F9", // Light teal-tinted gray
      paper: "#FFFFFF",
    },
    success: {
      main: "#3D8D7A", // Teal
    },
    error: {
      main: "#FE4F2D", // Coral
    },
    warning: {
      main: "#FFB649", // Amber
    },
    info: {
      main: "#5C9EAD", // Light blue
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Comprehensive function to export dashboard components as a professional PDF (without Doughnut chart)
const exportCompleteDashboardToPDF = async (lineChartRef, tableRef, attendanceData, stats) => {
  if (!lineChartRef.current) {
    console.error("Line chart ref is missing");
    alert("Cannot generate PDF: Line chart is not rendered.");
    return;
  }
  if (!tableRef.current) {
    console.error("Table ref is missing");
    alert("Cannot generate PDF: Table is not rendered.");
    return;
  }
  if (!attendanceData || attendanceData.length === 0) {
    console.error("No attendance data available");
    alert("Cannot generate PDF: No attendance data available.");
    return;
  }
  
  // Create new jsPDF document in portrait orientation (A4)
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);
  
  try {
    // Add header
    pdf.setFillColor(61, 141, 122); // Teal header
    pdf.rect(0, 0, pageWidth, 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Attendance Analytics Dashboard", margin, 13);
    
    // Add generation info
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 50, 13);
    
    // Add summary section
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Summary Statistics", margin, 25);
    
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, 27, pageWidth - margin, 27);
    
    // Create summary table
    pdf.setFontSize(10);
    const summaryY = 32;
    const colWidth = contentWidth / 4;
    
    // Summary headers
    pdf.setFont("helvetica", "bold");
    pdf.text("Total Sessions", margin, summaryY);
    pdf.text("Avg. Attendance", margin + colWidth, summaryY);
    pdf.text("Latest Attendance", margin + colWidth * 2, summaryY);
    pdf.text("Trend", margin + colWidth * 3, summaryY);
    
    // Summary values
    pdf.setFont("helvetica", "normal");
    pdf.text(`${stats.totalSessions}`, margin, summaryY + 6);
    pdf.text(`${stats.averageAttendance}%`, margin + colWidth, summaryY + 6);
    pdf.text(`${stats.latestAttendance}%`, margin + colWidth * 2, summaryY + 6);
    pdf.text(`${stats.trend === "up" ? "Improving" : stats.trend === "down" ? "Declining" : "Stable"}`, 
      margin + colWidth * 3, summaryY + 6);
    
    // Add line chart
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Attendance Trends", margin, 45);
    pdf.setFont("helvetica", "normal");
    
    // Convert line chart to high-resolution image
    const lineChartCanvas = await html2canvas(lineChartRef.current, {
      scale: 3, // Increase resolution for sharper image
      useCORS: true,
      backgroundColor: '#FFFFFF',
    });
    const lineChartImg = lineChartCanvas.toDataURL('image/png', 1.0); // High-quality PNG
    pdf.addImage(lineChartImg, 'PNG', margin, 50, contentWidth, 60);
    
    // Add border around chart for professional look
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, 50, contentWidth, 60);
    
    // Add attendance table
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Attendance Records", margin, 120);
    pdf.setFont("helvetica", "normal");
    
    // Add table headers
    const tableY = 125;
    const tableColWidth = contentWidth / 6;
    
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, tableY, contentWidth, 7, 'F');
    
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.text("Date", margin + 3, tableY + 5);
    pdf.text("Total", margin + tableColWidth + 3, tableY + 5);
    pdf.text("Present", margin + tableColWidth * 2 + 3, tableY + 5);
    pdf.text("Absent", margin + tableColWidth * 3 + 3, tableY + 5);
    pdf.text("Rate", margin + tableColWidth * 4 + 3, tableY + 5);
    pdf.text("Status", margin + tableColWidth * 5 + 3, tableY + 5);
    
    // Add table data
    pdf.setFont("helvetica", "normal");
    let rowY = tableY + 7;
    
    // Show only the last 8 records to fit on the page
    const displayRecords = attendanceData.slice(0, 8);
    
    displayRecords.forEach((record, index) => {
      const isEven = index % 2 === 0;
      if (isEven) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, rowY, contentWidth, 7, 'F');
      }
      
      const attendanceRate = (record.present_count / record.total_students) * 100;
      const formattedDate = new Date(record.date).toLocaleDateString();
      
      pdf.text(formattedDate, margin + 3, rowY + 5);
      pdf.text(record.total_students.toString(), margin + tableColWidth + 3, rowY + 5);
      pdf.text(record.present_count.toString(), margin + tableColWidth * 2 + 3, rowY + 5);
      pdf.text((record.total_students - record.present_count).toString(), margin + tableColWidth * 3 + 3, rowY + 5);
      pdf.text(`${attendanceRate.toFixed(1)}%`, margin + tableColWidth * 4 + 3, rowY + 5);
      
      let status = attendanceRate >= 80 ? "Good" : attendanceRate >= 60 ? "Average" : "Poor";
      pdf.text(status, margin + tableColWidth * 5 + 3, rowY + 5);
      
      rowY += 7;
    });
    
    // Add border around table
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, tableY, contentWidth, rowY - tableY);
    
    // Add footer
    const footerY = pageHeight - 10;
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont("helvetica", "normal");
    pdf.text("© Attendance Management System", margin, footerY);
    pdf.text("Page 1 of 1", pageWidth - margin - 20, footerY);
    
    // Save the PDF
    pdf.save('attendance_analytics_report.pdf');
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};

const AttendanceStatCard = ({ title, value, icon, color }) => {
  return (
    <Card sx={{ 
      height: "100%", 
      boxShadow: "0px 4px 12px rgba(0,0,0,0.03)",
      transition: "transform 0.3s, box-shadow 0.3s",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0px 6px 15px rgba(0,0,0,0.08)",
      }
    }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box sx={{ 
            backgroundColor: `${color}15`, 
            borderRadius: "50%", 
            p: 1, 
            mr: 2 
          }}>
            {icon}
          </Box>
          <Typography color="textSecondary" variant="subtitle1">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

function AttendanceCharts({ attendanceData, lineChartRef, doughnutChartRef }) {
  if (!attendanceData || attendanceData.length === 0) {
    return null;
  }

  // Prepare data for line chart
  const dates = attendanceData.map(entry => new Date(entry.date).toLocaleDateString());
  const presentCounts = attendanceData.map(entry => entry.present_count);
  const totalCounts = attendanceData.map(entry => entry.total_students);
  const absentCounts = attendanceData.map(entry => entry.total_students - entry.present_count);
  
  // Calculate average attendance rate
  const attendanceRates = attendanceData.map(entry => 
    (entry.present_count / entry.total_students) * 100
  );
  const avgAttendanceRate = attendanceRates.reduce((sum, rate) => sum + rate, 0) / attendanceRates.length;
  
  // Last five dates for doughnut chart
  const lastFiveDates = [...dates].slice(-5);
  const lastFivePresentCounts = [...presentCounts].slice(-5);
  const lastFiveAbsentCounts = [...absentCounts].slice(-5);

  // Enhanced Line chart data with new color scheme
  const lineChartData = {
    labels: dates,
    datasets: [
      {
        label: "Present",
        data: presentCounts,
        borderColor: "#3D8D7A", // Teal
        backgroundColor: "rgba(61, 141, 122, 0.08)",
        borderWidth: 2.5,
        fill: true,
        tension: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#FFFFFF",
        pointBorderColor: "#3D8D7A",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "#3D8D7A",
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: "#ffffff",
      },
      {
        label: "Absent",
        data: absentCounts,
        borderColor: "#FE4F2D", // Coral
        backgroundColor: "rgba(254, 79, 45, 0.08)",
        borderWidth: 2.5,
        fill: true,
        tension: 0,
        pointRadius: 4,
        pointBackgroundColor: "#FFFFFF",
        pointBorderColor: "#FE4F2D",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "#FE4F2D",
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: "#ffffff",
      }
    ]
  };

  // Updated doughnut chart data with more vibrant colors
  const doughnutChartData = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [
          lastFivePresentCounts.reduce((sum, count) => sum + count, 0),
          lastFiveAbsentCounts.reduce((sum, count) => sum + count, 0)
        ],
        backgroundColor: [
          "rgba(61, 141, 122, 0.9)", // Teal for present
          "rgba(254, 79, 45, 0.9)"   // Coral for absent
        ],
        borderColor: ["#3D8D7A", "#FE4F2D"],
        borderWidth: 2,
        hoverOffset: 15,
        borderRadius: 4,
        spacing: 5,
      }
    ]
  };

  return (
    <Box sx={{ mb: 6 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card 
            sx={{ 
              p: 2, 
              mb: 3, 
              position: 'relative',
              overflow: 'visible',
              backgroundColor: '#FFFFFF', // Clean white background for PDF capture
              boxShadow: 'none', // Remove shadow for cleaner PDF
              border: '1px solid rgba(0, 0, 0, 0.1)', // Subtle border
            }}
            ref={lineChartRef}
          >
            <Box sx={{ p: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" fontWeight="medium">
                <TrendingUp sx={{ verticalAlign: "middle", mr: 1, color: "#3D8D7A" }} />
                Attendance Trends
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box 
              sx={{ 
                height: 350, 
                p: 2, 
                backgroundColor: '#FFFFFF', // Clean background for PDF
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              <Line 
                data={lineChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 20,
                        font: {
                          family: '"Poppins", sans-serif',
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      usePointStyle: true,
                      bodyFont: {
                        family: '"Poppins", sans-serif',
                      },
                      titleFont: {
                        family: '"Poppins", sans-serif',
                        weight: 'bold'
                      },
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          if (context.parsed.y !== null) {
                            label += context.parsed.y;
                          }
                          return label + ' students';
                        }
                      }
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false,
                      },
                      ticks: {
                        font: {
                          family: '"Poppins", sans-serif',
                          weight: 'medium',
                        },
                        padding: 10,
                        color: '#555555'
                      },
                      border: {
                        dash: [4, 4],
                      }
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        font: {
                          family: '"Poppins", sans-serif',
                          weight: 'medium',
                        },
                        maxRotation: 0,
                        minRotation: 0,
                        color: '#555555',
                        padding: 10,
                      }
                    },
                  },
                  elements: {
                    line: {
                      tension: 0,
                      borderWidth: 3,
                      borderJoinStyle: 'miter',
                    },
                    point: {
                      radius: 4,
                      borderWidth: 2,
                      backgroundColor: '#FFFFFF',
                      hoverRadius: 6,
                      hoverBorderWidth: 2,
                    }
                  }
                }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              p: 2, 
              height: "90%", 
              background: "linear-gradient(145deg, #ffffff, #f9fafb)",
              position: 'relative',
              overflow: 'visible',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -3,
                right: 20,
                left: 20,
                height: 6,
                background: 'linear-gradient(90deg, #FE4F2D, #FF7A60)',
                borderRadius: '8px 8px 0 0',
              }
            }}
            ref={doughnutChartRef}
           >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" fontWeight="medium">
                <PeopleAlt sx={{ verticalAlign: "middle", mr: 1, color: "#FE4F2D" }} />
                Last 5 Days Summary
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box 
              sx={{ 
                height: 300,
                display: "flex", 
                justifyContent: "center",
                alignItems: "center",
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.95))',
                borderRadius: 2,
                boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.03)',
                p: 2,
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "70%",
                  height: "70%",
                  borderRadius: "50%",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)",
                  pointerEvents: "none"
                }
              }}
            >
              <div style={{marginTop:"80px", position: "relative", width: "100%", height: "100%" }}>
                <Doughnut 
                  data={doughnutChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: {
                            family: '"Poppins", sans-serif',
                            size: 12
                          }
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        bodyFont: {
                          family: '"Poppins", sans-serif',
                        },
                        titleFont: {
                          family: '"Poppins", sans-serif',
                          weight: 'bold'
                        },
                        callbacks: {
                          label: function(context) {
                            const value = context.raw;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    },
                    animation: {
                      animateScale: true,
                      animateRotate: true
                    }
                  }}
                />
                {/* Average attendance rate displayed in center of doughnut chart */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "45%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #3D8D7A, #5C9EAD)",
                    borderRadius: "50%",
                    width: "110px",
                    height: "110px",
                    boxShadow: "0 4px 12px rgba(61, 141, 122, 0.3)",
                    border: "4px solid white",
                    zIndex: 10
                  }}
                >
                  <Typography variant="h5" color="white" fontWeight="bold">
                    {avgAttendanceRate.toFixed(1)}%
                  </Typography>
                </Box>
              </div>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function AttendanceTable({ attendanceData, tableRef }) {
  if (!attendanceData || attendanceData.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No attendance records found for the selected module and class.
      </Alert>
    );
  }

  return (
    <Card 
      sx={{ 
        mb: 4,
        position: 'relative',
        overflow: 'visible',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -3,
          left: 20,
          right: 20,
          height: 6,
          background: 'linear-gradient(90deg, #3D8D7A, #5C9EAD)',
          borderRadius: '8px 8px 0 0',
        }
      }}
      ref={tableRef}
    >
      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight="medium">
          <CalendarMonth sx={{ verticalAlign: "middle", mr: 1, color: "#3D8D7A" }} />
          Attendance Records
        </Typography>
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton 
              size="small"
              sx={{ 
                bgcolor: 'rgba(254, 79, 45, 0.1)',
                '&:hover': { bgcolor: 'rgba(254, 79, 45, 0.2)' } 
              }}
            >
              <Refresh sx={{ color: "#FE4F2D" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ 
                background: "linear-gradient(90deg, rgba(61, 141, 122, 0.08), rgba(92, 158, 173, 0.08))" 
              }}>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Total Students</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Present</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Absent</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Rate</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.map((record, index) => {
                const attendanceRate = (record.present_count / record.total_students) * 100;
                const formattedDate = new Date(record.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                });
                
                return (
                  <TableRow 
                    key={index} 
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'rgba(61, 141, 122, 0.04)' },
                      transition: 'background-color 0.2s',
                      borderLeft: index % 2 === 0 ? '3px solid rgba(61, 141, 122, 0.5)' : 'none'
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarMonth 
                          fontSize="small" 
                          sx={{ mr: 1, color: 'rgba(61, 141, 122, 0.7)', fontSize: '1rem' }} 
                        />
                        {formattedDate}
                      </Box>
                    </TableCell>
                    <TableCell align="center">{record.total_students}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        bgcolor: 'rgba(61, 141, 122, 0.1)',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1
                      }}>
                        {record.present_count}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        bgcolor: 'rgba(254, 79, 45, 0.1)',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1
                      }}>
                        {record.total_students - record.present_count}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="body2" 
                        fontWeight="medium"
                        color={
                          attendanceRate < 60 ? "#FE4F2D" : 
                          attendanceRate < 80 ? "#FFB649" : 
                          "#3D8D7A"
                        }
                        sx={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '3.5rem',
                          height: '1.5rem',
                          borderRadius: '1rem',
                          bgcolor: 
                            attendanceRate < 60 ? "rgba(254, 79, 45, 0.15)" : 
                            attendanceRate < 80 ? "rgba(255, 182, 73, 0.15)" : 
                            "rgba(61, 141, 122, 0.15)",
                        }}
                      >
                        {attendanceRate.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small"
                        icon={
                          attendanceRate >= 80 ? <CheckCircle fontSize="small" /> : 
                          <Cancel fontSize="small" />
                        }
                        label={
                          attendanceRate >= 80 ? "Good" : 
                          attendanceRate >= 60 ? "Average" : 
                          "Poor"
                        }
                        color={
                          attendanceRate >= 80 ? "success" : 
                          attendanceRate >= 60 ? "warning" : 
                          "error"
                        }
                        sx={{ 
                          fontWeight: 500,
                          '& .MuiChip-icon': { fontSize: '0.8rem' },
                          bgcolor: 
                            attendanceRate >= 80 ? "rgba(61, 141, 122, 0.9)" : 
                            attendanceRate >= 60 ? "rgba(255, 182, 73, 0.9)" : 
                            "rgba(254, 79, 45, 0.9)",
                          color: '#FFFFFF',
                          borderRadius: '12px',
                          padding: '2px 4px'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
}

const AttendanceAnalytics = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const lineChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const tableRef = useRef(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const module_id = queryParams.get("module_id");
  const module_poc_id = queryParams.get("module_poc_id");

  useEffect(() => {
    if (module_id && module_poc_id) {
      fetchAttendance();
    }
  }, [module_id, module_poc_id]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
  
      console.log("Fetching attendance data with:");
      console.log("module_id:", module_id);
      console.log("module_poc_id:", module_poc_id);
  
      const response = await fetchAttendanceData(module_id, module_poc_id);
  
      console.log("API Response:", response);
  
      const attendanceDocs = response?.data;
  
      if (Array.isArray(attendanceDocs) && attendanceDocs.length > 0) {
        const dailyRecords = attendanceDocs[0].daily_attendance;
  
        if (Array.isArray(dailyRecords) && dailyRecords.length > 0) {
          const sortedAttendance = [...dailyRecords].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
  
          const processedData = sortedAttendance.map((item) => ({
            date: item.date,
            present_count: parseInt(item.present_count),
            total_students: parseInt(item.total_students),
          }));
  
          console.log("Processed Attendance Data:", processedData);
          setAttendanceData(processedData);
        } else {
          console.warn("No daily attendance records found.");
          setAttendanceData([]);
        }
      } else {
        console.warn("No attendance documents found.");
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError("Failed to load attendance data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!module_id || !module_poc_id) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Missing module_id or module_poc_id in the URL.
      </Alert>
    );
  }

  const stats = {
    totalSessions: attendanceData.length,
    averageAttendance: attendanceData.length ?
      (attendanceData.reduce((sum, record) => sum + record.present_count, 0) /
        attendanceData.reduce((sum, record) => sum + record.total_students, 0) * 100).toFixed(1) : 0,
    latestAttendance: attendanceData.length ?
      (attendanceData[0].present_count / attendanceData[0].total_students * 100).toFixed(1) : 0,
    trend: attendanceData.length > 1 ?
      (attendanceData[0].present_count / attendanceData[0].total_students) >
        (attendanceData[1].present_count / attendanceData[1].total_students)
        ? "up" : "down" : "stable"
  };

  const handleExportPDF = () => {
    exportCompleteDashboardToPDF(lineChartRef, tableRef, attendanceData, stats);
  };

  return (
  <>
  <Admin_Dash/>
  <ThemeProvider theme={theme}>
      <Box sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        pt: 3,
        pb: 6
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Container maxWidth="lg">
            <Paper elevation={0} sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: "linear-gradient(to right bottom, #FFFFFF, #F8FAFC)"
            }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                    borderRadius: "50%",
                    p: 1.5,
                    mr: 2
                  }}>
                    <School fontSize="large" sx={{ color: "primary.main" }} />
                  </Box>
                  <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
                    Attendance Analytics Dashboard
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdf />}
                  onClick={handleExportPDF}
                  sx={{
                    bgcolor: '#3D8D7A',
                    '&:hover': { bgcolor: '#2D6A5B' }
                  }}
                >
                  Export Dashboard PDF
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
                  <CircularProgress color="primary" />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ my: 2 }}>
                  {error}
                </Alert>
              ) : (
                <>
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <AttendanceStatCard
                        title="Sessions"
                        value={stats.totalSessions}
                        icon={<CalendarMonth sx={{ color: theme.palette.primary.main }} />}
                        color={theme.palette.primary.main}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <AttendanceStatCard
                        title="Average Attendance"
                        value={`${stats.averageAttendance}%`}
                        icon={<Person sx={{ color: theme.palette.info.main }} />}
                        color={theme.palette.info.main}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <AttendanceStatCard
                        title="Latest Attendance"
                        value={`${stats.latestAttendance}%`}
                        icon={<CheckCircle sx={{ color: theme.palette.success.main }} />}
                        color={theme.palette.success.main}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <AttendanceStatCard
                        title="Trend"
                        value={stats.trend === "up" ? "Improving" : stats.trend === "down" ? "Declining" : "Stable"}
                        icon={<TrendingUp sx={{ color: theme.palette.secondary.main }} />}
                        color={theme.palette.secondary.main}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 4 }}>
                    <Tabs
                      value={activeTab}
                      onChange={(e, newValue) => setActiveTab(newValue)}
                      textColor="primary"
                      indicatorColor="primary"
                      sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                          minWidth: 120,
                          fontWeight: 500,
                          transition: 'all 0.2s',
                          '&.Mui-selected': {
                            fontWeight: 600
                          }
                        }
                      }}
                    >
                      <Tab label="Charts" />
                      <Tab label="Data Table" />
                    </Tabs>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
                      <AttendanceCharts 
                        attendanceData={attendanceData} 
                        lineChartRef={lineChartRef}
                        doughnutChartRef={doughnutChartRef}
                      />
                    </Box>
                    <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
                      <AttendanceTable 
                        attendanceData={attendanceData} 
                        tableRef={tableRef}
                      />
                    </Box>
                  </Box>
                </>
              )}
            </Paper>
          </Container>
        </motion.div>
      </Box>
    </ThemeProvider>
    </>
    
  );
};

export default AttendanceAnalytics;