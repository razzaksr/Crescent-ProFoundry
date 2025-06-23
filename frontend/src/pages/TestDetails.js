import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Divider,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Paper,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import {
  Language as LanguageIcon,
  EmojiEvents as ScoreIcon,
  ArrowForward as ArrowIcon,
  ArrowBack as ArrowBackIcon,
  Quiz as QuizIcon,
  Code as CodeIcon,
  CheckCircleOutline as CheckIcon,
  LockClock as LockIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { getTestById } from "../axios"; // Import from apiService

// Create a custom theme with improved typography
const theme = createTheme({
  typography: {
    fontFamily: ["Inter", "Roboto", '"Segoe UI"', "Arial", "sans-serif"].join(","),
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.02em",
      textTransform: "none",
    },
    subtitle1: {
      fontWeight: 500,
    },
    body1: {
      lineHeight: 1.6,
    },
  },
  palette: {
    primary: {
      main: "#0c83c8",
      light: "#3a9bd7",
      dark: "#096ba3",
    },
    secondary: {
      main: "#fc7a46",
      light: "#fd9469",
      dark: "#e56a3a",
    },
    background: {
      default: "#f5f7fa",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
          boxShadow: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
          borderRadius: 8,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          "& .MuiAlert-root": {
            fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
          },
        },
      },
    },
  },
});

// Custom styled components
const AnimatedCard = styled(Card)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 16px 70px rgba(0, 0, 0, 0.12)",
  },
}));

const ColorBar = styled(Box)(({ theme }) => ({
  height: 6,
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
    "& .MuiButton-endIcon": {
      transform: "translateX(4px)",
    },
    "& .MuiButton-startIcon": {
      transform: "translateX(-4px)",
    },
  },
  "& .MuiButton-endIcon, & .MuiButton-startIcon": {
    transition: "transform 0.2s ease",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 70%)",
    transform: "translateX(-100%)",
  },
  "&:hover::after": {
    transition: "transform 1s ease",
    transform: "translateX(100%)",
  },
}));

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "100%",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  borderRadius: 12,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.03),
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
}));

const SecondaryIconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
  color: theme.palette.secondary.main,
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  gap: theme.spacing(2),
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  ...(status === "active" && {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
  }),
  ...(status === "disabled" && {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
  }),
}));

const TestDetails = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Responsive breakpoints
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    // Set testId in localStorage
    localStorage.setItem("test_id", testId);

    const fetchTestData = async () => {
      try {
        setLoading(true);
        const data = await getTestById(testId);
        setTestData(data);
      } catch (err) {
        console.error("Failed to fetch test data:", err);
        setSnackbarMessage("Failed to fetch test data.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();

    // Prevent back navigation by handling popstate
    const handlePopState = () => {
      // Push the current page back to the history to prevent going back
      window.history.pushState(null, null, window.location.pathname);
      setSnackbarMessage("Navigation back is disabled during the test.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [testId]);

  // Check if test has MCQ component
  const hasMcq = testData?.test_mcq_id && testData.test_mcq_id.length > 0;
  
  // Check if test has coding component
  const hasCoding = testData?.test_coding_id && testData.test_coding_id.length > 0;
  
  // Check if test is active
  const isTestActive = testData?.status === "active";

  // Determine first component to navigate to
  const getFirstComponentPath = () => {
    if (hasMcq) return `/mcq/${testId}`;
    if (hasCoding) return `/coding/${testData.test_coding_id[0]}`; // Use first coding ID
    return null;
  };

  const handleProceed = async () => {
    // Don't proceed if test is disabled
    if (!isTestActive) {
      setSnackbarMessage("This test is currently disabled. Please try again later.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const firstComponentPath = getFirstComponentPath();
    if (!firstComponentPath) {
      setSnackbarMessage("No test components found.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      // Calculate total time: 60 seconds per MCQ, 600 seconds per coding question
      const mcqCount = testData.test_mcq_id?.length || 0;
      const codingCount = testData.test_coding_id?.length || 0;
      const totalTime = (mcqCount * 60) + (codingCount * 600);

      // Store total time in localStorage
      if (totalTime > 0) {
        localStorage.setItem("test_timer", totalTime.toString());
      } else {
        setSnackbarMessage("No valid test components to set timer.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      // Request fullscreen mode
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else if (document.documentElement.mozRequestFullScreen) {
        await document.documentElement.mozRequestFullScreen();
        setIsFullscreen(true);
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
        setIsFullscreen(true);
      } else {
        // Fallback if fullscreen not supported
        setSnackbarMessage("Fullscreen mode not supported by your browser. The test requires fullscreen.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }

      // Prevent back navigation by replacing history and pushing dummy entries
      window.history.replaceState(null, null, firstComponentPath);
      window.history.pushState(null, null, firstComponentPath);
      window.history.pushState(null, null, firstComponentPath);

      // Navigate to first component
      navigate(firstComponentPath);
    } catch (err) {
      console.error("Fullscreen request failed:", err);
      setIsFullscreen(false);
      setSnackbarMessage("Failed to enter fullscreen mode. Please allow fullscreen and try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleBack = () => {
    window.history.back(); 
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const renderLoading = () => (
    <LoadingContainer>
      <CircularProgress
        size={48}
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
          animationDuration: "1.2s",
        }}
      />
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{
          opacity: 0.8,
          animation: "pulse 1.5s infinite ease-in-out",
          "@keyframes pulse": {
            "0%, 100%": { opacity: 0.8 },
            "50%": { opacity: 0.5 },
          },
        }}
      >
        Loading test details...
      </Typography>
    </LoadingContainer>
  );

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {renderLoading()}
      </ThemeProvider>
    );
  }

  if (!testData) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={isSmallScreen ? 2 : 4}>
          <Paper
            elevation={2}
            sx={{
              p: 4,
              maxWidth: 500,
              borderRadius: 3,
              textAlign: "center",
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Unable to load test details
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              We couldn't retrieve the test details. Please check your connection and try again.
            </Typography>
            <AnimatedButton variant="outlined" color="primary" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              Retry
            </AnimatedButton>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  // Determine button text based on available components
  const getButtonText = () => {
    if (!isTestActive) return "Test Disabled";
    if (hasMcq) return "Proceed to MCQ";
    if (hasCoding) return "Proceed to Coding";
    return "No Components Available";
  };

  const getTestOverviewText = () => {
    let description = `This assessment is designed to evaluate your proficiency in ${testData.test_language}.`;
    
    if (hasMcq && hasCoding) {
      description += " The test consists of multiple-choice questions and coding challenges.";
    } else if (hasMcq) {
      description += " The test consists of multiple-choice questions.";
    } else if (hasCoding) {
      description += " The test consists of coding challenges.";
    }
    
    description += " The test is timed, and your performance will be scored based on accuracy and completion time.";
    
    return description;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: "100%",
            fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: isSmallScreen ? 2 : 4,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <AnimatedCard sx={{ width: "100%", maxWidth: 800 }}>
          <ColorBar />
          <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <Box>
                <Chip
                  label="Test Details"
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mb: 1.5,
                  }}
                />
                <Typography
                  variant={isSmallScreen ? "h5" : "h4"}
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {testData.test_name}
                </Typography>
              </Box>
              <StatusChip
                label={testData.status === "active" ? "Active" : "Disabled"}
                status={testData.status}
                size="small"
                icon={testData.status === "active" ? <CheckIcon /> : <LockIcon />}
              />
            </Box>

            <CardContent sx={{ p: 0 }}>
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={6}>
                  <InfoCard elevation={0}>
                    <IconWrapper>
                      <LanguageIcon />
                    </IconWrapper>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                        Language
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {testData.test_language}
                      </Typography>
                    </Box>
                  </InfoCard>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoCard elevation={0}>
                    <IconWrapper>
                      <ScoreIcon />
                    </IconWrapper>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                        Total Score
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {testData.test_total_score} points
                      </Typography>
                    </Box>
                  </InfoCard>
                </Grid>
              </Grid>

              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  mt: 2,
                  mb: 2,
                }}
              >
                Test Components
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoCard elevation={0} sx={{ opacity: hasMcq ? 1 : 0.7 }}>
                    <IconWrapper>
                      <QuizIcon />
                    </IconWrapper>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                        MCQ Questions
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {testData.test_mcq_id?.length || 0} questions
                        </Typography>
                        {hasMcq ? (
                          <Chip
                            size="small"
                            label="Included"
                            sx={{
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main,
                              ml: 1,
                            }}
                            icon={<CheckIcon style={{ fontSize: 16 }} />}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="Not Included"
                            sx={{
                              backgroundColor: alpha(theme.palette.grey[500], 0.1),
                              color: theme.palette.grey[500],
                              ml: 1,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </InfoCard>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoCard elevation={0} sx={{ opacity: hasCoding ? 1 : 0.7 }}>
                    <SecondaryIconWrapper>
                      <CodeIcon />
                    </SecondaryIconWrapper>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                        Coding Tasks
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {testData.test_coding_id?.length || 0} tasks
                        </Typography>
                        {hasCoding ? (
                          <Chip
                            size="small"
                            label="Included"
                            sx={{
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main,
                              ml: 1,
                            }}
                            icon={<CheckIcon style={{ fontSize: 16 }} />}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="Not Included"
                            sx={{
                              backgroundColor: alpha(theme.palette.grey[500], 0.1),
                              color: theme.palette.grey[500],
                              ml: 1,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </InfoCard>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    mb: 2,
                  }}
                >
                  Test Overview
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  {getTestOverviewText()}
                </Typography>
                
                {!isTestActive && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mt: 2,
                      mb: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.error.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <ErrorIcon color="error" fontSize="small" />
                    <Typography variant="body2" color="error.main">
                      This test is currently disabled and not available for taking. Please check back later or contact the administrator.
                    </Typography>
                  </Paper>
                )}
                
                {(hasMcq || hasCoding) ? (
                  <Typography variant="body1" color="textSecondary" sx={{ mb: -3}}>
                    {isTestActive
                      ? `Click "${getButtonText()}" to begin the assessment. The test will open in fullscreen mode.`
                      : "The test is currently disabled and cannot be started."}
                  </Typography>
                ) : (
                  <Typography variant="body1" color="error" sx={{ mb: 0.5 }}>
                    No test components found. Please contact the administrator.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Box>
          <Divider />
          <CardActions
            sx={{
              p: isSmallScreen ? 2 : 3,
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: alpha(theme.palette.background.default, 0.5),
            }}
          >
            <AnimatedButton
              variant="outlined"
              color="primary"
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                borderColor: alpha(theme.palette.primary.main, 0.5),
              }}
            >
              Back
            </AnimatedButton>
            <Tooltip 
              title={!isTestActive ? "This test is currently disabled" : ""} 
              placement="top"
              disableHoverListener={isTestActive}
            >
              <span>
                <AnimatedButton
                  variant="contained"
                  color="secondary"
                  onClick={handleProceed}
                  endIcon={isTestActive ? <ArrowIcon /> : <LockIcon />}
                  disableElevation
                  disabled={!isTestActive || (!hasMcq && !hasCoding)}
                  sx={{
                    px: isSmallScreen ? 3 : 4,
                    py: isSmallScreen ? 1 : 1.5,
                    color: "#ffffff",
                  }}
                >
                  {getButtonText()}
                </AnimatedButton>
              </span>
            </Tooltip>
          </CardActions>
        </AnimatedCard>
      </Box>
    </ThemeProvider>
  );
};

export default TestDetails;