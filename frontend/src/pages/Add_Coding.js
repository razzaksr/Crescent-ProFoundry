
import React from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Admin_Dashboard from "../components/AdminDash";
import { createCodeProblem } from "../axios";

const Add_Coding = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [problemStatement, setProblemStatement] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = React.useState(false);

  const handleSubmit = async () => {
    if (!problemStatement.trim()) {
      setOpenError(true);
      return;
    }

    try {
      await createCodeProblem(problemStatement, tags);
      setOpenSuccess(true);
      handleClear();
    } catch (err) {
      console.error(err);
      setOpenError(true);
    }
  };

  const handleClear = () => {
    setProblemStatement("");
    setTags("");
  };

  const handleCloseSnackbar = () => {
    setOpenSuccess(false);
    setOpenError(false);
  };

  return (
    <>
      <Admin_Dashboard />
      <Container
        maxWidth="md"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: { xs: 2, sm: 3, md: 4 },
          backgroundColor: "#f5f7fa",
        }}
      >
        <Paper
          sx={{
            width: "100%",
            overflow: "hidden",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(12, 131, 200, 0.08)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
              padding: { xs: "16px", sm: "20px", md: "24px" },
              color: "#ffffff",
              opacity: 0,
              animation: "fadeIn 0.5s forwards",
              "@keyframes fadeIn": {
                from: { opacity: 0, transform: "translateY(20px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
              }}
            >
              Add Code Problem
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                opacity: 0.9,
                mt: 0.5,
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
              }}
            >
              Add a new coding question for assessment
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 1,
                fontWeight: 600,
                background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "1rem", sm: "1.1rem" },
              }}
            >
              Problem Statement
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={4}
              placeholder="Write a function to check if a number is prime."
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&:hover fieldset": { borderColor: "#0c83c8" },
                  "&.Mui-focused fieldset": { borderColor: "#fc7a46" },
                },
                "& .MuiInputLabel-root": {
                  color: "#0c83c8",
                  "&.Mui-focused": { color: "#fc7a46" },
                },
                "& .MuiFormHelperText-root": { color: "#4b5563" },
              }}
              aria-label="Problem statement input"
            />

            <Typography
              variant="subtitle1"
              sx={{
                mb: 1,
                fontWeight: 600,
                background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "1rem", sm: "1.1rem" },
              }}
            >
              Tags
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter tags separated by commas (e.g., maths, loops, prime)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&:hover fieldset": { borderColor: "#0c83c8" },
                  "&.Mui-focused fieldset": { borderColor: "#fc7a46" },
                },
                "& .MuiInputLabel-root": {
                  color: "#0c83c8",
                  "&.Mui-focused": { color: "#fc7a46" },
                },
                "& .MuiFormHelperText-root": { color: "#4b5563" },
              }}
              aria-label="Tags input"
            />

            {/* Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 3,
                pt: 3,
                borderTop: "1px solid #e5e7eb",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                size="large"
                onClick={handleClear}
                sx={{
                  borderRadius: "8px",
                  px: { xs: 2, sm: 3 },
                  py: 1,
                  color: "#0c83c8",
                  borderColor: "#0c83c8",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#fc7a46",
                    color: "#fc7a46",
                    backgroundColor: "#e3f2fd",
                  },
                }}
                aria-label="Clear form"
              >
                Clear Form
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                sx={{
                  borderRadius: "8px",
                  px: { xs: 3, sm: 4 },
                  py: 1,
                  background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
                  color: "#ffffff",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    background: "linear-gradient(90deg, #fc7a46, #0c83c8)",
                  },
                }}
                aria-label="Submit problem"
              >
                Submit Problem
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Snackbars */}
        <Snackbar
          open={openSuccess}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ mt: 2, mr: 2 }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            variant="filled"
            sx={{
              width: "100%",
              background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
              color: "#ffffff",
              fontSize: "0.9rem",
              "& .MuiAlert-icon": { color: "#ffffff" },
            }}
            icon={<CheckCircleOutlineIcon />}
          >
            Code problem successfully submitted!
          </Alert>
        </Snackbar>

        <Snackbar
          open={openError}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ mt: 2, mr: 2 }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            variant="filled"
            sx={{
              width: "100%",
              fontSize: "0.9rem",
            }}
            icon={<ErrorOutlineIcon />}
          >
            Problem statement is required or submission failed.
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Add_Coding;
