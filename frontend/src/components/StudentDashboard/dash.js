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
import { fetchPocCertStatus } from "../../axios"; // Import the new service

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
      <AppBar position="sticky" sx={{ backgroundColor: "#fff" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <img src={Image} alt="Zealous Logo" width={150} height={67} />
          </Box>

          <Box display="flex" alignItems="center">
            <IconButton onClick={handleMenuOpen}>
              <Avatar sx={{ bgcolor: "#0b78b9" }}>{getInitials(userName)}</Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem disabled>
                <AccountCircle sx={{ mr: 1 }} />
                <Typography>{userName || "User"}</Typography>
              </MenuItem>
              <MenuItem onClick={handleDownloadCertificate} disabled={!canDownloadCertificate}>
                <Download sx={{ mr: 1, color: "#0c83c8" }} />
                Download Certificate
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1, color: "#fc7a46" }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <CertificateGenerator ref={certificateRef} />
    </>
  );
}