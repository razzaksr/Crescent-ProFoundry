import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import { createRoot } from "react-dom/client";
import { QRCodeCanvas } from "qrcode.react";
import BackgroundImg from "../assests/cert_bg.jpg";
import DigiSign from "../assests/DigiSign.png";
import { getUserById, getModuleById, fetchAggregateScores, fetchOrGenerateCertificates, fetchAllPocs, fetchPocById } from "../axios";
import Admin_Dashboard from "../components/AdminDash";

const CertificateTemplate = ({
  forwardedRef,
  certificateId,
  userDetails,
  moduleDetails,
  aggregateScore
}) => {
  if (!userDetails || !moduleDetails || !aggregateScore || !certificateId) return null;

  const percentage = aggregateScore?.average_percentage?.toFixed(2) || "0.00";
  const issueDate = dayjs().format("DD-MM-YYYY");
  const verificationUrl = `https://zealoustechcorp.com/verify?certificateId=${encodeURIComponent(certificateId)}`;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "29.7cm",
        margin: "0 auto",
        transform: "scale(calc(100vw / 1200))",
        transformOrigin: "top center",
        overflow: "hidden",
      }}
    >
      <div
        ref={forwardedRef}
        style={{
          width: "29.7cm",
          height: "21cm",
          background: "transparent",
          position: "relative",
          fontFamily: "Times New Roman",
          padding: "60px",
          boxSizing: "border-box",
          color: "#000",
          textAlign: "center",
        }}
      >
        <img
          src={BackgroundImg}
          alt="Background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
            objectFit: "cover",
          }}
          onError={(e) => console.error("Failed to load background image:", e, BackgroundImg)}
        />
        <div style={{ marginTop: "130px", display: "flex", flexDirection: "column", alignItems: "flex-end", width: "fit-content", marginLeft: "auto", marginRight: "auto" }}>
          <h2 style={{ fontSize: 47, charSpace: 0.1, margin: 0 }}>CERTIFICATE OF COMPLETION</h2>
          <p style={{ fontSize: 27, fontStyle: "italic", fontFamily: "Charm", margin: "5px 0 0 0" }}>
            Certificate ID: {certificateId}
          </p>
        </div>

        <p style={{ fontSize: 27, fontWeight: "bold", marginTop: "10px" }}>
          WE ARE PROUDLY PRESENT THIS SKILL WORKSHOP
        </p>
        <p style={{ fontSize: 27, fontWeight: "bold", marginTop: "5px" }}>CERTIFICATE TO</p>

        <div style={{ display: "inline-block", textAlign: "center", marginTop: "5px" }}>
          <h3 style={{ fontSize: 27, color: "black", fontWeight: "bold" }}>
            {userDetails.full_name?.toUpperCase()}
            {userDetails.rollno ? ` ${userDetails.rollno}` : ""}
          </h3>
        </div>

        <p style={{ fontSize: 27, margin: "10px auto", width: "80%" }}>
          Department of <strong>{userDetails.department}</strong> from <strong>{userDetails.college}</strong> on
          <strong> {moduleDetails.mod_name}</strong>. Obtained a mark of <strong>{percentage}%</strong>.<br />
          Duration: {moduleDetails.mod_duration}.
        </p>

        <div
          style={{
            position: "absolute",
            bottom: "90px",
            left: "220px",
            textAlign: "center",
          }}
        >
          <QRCodeCanvas
            value={verificationUrl}
            size={100}
            level="H"
            style={{ marginBottom: "28px", marginLeft: "5px" }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "200px",
            textAlign: "center",
            fontSize: 27,
          }}
        >
          <strong>{issueDate}</strong>
          <div style={{ height: "2px", backgroundColor: "#35b5ff", width: "140px", margin: "5px auto 0" }} />
          <span style={{ fontWeight: "bold" }}>Date of Issue</span>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "60px",
            textAlign: "center",
            fontSize: 27,
          }}
        >
          <img
            src={DigiSign || "/placeholder.svg"}
            alt="Digital Signature"
            style={{ height: "90px", width: "90px", marginBottom: "5px" }}
          />
          <div style={{ height: "2px", backgroundColor: "#35b5ff", width: "200px", margin: "5px auto 0" }} />
          <span style={{ fontWeight: "bold" }}>Head - Technology & Training</span>
        </div>
      </div>
    </div>
  );
};

const generateCertificateCanvas = async (certificateId, userDetails, moduleDetails, aggregateScore) => {
  const certificateRef = { current: null };
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    root.render(
      <CertificateTemplate
        forwardedRef={(el) => (certificateRef.current = el)}
        certificateId={certificateId}
        userDetails={userDetails}
        moduleDetails={moduleDetails}
        aggregateScore={aggregateScore}
      />
    );

    await new Promise((resolve) => setTimeout(resolve, 3000));
    if (!certificateRef.current) {
      throw new Error("Failed to render certificate template");
    }

    console.log("Loading background image from:", BackgroundImg);
    const background = new Image();
    background.src = BackgroundImg;
    await new Promise((resolve, reject) => {
      background.onload = () => {
        console.log("Background image loaded successfully:", background.src, background.width, background.height);
        resolve();
      };
      background.onerror = (error) => {
        console.error("Failed to load background image:", error, BackgroundImg);
        reject(new Error(`Failed to load background image: ${BackgroundImg}`));
      };
    });

    const canvas = await html2canvas(certificateRef.current, {
      useCORS: true,
      backgroundColor: "transparent",
      scale: 2,
    });

    return { canvas, background };
  } catch (error) {
    throw new Error(`Failed to generate certificate for ${certificateId}: ${error.message}`);
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
};

const BulkCertificateGenerator = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pocs, setPocs] = useState([]);
  const [selectedPocId, setSelectedPocId] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [error, setError] = useState(null);
  const [certificateErrors, setCertificateErrors] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchPocs = async () => {
      try {
        const pocData = await fetchAllPocs();
        console.log("Fetched POCs:", pocData.data);
        setPocs(Array.isArray(pocData.data) ? pocData.data : []);
      } catch (error) {
        console.error("Failed to fetch POCs:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch POCs: " + error.message,
          severity: 'error',
        });
        setPocs([]);
      }
    };
    fetchPocs();
  }, []);

  useEffect(() => {
    if (!selectedPocId) {
      setUsers([]);
      setSelectedUserIds([]);
      return;
    }

    const fetchPocDetails = async () => {
      try {
        setLoading(true);
        const pocData = await fetchPocById(selectedPocId);
        console.log("Fetched POC details:", pocData);
        const userIds = pocData.mod_users || [];
        const userPromises = userIds.map(async (userId) => {
          try {
            const userDetails = await getUserById(userId);
            const scoreData = await fetchAggregateScores(selectedPocId, userId);
            return {
              id: userId,
              full_name: userDetails.full_name || "Unknown",
              rollno: userDetails.rollno || "",
              department: userDetails.department || "Unknown",
              college: userDetails.college || "Unknown",
              aggregate_score: scoreData.response?.average_percentage?.toFixed(2) || "0.00",
            };
          } catch (error) {
            console.error(`Failed to fetch data for user ${userId}:`, error);
            return {
              id: userId,
              full_name: "Unknown",
              rollno: "",
              department: "Unknown",
              college: "Unknown",
              aggregate_score: "0.00",
              error: `Failed to fetch user or score data: ${error.message}`,
            };
          }
        });
        const userData = await Promise.all(userPromises);
        const errors = userData.filter(u => u.error).map(u => ({ userId: u.id, message: u.error }));
        if (errors.length > 0) {
          setCertificateErrors(errors);
          setSnackbar({
            open: true,
            message: "Errors occurred while fetching user data.",
            severity: 'error',
          });
        }
        setUsers(userData.filter(u => !u.error));
      } catch (error) {
        console.error("Failed to fetch POC users:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch POC users: " + error.message,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPocDetails();
  }, [selectedPocId]);

  const handleGenerateCertificates = async () => {
    if (selectedUserIds.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one user.",
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    setDialogOpen(true);
    setDialogMessage("Generating certificates...");
    setError(null);
    setCertificateErrors([]);

    try {
      console.log("Generating certificates for POC:", selectedPocId, "Users:", selectedUserIds);
      const { results, errors } = await fetchOrGenerateCertificates(selectedPocId, selectedUserIds);
      console.log("Certificate results:", results, "Errors:", errors);
      if (errors.length > 0) {
        setCertificateErrors(errors);
        throw new Error("Some certificates failed to generate");
      }
      if (results.length === 0) {
        throw new Error("No certificates generated for the selected users");
      }

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [297, 210], compress: true });

      for (let i = 0; i < results.length; i++) {
        const { userId, certificateId } = results[i];
        const user = users.find(u => u.id === userId);
        const modId = pocs.find(p => p.mod_poc_id === selectedPocId)?.mod_id;
        const pocId = selectedPocId;

        if (!user || !modId) {
          setCertificateErrors(prev => [...prev, {
            userId,
            message: `Missing user or module data for user ${userId}`,
          }]);
          continue;
        }

        const moduleDetails = await getModuleById(modId);
        const scoreData = await fetchAggregateScores(pocId, userId);

        const { canvas, background } = await generateCertificateCanvas(
          certificateId,
          user,
          moduleDetails,
          scoreData.response
        );

        const imgData = canvas.toDataURL("image/jpeg", 0.8);
        console.log(`Canvas data URL size for ${certificateId}: ${(imgData.length * 0.75 / 1024 / 1024).toFixed(2)} MB`);
        if (i > 0) {
          pdf.addPage();
        }
        console.log("Adding background to PDF:", background.src);
        pdf.addImage(background, "JPEG", 0, 0, 297, 210, undefined, "FAST");
        pdf.addImage(imgData, "JPEG", 0, 0, 297, 210, undefined, "FAST");
      }

      if (certificateErrors.length > 0) {
        throw new Error("Some certificates failed to generate");
      }

      const filename = `Certificates_${selectedPocId}.pdf`;
      pdf.save(filename);
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
      URL.revokeObjectURL(pdfUrl);

      setDialogMessage("Certificates generated successfully!");
      setSnackbar({
        open: true,
        message: "Certificates generated successfully!",
        severity: 'success',
      });
    } catch (error) {
      console.error("Error generating certificates:", error);
      setError(error.message || "Failed to generate certificates");
      setDialogMessage('');
      setSnackbar({
        open: true,
        message: error.message || "Failed to generate certificates",
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
    setError(null);
    setCertificateErrors([]);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const columns = [
    { field: "full_name", headerName: "Full Name", minWidth: 200, flex: 2 },
    { field: "rollno", headerName: "Roll Number", minWidth: 150, flex: 1.5 },
    { field: "department", headerName: "Department", minWidth: 150, flex: 1.5 },
    { field: "college", headerName: "College", minWidth: 200, flex: 2 },
    { field: "aggregate_score", headerName: "Aggregate Score (%)", minWidth: 150, flex: 1.5 },
  ];

  const dataGridSx = {
    '& .MuiDataGrid-columnHeaders': {
      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
      color: '#0c83c8',
      fontWeight: '600',
      fontSize: '14px',
      textTransform: 'uppercase',
      borderBottom: '2px solid #0c83c8',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: '600',
    },
    '& .MuiDataGrid-row': {
      '&:nth-of-type(odd)': {
        backgroundColor: '#f8fafc',
      },
      '&:hover': {
        backgroundColor: '#e3f2fd',
        transition: 'background-color 0.2s ease',
      },
    },
    '& .MuiDataGrid-cell': {
      borderBottom: '1px solid #e5e7eb',
      padding: '8px',
      fontSize: isMobile ? '12px' : '14px',
    },
    boxShadow: '0 2px 8px rgba(12, 131, 200, 0.05)',
    borderRadius: '12px',
    border: 'none',
    overflow: 'hidden',
  };

  return (
    <>
      <Admin_Dashboard />
      <Box
        sx={{
          padding: { xs: 2, sm: 3, md: 4 },
          backgroundColor: '#f5f7fa',
          minHeight: '100vh',
          position: 'relative',
          overflowX: 'hidden',
        }}
      >
        <Paper
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
            color: '#ffffff',
            borderRadius: '16px',
            textAlign: 'center',
            opacity: 0,
            animation: 'fadeIn 0.5s forwards',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{
              fontWeight: '700',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
            }}
          >
            Bulk Certificate Generator
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ mt: 0.5, fontSize: { xs: '12px', sm: '14px' } }}
          >
            Generate certificates for selected users
          </Typography>
        </Paper>
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(12, 131, 200, 0.08)',
            backgroundColor: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '600',
                fontSize: { xs: '1.2rem', sm: '1.4rem' },
              }}
            >
              Select POC
            </Typography>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#0c83c8' }}>Select POC</InputLabel>
              <Select
                value={selectedPocId}
                onChange={(e) => setSelectedPocId(e.target.value)}
                label="Select POC"
                sx={{
                  borderRadius: '8px',
                  '& .MuiSelect-select': {
                    color: '#1f2937',
                    fontSize: isMobile ? '14px' : '16px',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0c83c8',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#fc7a46',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0c83c8',
                  },
                }}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {pocs.map((poc) => (
                  <MenuItem key={poc.mod_poc_id} value={poc.mod_poc_id}>
                    {poc.mod_poc_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedPocId && (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    mt: 2,
                    mb: 2,
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '600',
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                  }}
                >
                  Select Users
                </Typography>
                <Box sx={{ height: { xs: 300, sm: 350, md: 400 }, width: '100%' }}>
                  <DataGrid
                    rows={users}
                    columns={columns}
                    checkboxSelection
                    onRowSelectionModelChange={(newSelection) => setSelectedUserIds(newSelection)}
                    rowSelectionModel={selectedUserIds}
                    loading={loading}
                    pageSizeOptions={[5, 10, 20]}
                    sx={dataGridSx}
                    aria-label="Users DataGrid"
                  />
                </Box>
              </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleGenerateCertificates}
                disabled={loading || selectedUserIds.length === 0}
                sx={{
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  color: '#ffffff',
                  fontWeight: '500',
                  px: 3,
                  py: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                  '&:disabled': {
                    backgroundColor: '#b0bec5',
                    color: '#ffffff',
                  },
                }}
              >
                {loading ? <CircularProgress size={20} sx={{ color: '#ffffff', mr: 1 }} /> : 'Generate Certificates'}
              </Button>
            </Box>
          </Box>
        </Paper>

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(12, 131, 200, 0.1)',
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: '#f5f7fa',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: '600',
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.1rem', sm: '1.2rem' },
              py: 1.5,
            }}
          >
            Certificate Generation
          </DialogTitle>
          <DialogContent
            dividers
            sx={{
              py: 2,
              px: { xs: 2, sm: 3 },
              backgroundColor: '#ffffff',
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress sx={{ color: '#0c83c8' }} />
              </Box>
            ) : (
              <Box>
                {dialogMessage && (
                  <Typography sx={{ color: '#1f2937', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                    {dialogMessage}
                  </Typography>
                )}
                {certificateErrors.length > 0 && (
                  <>
                    <Typography color="error" sx={{ mt: 2, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                      Errors occurred for some users:
                    </Typography>
                    <List>
                      {certificateErrors.map(({ userId, message }, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`User ID: ${userId}`}
                            secondary={`Error: ${message}`}
                            primaryTypographyProps={{ fontSize: isMobile ? '14px' : '16px', color: '#1f2937' }}
                            secondaryTypographyProps={{ fontSize: isMobile ? '12px' : '14px', color: '#dc2626' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                {!dialogMessage && certificateErrors.length === 0 && error && (
                  <Typography color="error" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                    {error}
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: 1.5,
              backgroundColor: '#f5f7fa',
            }}
          >
            <Button
              onClick={handleCloseDialog}
              disabled={loading}
              sx={{
                color: '#0c83c8',
                fontWeight: '500',
                textTransform: 'none',
                '&:hover': { color: '#fc7a46', backgroundColor: '#e3f2fd' },
                '&:disabled': { color: '#b0bec5' },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ mb: { xs: 6, sm: 2 }, mr: 2 }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: '100%',
              background: snackbar.severity === 'success' ? 'linear-gradient(90deg, #0c83c8, #fc7a46)' : undefined,
              color: '#ffffff',
              fontSize: '0.9rem',
              '& .MuiAlert-icon': {
                color: '#ffffff',
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default BulkCertificateGenerator;