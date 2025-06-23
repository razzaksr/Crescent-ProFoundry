import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  AppBar,
  Toolbar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import Image from "../assests/Crescent.png";
import {
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
  ExpandLess,
  ExpandMore,
  People,
  Business,
  Book,
  Quiz,
  Person,
  Code,
  BugReport,
  Assignment,
  Add,
  Edit,
  Visibility,
  FolderOpen,
} from "@mui/icons-material";
import CertificateGenerator from "./certificate";
import { useNavigate } from "react-router-dom";

export default function Admin_Dash() {
  const [userName, setUserName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [userId, setUserId] = useState("");
  const [hasResults, setHasResults] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const certificateRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("true");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.user?.full_name) setUserName(user.user.full_name);
        if (user?.user?.user_id) {
          const id = user.user.user_id;
          setUserId(id);
        }
      } catch (err) {
        console.error("Error parsing user session:", err);
      }
    }
  }, []);

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
    window.location.assign("/landing");
    handleMenuClose();
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleMenuToggle = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const menuItems = [
    {
      text: "POC",
      icon: <Assignment />,
      color: "#0c83c8",
      routes: [
        { text: "View POC", path: "/poc", icon: <Visibility /> },
        { text: "Add POC", path: "/add_poc", icon: <Add /> },
        { text: "Update POC", path: "/update_poc", icon: <Edit /> },
      ],
    },
    {
      text: "Organization",
      icon: <Business />,
      color: "#fc7a46",
      routes: [
        { text: "View Organization", path: "/organization", icon: <Visibility /> },
        { text: "Add Organization", path: "/add_organisation", icon: <Add /> },
        { text: "Update Organization", path: "/update_organization", icon: <Edit /> },
      ],
    },
    {
      text: "Module",
      icon: <Book />,
      color: "#0c83c8",
      routes: [
        { text: "View Module", path: "/module", icon: <Visibility /> },
        { text: "Add Module", path: "/add_module", icon: <Add /> },
        { text: "Update Module", path: "/update_module", icon: <Edit /> },
      ],
    },
    {
      text: "Test",
      icon: <Quiz />,
      color: "#fc7a46",
      routes: [
        { text: "View Test", path: "/test", icon: <Visibility /> },
        { text: "Add Test", path: "/add_test", icon: <Add /> },
        { text: "Update Test", path: "/update_test", icon: <Edit /> },
        { text: "Allocate Test", path: "/allocate_test", icon: <Edit /> },
      ],
    },
    {
      text: "User",
      icon: <Person />,
      color: "#0c83c8",
      routes: [
        { text: "View User", path: "/user", icon: <Visibility /> },
        { text: "Add User", path: "/add_user", icon: <Add /> },
      ],
    },
    {
      text: "Expert",
      icon: <People />,
      color: "#fc7a46",
      routes: [
        { text: "View Expert", path: "/expert", icon: <Visibility /> },
        { text: "Add Expert", path: "/add_expert", icon: <Add /> },
        { text: "Update Expert", path: "/update_expert", icon: <Edit /> },
      ],
    },
    {
      text: "MCQ",
      icon: <Quiz />,
      color: "#0c83c8",
      routes: [
        { text: "View MCQ", path: "/mcq-admin", icon: <Visibility /> },
        { text: "Add MCQ", path: "/add_mcq", icon: <Add /> },
      ],
    },
    {
      text: "Coding",
      icon: <Code />,
      color: "#fc7a46",
      routes: [
        { text: "View Coding", path: "/codingpage", icon: <Visibility /> },
        { text: "Add Coding", path: "/add_coding", icon: <Add /> },
        { text: "Update Coding", path: "/update_coding", icon: <Edit /> },
      ],
    },
    {
      text: "Testcase",
      icon: <BugReport />,
      color: "#0c83c8",
      routes: [
        { text: "View Testcase", path: "/testcasepage", icon: <Visibility /> },
        { text: "Add Testcase", path: "/add_testcase", icon: <Add /> },
      ],
    },
        {
      text: "Report",
      icon: <FolderOpen />,
      color: "#fc7a46",
      routes: [
        { text: "Report Generation", path: "/reportAndPieGen", icon: <Add /> },
        { text: "Create Master Report", path: "/reportGen", icon: <Add /> },
      ],
    },
    {
      text: "Certificate",
      icon: <Assignment />,
      color: "#0c83c8",
      routes: [
        { text: "Generate Certificate", path: "/bulk_certificate", icon: <Add /> },
      ],
    },

  ];

  const drawerContent = (
    <Box sx={{ width: 280, overflowY: 'auto' }} role="presentation">
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h6" sx={{ color: '#0c83c8', fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
      </Box>
      <List sx={{ '.MuiListItemButton-root': { border: 0 } }}>
        {menuItems.map((item) => (
          <div key={item.text}>
            <ListItem disablePadding sx={{ '--card-color': item.color }}>
              <ListItemButton
                onClick={() => handleMenuToggle(item.text)}
                sx={{
                  color: '#333',
                  padding: '0.75rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background-color 0.2s, color 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(12, 131, 200, 0.1)',
                    color: '#0c83c8',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: '2.25rem', color: item.color }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                <Box sx={{ ml: 'auto' }}>
                  {openMenus[item.text] ? (
                    <ExpandLess sx={{ color: '#333' }} />
                  ) : (
                    <ExpandMore sx={{ color: '#333' }} />
                  )}
                </Box>
              </ListItemButton>
            </ListItem>
            <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.routes.map((route) => (
                  <ListItem key={route.text} disablePadding>
                    <ListItemButton
                      sx={{
                        pl: 4,
                        color: '#333',
                        padding: '0.75rem 1.25rem',
                        transition: 'background-color 0.2s, color 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(12, 131, 200, 0.1)',
                          color: '#0c83c8',
                        },
                      }}
                      onClick={() => navigate(route.path)}
                    >
                      <ListItemIcon sx={{ minWidth: '2.25rem', color: item.color }}>
                        {route.icon}
                      </ListItemIcon>
                      <ListItemText primary={route.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </div>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <style>{`
        :root {
          --primary-color: #0c83c8;
          --secondary-color: #fc7a46;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: ${drawerOpen ? '0' : '-280px'};
          width: 280px;
          height: 100vh;
          background-color: #ffffff;
          box-shadow: 0.25rem 0 1rem rgba(0, 0, 0, 0.1);
          transition: left 0.3s ease;
          z-index: 1050;
          overflow-y: auto;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.3);
          z-index: 1040;
          opacity: ${drawerOpen ? '1' : '0'};
          visibility: ${drawerOpen ? 'visible' : 'hidden'};
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: var(--primary-color);
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 260px;
            left: ${drawerOpen ? '0' : '-260px'};
          }
        }
      `}</style>

      <AppBar
        position="sticky"
        sx={{ backgroundColor: "#fff"}}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon sx={{ color: "#0b78b9" }} />
            </IconButton>
            <img
              src={Image}
              alt="Zealous Logo"
              width={150}
              height={67}
              style={{ cursor: "pointer" }}
              onClick={handleLogoClick}
            />
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
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1, color: "#fc7a46" }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <div className="sidebar-overlay" onClick={toggleDrawer(false)}></div>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            boxShadow: '0.25rem 0 1rem rgba(0, 0, 0, 0.1)',
            transition: 'left 0.3s ease',
            position: 'fixed',
            top: 0,
            left: drawerOpen ? 0 : '-280px',
            height: '100vh',
            zIndex: 1050,
            overflowY: 'auto',
          },
        }}
        classes={{ paper: 'sidebar' }}
      >
        {drawerContent}
      </Drawer>

      <CertificateGenerator ref={certificateRef} />
    </>
  );
}