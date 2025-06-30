import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fetchResultsByUserAndPoc } from "../../axios";

const AssessmentScores = () => {
  const [assessmentData, setAssessmentData] = useState([]);

  const styles = {
    card: {
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      transition: "all 0.3s ease",
      minHeight: "350px",
      backgroundColor: "white",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      boxSizing: "border-box",
    },
    cardHeader: {
      padding: "16px",
      background: "linear-gradient(135deg, #38b6ff 0%, #2a8cc0 100%)",
      color: "white",
    },
    cardTitle: { fontSize: "18px", fontWeight: "600", marginBottom: "6px" },
    cardSubtitle: { fontSize: "12px", opacity: "0.9", marginBottom: "0" },
    cardContent: {
      padding: "16px",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
    },
    chartContainer: {
      height: "250px",
      width: "100%",
      marginTop: "12px",
      flexGrow: 1,
    },
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: "#fff",
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}>
          <p style={{ margin: "0", fontWeight: "bold" }}>{label}</p>
          <p style={{ margin: "4px 0", color: "#38b6ff" }}>Obtained Score: {data.scored}</p>
          <p style={{ margin: "4px 0", color: "#f06292" }}>Total Score: {data.total}</p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("true");
        if (!storedUser) {
          console.warn("No user found in localStorage");
          setAssessmentData([]);
          return;
        }

        const userData = JSON.parse(storedUser);
        const currentUserId = userData?.user?.user_id;
        const currentPocId = userData?.user?.mod_poc_id?.mod_poc_id;

        if (!currentUserId || !currentPocId) {
          console.warn("No user ID or POC ID available in localStorage");
          setAssessmentData([]);
          return;
        }

        const resultData = await fetchResultsByUserAndPoc(currentUserId, currentPocId);
        if (resultData?.success && Array.isArray(resultData.data) && resultData.data.length > 0) {
          const transformedData = resultData.data.map((result, index) => ({
            name: `Assessment ${index + 1}`,
            scored: result.result_score || 0,
            total: result.result_total_score || 0,
          }));
          setAssessmentData(transformedData);
        } else {
          setAssessmentData([]);
        }
      } catch (error) {
        console.error("Error fetching assessment data:", error);
        setAssessmentData([]);
      }
    };

    fetchData();
  }, []);

  return (
    <div
      style={styles.card}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.1)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.05)";
      }}
    >
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>Assessment Scores</h2>
        <p style={styles.cardSubtitle}>Your performance in recent assessments</p>
      </div>
      <div style={styles.cardContent}>
        <div style={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={assessmentData}
              margin={{ top: 16, right: 16, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, Math.max(...assessmentData.map(d => d.total), 50)]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="scored" fill="#38b6ff" radius={[4, 4, 0, 0]} name="Obtained Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AssessmentScores;