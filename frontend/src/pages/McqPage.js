import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Radio,
  FormControlLabel,
  Button,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  LinearProgress,
  IconButton,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { Flag as FlagIcon, ArrowForward as ArrowIcon, Info as InfoIcon, Timer as TimerIcon } from "@mui/icons-material";
import { getTestById, getMcqById, submitTestResult } from "../axios";
import "../styles/McqStyle.css";

// Custom theme
const theme = createTheme({
  typography: {
    fontFamily: ["Inter", "Roboto", '"Segoe UI"', "Arial", "sans-serif"].join(","),
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  palette: {
    primary: { main: "#0c83c8" },
    secondary: { main: "#fc7a46" },
    success: { main: "#2e7d32" },
    warning: { main: "#f57c00" },
    background: { default: "#f8fafc" },
  },
  shape: { borderRadius: 8 },
});

// Pie Chart Component
const PieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  let cumulativePercentage = 0;

  const createPath = (percentage, cumulativePercentage) => {
    const startAngle = cumulativePercentage * 3.6;
    const endAngle = (cumulativePercentage + percentage) * 3.6;
    const largeArcFlag = percentage > 50 ? 1 : 0;

    const x1 = 50 + 35 * Math.cos(((startAngle - 90) * Math.PI) / 180);
    const y1 = 50 + 35 * Math.sin(((startAngle - 90) * Math.PI) / 180);
    const x2 = 50 + 35 * Math.cos(((endAngle - 90) * Math.PI) / 180);
    const y2 = 50 + 35 * Math.sin(((endAngle - 90) * Math.PI) / 180);

    return `M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div
  className={`pie-chart-container ${
    total === 100 ? "stable" : ""
  }`}
>
  <svg viewBox="0 0 100 100" className="pie-chart">
    {data.map((item, index) => {
      if (item.value === 0) return null;
      const rawPercent = (item.value / total) * 100;
      const percentage = Math.min(rawPercent, 99.999); // prevent 100% glitch
      const path = createPath(percentage, cumulativePercentage);
      cumulativePercentage += percentage;

      return (
        <path
          key={index}
          d={path}
          fill={item.color}
          className={`pie-slice ${total === 100 ? "stable" : ""}`}
        />
      );
    })}
  </svg>
</div>

  );
};

// Circular Timer Component
const CircularTimer = ({ timeLeft, totalTime }) => {
  const percentage = (timeLeft / totalTime) * 100;
  const circumference = 2 * Math.PI * 35;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getTimerColor = () => {
    if (percentage > 50) return "#22c55e"; // Green
    if (percentage > 20) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  return (
    <div className="circular-timer">
      <svg className="timer-svg" viewBox="0 0 100 100">
        <circle className="timer-background" cx="50" cy="50" r="35" fill="#e2e8f0" stroke="none" />
        <circle
          className="timer-progress"
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke={getTimerColor()}
          strokeWidth="6"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
        />
        <circle className="timer-fill" cx="50" cy="50" r="30" fill={getTimerColor()} opacity="0.2" />
      </svg>
    </div>
  );
};

// Question Navigator Component
const QuestionNavigator = ({ progress, currentQuestion, onQuestionSelect }) => {
  return (
    <div className="question-navigator">
      <Typography variant="subtitle2" className="navigator-title">
        Question Navigator
      </Typography>
      <div className="question-grid">
        {progress.map((item, index) => {
          let status = "not-visited";
          if (item.selected_option && item.marked) status = "answered-and-marked";
          else if (item.selected_option) status = "answered";
          else if (item.marked) status = "marked";
          else if (item.visited) status = "not-answered";

          return (
            <div
              key={index}
              className={`question-bubble ${status} ${index === currentQuestion ? "current" : ""}`}
              onClick={() => onQuestionSelect(index)}
            >
              {index + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const McqPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [testData, setTestData] = useState(null);
  const [mcqData, setMcqData] = useState([]);
  const [codingIds, setCodingIds] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [progress, setProgress] = useState([]);
  const [testResult, setTestResult] = useState({});
  const [timer, setTimer] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, type: "", message: "", onConfirm: null });
  const [instructionsDialogOpen, setInstructionsDialogOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [userId, setUserId] = useState("");
  const [pocId, setPocId] = useState("");
  const timerRef = useRef(null);
  const isSubmitting = useRef(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [isFullscreen, setIsFullscreen] = useState(false);

  const defaultInstructions = [
    "Read each question carefully before answering.",
    "Select one option for each multiple-choice question.",
    "Use the 'Mark for Review' button to revisit questions later.",
    "Click 'Next' to move to the next question or 'Previous' to go back.",
    "Do not refresh the page or navigate away, as this will submit the test.",
    "Ensure you remain in fullscreen mode throughout the test.",
    "Any attempt to copy, paste, open developer tools, or switch tabs will result in immediate test submission.",
    "Submit the test when you are ready, or proceed to the coding section if applicable.",
  ];

  const shuffleArray = (array) => {
    if (!array || !Array.isArray(array)) return [];
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize test data
  useEffect(() => {
    const initializeTest = async () => {
      try {
        setLoading(true);

        const storedUser = localStorage.getItem("true");
        let userData = {};
        if (storedUser) {
          try {
            userData = JSON.parse(storedUser);
            setStudentName(userData.user?.full_name || "Student");
            setUserId(userData.user?.user_id || "");
            setPocId(userData.user?.mod_poc_id?.mod_poc_id || "");
          } catch (error) {
            console.error("Failed to parse user data:", error);
          }
        }

        const test = await getTestById(testId);
        if (!test) throw new Error("Test data not found");
        setTestData(test);

        let codingIds = test.test_coding_id?.length ? test.test_coding_id : [];
        const savedCodingIds = JSON.parse(localStorage.getItem("coding_ids") || "[]");
        if (savedCodingIds.length > 0) {
          codingIds = savedCodingIds;
        } else {
          localStorage.setItem("coding_ids", JSON.stringify(codingIds));
        }
        setCodingIds(codingIds);

        const mcqPromises = (test.test_mcq_id || []).map((id) => getMcqById(id));
        const mcqResults = await Promise.all(mcqPromises);
        const shuffledMcq = shuffleArray(
          mcqResults.map((mcq) => ({
            ...mcq,
            mcq_options: shuffleArray(mcq.mcq_options || []),
          })),
        );
        setMcqData(shuffledMcq);

        const savedProgress = JSON.parse(localStorage.getItem("test_progress") || "[]");
        const initialProgress = shuffledMcq.map((mcq) => ({
          mcq_id: mcq.mcq_id,
          selected_option: null,
          marked: false,
          visited: false,
        }));
        const mergedProgress = initialProgress.map((init) => {
          const saved = savedProgress.find((p) => p.mcq_id === init.mcq_id);
          return saved || init;
        });
        setProgress(mergedProgress);

        const savedTimer = localStorage.getItem("test_timer");
        if (!savedTimer) throw new Error("Test timer not found in localStorage");
        const timerValue = Number.parseInt(savedTimer, 10);
        if (isNaN(timerValue) || timerValue <= 0) throw new Error("Invalid test timer value");
        setTimer(timerValue);
        setTotalTime(timerValue);

        const savedResult = JSON.parse(localStorage.getItem("test_result") || "{}");
        const navigationResult = state || {};
        const updatedResult = {
          result_user_id: userData.user?.user_id || savedResult.result_user_id || navigationResult.result_user_id || "",
          result_test_id: testId,
          result_score: savedResult.result_score || navigationResult.result_score || 0,
          result_total_score:
            savedResult.result_total_score ||
            navigationResult.result_total_score ||
            (test.test_mcq_id?.length || 0) + (test.test_coding_id?.length || 0) * 10,
          result_poc_id:
            userData.user?.mod_poc_id?.mod_poc_id || savedResult.result_poc_id || navigationResult.result_poc_id || "",
          studentName: userData.user?.full_name || savedResult.studentName || navigationResult.studentName || "",
          testName: test.test_name || savedResult.testName || navigationResult.testName || "",
          testLanguage: test.test_language || savedResult.testLanguage || navigationResult.testLanguage || "",
          codingIds: savedResult.codingIds || navigationResult.codingIds || codingIds,
          codingAnswered: savedResult.codingAnswered || navigationResult.codingAnswered || 0,
          codingNotAnswered:
            savedResult.codingNotAnswered || navigationResult.codingNotAnswered || test.test_coding_id?.length || 0,
          codingNotVisited:
            savedResult.codingNotVisited || navigationResult.codingNotVisited || test.test_coding_id?.length || 0,
          codingCorrect: savedResult.codingCorrect || navigationResult.codingCorrect || 0,
          codingWrong: savedResult.codingWrong || navigationResult.codingWrong || 0,
          codingResults: savedResult.codingResults || navigationResult.codingResults || [],
          mcqAnswered: savedResult.mcqAnswered || navigationResult.mcqAnswered || 0,
          mcqCorrect: savedResult.mcqCorrect || navigationResult.mcqCorrect || 0,
          mcqWrong: savedResult.mcqWrong || navigationResult.mcqWrong || 0,
          mcqNotAnswered: savedResult.mcqNotAnswered || navigationResult.mcqNotAnswered || 0,
          mcqNotVisited: savedResult.mcqNotVisited || navigationResult.mcqNotVisited || test.test_mcq_id?.length || 0,
          marked: savedResult.marked || navigationResult.marked || 0,
          currentCodingIndex: savedResult.currentCodingIndex || navigationResult.currentCodingIndex || 0,
        };
        setTestResult(updatedResult);
        localStorage.setItem("test_result", JSON.stringify(updatedResult));

        window.history.replaceState(null, null, `/mcq/${testId}`);
        window.history.pushState(null, null, `/mcq/${testId}`);
        window.history.pushState(null, null, `/mcq/${testId}`);

        // Request fullscreen
        try {
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
            console.warn("Fullscreen API not supported");
            setDialog({
              open: true,
              type: "warning",
              message: "Fullscreen mode is not supported by your browser. The test requires fullscreen.",
              onConfirm: () => setDialog({ open: false }),
            });
          }
        } catch (error) {
          console.error("Fullscreen request failed:", error);
         
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Initialization error:", error);
        setDialog({
          open: true,
          type: "error",
          message: error.message || "Failed to load test data",
          onConfirm: () => {
            window.history.replaceState(null, null, "/test-result");
            navigate("/test-result");
          },
        });
      } finally {
        setLoading(false);
      }
    };

    initializeTest();
  }, [testId, navigate, state]);

  // Timer countdown
  useEffect(() => {
    if (!isInitialized || timer <= 0) {
      if (timer <= 0 && isInitialized && !isSubmitting.current) {
        handleSubmitTest();
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        const newTime = prev - 1;
        localStorage.setItem("test_timer", newTime);
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timer, isInitialized]);

  // Malpractice prevention and fullscreen handling
  useEffect(() => {
    if (!isInitialized) return;

    const handlePopState = () => {
      window.history.pushState(null, null, `/mcq/${testId}`);
      handleMalpractice("Attempted to navigate back using browser controls");
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Leaving the test will submit it automatically. Are you sure?";
      handleMalpractice("Attempted to close or refresh the page");
    };

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen && isInitialized) {
        handleMalpractice("Exited fullscreen mode");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleMalpractice("Tab/window switching detected");
      }
    };

    const preventCopyPaste = (e) => {
      e.preventDefault();
      handleMalpractice("Copy/paste attempted");
    };

    const preventDevTools = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        handleMalpractice("Attempted to open developer tools");
      }
    };

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        handleMalpractice("Mouse moved outside test window");
      }
    };

    const detectNewWindow = () => {
      handleMalpractice("Attempted to open a new tab or window");
    };

    const handleMalpractice = (message) => {
      if (isSubmitting.current) return;

      setDialog({
        open: true,
        type: "malpractice",
        message: `Malpractice detected: ${message}. Test is being submitted.`,
        onConfirm: handleSubmitTest,
      });

      // Submit immediately
      handleSubmitTest();
    };

    const requestFullscreen = async () => {
      try {
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
        }
      } catch (error) {
        console.error("Fullscreen request failed:", error);
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", preventCopyPaste);
    document.addEventListener("paste", preventCopyPaste);
    document.addEventListener("keydown", preventDevTools);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("blur", detectNewWindow);

    const fullscreenCheckInterval = setInterval(() => {
      if (!isFullscreen && isInitialized) {
        requestFullscreen();
      }
    }, 5000);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      document.removeEventListener("keydown", preventDevTools);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("blur", detectNewWindow);
      clearInterval(fullscreenCheckInterval);
    };
  }, [isInitialized, testId, isFullscreen]);

  // Save progress and test result
  useEffect(() => {
    if (!isInitialized || !testData || !mcqData) return;

    localStorage.setItem("test_progress", JSON.stringify(progress));

    const answeredCount = progress.filter((p) => p.selected_option).length;
    const markedCount = progress.filter((p) => p.marked).length;
    const notAnsweredCount = progress.filter((p) => !p.selected_option && p.visited && !p.marked).length;
    const notVisitedCount = progress.filter((p) => !p.visited && !p.marked && !p.selected_option).length;
    let mcqScore = 0;
    let wrongAnswersCount = 0;

    progress.forEach((p) => {
      const question = mcqData.find((q) => q.mcq_id === p.mcq_id);
      if (question && p.selected_option && p.selected_option === question.mcq_answer) {
        mcqScore += 1;
      } else if (p.selected_option) {
        wrongAnswersCount += 1;
      }
    });

    setTestResult((prev) => {
      const updatedResult = {
        ...prev,
        result_user_id: userId || prev.result_user_id || "",
        result_test_id: testId,
        result_score: mcqScore + (prev.codingResults?.reduce((sum, res) => sum + res.score, 0) || 0),
        result_total_score: (testData.test_mcq_id?.length || 0) + (testData.test_coding_id?.length || 0) * 10,
        result_poc_id: pocId || prev.result_poc_id || "",
        studentName: studentName || prev.studentName || "",
        testName: testData.test_name || prev.testName || "",
        testLanguage: testData.test_language || prev.testLanguage || "",
        codingIds: prev.codingIds || codingIds,
        codingAnswered: prev.codingAnswered || 0,
        codingNotAnswered: prev.codingNotAnswered || testData.test_coding_id?.length || 0,
        codingNotVisited: prev.codingNotVisited || testData.test_coding_id?.length || 0,
        codingCorrect: prev.codingCorrect || 0,
        codingWrong: prev.codingWrong || 0,
        codingResults: prev.codingResults || [],
        mcqAnswered: answeredCount,
        mcqCorrect: mcqScore,
        mcqWrong: wrongAnswersCount,
        mcqNotAnswered: notAnsweredCount,
        mcqNotVisited: notVisitedCount,
        marked: markedCount,
        currentCodingIndex: prev.currentCodingIndex || 0,
      };
      localStorage.setItem("test_result", JSON.stringify(updatedResult));
      return updatedResult;
    });
  }, [progress, testData, userId, pocId, studentName, testId, mcqData, isInitialized, codingIds]);

  const handleOptionClick = (option) => {
    setProgress((prev) =>
      prev.map((item, idx) =>
        idx === currentQuestion
          ? {
              ...item,
              selected_option: item?.selected_option === option ? null : option,
              visited: true,
            }
          : item
      )
    );
  };

  const handleMarkQuestion = () => {
    setProgress((prev) =>
      prev.map((item, idx) => (idx === currentQuestion ? { ...item, marked: !item.marked, visited: true } : item))
    );
  };

  const handleQuestionNavigation = (index) => {
    if (index >= 0 && index < mcqData.length) {
      setProgress((prev) => prev.map((item, idx) => (idx === index ? { ...item, visited: true } : item)));
      setCurrentQuestion(index);
    }
  };

  const handleSubmitTest = useCallback(async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    try {
      console.log("Submitting test...");
      const resultData = JSON.parse(localStorage.getItem("test_result") || "{}") || testResult;
      await submitTestResult(resultData);
      console.log("Test submitted successfully");

      if (document.exitFullscreen) {
        await document.exitFullscreen().catch((err) => console.error("Failed to exit fullscreen:", err));
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen().catch((err) => console.error("Failed to exit fullscreen:", err));
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen().catch((err) => console.error("Failed to exit fullscreen:", err));
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen().catch((err) => console.error("Failed to exit fullscreen:", err));
      }

      window.history.replaceState(null, null, "/test-result");
      navigate("/test-result");
    } catch (error) {
      console.error("Submission error:", error);
      setDialog({
        open: true,
        type: "error",
        message: "Failed to submit test. You will be redirected to the results page.",
        onConfirm: () => {
          window.history.replaceState(null, null, "/test-result");
          navigate("/test-result");
        },
      });
    } finally {
      isSubmitting.current = false;
    }
  }, [testResult, navigate]);

  const handleProceedToCoding = () => {
    if (codingIds.length === 0) {
      setDialog({
        open: true,
        type: "error",
        message: "No coding problems available for this test.",
        onConfirm: () => setDialog({ open: false }),
      });
      return;
    }
    setDialog({
      open: true,
      type: "proceed",
      message: "Once you proceed to the coding section, you cannot return to the MCQ section. Do you want to continue?",
      onConfirm: () => {
        navigate(`/coding/${codingIds[0]}`, {
          state: {
            ...testResult,
            currentCodingIndex: 0,
            codingIds,
          },
        });
        setDialog({ open: false });
      },
    });
  };

  const handleSubmitTestWithWarning = () => {
    setDialog({
      open: true,
      type: "submit",
      message: "Submitting the test is final. You cannot make further changes. Do you want to submit?",
      onConfirm: handleSubmitTest,
    });
  };

  const handleOpenInstructions = () => {
    setInstructionsDialogOpen(true);
  };

  const handleCloseInstructions = () => {
    setInstructionsDialogOpen(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!testData || mcqData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Test
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Unable to load test data. Please try again later.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              window.history.replaceState(null, null, "/test-result");
              navigate("/test-result");
            }}
          >
            Go to Results
          </Button>
        </Paper>
      </Box>
    );
  }

  let answeredCount = 0;
  let markedCount = 0;
  let answeredAndMarkedCount = 0;
  let notAnsweredCount = 0;
  let notVisitedCount = 0;

  progress.forEach((p) => {
    if (p.selected_option && p.marked) answeredAndMarkedCount += 1;
    else if (p.selected_option) answeredCount += 1;
    else if (p.marked) markedCount += 1;
    else if (p.visited) notAnsweredCount += 1;
    else notVisitedCount += 1;
  });

  const pieChartData = [
    { label: "Answered & Marked", value: answeredAndMarkedCount, color: "#0c83c8" },
    { label: "Answered", value: answeredCount, color: "#22c55e" },
    { label: "Marked", value: markedCount, color: "#fc7a46" },
    { label: "Not Answered", value: notAnsweredCount, color: "#ef4444" },
    { label: "Not Visited", value: notVisitedCount, color: "#9ca3af" },
  ];

  const isLastQuestionAnswered = currentQuestion === mcqData.length - 1 && progress[currentQuestion]?.selected_option;

  const instructions = testData.test_instructions
    ? Array.isArray(testData.test_instructions)
      ? testData.test_instructions
      : testData.test_instructions.split("\n").filter((line) => line.trim())
    : defaultInstructions;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dialog
        open={dialog.open}
        onClose={() => {}}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="clean-dialog"
        disableEscapeKeyDown={dialog.type === "malpractice"}
        disableBackdropClick={dialog.type === "malpractice"}
      >
        <DialogTitle id="alert-dialog-title">
          {dialog.type === "malpractice" ? "Malpractice Detected" : dialog.type === "error" ? "Error" : "Warning"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{dialog.message}</DialogContentText>
          {dialog.type === "malpractice" && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {dialog.type === "proceed" || dialog.type === "submit" ? (
            <>
              <Button onClick={() => setDialog({ open: false })} color="primary" className="clean-button">
                Stay in MCQ
              </Button>
              <Button onClick={dialog.onConfirm} color="secondary" autoFocus className="clean-button">
                {dialog.type === "proceed" ? "Proceed to Coding" : "Submit Test"}
              </Button>
            </>
          ) : dialog.type === "error" ? (
            <Button onClick={dialog.onConfirm} color="primary" autoFocus className="clean-button">
              OK
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>

      <Dialog
        open={instructionsDialogOpen}
        onClose={handleCloseInstructions}
        aria-labelledby="instructions-dialog-title"
        maxWidth="sm"
        fullWidth
        className="clean-dialog"
      >
        <DialogTitle id="instructions-title">Test Instructions</DialogTitle>
        <DialogContent>
          <Box component="ol" sx={{ pl: 3, mb: 0 }}>
            {instructions.map((instruction, index) => (
              <Typography key={index} component="li" variant="body1" sx={{ mb: 1 }}>
                {instruction}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInstructions} color="primary" autoFocus className="clean-button">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <Typography variant="h6" className="test-title">
              {testData.test_name || "Test"}
            </Typography>
            <IconButton onClick={handleOpenInstructions} aria-label="View test instructions" className="info-button">
              <InfoIcon />
            </IconButton>
          </div>
          <div className="header-right">
            <div className="timer-display">
              <TimerIcon className="timer-icon" />
              <span className="timer-text">{formatTime(timer)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="question-card">
          <div className="question-header">
            <Typography variant="h6" className="question-number">
              Question {currentQuestion + 1} of {mcqData.length}
            </Typography>
          </div>

          <div className="question-content">
            <Typography variant="body1" className="question-text">
              {mcqData[currentQuestion]?.mcq_question || "Loading question..."}
            </Typography>

            <div className="options-group">
              {(mcqData[currentQuestion]?.mcq_options || []).map((option, index) => (
                <div
                  key={index}
                  className={`option-item ${progress[currentQuestion]?.selected_option === option ? "selected" : ""}`}
                  onClick={() => handleOptionClick(option)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOptionClick(option);
                    }
                  }}
                >
                  <FormControlLabel
                    value={option}
                    control={
                      <Radio
                        className="custom-radio"
                        checked={progress[currentQuestion]?.selected_option === option}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                        tabIndex={-1}
                      />
                    }
                    label={option}
                    className="option-label"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="question-actions">
            <Button
              variant="outlined"
              onClick={handleMarkQuestion}
              startIcon={<FlagIcon />}
              className="clean-button mark-button"
            >
              {progress[currentQuestion]?.marked ? "Unmark" : "Mark for Review"}
            </Button>

            <div className="navigation-buttons">
              {currentQuestion > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => handleQuestionNavigation(currentQuestion - 1)}
                  className="clean-button nav-button"
                >
                  Previous
                </Button>
              )}
              {currentQuestion < mcqData.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => handleQuestionNavigation(currentQuestion + 1)}
                  endIcon={<ArrowIcon />}
                  className="clean-button nav-button primary"
                >
                  Next
                </Button>
              ) : (
                isLastQuestionAnswered && (
                  <Button
                    variant="contained"
                    onClick={testData.test_coding_id?.length > 0 ? handleProceedToCoding : handleSubmitTestWithWarning}
                    endIcon={<ArrowIcon />}
                    className="clean-button proceed-button"
                  >
                    Proceed
                  </Button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="info-card">
          <div className="student-info">
            <Typography variant="h6" className="student-name">
              {studentName}
            </Typography>
          </div>

          <div className="charts-container">
            <div className="chart-item">
              <Typography variant="subtitle2" className="chart-label">
                Progress
              </Typography>
              <PieChart data={pieChartData} />
            </div>
            <div className="chart-item">
              <Typography variant="subtitle2" className="chart-label">
                Time
              </Typography>
              <CircularTimer timeLeft={timer} totalTime={totalTime} />
            </div>
          </div>

          <Divider className="section-divider" />

          <QuestionNavigator
            progress={progress}
            currentQuestion={currentQuestion}
            onQuestionSelect={handleQuestionNavigation}
          />

          <div className="final-actions">
            <Button
              variant="contained"
              onClick={handleSubmitTestWithWarning}
              fullWidth
              className="clean-button submit-button"
            >
              Submit Test
            </Button>
            {testData.test_coding_id?.length > 0 && (
              <Button
                variant="contained"
                onClick={handleProceedToCoding}
                endIcon={<ArrowIcon />}
                fullWidth
                className="clean-button coding-button"
              >
                Proceed to Coding
              </Button>
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default McqPage;