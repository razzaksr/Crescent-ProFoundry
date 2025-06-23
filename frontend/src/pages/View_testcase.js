import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import { fetchAllTestCases } from "../axios";
import Admin_Dashboard from "../components/AdminDash";

const TestcaseGrid = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  useEffect(() => {
    const getTestCases = async () => {
      try {
        const response = await fetchAllTestCases();
        const data = Array.isArray(response.data) ? response.data : [];
        const formattedRows = data.map((item, index) => ({
          id: item._id || `temp-id-${index}`,
          testcase_id: item.testcase_id || "N/A",
          input: Array.isArray(item.testcase_input)
            ? item.testcase_input.join(", ")
            : item.testcase_input || "N/A",
          output: Array.isArray(item.testcase_output)
            ? item.testcase_output.join(", ")
            : item.testcase_output || "N/A",
          tags: Array.isArray(item.testcase_tags) ? [...new Set(item.testcase_tags)] : [],
          createdAt: item.createdAt && !isNaN(new Date(item.createdAt))
            ? new Date(item.createdAt).toLocaleString()
            : "N/A",
          updatedAt: item.updatedAt && !isNaN(new Date(item.updatedAt))
            ? new Date(item.updatedAt).toLocaleString()
            : "N/A",
        }));
        setRows(formattedRows);
      } catch (error) {
        setSnackbarMessage(
          `Failed to fetch test cases: ${
            error.response?.data?.error || error.message || "Unknown error"
          }`
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    getTestCases();
  }, []);

  const renderTagChips = (tags) => {
    if (!Array.isArray(tags) || tags.length === 0) {
      return (
        <Typography variant="body2" sx={{ fontSize: { xs: "12px", sm: "14px" } }}>
          No tags
        </Typography>
      );
    }
    return tags.map((tag, index) => (
      <Chip
        key={index}
        label={tag.trim()}
        size="small"
        sx={{
          m: 0.5,
          backgroundColor: "#e3f2fd",
          color: "#0c83c8",
          fontSize: { xs: "10px", sm: "12px" },
          fontWeight: 500,
          "&:hover": { backgroundColor: "#d1e9ff" },
        }}
      />
    ));
  };

  const columns = [
    {
      field: "input",
      headerName: "Input",
      minWidth: 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography variant="inherit" fontWeight="bold">
            Input
          </Typography>
        </Box>
      ),
    },
    {
      field: "output",
      headerName: "Output",
      minWidth: 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography variant="inherit" fontWeight="bold">
            Output
          </Typography>
        </Box>
      ),
    },
    {
      field: "tags",
      headerName: "Tags",
      minWidth: 300,
      flex: 1.2,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography variant="inherit" fontWeight="bold">
            Tags
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, py: 1 }}>
          {renderTagChips(params.value)}
        </Box>
      ),
    },
    // {
    //   field: "createdAt",
    //   headerName: "Created At",
    //   minWidth: 180,
    //   flex: 1,
    //   renderHeader: () => (
    //     <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
    //       <Typography variant="inherit" fontWeight="bold">
    //         Created At
    //       </Typography>
    //     </Box>
    //   ),
    // },
    // {
    //   field: "updatedAt",
    //   headerName: "Updated At",
    //   minWidth: 180,
    //   flex: 1,
    //   renderHeader: () => (
    //     <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
    //       <Typography variant="inherit" fontWeight="bold">
    //         Updated At
    //       </Typography>
    //     </Box>
    //   ),
    // },
  ];

  const dataGridSx = {
    borderRadius: "12px",
    "& .MuiDataGrid-columnHeaders": {
      background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
      color: "#0c83c8",
      fontWeight: "600",
      fontSize: { xs: "14px", sm: "15px" },
    },
    "& .MuiDataGrid-row": {
      "&:nth-of-type(odd)": { backgroundColor: "#f8fafc" },
      "&:hover": { backgroundColor: "#e3f2fd" },
    },
    "& .MuiDataGrid-cell": {
      fontSize: { xs: "12px", sm: "14px" },
      borderBottom: "1px solid #e5e7eb",
    },
    "& .MuiCheckbox-root": {
      color: "#0c83c8",
      "&.Mui-checked": { color: "#fc7a46" },
    },
    boxShadow: "0 2px 8px rgba(12, 131, 200, 0.05)",
    border: "none",
  };

  return (
    <>
      <Admin_Dashboard />
      <Box
        sx={{
          padding: { xs: 2, sm: 3, md: 4 },
          backgroundColor: "#f5f7fa",
          minHeight: "100vh",
        }}
      >
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(12, 131, 200, 0.08)",
            mb: { xs: 3, sm: 4 },
            backgroundColor: "#ffffff",
          }}
        >
          <Paper
            sx={{
              mb: 4,
              p: { xs: 2, sm: 3 },
              background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
              color: "#ffffff",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: "700",
                fontSize: { xs: "1.8rem", sm: "2.2rem" },
              }}
            >
              Test Case Management
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ mt: 0.5, fontSize: { xs: "12px", sm: "14px" } }}
            >
              View and manage all test cases
            </Typography>
          </Paper>
          <Paper
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(12, 131, 200, 0.08)",
              backgroundColor: "#ffffff",
            }}
          >
            <Box sx={{ height: { xs: 400, sm: 600 }, width: "100%" }}>
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <CircularProgress sx={{ color: "#0c83c8" }} />
                </Box>
              ) : (
                <DataGrid
                  rows={rows}
                  columns={columns}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  pageSizeOptions={[10, 20]}
                  getRowId={(row) => row.id}
                  sx={dataGridSx}
                />
              )}
            </Box>
          </Paper>
        </Paper>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            variant="filled"
            sx={{
              background:
                snackbarSeverity === "success"
                  ? "linear-gradient(90deg, #0c83c8, #fc7a46)"
                  : undefined,
              fontSize: { xs: "12px", sm: "14px" },
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default TestcaseGrid;