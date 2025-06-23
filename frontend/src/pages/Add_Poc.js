import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { User, Mail, Phone, BadgeCheck, ShieldCheck } from "lucide-react";
import Admin_Dashboard from "../components/AdminDash";
import { addPOC } from "../axios";

const Add_POC = () => {
  const [pocName, setPocName] = useState("");
  const [pocRole, setPocRole] = useState("");
  const [pocEmail, setPocEmail] = useState("");
  const [pocMobile, setPocMobile] = useState("");
  const [certId, setCertId] = useState("");
  const [certStatus, setCertStatus] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Please fill all fields correctly.");

  const handleSubmit = async () => {
    if (!pocName || !pocRole || !pocEmail || !pocMobile) {
      setErrorMessage("Please fill all required fields.");
      setOpenError(true);
      return;
    }

    const payload = {
      mod_poc_name: pocName,
      mod_poc_role: pocRole,
      mod_poc_email: pocEmail,
      mod_poc_mobile: pocMobile,
      mod_images: [],
      mod_tests: [],
      mod_users: [],
      attendance: [],
      poc_certificate: certId
        ? {
          cert_id: certId,
          cert_status: certStatus,
        }
        : null,
      certificates: {},
    };

    try {
      const data = await addPOC(payload);
      console.log("POC added:", data);
      setOpenSuccess(true);
      handleClear();
    } catch (err) {
      console.error("Error adding POC:", err.message || err);
      setErrorMessage(err.message || "Failed to add POC. Please try again.");
      setOpenError(true);
    }
  };

  const handleClear = () => {
    setPocName("");
    setPocRole("");
    setPocEmail("");
    setPocMobile("");
    setCertId("");
    setCertStatus(false);
  };

  return (
    <>
      <Admin_Dashboard />
      <Container maxWidth="sm" sx={{ py: 5 }}>
        <Paper elevation={8} sx={{ borderRadius: 4, overflow: "hidden" }}>
          {/* Header */}
          <Box
            sx={{
              p: 3,
              background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
              color: "white",
            }}
          >

            <Typography
              variant="h4"
              fontWeight={700}
              textAlign="center"
            >
              <span style={{ color: "#fff", padding: "4px 12px", borderRadius: 8 }}>
                Add POC
              </span>
            </Typography>

            <Typography variant="subtitle2"
              textAlign="center">
              Fill the details of your Point of Contact
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <User size={20} color="#0c83c8" style={{ marginBottom: 20 }} />
              <TextField
                fullWidth
                label="POC Name"
                variant="outlined"
                value={pocName}
                onChange={(e) => setPocName(e.target.value)}
                sx={{ mb: 3 }}
                required
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BadgeCheck size={20} color="#0c83c8" style={{ marginBottom: 20 }}  />
              <TextField
                fullWidth
                label="POC Role"
                variant="outlined"
                value={pocRole}
                onChange={(e) => setPocRole(e.target.value)}
                sx={{ mb: 3 }}
                required
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Mail size={20} color="#0c83c8" style={{ marginBottom: 20 }}  />
              <TextField
                fullWidth
                label="POC Email"
                type="email"
                variant="outlined"
                value={pocEmail}
                onChange={(e) => setPocEmail(e.target.value)}
                sx={{ mb: 3 }}
                required
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Phone size={20} color="#0c83c8"  style={{ marginBottom: 20 }} />
              <TextField
                fullWidth
                label="POC Mobile"
                variant="outlined"
                value={pocMobile}
                onChange={(e) => setPocMobile(e.target.value)}
                sx={{ mb: 3 }}
                required
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ShieldCheck size={20} color="#0c83c8" style={{ marginBottom: 20 }}  />
              <TextField
                fullWidth
                label="Certificate ID"
                variant="outlined"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="e.g., CET/DEMO/"
                helperText="Leave empty if no certificate"
                sx={{ mb: 3 }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={certStatus}
                  onChange={(e) => setCertStatus(e.target.checked)}
                  color="primary"
                />
              }
              label="Certificate Status (Active/Inactive)"
              sx={{ mb: 3 }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleClear}
                sx={{ px: 4, borderRadius: 3 }}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  px: 4,
                  borderRadius: 3,
                  background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
                  color: "white",
                  fontWeight: 600,
                  "&:hover": {
                    background: "linear-gradient(90deg, #fc7a46, #0c83c8)",
                  },
                }}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Snackbar Alerts */}
        <Snackbar
          open={openSuccess}
          autoHideDuration={3000}
          onClose={() => setOpenSuccess(false)}
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            POC added successfully!
          </Alert>
        </Snackbar>

        <Snackbar
          open={openError}
          autoHideDuration={3000}
          onClose={() => setOpenError(false)}
        >
          <Alert severity="error" sx={{ width: "100%" }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Add_POC;
