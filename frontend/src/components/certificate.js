import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import { createRoot } from "react-dom/client";
import BackgroundImg from "../assests/cert_bg.jpg.jpg";
import DigiSign from "../assests/DigiSign.png";
import { getUserById, getModuleById, fetchAggregateScores, fetchOrGenerateCertificates } from "../axios";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { QRCodeCanvas } from "qrcode.react";
import CloseIcon from "@mui/icons-material/Close";

// Certificate template
const CertificateTemplate = ({ forwardedRef, certificateId }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [moduleDetails, setModuleDetails] = useState(null);
  const [aggregateScore, setAggregateScore] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem("true");
      if (!storedUser) return;

      try {
        const user = JSON.parse(storedUser);
        const userId = user?.user?.user_id;
        const modId = user?.user?.mod_poc_id?.mod_id;
        const pocId = user?.user?.mod_poc_id?.mod_poc_id;

        if (userId) {
          const userData = await getUserById(userId);
          setUserDetails(userData);
        }

        if (modId) {
          const moduleData = await getModuleById(modId);
          setModuleDetails(moduleData);
        }

        if (userId && pocId) {
          const scoreData = await fetchAggregateScores(pocId, userId);
          setAggregateScore(scoreData.response);
        }
      } catch (error) {
        console.error("Error fetching certificate data:", error);
      }
    };

    fetchData();
  }, []);

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
            {userDetails.full_name?.toUpperCase()} ({userDetails.rollno})
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
            style={{ marginBottom: "28px",marginLeft:"5px" }}
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

// Generate PDF
const generateCertificate = async (certificateId, setProgress, setError) => {
  const certificateRef = { current: null };
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    root.render(<CertificateTemplate forwardedRef={(el) => (certificateRef.current = el)} certificateId={certificateId} />);

    setProgress(20);
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for rendering

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

    setProgress(40);
    const canvas = await html2canvas(certificateRef.current, {
      useCORS: true,
      backgroundColor: "transparent",
      scale: 2,
    });

    setProgress(60);
    const imgData = canvas.toDataURL("image/jpeg", 0.8);
    console.log(`Canvas data URL size: ${(imgData.length * 0.75 / 1024 / 1024).toFixed(2)} MB`);

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [297, 210], compress: true });
    console.log("Adding background to PDF:", background.src);
    pdf.addImage(background, "JPEG", 0, 0, 297, 210);
    pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);

    const storedUser = localStorage.getItem("true");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const filename = user?.user?.full_name ? `${user.user.full_name}_Certificate.pdf` : "Certificate.pdf";

    pdf.save(filename);

    setProgress(90);
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");

    URL.revokeObjectURL(pdfUrl);
    setProgress(100);
  } catch (error) {
    console.error("Error generating certificate:", error);
    setError(error.message || "Failed to generate certificate PDF");
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
};

// Styled Components
const CurvyDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "20px",
    backgroundColor: "#ffffff",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
    overflow: "hidden",
    transition: "all 0.3s ease",
    width: "90vw",
    maxWidth: "400px",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "600px",
    },
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
    },
  },
}));

const CurvyDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: "linear-gradient(135deg, #0c83c8 0%, #3a9bd7 100%)",
  color: "#ffffff",
  padding: theme.spacing(2, 3),
  fontSize: "1.25rem",
  fontWeight: 600,
  textAlign: "center",
  borderTopLeftRadius: "20px",
  borderTopRightRadius: "20px",
  [theme.breakpoints.down("sm")]: {
    fontSize: "1rem",
    padding: theme.spacing(1.5, 2),
  },
}));

const CurvyDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
  backgroundColor: "#f9fafc",
  borderBottomLeftRadius: "20px",
  borderBottomRightRadius: "20px",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const ProgressBarContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "12px",
  marginTop: theme.spacing(2),
  backgroundColor: alpha(theme.palette.grey[300], 0.5),
  borderRadius: "12px",
  overflow: "hidden",
  position: "relative",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.grey[300], 0.7),
    boxShadow: `0 0 8px ${alpha("#fc7a46", 0.3)}`,
    transform: "scale(1.01)",
  },
  [theme.breakpoints.down("sm")]: {
    height: "8px",
    marginTop: theme.spacing(1),
  },
}));

const ProgressBarFill = styled(Box)(({ theme, value }) => ({
  width: `${value}%`,
  height: "100%",
  background: "linear-gradient(90deg, #0c83c8 0%, #fc7a46 100%)",
  borderRadius: "12px",
  transition: "width 0.5s ease-in-out",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
    animation: "shimmer 2s infinite",
  },
  "@keyframes shimmer": {
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(100%)" },
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.grey[200], 0.8),
  color: theme.palette.grey[700],
  borderRadius: "50%",
  padding: theme.spacing(1),
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.grey[300], 0.9),
    transform: "scale(1.2)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.5),
  },
}));

// Certificate Generator component
const CertificateGenerator = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [certificateId, setCertificateId] = useState(null);

  useImperativeHandle(ref, () => ({
    handleDownloadCertificate,
  }));

  const handleDownloadCertificate = async () => {
    setOpen(true);
    setProgress(0);
    setError(null);

    try {
      const storedUser = localStorage.getItem("true");
      if (!storedUser) {
        throw new Error("No user data found in localStorage");
      }

      const user = JSON.parse(storedUser);
      const userId = user?.user?.user_id;
      const pocId = user?.user?.mod_poc_id?.mod_poc_id;

      if (!userId || !pocId) {
        throw new Error("Invalid userId or pocId");
      }

      const certId = await fetchOrGenerateCertificates(pocId, userId);
      setCertificateId(certId);

      await generateCertificate(certId, setProgress, setError);
    } catch (err) {
      console.error("Error in certificate generation:", err);
      const errorMessage = err.message || "Failed to generate certificate.";
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setProgress(0);
    setError(null);
    setCertificateId(null);
  };

  return (
    <CurvyDialog
      open={open}
      onClose={progress === 100 || error ? handleClose : undefined}
      fullWidth
    >
      <CurvyDialogTitle>Generating Certificate</CurvyDialogTitle>
      <CurvyDialogContent>
        <Box sx={{ width: "100%", textAlign: "center" }}>
          {error ? (
            <Typography
              variant="body1"
color="error"
              sx={{
                fontWeight: 500,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                animation: "fadeIn 0.5s ease-in",
                "@keyframes fadeIn": {
                  "0%": { opacity: 0 },
                  "100%": { opacity: 1 },
                },
              }}
            >
              {error}
            </Typography>
          ) : (
            <>
              <ProgressBarContainer>
                <ProgressBarFill value={progress} />
              </ProgressBarContainer>
              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  color: progress === 100 ? "#0c83c8" : "#333",
                  fontWeight: 500,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  animation: progress === 100 ? "pulse 1.5s infinite" : "fadeIn 0.5s ease-in",
                  "@keyframes pulse": {
                    "0%": { opacity: 0.8 },
                    "50%": { opacity: 1 },
                    "100%": { opacity: 0.8 },
                  },
                  "@keyframes fadeIn": {
                    "0%": { opacity: 0 },
                    "100%": { opacity: 1 },
                  },
                }}
              >
                {progress === 100 ? "Certificate Generated!" : `Progress: ${progress}%`}
              </Typography>
            </>
          )}
        </Box>
        {(progress === 100 || error) && (
          <CloseButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: { xs: 8, sm: 16 },
              right: { xs: 8, sm: 16 },
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
          </CloseButton>
        )}
      </CurvyDialogContent>
    </CurvyDialog>
  );
});

export default CertificateGenerator;