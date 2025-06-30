import React, { useState, useEffect, useRef } from "react";
import { BookOpen, FileText } from "lucide-react";
import AssessmentScores from "../components/StudentDashboard/AssessmentScores";
import UpcomingDeadlines from "../components/StudentDashboard/UpcomingDeadlines";
import {
  fetchAggregateScores,
  fetchModuleAndPoc,
  fetchExpertName,
  fetchModuleName,
  fetchOrgName,
  checkIfTestTaken,
  fetchTestsToday,
  fetchPocCertStatus,
} from "../axios";
import CourseInfoCards from "../components/StudentDashboard/CourseInfoCards";
import Dash from "../components/StudentDashboard/dash";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import CertificateGenerator from "../components/certificate";

export default function StudentDashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [studentName, setStudentName] = useState("Loading...");
  const [coordinatorName, setCoordinatorName] = useState("Loading...");
  const [modId, setModId] = useState(null);
  const [pocId, setPocId] = useState(null);
  const [expertName, setExpertName] = useState("Loading...");
  const [moduleName, setModuleName] = useState("Loading...");
  const [orgName, setOrgName] = useState("Loading...");
  const [testIds, setTestIds] = useState([]);
  const [testStatuses, setTestStatuses] = useState({}); // { testId: boolean }
  const [userId, setUserId] = useState(null);
  const [courseProgress, setCourseProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canDownloadCertificate, setCanDownloadCertificate] = useState(false);
  const certificateRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Clear localStorage except for 'true' and 'isLoggedIn'
    const preserveKeys = ["true", "isLoggedIn"];
    Object.keys(localStorage).forEach((key) => {
      if (!preserveKeys.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Clear browser history and clear current page as only entry
    window.history.replaceState(null, null, window.location.href);

    const storedUser = localStorage.getItem("true");

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log("User data from localStorage:", userData);

        setStudentName(userData.user.full_name || "Student");
        setUserId(userData.user.user_id);
        setModId(userData.user.mod_poc_id.mod_id);
        setPocId(userData.user.mod_poc_id.mod_poc_id);
        console.log("User Admin:", userData.user.admin);

        if (userData?.user?.user_id && userData?.user?.mod_poc_id?.mod_poc_id) {
          fetchDashboardData(
            userData.user.user_id,
            userData.user.mod_poc_id.mod_id,
            userData.user.mod_poc_id.mod_poc_id
          );
        } else {
          console.warn("Incomplete user data in localStorage:", userData);
          setError("User session invalid");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        setError("Failed to load user data");
        setIsLoading(false);
      }
    } else {
      console.warn("No user found in localStorage");
      setError("Please log in");
      setIsLoading(false);
    }
  }, []);

  const fetchDashboardData = async (userId, modId, modPocId) => {
    try {
      setIsLoading(true);

      const modulePocData = await fetchModuleAndPoc(userId);
      console.log("Module and POC data:", modulePocData);

      setModId(modulePocData.mod_id || null);
      setPocId(modulePocData.mod_poc_id || null);
      setCoordinatorName(modulePocData.mod_poc_name || "Not assigned");

      // Fetch certificate status
      const certStatus = await fetchPocCertStatus(modPocId);
      setCanDownloadCertificate(certStatus === true);

      if (modulePocData.mod_id) {
        const [expertData, moduleData, orgData] = await Promise.all([
          fetchExpertName(modulePocData.mod_id),
          fetchModuleName(modulePocData.mod_id),
          fetchOrgName(modulePocData.mod_id),
        ]);

        setExpertName(expertData.mod_expert_name || "Not assigned");
        setModuleName(moduleData.mod_name || "Unknown module");
        setOrgName(orgData.org_name || "Unknown organization");
      }

      if (userId && modulePocData.mod_poc_id) {
        await fetchCourseProgress(userId, modulePocData.mod_poc_id);
      }
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodayTests = async (pocId, userId) => {
    try {
      const testsData = await fetchTestsToday(pocId);
      console.log("Today's tests data:", testsData);

      const tests = testsData.test_ids || [];
      if (tests.length > 0) {
        console.log("Test IDs for today:", tests);
        setTestIds(tests);

        // Check status for all tests
        const statusPromises = tests.map(async (testId) => {
          try {
            const result = await checkIfTestTaken(userId, testId);
            console.log(`Check Test Response for ${testId}:`, result);
            return { testId, hasTaken: result.length > 0 };
          } catch (error) {
            console.error(`Error checking test status for ${testId}:`, error);
            return { testId, hasTaken: false };
          }
        });

        const statuses = await Promise.all(statusPromises);
        const statusMap = statuses.reduce((acc, { testId, hasTaken }) => {
          acc[testId] = hasTaken;
          return acc;
        }, {});
        setTestStatuses(statusMap);
        console.log("Test statuses:", statusMap);
      } else {
        console.warn("No tests available for today");
        setTestIds([]);
        setTestStatuses({});
      }
    } catch (testError) {
      console.error("Failed to fetch today's tests:", testError);
      setError("Failed to load today's tests");
      setTestIds([]);
      setTestStatuses({});
    }
  };

  const fetchCourseProgress = async (userId, modPocId) => {
    try {
      const response = await fetchAggregateScores(modPocId, userId);
      console.log("Course progress data:", response);

      if (response.response && response.response.average_percentage) {
        const averagePercentage = response.response.average_percentage;
        setCourseProgress(Math.floor(averagePercentage));
      } else {
        setCourseProgress(0);
      }
    } catch (error) {
      console.error("Error fetching course progress:", error);
      setCourseProgress(0);
    }
  };

  useEffect(() => {
    if (pocId && userId) {
      console.log("Fetching tests for pocId:", pocId);
      fetchTodayTests(pocId, userId);
    }
  }, [pocId, userId]);

  const styles = {
    container: {
      display: "grid",
      gridTemplateRows: "auto 1fr",
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif",
    },
    mainContent: {
      display: "grid",
      gridTemplateColumns: "1fr",
      padding: "24px",
      maxWidth: "1400px",
      margin: "0 auto",
      width: "100%",
      boxSizing: "border-box",
    },
    header: {
      background: `linear-gradient(135deg, #38b6ff 0%, #2a8cc0 100%)`,
      color: "white",
      padding: "24px",
      borderRadius: "0 0 20px 20px",
      boxShadow: "0 4px 20px rgba(56, 182, 255, 0.2)",
      marginBottom: "24px",
    },
    headerTitle: {
      fontSize: "clamp(24px, 5vw, 28px)",
      fontWeight: "700",
      marginBottom: "8px",
    },
    headerSubtitle: {
      fontSize: "clamp(14px, 3vw, 16px)",
      opacity: "0.9",
      marginBottom: "16px",
    },
    buttonContainer: {
      display: "flex",
      gap: "12px",
      marginTop: "16px",
      flexWrap: "wrap",
    },
    progressCircle: {
      position: "relative",
      width: "clamp(150px, 25vw, 200px)",
      height: "clamp(150px, 25vw, 200px)",
      borderRadius: "50%",
      background: `conic-gradient(#ff66c4 ${courseProgress}%, rgba(255,255,255,0.2) 0)`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      margin: "0 auto",
    },
    innerCircle: {
      position: "absolute",
      inset: "10px",
      borderRadius: "50%",
      background: "rgba(56, 182, 255, 0.8)",
    },
    progressText: {
      position: "relative",
      textAlign: "center",
      zIndex: "1",
    },
    progressPercentage: {
      fontSize: "clamp(28px, 6vw, 36px)",
      fontWeight: "bold",
    },
    progressLabel: {
      fontSize: "clamp(12px, 2.5vw, 14px)",
    },
    statCard: {
      padding: "12px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      minHeight: "70px",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    iconWrapper: {
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    statTitle: {
      fontSize: "clamp(10px, 2vw, 12px)",
      color: "#6b7280",
      marginBottom: "4px",
    },
    statValue: {
      fontSize: "clamp(14px, 2.5vw, 16px)",
      fontWeight: "600",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    sectionSpacing: {
      marginBottom: "24px",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      width: "100%",
    },
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleTestModuleClick = () => {
    if (testIds.length === 0) {
      console.warn("No test IDs available");
      alert("No tests are scheduled for today. Please check back tomorrow or contact your coordinator.");
      return;
    }

    // Check if all tests are taken
    const allTestsTaken = testIds.every((testId) => testStatuses[testId] === true);
    if (allTestsTaken) {
      console.log("All tests completed for today");
      alert("You have completed all tests scheduled for today.");
      return;
    }

    // Find the first uncompleted test
    const firstUncompletedTestId = testIds.find((testId) => !testStatuses[testId]);
    console.log("Navigating to test:", firstUncompletedTestId);
    navigate(`/test-intro/${firstUncompletedTestId}`);
  };

  const handleDownloadCertificate = async () => {
    try {
      if (certificateRef.current) {
        await certificateRef.current.handleDownloadCertificate();
      } else {
        throw new Error("Certificate generator not initialized");
      }
    } catch (error) {
      console.error("Certificate generation failed:", error);
      alert("Failed to generate certificate.");
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <Box style={styles.loadingContainer}>
          <CircularProgress
            size={isMobile ? "60px" : "80px"}
            sx={{ color: "#38b6ff" }}
          />
        </Box>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <Box style={styles.loadingContainer}>
          <p style={{ color: "#ff4444", textAlign: "center", fontSize: "clamp(14px, 3vw, 16px)" }}>
            {error}
          </p>
        </Box>
      </div>
    );
  }

  const allTestsTaken = testIds.length > 0 && testIds.every((testId) => testStatuses[testId] === true);

  return (
    <div style={styles.container}>
      <Dash certificateRef={certificateRef} />
      <CertificateGenerator ref={certificateRef} />
      <div style={styles.mainContent}>
        <div style={{ ...styles.header, ...styles.sectionSpacing }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "7fr 5fr",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <div>
              <h1 style={styles.headerTitle}>Welcome back, {studentName}!</h1>
              <p style={styles.headerSubtitle}>
                Continue your learning journey with {moduleName}
              </p>
              <div style={styles.buttonContainer}>
                <button
                  style={{
                    backgroundColor: testIds.length === 0 || allTestsTaken ? "#cccccc" : "#ff66c4",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: testIds.length === 0 || allTestsTaken ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onClick={handleTestModuleClick}
                  disabled={testIds.length === 0 || allTestsTaken}
                  onMouseOver={(e) => {
                    if (testIds.length > 0 && !allTestsTaken) {
                      e.currentTarget.style.backgroundColor = "#e55ab2";
                      e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0, 0, 0, 0.2)";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (testIds.length > 0 && !allTestsTaken) {
                      e.currentTarget.style.backgroundColor = "#ff66c4";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                >
                  <FileText size={18} />
                  Take Tests
                </button>
                {canDownloadCertificate && (
                  <button
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: "1px solid white",
                      borderRadius: "8px",
                      fontWeight: "600",
                      padding: "10px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onClick={handleDownloadCertificate}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#2a8cc0";
                      e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0, 0, 0, 0.2)";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <BookOpen size={18} />
                    Download Certificate
                  </button>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingTop: isMobile ? "16px" : "0",
              }}
            >
              <div style={styles.progressCircle}>
                <div style={styles.innerCircle}></div>
                <div style={styles.progressText}>
                  <div style={styles.progressPercentage}>{courseProgress}%</div>
                  <div style={styles.progressLabel}>Course Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CourseInfoCards
          orgName={orgName}
          moduleName={moduleName}
          expertName={expertName}
          coordinatorName={coordinatorName}
          styles={styles}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <AssessmentScores />
          <UpcomingDeadlines />
        </div>
      </div>
    </div>
  );
}