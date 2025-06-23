import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Paper, Chip } from "@mui/material";
import Admin_Dashboard from "../components/AdminDash";
import { fetchAllCodes } from "../axios";

const Codingpage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const getCodes = async () => {
      try {
        setLoading(true);
        const response = await fetchAllCodes();
        const codesArray = response.codes || [];
        if (!Array.isArray(codesArray)) {
          throw new Error("Data is not an array");
        }

        const formattedRows = codesArray.map((item, index) => ({
          id: item._id || `temp-id-${index}`,
          problem: item.code_problem_statement || "N/A",
          testCasesCount: Array.isArray(item.code_test_cases_id)
            ? item.code_test_cases_id.length
            : Array.isArray(item.code_test_cases)
            ? item.code_test_cases.length
            : 0,
          tags: Array.isArray(item.code_tags) ? item.code_tags : [],
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A",
          updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "N/A",
        }));
        setRows(formattedRows);
      } catch (error) {
        console.error("Error fetching code data:", error);
        setError("Unable to fetch coding problems. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    getCodes();
  }, []);

  const columns = [
    {
      field: "problem",
      headerName: "Problem Statement",
      minWidth: 300,
      flex: 1.5,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography variant="inherit" fontWeight="bold">
            Problem Statement
          </Typography>
        </Box>
      ),
    },
    {
      field: "testCasesCount",
      headerName: "No of Test Cases",
      minWidth: 150,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography variant="inherit" fontWeight="bold">
            No of Test Cases
          </Typography>
        </Box>
      ),
    },
    {
      field: "tags",
      headerName: "Tags",
      minWidth: 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography variant="inherit" fontWeight="bold">
            Tags
          </Typography>
        </Box>
      ),
      renderCell: (params) => {
        const tags = params.value;
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, py: 1 }}>
            {tags.length > 0 ? (
              tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{
                    backgroundColor: "#e3f2fd",
                    color: "#0c83c8",
                    fontSize: { xs: "10px", sm: "12px" },
                    fontWeight: 500,
                  }}
                />
              ))
            ) : (
              <Typography variant="body2" sx={{ fontSize: { xs: "12px", sm: "14px" } }}>
                No tags
              </Typography>
            )}
          </Box>
        );
      },
    },
    // {
    //   field: "createdAt",
    //   headerName: "Created At",
    //   minWidth: 180,
    //   flex: 0.8,
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
    //   flex: 0.8,
    //   renderHeader: () => (
    //     <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
    //       <Typography variant="inherit" fontWeight="bold">
    //         Updated At
    //       </Typography>
    //     </Box>
    //   ),
    // },
  ];

  return (
    <>
      <Admin_Dashboard />
      <Box sx={{ padding: { xs: 2, sm: 4 }, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        {/* Gradient Header */}
        <Box
          sx={{
            background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
            padding: { xs: 2, sm: 3 },
            color: "white",
            borderRadius: "12px",
            textAlign: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold", fontSize: { xs: "1.5rem", sm: "2rem" } }}>
            Coding Management
          </Typography>
          <Typography variant="subtitle2" sx={{ fontSize: { xs: "12px", sm: "14px" } }}>
            Manage and review all coding problems in one place
          </Typography>
        </Box>

        {/* DataGrid Container */}
        <Paper
          elevation={4}
          sx={{
            p: { xs: 1, sm: 2 },
            borderRadius: "16px",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
            border: "2px solid #0c83c8",
          }}
        >
          <Box sx={{ height: { xs: 400, sm: 600 }, width: "100%" }}>
            {error ? (
              <Typography variant="body1" color="error" sx={{ textAlign: "center", mt: 2 }}>
                {error}
              </Typography>
            ) : (
              <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[10, 20, 50]}
                getRowId={(row) => row.id}
                loading={loading}
                sx={{
                  borderRadius: 2,
                  bgcolor: "white",
                  "& .MuiDataGrid-columnHeaders": {
                    background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
                    color: "#0c83c8",
                    fontSize: { xs: "14px", sm: "16px" },
                  },
                  "& .MuiDataGrid-cell": {
                    fontSize: { xs: "12px", sm: "14px" },
                  },
                  "& .MuiDataGrid-footerContainer": {
                    backgroundColor: "#f0f2ff",
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#f9f9f9",
                  },
                }}
              />
            )}
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default Codingpage;