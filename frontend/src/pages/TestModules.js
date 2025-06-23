import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Grid,
  Alert,
} from "@mui/material";
import { Clock, Award } from "lucide-react";
import { fetchModuleAndPoc, getTestById } from "../axios"; // <-- Axios functions

const TestModule = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchTests = useCallback(async (userId) => {
    setLoading(true);
    try {
      const response = await fetchModuleAndPoc(userId);
      console.log("Fetched tests:", response.test_ids);

      if (response?.mod_id) {
        localStorage.setItem("mod_id", response.mod_id);
      }

      if (response?.test_ids?.length) {
        const testDetails = await Promise.all(
          response.test_ids.map((testId) => getTestById(testId))
        );
        setTests(testDetails);
      } else {
        setTests([]);
        setError("No tests available.");
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
      setError("Failed to load tests.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("true");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.user?.user_id) {
          fetchTests(user.user.user_id);
        }
      } catch (error) {
        console.error("Error parsing user:", error);
      }
    }
  }, [fetchTests]);

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ textAlign: "center", color: "#2C3E50" }}
      >
        Test Modules
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {tests.map((test) => {
            const hasMCQs = Array.isArray(test.test_mcq_id) && test.test_mcq_id.length > 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={test.test_id}>
                <Card
                  sx={{
                    p: 2,
                    boxShadow: 4,
                    borderRadius: 3,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
                    },
                    background: "linear-gradient(135deg, #6DD5FA, #2980B9)",
                    color: "#fff",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {test.test_name}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Clock size={18} color="#f1c40f" />
                      <Typography variant="body2" sx={{ fontSize: "14px" }}>
                        {test.duration || "60 mins"}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Award size={18} color="#e74c3c" />
                      <Typography variant="body2" sx={{ fontSize: "14px" }}>
                        {test.difficulty || "Medium"}
                      </Typography>
                    </Box>
                  </CardContent>

                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      width: "100%",
                      backgroundColor: "#27AE60",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#229954" },
                    }}
                    onClick={() => {
                      if (hasMCQs) {
                        navigate(`/mcq-test/${test.test_id}`, {
                          state: {
                            testMcqIds: test.test_mcq_id,
                            testTotalScore: test.test_total_score,
                          },
                        });
                      } else {
                        console.error("No MCQs for this test");
                      }
                    }}
                    disabled={!hasMCQs}
                  >
                    Start Test
                  </Button>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default TestModule;
