import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  AppBar,
  Toolbar,
  Box,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import Image from "../../assests/Crescent.png";
import {
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
  Download,
} from "@mui/icons-material";
import CertificateGenerator from "../certificate";
import { fetchPocCertStatus } from "../../axios";

export default function DashboardHeader() {
  const [userName, setUserName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [canDownloadCertificate, setCanDownloadCertificate] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("true");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.user?.full_name) setUserName(user.user.full_name);
        if (user?.user?.mod_poc_id?.mod_poc_id) {
          const pocId = user.user.mod_poc_id.mod_poc_id;
          fetchPocData(pocId);
        }
      } catch (err) {
        console.error("Error parsing user session:", err);
      }
    }
  }, []);

  const fetchPocData = async (pocId) => {
    try {
      const certStatus = await fetchPocCertStatus(pocId);
      setCanDownloadCertificate(certStatus === true);
    } catch (error) {
      console.error("Error fetching POC certificate status:", error);
      setCanDownloadCertificate(false);
    }
  };

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "U";

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    window.location.assign("/");
    handleMenuClose();
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

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "#fff",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
          borderRadius: "0 0 12px 12px",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <img
              src={Image}
              alt="Zealous Logo"
              width={150}
              height={67}
              style={{
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              sx={{
                color: "#38b6ff",
                fontSize: { xs: "clamp(12px, 2.5vw, 14px)", sm: "16px" },
                fontWeight: 600,
                display: { xs: "none", sm: "block" },
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {userName || "User"}
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                padding: 0,
                "&:hover": {
                  transform: "scale(1.1)",
                  boxShadow: "0 4px 12px rgba(255, 102, 196, 0.3)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#ff66c4",
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  fontSize: { xs: "14px", sm: "16px" },
                  borderRadius: "8px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {getInitials(userName)}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                  backgroundColor: "#fff",
                  minWidth: 200,
                },
              }}
            >
              <MenuItem
                disabled
                sx={{
                  opacity: 1,
                  padding: "12px 16px",
                  "&:hover": { backgroundColor: "transparent" },
                  cursor: "default",
                }}
              >
                <AccountCircle sx={{ mr: 1.5, color: "#64748b" }} />
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: "#2c3e50",
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {userName || "User"}
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={handleDownloadCertificate}
                disabled={!canDownloadCertificate}
                sx={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  mx: 1,
                  mb: 1,
                  "&:hover": {
                    backgroundColor: "rgba(56, 182, 255, 0.1)",
                    transform: "translateX(4px)",
                  },
                  transition: "all 0.2s ease",
                  color: !canDownloadCertificate ? "#ccc" : "#2c3e50",
                }}
              >
                <Download sx={{ mr: 1.5, color: !canDownloadCertificate ? "#ccc" : "#38b6ff" }} />
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Download Certificate
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  mx: 1,
                  "&:hover": {
                    backgroundColor: "rgba(255, 102, 196, 0.1)",
                    transform: "translateX(4px)",
                  },
                  transition: "all 0.2s ease",
                  color: "#2c3e50",
                }}
              >
                <ExitToApp sx={{ mr: 1.5, color: "#ff66c4" }} />
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <CertificateGenerator ref={certificateRef} />
    </>
  );
}