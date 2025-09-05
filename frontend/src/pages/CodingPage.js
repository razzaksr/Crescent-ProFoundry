import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  CssBaseline,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Typography,
  Tooltip,
  Stack,
  createTheme,
  ThemeProvider,
  useMediaQuery,
  alpha,
  styled,
  Switch,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Editor } from "@monaco-editor/react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CodeIcon from "@mui/icons-material/Code";
import JavaIcon from "@mui/icons-material/DeveloperMode";
import PythonIcon from "@mui/icons-material/Memory";
import CppIcon from "@mui/icons-material/IntegrationInstructions";
import CIcon from "@mui/icons-material/SettingsEthernet";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import JavascriptIcon from "@mui/icons-material/Code" // Using Code icon for JavaScript
import TerminalIcon from "@mui/icons-material/Terminal";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import DoneIcon from "@mui/icons-material/Done";
import InfoIcon from "@mui/icons-material/Info";
import { fetchCodeById, fetchTestCaseById, compileCode, submitTestResult, getTestById } from "../axios";

// Language mapping for backend
const languageApiMap = {
  python: "python",
  java: "java",
  cpp: "cpp",
  c: "c",
  javascript: "javascript",
};

// Material UI Switch for theme toggle
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: theme.palette.mode === "dark" ? "#003892" : "#001e3c",
    width: 32,
    height: 32,
    "&::before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff"
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
    borderRadius: 20 / 2,
  },
}));

// Create themes with updated color palette
const createAppTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      primary: { main: "#0c83c8" },
      secondary: { main: "#fc7a46" },
      background: {
        default: mode === "dark" ? "#111827" : "#f9fafb",
        paper: mode === "dark" ? "#1f2937" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#f3f4f6" : "#1f2937",
        secondary: mode === "dark" ? "#9ca3af" : "#6b7280",
      },
      success: { main: "#0c83c8" },
      error: { main: "#ef4444" },
      warning: { main: "#f59e0b" },
      info: { main: "#3b82f6" },
      divider: mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
    },
    typography: {
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 500, textTransform: "none" },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap');
          
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: ${mode === "dark" ? "#1f2937" : "#f1f5f9"};
          }
          ::-webkit-scrollbar-thumb {
            background: ${mode === "dark" ? "#4b5563" : "#cbd5e1"};
            borderRadius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${mode === "dark" ? "#6b7280" : "#94a3b8"};
          }
          
          .resize-active * {
            user-select: none !important;
          }
          
          @media (max-width: 600px) {
            .monaco-editor .inputarea {
              font-size: 16px !important;
              line-height: normal !important;
            }
          }
        `,
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: "none",
            "&:hover": {
              boxShadow:
                mode === "dark" ? "0 4px 12px rgba(12, 131, 200, 0.25)" : "0 4px 12px rgba(12, 131, 200, 0.15)",
            },
          },
          containedPrimary: {
            background: "#0c83c8",
            "&:hover": { background: "#095e8f" },
          },
          containedSecondary: {
            background: "#fc7a46",
            "&:hover": { background: "#e55e2c" },
          },
          outlined: { borderWidth: 1.5 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow: mode === "dark" ? "0 4px 6px -1px rgba(0, 0, 0, 0.2)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflow: "hidden",
            border: `1px solid ${mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
              "& fieldset": { borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)" },
              "&:hover fieldset": { borderColor: "#0c83c8" },
              "&.Mui-focused fieldset": { borderColor: "#0c83c8" },
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: "all 0.2s ease-in-out",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)" },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 8,
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
};

const CodingPage = () => {
  const { codeId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState(localStorage.getItem("themeMode") || "dark");
  const theme = createAppTheme(mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Initialize from localStorage
  const [testId, setTestId] = useState(localStorage.getItem("test_id") || "");
  const [userId, setUserId] = useState("");
  const [pocId, setPocId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [timer, setTimer] = useState(parseInt(localStorage.getItem("test_timer")) || 0);
  const timerRef = useRef(null);

  // Test context from localStorage or state
  const savedTestResult = JSON.parse(localStorage.getItem("test_result")) || {};
  const [testResult, setTestResult] = useState({
    result_user_id: savedTestResult.result_user_id || state?.result_user_id || "",
    codingAnswered: savedTestResult.codingAnswered || state?.codingAnswered || 0,
    codingCorrect: savedTestResult.codingCorrect || state?.codingCorrect || 0,
    codingIds: savedTestResult.codingIds || state?.codingIds || [],
    codingNotAnswered: savedTestResult.codingNotAnswered || state?.codingNotAnswered || 0,
    codingNotVisited: savedTestResult.codingNotVisited || state?.codingNotVisited || 0,
    codingWrong: savedTestResult.codingWrong || state?.codingWrong || 0,
    marked: savedTestResult.marked || state?.marked || 0,
    mcqAnswered: savedTestResult.mcqAnswered || state?.mcqAnswered || 0,
    mcqCorrect: savedTestResult.mcqCorrect || state?.mcqCorrect || 0,
    mcqNotAnswered: savedTestResult.mcqNotAnswered || state?.mcqNotAnswered || 0,
    mcqNotVisited: savedTestResult.mcqNotVisited || state?.mcqNotVisited || 0,
    mcqWrong: savedTestResult.mcqWrong || state?.mcqWrong || 0,
    result_poc_id: savedTestResult.result_poc_id || state?.result_poc_id || "",
    result_score: savedTestResult.result_score || state?.result_score || 0,
    result_total_score: savedTestResult.result_total_score || state?.result_total_score || 0,
    studentName: savedTestResult.studentName || state?.studentName || "",
    testLanguage: savedTestResult.testLanguage || state?.testLanguage || "",
    testName: savedTestResult.testName || state?.testName || "",
    currentCodingIndex: savedTestResult.currentCodingIndex || state?.currentCodingIndex || 0,
    codingResults: savedTestResult.codingResults || state?.codingResults || [],
    testInstructions: savedTestResult.testInstructions || state?.testInstructions || [],
  });

  // Component state
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [showOutput, setShowOutput] = useState(true);
  const [outputMinimized, setOutputMinimized] = useState(false);
  const [openProgressDialog, setOpenProgressDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showTestCases, setShowTestCases] = useState(!isMobile);
  const [testCasesCollapsed, setTestCasesCollapsed] = useState(false);
  const [editorWidth, setEditorWidth] = useState(60);
  const [outputHeight, setOutputHeight] = useState(30);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [submitConfirmDialogOpen, setSubmitConfirmDialogOpen] = useState(false);
  const [fetchedTestCodingIds, setFetchedTestCodingIds] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [showFullScreenPrompt, setShowFullScreenPrompt] = useState(true);

  const isDraggingRef = useRef(false);
  const dividerRef = useRef(null);
  const outputDividerRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const editorRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Language templates
  const templates = {
    python: `print("Hello World")`,
    java: `import java.util.*;\npublic class Progman {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}`,
    c: `#include <stdio.h>\nint main() {\n\tprintf("Hello World");\n\treturn 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n\tcout << "Hello World";\n\treturn 0;\n}`,
    javascript: `console.log("Hello World");`,
  };

  // Language icon mapping
  const languageIcons = {
    python: <PythonIcon fontSize="small" />,
    java: <JavaIcon fontSize="small" />,
    cpp: <CppIcon fontSize="small" />,
    c: <CIcon fontSize="small" />,
    javascript: <JavascriptIcon fontSize="small" />
  };

  // Language display names
  const languageNames = {
    python: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
    javascript: "JavaScript",
  };

  // Default instructions
  const defaultInstructions = [
    "Read each problem statement carefully and ensure you understand the requirements before coding.",
    "Write your solution in the provided code editor using the selected programming language.",
    "Test your code against the provided test cases before submitting to verify correctness.",
    "Save your progress frequently using the Save button to avoid losing work.",
    "Malpractice Warning: Do not attempt to navigate away from the test, use browser back/forward buttons, or switch tabs. Such actions will result in immediate test submission.",
    "Malpractice Warning: Copying, pasting, or using external tools (including AI assistance) is strictly prohibited and will lead to automatic test submission.",
    "Malpractice Warning: Rapid code input or suspicious keyboard shortcuts (e.g., Ctrl+V, Alt+/) will be flagged as potential malpractice.",
    "Submit your test only when you are ready to finalize all answers. Once submitted, no further changes can be made.",
    "Ensure you are in full-screen mode during the test to maintain a secure testing environment.",
    "Contact the test administrator for any technical issues or clarifications during the test."
  ];

  // Prevent browser back/forward navigation
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    for (let i = 0; i < 10; i++) {
      window.history.pushState(null, null, window.location.href);
    }

    const handlePopState = (event) => {
      event.preventDefault();
      if (!hasSubmitted) {
        setSnackbarMessage("Malpractice detected: Attempted navigation. Test submitted automatically.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        handleFinalSubmit(true);
      }
      window.history.pushState(null, null, window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasSubmitted]);

  // Fetch user data and test instructions
  useEffect(() => {
    const storedUser = localStorage.getItem("true");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setStudentName(user.user.full_name || "");
        setUserId(user.user.user_id || "");
        setPocId(user.user.mod_poc_id?.mod_poc_id || "");
        setTestResult((prev) => {
          const updatedTestResult = {
            ...prev,
            studentName: user.user.full_name || prev.studentName,
            result_user_id: user.user.user_id || prev.result_user_id,
            result_poc_id: user.user.mod_poc_id?.mod_poc_id || prev.result_poc_id,
          };
          localStorage.setItem("test_result", JSON.stringify(updatedTestResult));
          return updatedTestResult;
        });
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        setSnackbarMessage("Invalid user data in localStorage.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage("No user data found in localStorage.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, []);

  useEffect(() => {
    if (codeId) {
      const savedPayload = localStorage.getItem(`code_${codeId}`);
      if (savedPayload) {
        try {
          const parsedPayload = JSON.parse(savedPayload);
          const savedLanguage = Object.keys(languageApiMap).find(
            (key) => languageApiMap[key] === parsedPayload.language
          ) || "python";
          console.log("Loading saved language:", savedLanguage); // Debug log
          // Only update language if it hasn't been set by user interaction
          setLanguage((currentLanguage) => {
            if (currentLanguage === "python" || !currentLanguage) {
              return savedLanguage;
            }
            return currentLanguage;
          });
          setInput(parsedPayload.code || templates[savedLanguage]);
        } catch (error) {
          console.error("Error parsing saved payload:", error);
          setInput(templates[language]);
        }
      } else {
        console.log("No saved payload, using default template for language:", language); // Debug log
        setInput(templates[language]);
      }
    }
  }, [codeId]); // Remove `language` from dependencies

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId) {
        setSnackbarMessage("No test ID found in localStorage.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      try {
        const res = await getTestById(testId);
        setFetchedTestCodingIds(res.test_coding_id || []);
        setTestResult((prev) => {
          const updatedTestResult = {
            ...prev,
            codingIds: res.test_coding_id || prev.codingIds,
            testName: res.test_name || prev.testName,
            testLanguage: res.test_language || prev.testLanguage,
            result_total_score: (res.test_mcq_id?.length || 0) + (res.test_coding_id?.length || 0) * 10,
            testInstructions: res.test_instructions || defaultInstructions, // Use defaultInstructions if none provided
          };
          localStorage.setItem("test_result", JSON.stringify(updatedTestResult));
          return updatedTestResult;
        });
        setTestCases([]);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch test:", err);
        setSnackbarMessage("Failed to fetch test data.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setLoading(false);
      }
    };
    fetchTestData();
  }, [testId]);

  // Timer countdown and auto-submit
  useEffect(() => {
    if (!timer || timer <= 0 || hasSubmitted) {
      if (timer <= 0 && !hasSubmitted) handleFinalSubmit(true);
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
  }, [timer, hasSubmitted]);

  // Full-screen logic
  useEffect(() => {
    const handleFullScreenChange = () => {
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
      ) {
        if (isFullScreen && !hasSubmitted) {
          handleFinalSubmit(true);
        }
        setIsFullScreen(false);
      } else {
        setIsFullScreen(true);
        setShowFullScreenPrompt(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullScreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullScreenChange);
    };
  }, [isFullScreen, hasSubmitted]);


  // Malpractice detection
  useEffect(() => {
    const handleMalpractice = (reason) => {
      if (!hasSubmitted) {
        setSnackbarMessage(`Malpractice detected: ${reason}. Test submitted automatically.`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        handleFinalSubmit(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleMalpractice("Tab switching or minimizing browser");
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      handleMalpractice("Right-click attempt");
    };

    const handleCopy = (e) => {
      e.preventDefault();
      handleMalpractice("Copy attempt");
    };

    const handlePaste = (e) => {
      e.preventDefault();
      handleMalpractice("Paste attempt");
    };

    const handleKeyDown = (e) => {
      // Block Windows key (left: 91, right: 92)
      if (e.keyCode === 91 || e.keyCode === 92) {
        e.preventDefault();
        handleMalpractice("Windows key usage");
      }
      // Block screenshot shortcuts
      if (e.key === "PrintScreen" || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s")) {
        e.preventDefault();
        handleMalpractice("Screenshot attempt");
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        handleMalpractice("Clipboard shortcut attempt (Win+V or Cmd+V)");
      }
      if ((e.altKey && e.key === "/") || (e.ctrlKey && e.key.toLowerCase() === "i")) {
        e.preventDefault();
        handleMalpractice("Suspected AI tool shortcut");
      }
    };

    let lastInputTime = Date.now();
    const handleEditorInput = (e) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastInputTime;
      lastInputTime = currentTime;

      if (e.target.value && e.target.value.length > 100 && timeDiff < 500) {
        handleMalpractice("Rapid code input detected (possible AI paste)");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);
    const editorElement = document.querySelector(".monaco-editor .inputarea");
    if (editorElement) {
      editorElement.addEventListener("input", handleEditorInput);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);
      if (editorElement) {
        editorElement.removeEventListener("input", handleEditorInput);
      }
    };
  }, [hasSubmitted]);

  // Auto-save function
  const saveSubmissionPayload = useCallback(() => {
    const formattedTestCases = testCases.map((testCase) => ({
      input: Array.isArray(testCase.testcase_input)
        ? testCase.testcase_input.join("\n")
        : testCase.testcase_input || "",
      expectedOutput: Array.isArray(testCase.testcase_output)
        ? testCase.testcase_output.join("\n")
        : testCase.testcase_output || "",
    }));

    const submissionPayload = {
      language: languageApiMap[language],
      code: input,
      testCases: formattedTestCases,
    };

    localStorage.setItem(`code_${codeId}`, JSON.stringify(submissionPayload));
  }, [codeId, language, input, testCases]);

  // Debounce function for auto-save
  const debounce = (func, delay) => {
    return (...args) => {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Debounced auto-save
  const debouncedSave = useCallback(debounce(saveSubmissionPayload, 1000), [saveSubmissionPayload]);

  // Auto-save on input or language change
  useEffect(() => {
    if (codeId && input) {
      debouncedSave();
    }
  }, [input, language, codeId, debouncedSave]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(autoSaveTimeoutRef.current);
    };
  }, []);

  // Effect to handle responsive layout and cleanup
  useEffect(() => {
    if (isMobile) {
      setShowTestCases(true);
      setTestCasesCollapsed(false);
    } else {
      setEditorWidth(60);
      setTestCasesCollapsed(false);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleOutputMouseMove);
      document.removeEventListener("mouseup", handleOutputMouseUp);
      document.body.classList.remove("resize-active");
      clearTimeout(resizeTimeoutRef.current);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isMobile]);

  // Fix for ResizeObserver loop error
  useEffect(() => {
    if (typeof ResizeObserver !== "undefined") {
      const resizeCallback = (entries) => {
        window.requestAnimationFrame(() => {
          if (!Array.isArray(entries) || !entries.length) {
            return;
          }
          if (editorRef.current) {
            editorRef.current.layout();
          }
        });
      };
      resizeObserverRef.current = new ResizeObserver(resizeCallback);
      const container = document.querySelector(".monaco-editor");
      if (container) {
        resizeObserverRef.current.observe(container);
      }
    }
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // Handle horizontal divider drag (editor vs test cases)
  const handleMouseDown = (e) => {
    if (!isMobile) {
      e.preventDefault();
      isDraggingRef.current = true;
      document.body.classList.add("resize-active");
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isDraggingRef.current && dividerRef.current) {
      const container = dividerRef.current.parentElement;
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      setEditorWidth(Math.max(30, Math.min(80, newWidth)));
    }
  }, []);

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.body.classList.remove("resize-active");
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current.layout();
      }, 10);
    }
  };

  // Handle vertical divider drag (output height)
  const handleOutputMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.classList.add("resize-active");
    document.addEventListener("mousemove", handleOutputMouseMove);
    document.addEventListener("mouseup", handleOutputMouseUp);
  };

  const handleOutputMouseMove = useCallback((e) => {
    if (isDraggingRef.current && outputDividerRef.current) {
      const container = outputDividerRef.current.parentElement;
      const containerRect = container.getBoundingClientRect();
      const newHeight = ((containerRect.bottom - e.clientY) / containerRect.height) * 100;
      setOutputHeight(Math.max(20, Math.min(50, newHeight)));
    }
  }, []);

  const handleOutputMouseUp = () => {
    isDraggingRef.current = false;
    document.body.classList.remove("resize-active");
    document.removeEventListener("mousemove", handleOutputMouseMove);
    document.removeEventListener("mouseup", handleOutputMouseUp);
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current.layout();
      }, 10);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    if (isMobile) {
      const textarea = document.querySelector(".monaco-editor .inputarea");
      if (textarea) {
        textarea.style.fontSize = "16px";
        textarea.style.lineHeight = "normal";
      }
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.updateOptions({ theme: newMode === "dark" ? "vs-dark" : "vs" });
      }
    }, 10);
  };

  // Toggle output console
  const toggleOutput = () => {
    if (outputMinimized) {
      setOutputMinimized(false);
      setShowOutput(true);
    } else {
      setOutputMinimized(!outputMinimized);
    }
  };

  // Toggle test cases panel
  const toggleTestCases = () => {
    setTestCasesCollapsed(!testCasesCollapsed);
  };

  // Handle editor input changes
  const handleEditorChange = (value) => {
    setInput(value || "");
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    console.log("Language change triggered. New language:", newLanguage); // Debug log

    // Update language state
    setLanguage((prevLanguage) => {
      console.log("Previous language:", prevLanguage, "New language:", newLanguage); // Debug log
      return newLanguage;
    });

    // Load saved code for the new language, if it exists
    const savedPayload = localStorage.getItem(`code_${codeId}`);
    let newCode = templates[newLanguage];

    if (savedPayload) {
      try {
        const parsedPayload = JSON.parse(savedPayload);
        console.log("Saved payload found:", parsedPayload); // Debug log
        if (parsedPayload.language === languageApiMap[newLanguage]) {
          newCode = parsedPayload.code || templates[newLanguage];
          console.log("Using saved code for language:", newLanguage); // Debug log
        }
      } catch (error) {
        console.error("Error parsing saved payload:", error);
      }
    } else {
      console.log("No saved payload, using template for:", newLanguage); // Debug log
    }

    // Update editor content
    setInput(newCode);
    console.log("Editor input set to:", newCode); // Debug log

    // Update editor language model
    if (editorRef.current && editorRef.current.getModel()) {
      window.monaco.editor.setModelLanguage(editorRef.current.getModel(), newLanguage);
      console.log("Editor language model updated to:", newLanguage); // Debug log
    } else {
      console.warn("Editor or model not available during language change"); // Debug log
    }

    // Save the new language and code
    saveSubmissionPayload();
    console.log("Submission payload saved for language:", newLanguage); // Debug log

  };
  // Reset editor to template
  const resetEditor = () => {
    setResetDialogOpen(true);
  };

  // Confirm editor reset
  const confirmResetEditor = () => {
    setInput(templates[language] || "");
    localStorage.removeItem(`code_${codeId}`);
    setSnackbarMessage("Editor reset to template");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
    setResetDialogOpen(false);
  };

  // Cancel editor reset
  const cancelResetEditor = () => {
    setResetDialogOpen(false);
  };

  // Manual save
  const handleSave = () => {
    const formattedTestCases = testCases.map((testCase) => ({
      input: Array.isArray(testCase.testcase_input)
        ? testCase.testcase_input.join("\n")
        : testCase.testcase_input || "",
      expectedOutput: Array.isArray(testCase.testcase_output)
        ? testCase.testcase_output.join("\n")
        : testCase.testcase_output || "",
    }));

    const submissionPayload = {
      language: languageApiMap[language],
      code: input,
      testCases: formattedTestCases,
    };

    localStorage.setItem(`code_${codeId}`, JSON.stringify(submissionPayload));
    setSnackbarMessage("Progress saved manually");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  // Fetch code and test cases
  const fetchCodeAndTestCases = async (id) => {
    try {
      setLoading(true);
      const code = await fetchCodeById(id);
      setSelectedCode(code);

      if (!code.code_test_cases_id || code.code_test_cases_id.length === 0) {
        setTestCases([]);
        setSnackbarMessage("No test cases found for this problem.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }

      const testCasePromises = code.code_test_cases_id.map(async (testcase_id) => {
        try {
          return await fetchTestCaseById(testcase_id);
        } catch (err) {
          console.error(`Error fetching test case ${testcase_id}:`, err);
          return null;
        }
      });
      const responses = await Promise.all(testCasePromises);
      const validTestCases = responses.filter((tc) => tc && tc.testcase_input && tc.testcase_output);
      setTestCases(validTestCases);

      if (validTestCases.length === 0) {
        setTestCases([{ testcase_input: "", testcase_output: "" }]);
        setSnackbarMessage("No valid test cases retrieved.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setTestCases([{ testcase_input: "", testcase_output: "" }]);
      setOutput(`Error fetching problem: ${err.message}.`);
      setShowOutput(true);
      setSnackbarMessage(`Error fetching problem: ${err.message}.`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch code on mount or codeId change
  useEffect(() => {
    if (codeId) {
      fetchCodeAndTestCases(codeId);
      setOutput("");
    } else {
      setOutput("Error: No code ID provided in URL");
      setShowOutput(true);
      setSnackbarMessage("No code ID provided in URL.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [codeId]);

  const compileAndEvaluate = async (currentCodeId, codeInput, codeLanguage, codeTestCases) => {
    setShowOutput(true);
    setOutputMinimized(false);
    setLoading(true);
    setOpenProgressDialog(true);
    setOutput("Running code against test cases...\n");
  
    try {
      // Validate and format test cases
      const formattedTestCases = codeTestCases
        .filter(tc => tc?.testcase_input != null && tc?.testcase_output != null)
        .map(testCase => ({
          input: Array.isArray(testCase.testcase_input)
            ? testCase.testcase_input.join("\n")
            : testCase.testcase_input || "",
          expectedOutput: Array.isArray(testCase.testcase_output)
            ? testCase.testcase_output.join("\n")
            : testCase.testcase_output || "",
        }));
  
      // Ensure at least one test case
      if (formattedTestCases.length === 0) {
        console.warn(`⚠️ No valid test cases for ${currentCodeId}, using default empty test case`);
        formattedTestCases.push({ input: "", expectedOutput: "" });
      }
  
      const submissionPayload = {
        language: languageApiMap[codeLanguage] || codeLanguage,
        code: codeInput || templates[codeLanguage] || "",
        testCases: formattedTestCases,
      };
  
      // Save payload to localStorage
      localStorage.setItem(`code_${currentCodeId}`, JSON.stringify(submissionPayload));
      console.log(`💾 Saved code payload for ${currentCodeId}:`, {
        codeLength: submissionPayload.code.length,
        language: submissionPayload.language,
        testCases: submissionPayload.testCases.length,
      });
  
      // Compile code
      const { results } = await compileCode(submissionPayload);
      const formattedOutput = results.map(
        (res, index) => {
          if (index < 2) {
            return `Test Case #${index + 1}:\nInput:\n${res.input}\nExpected Output:\n${res.expectedOutput}\nActual Output:\n${res.actualOutput}\nPassed: ${res.passed ? "✅" : "❌"}\n`;
          } else {
            return `Hidden Test Case #${index + 1}: ${res.passed ? "Passed ✅" : "Failed ❌"}\n`;
          }
        }
      ).join("\n");
      setOutput(formattedOutput);
  
      // Calculate score
      const allPassed = results.length > 0 && results.every(res => res.passed);
      const codingScore = allPassed ? 10 : 0;
  
      const newCodingResult = { codeId: currentCodeId, score: codingScore, total: 10 };
      console.log(`📊 New coding result for ${currentCodeId}:`, newCodingResult);
  
      // Get current test result
      let currentTestResult = testResult;
      try {
        const storedResult = localStorage.getItem("test_result");
        if (storedResult) {
          currentTestResult = JSON.parse(storedResult);
        }
      } catch (error) {
        console.error("Error parsing stored test result:", error);
      }
  
      // Initialize codingResults if undefined
      currentTestResult.codingResults = currentTestResult.codingResults || [];
  
      // Update coding results
      const existingIndex = currentTestResult.codingResults.findIndex(result => result.codeId === currentCodeId);
      let updatedCodingResults = [...currentTestResult.codingResults];
      if (existingIndex !== -1) {
        updatedCodingResults[existingIndex] = newCodingResult;
        console.log(`🔄 Updated existing result for ${currentCodeId} at index ${existingIndex}`);
      } else {
        updatedCodingResults.push(newCodingResult);
        console.log(`➕ Added new result for ${currentCodeId}. Total results: ${updatedCodingResults.length}`);
      }
  
      // Ensure codingIds is initialized
      const effectiveCodingIds = fetchedTestCodingIds.length > 0 ? fetchedTestCodingIds : (currentTestResult.codingIds || []);
  
      // Update test result
      const updatedTestResult = {
        ...currentTestResult,
        codingResults: updatedCodingResults,
        result_user_id: userId || currentTestResult.result_user_id || "",
        result_test_id: testId || currentTestResult.result_test_id || "",
        result_score: (currentTestResult.mcqCorrect || 0) + updatedCodingResults.reduce((sum, result) => sum + result.score, 0),
        result_total_score: currentTestResult.result_total_score || effectiveCodingIds.length * 10,
        result_poc_id: pocId || currentTestResult.result_poc_id || "",
        codingAnswered: updatedCodingResults.length,
        codingNotAnswered: effectiveCodingIds.length - updatedCodingResults.length,
        codingNotVisited : Math.max(0, effectiveCodingIds.length - updatedCodingResults.length),
        codingCorrect: updatedCodingResults.filter(r => r.score > 0).length,
        codingWrong: updatedCodingResults.filter(r => r.score === 0).length,
        studentName: studentName || currentTestResult.studentName || "",
      };
  
      // Save and verify localStorage
      localStorage.setItem("test_result", JSON.stringify(updatedTestResult));
      const verifyResult = JSON.parse(localStorage.getItem("test_result") || "{}");
      if (verifyResult.codingResults?.length !== updatedCodingResults.length) {
        throw new Error(`Verification failed: Expected ${updatedCodingResults.length} results, got ${verifyResult.codingResults?.length || 0}`);
      }
      console.log(`✅ Successfully saved test result with ${verifyResult.codingResults.length} coding results`);
  
      setTestResult(updatedTestResult);
      setSnackbarMessage("Code compiled and evaluated successfully!");
      setSnackbarSeverity("success");
      return { success: true, testResult: updatedTestResult };
    } catch (error) {
      console.error("Compile error:", error);
      setOutput(`Error running code: ${error.message}`);
      setSnackbarMessage("Error during code compilation.");
      setSnackbarSeverity("warning");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      setOpenProgressDialog(false);
      setSnackbarOpen(true);
    }
  };
  
  // Handle code run
  const handleRun = async e => {
    e.preventDefault();
    return (await compileAndEvaluate(codeId, input, language, testCases)).success;
  };
  
  // Compile all programs
  const compileAllPrograms = async () => {
    const effectiveCodingIds = fetchedTestCodingIds.length > 0 ? fetchedTestCodingIds : (testResult.codingIds || []);
    setLoading(true);
    setOpenProgressDialog(true);
    setOutput("Processing results...\nCompiling all programs...\n");
  
    console.log(`🚀 Starting compilation for ${effectiveCodingIds.length} coding problems:`, effectiveCodingIds);
  
    let compilationErrors = 0;
    let processedResults = [];
  
    try {
      for (const [index, id] of effectiveCodingIds.entries()) {
        console.log(`\n🔄 Processing program ${index + 1}/${effectiveCodingIds.length} - ID: ${id}`);
        setOutput(prev => `${prev}\n📝 Processing program ${index + 1}/${effectiveCodingIds.length} (ID: ${id})...`);
  
        // Initialize defaults
        let codeInput = templates[language] || "";
        let codeLanguage = language;
        let codeTestCases = [{ testcase_input: "", testcase_output: "" }];
  
        // Load saved payload
        const savedPayload = localStorage.getItem(`code_${id}`);
        if (savedPayload) {
          try {
            const parsedPayload = JSON.parse(savedPayload);
            codeInput = parsedPayload.code || templates[language] || "";
            codeLanguage = Object.keys(languageApiMap).find(key => languageApiMap[key] === parsedPayload.language) || language;
            console.log(`📂 Found saved payload for ${id}:`, {
              codeLength: codeInput.length,
              language: codeLanguage,
            });
            setOutput(prev => `${prev}\n   ✅ Using saved code (${codeInput.length} chars)`);
          } catch (error) {
            console.error(`❌ Error parsing saved payload for ${id}:`, error);
            setOutput(prev => `${prev}\n   ⚠️ Error parsing saved code, using default`);
          }
        } else {
          console.log(`⚠️ No saved payload for ${id}, using default template`);
          setOutput(prev => `${prev}\n   ⚠️ No saved code found, using default template`);
          localStorage.setItem(`code_${id}`, JSON.stringify({
            language: languageApiMap[language] || language,
            code: templates[language] || "",
            testCases: [{ input: "", expectedOutput: "" }],
          }));
        }
  
        // Fetch test cases
        try {
          const code = await fetchCodeById(id);
          if (code?.code_test_cases_id?.length > 0) {
            const testCasePromises = code.code_test_cases_id.map(async testcase_id => {
              try {
                const testCase = await fetchTestCaseById(testcase_id);
                return testCase?.testcase_input && testCase?.testcase_output ? testCase : null;
              } catch (err) {
                console.error(`Error fetching test case ${testcase_id}:`, err);
                return null;
              }
            });
            const responses = await Promise.all(testCasePromises);
            codeTestCases = responses.filter(tc => tc !== null);
            console.log(`📋 Found ${codeTestCases.length} test cases for ${id}`);
            setOutput(prev => `${prev}\n   📋 Found ${codeTestCases.length} test cases`);
          } else {
            console.warn(`⚠️ No test cases for ${id}, using default`);
            setOutput(prev => `${prev}\n   ⚠️ No test cases found, using default`);
          }
        } catch (err) {
          console.error(`Error fetching code ${id}:`, err);
          setOutput(prev => `${prev}\n   ⚠️ Error fetching test cases, using default`);
        }
  
        // Compile and evaluate
        setOutput(prev => `${prev}\n   ⚙️ Compiling...`);
        const compilationResult = await compileAndEvaluate(id, codeInput, codeLanguage, codeTestCases);
  
        if (!compilationResult.success) {
          compilationErrors++;
          console.error(`❌ Compilation failed for ${id}:`, compilationResult.error);
          setOutput(prev => `${prev}\n   ❌ Compilation failed: ${compilationResult.error}`);
        } else {
          processedResults.push(compilationResult);
          console.log(`✅ Successfully compiled ${id} with score:`, compilationResult.testResult.codingResults.find(r => r.codeId === id)?.score || 0);
          setOutput(prev => `${prev}\n   ✅ Compilation successful`);
        }
      }
  
      // Final verification
      console.log(`\n🔍 Final verification started`);
      setOutput(prev => `${prev}\n\n🔄 Finalizing all results...`);
  
      let finalTestResult = testResult;
      try {
        const storedResult = localStorage.getItem("test_result");
        if (storedResult) {
          finalTestResult = JSON.parse(storedResult);
        }
      } catch (error) {
        console.error("❌ Error getting final test result:", error);
      }
  
      // Ensure all coding IDs have results
      finalTestResult.codingResults = finalTestResult.codingResults || [];
      const missingIds = effectiveCodingIds.filter(id => !finalTestResult.codingResults.some(result => result.codeId === id));
      for (const missingId of missingIds) {
        console.log(`🔧 Processing missing ID: ${missingId}`);
        setOutput(prev => `${prev}\n🔧 Processing missing result for ${missingId}...`);
  
        const savedCode = localStorage.getItem(`code_${missingId}`);
        let score = 0;
        if (savedCode) {
          try {
            const parsedCode = JSON.parse(savedCode);
            if (parsedCode.code && parsedCode.code !== templates[language] && parsedCode.code.trim().length > (templates[language]?.length || 0)) {
              score = 5; // Partial credit for attempted code
              console.log(`💡 Giving partial credit (${score}) for attempted solution`);
            }
          } catch (error) {
            console.error(`Error parsing saved code for ${missingId}:`, error);
          }
        }
  
        finalTestResult.codingResults.push({
          codeId: missingId,
          score,
          total: 10,
        });
        console.log(`➕ Added missing result:`, { codeId: missingId, score, total: 10 });
      }
  
      // Update counts
     finalTestResult.codingAnswered = finalTestResult.codingResults.length;
  finalTestResult.codingCorrect = finalTestResult.codingResults.filter(r => r.score > 0).length;
  finalTestResult.codingWrong = finalTestResult.codingResults.filter(r => r.score === 0).length;
  finalTestResult.codingNotAnswered = Math.max(0, effectiveCodingIds.length - finalTestResult.codingAnswered);
  finalTestResult.codingNotVisited = Math.max(0, effectiveCodingIds.length - finalTestResult.codingAnswered);
  finalTestResult.result_score = (finalTestResult.mcqCorrect || 0) + finalTestResult.codingResults.reduce((sum, result) => sum + result.score, 0);
  
      // Save updated result
      localStorage.setItem("test_result", JSON.stringify(finalTestResult));
      setTestResult(finalTestResult);
  
      console.log(`✅ Compilation completed with ${compilationErrors} error(s)`, {
        codingResults: finalTestResult.codingResults.length,
        totalScore: finalTestResult.result_score,
      });
      setOutput(prev => `${prev}\n✅ Compilation completed with ${compilationErrors} error(s)`);
      setOutput(prev => `${prev}\n📈 Final coding results: ${finalTestResult.codingResults.length}/${effectiveCodingIds.length} programs processed`);
      setOutput(prev => `${prev}\n🏆 Total score: ${finalTestResult.result_score}/${finalTestResult.result_total_score}`);
  
      setSnackbarMessage(`Compilation completed. ${finalTestResult.codingResults.length}/${effectiveCodingIds.length} programs processed.`);
      setSnackbarSeverity(compilationErrors > 0 ? "warning" : "success");
  
      return {
        success: true,
        errors: compilationErrors,
        processedCount: finalTestResult.codingResults.length,
        expectedCount: effectiveCodingIds.length,
        finalResult: finalTestResult,
      };
    } catch (error) {
      console.error("❌ Error compiling all programs:", error);
      setOutput(prev => `${prev}\n❌ Error compiling programs: ${error.message}`);
      setSnackbarMessage("Error compiling all programs.");
      setSnackbarSeverity("error");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      setOpenProgressDialog(false);
      setSnackbarOpen(true);
    }
  };
  
  // Handle final submission
  const handleFinalSubmit = async (isMalpractice = false) => {
    if (hasSubmitted) {
      console.log(`⏹️ Submission already completed, ignoring duplicate call`);
      return;
    }
  
    console.log(`🚀 Starting final submission process (malpractice: ${isMalpractice})`);
    setLoading(true);
    setOpenProgressDialog(true);
    setOutput("🚀 Starting final submission process...\n");
  
    try {
      // Step 1: Compile all programs
      setOutput(prev => `${prev}\n📝 Step 1: Compiling all programs...`);
      console.log(`📝 Step 1: Starting compilation process`);
  
      const compilationResult = await compileAllPrograms();
      if (!compilationResult.success) {
        throw new Error(`Compilation failed: ${compilationResult.error}`);
      }
  
      console.log(`✅ Compilation completed:`, {
        success: compilationResult.success,
        errors: compilationResult.errors,
        processed: compilationResult.processedCount,
        expected: compilationResult.expectedCount,
      });
  
      // Step 2: Show confirmation dialog if not malpractice
      if (!isMalpractice) {
        console.log(`💬 Showing confirmation dialog`);
        setSubmitConfirmDialogOpen(true);
        setLoading(false);
        setOpenProgressDialog(false);
        return;
      }
  
      // Step 3: Prepare submission data
      setOutput(prev => `${prev}\n📤 Step 2: Preparing final submission...`);
      console.log(`📤 Step 3: Preparing submission data`);
  
      let finalTestResult = compilationResult.finalResult;
      try {
        const storedTestResult = localStorage.getItem("test_result");
        if (storedTestResult) {
          finalTestResult = JSON.parse(storedTestResult);
        }
      } catch (error) {
        console.error("❌ Error retrieving final test result:", error);
      }
  
      const resultData = {
        result_user_id: finalTestResult.result_user_id || userId || "",
        result_test_id: finalTestResult.result_test_id || testId || "",
        result_poc_id: finalTestResult.result_poc_id || pocId || "",
        result_score: finalTestResult.result_score || 0,
        result_total_score: finalTestResult.result_total_score || 0,
        codingAnswered: finalTestResult.codingAnswered || 0,
        codingCorrect: finalTestResult.codingCorrect || 0,
        codingIds: finalTestResult.codingIds || [],
        codingNotAnswered: finalTestResult.codingNotAnswered || 0,
        codingNotVisited: finalTestResult.codingNotVisited || 0,
        codingWrong: finalTestResult.codingWrong || 0,
        marked: finalTestResult.marked || 0,
        mcqAnswered: finalTestResult.mcqAnswered || 0,
        mcqCorrect: finalTestResult.mcqCorrect || 0,
        mcqNotAnswered: finalTestResult.mcqNotAnswered || 0,
        mcqNotVisited: finalTestResult.mcqNotVisited || 0,
        mcqWrong: finalTestResult.mcqWrong || 0,
        studentName: finalTestResult.studentName || studentName || "",
        testLanguage: finalTestResult.testLanguage || "",
        testName: finalTestResult.testName || "",
        codingResults: finalTestResult.codingResults || [],
      };
  
      // Log submission data
      console.log(`📋 Final submission data:`, {
        codingResults: resultData.codingResults.length,
        totalScore: resultData.result_score,
        codingIds: resultData.codingIds.length,
      });
      setOutput(prev => `${prev}\n📋 Final submission data:`);
      setOutput(prev => `${prev}\n   - Coding Problems: ${resultData.codingIds.length}`);
      setOutput(prev => `${prev}\n   - Coding Results: ${resultData.codingResults.length}`);
      setOutput(prev => `${prev}\n   - Total Score: ${resultData.result_score}/${resultData.result_total_score}`);
  
      // Step 4: Submit test
      setOutput(prev => `${prev}\n🚀 Step 3: Submitting test...`);
      console.log(`🚀 Submitting test result to server`);
      await submitTestResult(resultData);
      console.log(`✅ Test submitted successfully`);
  
      // Step 5: Cleanup
      setOutput(prev => `${prev}\n🧹 Step 4: Cleaning up...`);
      console.log(`🧹 Cleaning up localStorage`);
  
      const effectiveCodingIds = fetchedTestCodingIds.length > 0 ? fetchedTestCodingIds : (testResult.codingIds || []);
      effectiveCodingIds.forEach(id => {
        try {
          localStorage.removeItem(`code_${id}`);
          console.log(`🗑️ Removed code_${id} from localStorage`);
        } catch (error) {
          console.error(`❌ Error removing code_${id}:`, error);
        }
      });
  
      // Success
      setHasSubmitted(true);
      setOutput(prev => `${prev}\n🎉 Test submitted successfully!`);
      console.log(`🎉 Final submission completed successfully`);
  
      setSnackbarMessage("Test submitted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
  
      // Navigate to results
      navigate("/test-result", { state: { resultData } });
    } catch (error) {
      console.error("💥 Final submit error:", error);
      setOutput(prev => `${prev}\n💥 Error submitting test: ${error.message}`);
      setSnackbarMessage(`Error during test submission: ${error.message}`);
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
      setOpenProgressDialog(false);
      setSnackbarOpen(true);
    }
  };
  // Confirm final submission
  const confirmFinalSubmit = async () => {
    setSubmitConfirmDialogOpen(false);
    setLoading(true);
    setOpenProgressDialog(true);
    setOutput("Processing results...\nSubmitting test for final evaluation...\n");

    try {
      const resultData = {
        result_user_id: testResult.result_user_id || userId || "",
        result_test_id: testResult.result_test_id || testId || "",
        result_poc_id: testResult.result_poc_id || pocId || "",
        result_score: testResult.result_score || 0,
        result_total_score: testResult.result_total_score || 0,
        codingAnswered: testResult.codingAnswered || 0,
        codingCorrect: testResult.codingCorrect || 0,
        codingIds: testResult.codingIds || [],
        codingNotAnswered: testResult.codingNotAnswered || 0,
        codingNotVisited: testResult.codingNotVisited || 0,
        codingWrong: testResult.codingWrong || 0,
        marked: testResult.marked || 0,
        mcqAnswered: testResult.mcqAnswered || 0,
        mcqCorrect: testResult.mcqCorrect || 0,
        mcqNotAnswered: testResult.mcqNotAnswered || 0,
        mcqNotVisited: testResult.mcqNotVisited || 0,
        mcqWrong: testResult.mcqWrong || 0,
        studentName: testResult.studentName || studentName || "",
        testLanguage: testResult.testLanguage || "",
        testName: testResult.testName || "",
        codingResults: testResult.codingResults || [],
      };

      await submitTestResult(resultData);

      const effectiveCodingIds = fetchedTestCodingIds.length > 0 ? fetchedTestCodingIds : testResult.codingIds;
      effectiveCodingIds.forEach((id) => localStorage.removeItem(`code_${id}`));

      setHasSubmitted(true);
      setOutput((prev) => `${prev}\nTest submitted successfully!`);
      setSnackbarMessage("Test submitted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      navigate("/test-result", { state: { resultData } });
    } catch (error) {
      console.error("Final submit error:", error);
      setOutput((prev) => `${prev}\nError submitting test: ${error.message}`);
      setSnackbarMessage(`Error during test submission: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setOpenProgressDialog(false);
    }
  };

  // Cancel final submission
  const cancelFinalSubmit = () => {
    setSubmitConfirmDialogOpen(false);
    setSnackbarMessage("Submission cancelled. You can continue coding.");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  // Handle navigation to the previous problem
  const handlePrevious = async () => {
    saveSubmissionPayload();
    await compileAndEvaluate(codeId, input, language, testCases);

    const effectiveCodingIds = fetchedTestCodingIds.length > 0 ? fetchedTestCodingIds : testResult.codingIds;
    if (testResult.currentCodingIndex > 0) {
      const prevCodeId = effectiveCodingIds[testResult.currentCodingIndex - 1];
      setTestResult((prev) => {
        const updatedTestResult = {
          ...prev,
          currentCodingIndex: prev.currentCodingIndex - 1,
        };
        localStorage.setItem("test_result", JSON.stringify(updatedTestResult));
        return updatedTestResult;
      });
      navigate(`/coding/${prevCodeId}`, {
        state: {
          ...testResult,
          currentCodingIndex: testResult.currentCodingIndex - 1,
        },
      });
      window.history.pushState(null, null, window.location.href);
      setSnackbarMessage("Compiled and moved to previous program.");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
    }
  };

  // Handle navigation to the next problem
  const handleNext = async () => {
    saveSubmissionPayload();
    await compileAndEvaluate(codeId, input, language, testCases);

    const effectiveCodingIds = fetchedTestCodingIds.length > 0 ? fetchedTestCodingIds : testResult.codingIds;
    if (testResult.currentCodingIndex < effectiveCodingIds.length - 1) {
      const nextCodeId = effectiveCodingIds[testResult.currentCodingIndex + 1];
      setTestResult((prev) => {
        const updatedTestResult = {
          ...prev,
          currentCodingIndex: prev.currentCodingIndex + 1,
        };
        localStorage.setItem("test_result", JSON.stringify(updatedTestResult));
        return updatedTestResult;
      });
      navigate(`/coding/${nextCodeId}`, {
        state: {
          ...testResult,
          currentCodingIndex: testResult.currentCodingIndex + 1,
        },
      });
      window.history.pushState(null, null, window.location.href);
      setSnackbarMessage("Compiled and moved to next program.");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
    }
  };

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine effective coding IDs
  const effectiveCodingIds = fetchedTestCodingIds.length > 0 ? fetchedTestCodingIds : testResult.codingIds;
  const isFirstProgram = testResult.currentCodingIndex === 0;
  const isLastProgram = testResult.currentCodingIndex >= effectiveCodingIds.length - 1;

  const visibleTestCases = testCases.slice(0, 2);
  const hiddenTestCasesCount = testCases.length - 2;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dialog open={openProgressDialog} PaperProps={{ sx: { borderRadius: 3, bgcolor: "background.paper" } }}>
        <DialogContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 4 }}>
          <CircularProgress sx={{ color: "#0c83c8" }} />
          <Typography
            variant="h6"
            color="text.primary"
            sx={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important" }}
          >
            Processing your code...
          </Typography>
        </DialogContent>
      </Dialog>
      <Dialog open={submitConfirmDialogOpen} PaperProps={{ sx: { borderRadius: 3, bgcolor: "background.paper" } }}>
        <DialogContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            color="text.primary"
            sx={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important", mb: 2 }}
          >
            Are you sure you want to submit the test?
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important" }}
          >
            This action will finalize your test and you won't be able to make further changes.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={cancelFinalSubmit}
            variant="outlined"
            sx={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important" }}
          >
            Continue Coding
          </Button>
          <Button
            onClick={confirmFinalSubmit}
            variant="contained"
            color="error"
            sx={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important" }}
          >
            Submit Test
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={instructionsOpen} onClose={() => setInstructionsOpen(false)} PaperProps={{ sx: { borderRadius: 3, bgcolor: "background.paper" } }}>
        <DialogContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            color="text.primary"
            sx={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important", mb: 2 }}
          >
            Test Instructions
          </Typography>
          <List sx={{ pl: 2 }}>
            {defaultInstructions.map((instruction, index) => (
              <ListItem key={index} disablePadding>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important" }}
                    >
                      {`${index + 1}. ${instruction}`}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setInstructionsOpen(false)}
            variant="contained"
            color="primary"
            sx={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
            fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={resetDialogOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
            fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={confirmResetEditor}
                sx={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important" }}
              >
                Reset
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={cancelResetEditor}
                sx={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important" }}
              >
                Cancel
              </Button>
            </Box>
          }
        >
          Reset editor to template? This will clear your current code.
        </Alert>
      </Snackbar>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          bgcolor: "background.default",
        }}
      >
        <Box
          sx={{
            p: { xs: 1, sm: 1.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
            <CodeIcon sx={{ color: "#0c83c8", mr: 1, fontSize: { xs: 20, sm: 28 } }} />
            <Typography
              variant="h5"
              color="text.primary"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1rem", sm: "1.5rem" },
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
              }}
            >
              {testResult.testName} - Coding Program {testResult.currentCodingIndex + 1} of {effectiveCodingIds.length || 1}
            </Typography>
            <Tooltip title="View Instructions">
              <IconButton size="small" onClick={() => setInstructionsOpen(true)} sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", bgcolor: alpha(theme.palette.primary.main, 0.1), p: 1, borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                 Time Left: {formatTime(timer)}
              </Typography>
            </Box>
                        <Box sx={{ display: "flex", alignItems: "center", bgcolor: alpha(theme.palette.primary.main, 0.1), p: 1, borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                {studentName || "User"} 
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 140 }, mr: { xs: 0.5, sm: 1 } }}>
              <Select
                value={language}
                onChange={handleLanguageChange}
                sx={{
                  height: { xs: 32, sm: 40 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  "& .MuiSelect-select": { display: "flex", alignItems: "center", py: 0.5 },
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {languageIcons[selected]}
                    <Typography
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                      }}
                    >
                      {languageNames[selected]}
                    </Typography>
                  </Box>
                )}
              >
                <MenuItem value="python">
                  <PythonIcon sx={{ mr: 1, fontSize: "small" }} /> Python
                </MenuItem>
                <MenuItem value="java">
                  <JavaIcon sx={{ mr: 1, fontSize: "small" }} /> Java
                </MenuItem>
                <MenuItem value="cpp">
                  <CppIcon sx={{ mr: 1, fontSize: "small" }} /> C++
                </MenuItem>
                <MenuItem value="c">
                  <CIcon sx={{ mr: 1, fontSize: "small" }} /> C
                </MenuItem>
                                <MenuItem value="javascript">
                  <JavascriptIcon sx={{ mr: 1, fontSize: "small" }} /> JavaScript
                </MenuItem>
              </Select>
            </FormControl>
            <FormGroup>
              <FormControlLabel
                control={<MaterialUISwitch sx={{ m: { xs: 0.5, sm: 1 } }} checked={mode === "dark"} onChange={toggleTheme} />}
                label=""
              />
            </FormGroup>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: isMobile ? "100%" : testCasesCollapsed ? "90%" : `${editorWidth}%`,
              height: isMobile ? "50%" : "auto",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "width 0.2s ease-out",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="medium"
                sx={{
                  fontSize: { xs: "0.85rem", sm: "1rem" },
                  fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                }}
              >
                Code Editor
              </Typography>
              <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 }, alignItems: "center", flexShrink: 0 }}>
                <Tooltip title="Reset Code">
                  <IconButton size="small" onClick={resetEditor}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Save Code">
                  <IconButton size="small" onClick={handleSave}>
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRun}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={12} color="inherit" /> : <PlayArrowIcon />}
                  size="small"
                  sx={{
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    px: { xs: 1, sm: 2 },
                    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                  }}
                >
                  Run
                </Button>
              </Box>
            </Box>
            <Box sx={{ flex: 1, overflow: "hidden" }}>
              <Editor
                className="monaco-editor"
                height="100%"
                language={language}
                value={input}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme={mode === "dark" ? "vs-dark" : "vs"}
                options={{
                  fontSize: 18,
                  minimap: { enabled: !isMobile },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  padding: { top: 8 },
                  smoothScrolling: true,
                  automaticLayout: true,
                  tabIndex: 0,
                  wordWrap: "on",
                  fixedOverflowWidgets: true,
                  ...(isMobile && {
                    fontSize: 16,
                    lineHeight: 24,
                    quickSuggestions: false,
                  }),
                }}
              />
            </Box>
            <Box
              sx={{
                height: outputMinimized ? "auto" : `${outputHeight}%`,
                borderTop: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                transition: "height 0.2s ease-out",
              }}
            >
              <Box
                ref={outputDividerRef}
                sx={{
                  height: 8,
                  backgroundColor: theme.palette.divider,
                  cursor: "row-resize",
                  "&:hover": { backgroundColor: "#0c83c8" },
                }}
                onMouseDown={handleOutputMouseDown}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TerminalIcon sx={{ mr: 1, fontSize: { xs: 16, sm: 20 }, color: "#0c83c8" }} />
                  <Typography
                    variant="subtitle1"
                    fontWeight="medium"
                    sx={{
                      fontSize: { xs: "0.85rem", sm: "1rem" },
                      fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                    }}
                  >
                    Output Console
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={toggleOutput}
                  aria-label={outputMinimized ? "Expand output" : "Minimize output"}
                >
                  {outputMinimized ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowUpIcon fontSize="small" />}
                </IconButton>
              </Box>
              {!outputMinimized && showOutput && (
                <Box
                  sx={{
                    flex: 1,
                    p: 1,
                    overflow: "auto",
                    fontFamily: "'Fira Code', monospace",
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    color: "text.primary",
                    bgcolor: alpha(theme.palette.background.default, 0.9),
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {output || "Run your code to see the output here."}
                </Box>
              )}
            </Box>
          </Box>
          {!isMobile && !testCasesCollapsed && (
            <Box
              ref={dividerRef}
              sx={{
                width: 8,
                backgroundColor: theme.palette.divider,
                cursor: "col-resize",
                "&:hover": { backgroundColor: "#0c83c8" },
              }}
              onMouseDown={handleMouseDown}
            />
          )}
          <Box
            sx={{
              width: isMobile
                ? "100%"
                : testCasesCollapsed
                ? "10%"
                : `${100 - editorWidth - (testCasesCollapsed ? 0 : 1)}%`,
              height: isMobile ? "50%" : "auto",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderLeft: isMobile ? 0 : 1,
              borderTop: isMobile ? 1 : 0,
              borderColor: "divider",
              transition: "width 0.2s ease-out",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FormatListNumberedIcon sx={{ mr: 1, fontSize: { xs: 16, sm: 20 }, color: "#fc7a46" }} />
                <Typography
                  variant="subtitle1"
                  fontWeight="medium"
                  sx={{
                    fontSize: { xs: "0.85rem", sm: "1rem" },
                    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                  }}
                >
                  Problem & Test Cases
                </Typography>
                {!testCasesCollapsed && (
                  <Chip
                    label={testCases.length}
                    size="small"
                    color="secondary"
                    sx={{ ml: 1, height: { xs: 18, sm: 20 }, fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                  />
                )}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
                {isMobile ? (
                  <IconButton
                    size="small"
                    onClick={() => setShowTestCases(!showTestCases)}
                    aria-label={showTestCases ? "Collapse test cases" : "Expand test cases"}
                  >
                    {showTestCases ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                  </IconButton>
                ) : (
                  <Tooltip title={testCasesCollapsed ? "Expand" : "Collapse"}>
                    <IconButton
                      size="small"
                      onClick={toggleTestCases}
                      aria-label={testCasesCollapsed ? "Expand test cases" : "Collapse test cases"}
                    >
                      {testCasesCollapsed ? <KeyboardArrowLeftIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
            {isMobile && !showTestCases && (
              <Box
                sx={{
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                  }}
                >
                  {testCases.length} test case{testCases.length !== 1 ? "s" : ""} available
                </Typography>
              </Box>
            )}
            {!testCasesCollapsed && showTestCases && (
              <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <CircularProgress sx={{ color: "#0c83c8" }} />
                  </Box>
                ) : selectedCode ? (
                  <>
                    <Card sx={{ mb: 1 }}>
                      <CardContent sx={{ p: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight="medium"
                            sx={{
                              fontSize: { xs: "0.85rem", sm: "1rem" },
                              fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                            }}
                          >
                            {selectedCode.code_title || "Problem"}
                          </Typography>
                          <Chip
                            label={"10 Mark"}
                            size="small"
                            sx={{
                              bgcolor:
                                selectedCode.code_difficulty === "Easy"
                                  ? "#00af9b"
                                  : selectedCode.code_difficulty === "Hard"
                                  ? "#ff375f"
                                  : "#ffa116",
                              color: "white",
                              fontWeight: "bold",
                              height: { xs: 18, sm: 20 },
                              fontSize: { xs: "0.65rem", sm: "0.75rem" },
                            }}
                          />
                        </Box>
                        <Divider sx={{ mb: 1 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                            color: "text.secondary",
                            whiteSpace: "pre-wrap",
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          }}
                        >
                          {selectedCode.code_problem_statement}
                        </Typography>
                      </CardContent>
                    </Card>
                    {testCases.length > 0 ? (
                      <Stack spacing={1}>
                        {visibleTestCases.map((tc, i) => (
                          <Card key={i} sx={{ position: "relative" }}>
                            <CardContent sx={{ p: 1 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="medium"
                                  sx={{
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                                  }}
                                >
                                  Test Case #{i + 1}
                                </Typography>
                              </Box>
                              <Divider sx={{ mb: 1 }} />
                              {tc.testcase_input && (
                                <Typography
                                  sx={{
                                    fontFamily: "'Fira Code', monospace",
                                    color: "text.secondary",
                                    mb: 0.5,
                                    p: 1,
                                    bgcolor: alpha(theme.palette.background.default, 0.7),
                                    borderRadius: 1,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                  }}
                                >
                                  <strong>Input:</strong>
                                  <br />
                                  {Array.isArray(tc.testcase_input)
                                    ? tc.testcase_input.join("\n")
                                    : tc.testcase_input || "No input provided"}
                                </Typography>
                              )}
                              {tc.testcase_output && (
                                <Typography
                                  sx={{
                                    fontFamily: "'Fira Code', monospace",
                                    color: "text.secondary",
                                    p: 1,
                                    bgcolor: alpha(theme.palette.background.default, 0.7),
                                    borderRadius: 1,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                  }}
                                >
                                  <strong>Expected Output:</strong>
                                  <br />
                                  {Array.isArray(tc.testcase_output)
                                    ? tc.testcase_output.join("\n")
                                    : tc.testcase_output || "No output provided"}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                        {hiddenTestCasesCount > 0 && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                              fontSize: { xs: "0.7rem", sm: "0.8rem" },
                              p: 1,
                            }}
                          >
                            + {hiddenTestCasesCount} hidden test cases
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          p: 1,
                        }}
                      >
                        No test cases available for this problem.
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                      fontSize: { xs: "0.7rem", sm: "0.8rem" },
                      p: 1,
                    }}
                  >
                    No problem selected or failed to load problem data.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: { xs: 1, sm: 1.5 },
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handlePrevious}
              disabled={isFirstProgram || loading}
              startIcon={<NavigateBeforeIcon />}
              size="small"
              sx={{
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
              }}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleNext}
              disabled={isLastProgram || loading}
              endIcon={<NavigateNextIcon />}
              size="small"
              sx={{
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
              }}
            >
              Next
            </Button>
          </Box>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleFinalSubmit(false)}
            disabled={loading}
            startIcon={<DoneIcon />}
            size="small"
            sx={{
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
            }}
          >
            Submit Test
          </Button>
        </Box>
      </Box>
      {showFullScreenPrompt && (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1300,
          }}
        >
        </Box>
      )}
    </ThemeProvider>
  );
};

export default CodingPage;