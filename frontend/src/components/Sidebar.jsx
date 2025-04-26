/**
 * Sidebar Component
 * 
 * This component provides application navigation and user session information.
 * It displays a fixed sidebar with app branding, user profile, navigation menu,
 * and footer information.
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Paper,
  Avatar,
  Tooltip,
  Badge
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// Width of the sidebar in pixels
const drawerWidth = 240;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState("Guest");

  /**
   * Effect hook to retrieve current user from localStorage when component mounts
   * Updates the currentUser state with the stored username
   */
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  /**
   * Determines if a menu item should be highlighted as active
   * based on the current route path
   * 
   * @param {string} path - The path to check against current location
   * @returns {boolean} - True if the path matches current location
   */
  const isActive = (path) => {
    return location.pathname === path;
  };

  /**
   * Menu items configuration
   * Each item contains text, icon, path (or action), and active state
   */
  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
      active: isActive("/dashboard")
    },
    {
      text: "Report History",
      icon: <BarChartIcon />,
      path: "/history",
      active: isActive("/history")
    },
    {
      text: "User Guide",
      icon: <HelpOutlineIcon />,
      path: "/guide",
      active: isActive("/guide")
    },
    {
      text: "Logout",
      icon: <LogoutIcon />,
      action: "logout"
    },
  ];

  /**
   * Handles click events on menu items
   * Navigates to the specified path or performs logout action
   * 
   * @param {Object} item - The menu item that was clicked
   */
  const handleMenuItemClick = (item) => {
    if (item.action === "logout") {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      navigate("/login");
    } else {
      navigate(item.path);
    }
  };

  /**
   * Gets the first letter of the username for the avatar
   * Defaults to "G" (Guest) if no name is available
   * 
   * @param {string} name - The username
   * @returns {string} - The uppercase first letter of the name
   */
  const getInitial = (name) => {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : "G";
  };

  /**
   * Generates a consistent color for user avatar based on username
   * Uses a simple hash function to map username to one of the predefined colors
   * 
   * @param {string} username - The username to generate color for
   * @returns {string} - A hex color code from the predefined palette
   */
  const getUserColor = (username) => {
    const colors = [
      "#4f46e5", // indigo
      "#0891b2", // cyan
      "#0284c7", // sky
      "#2563eb", // blue
      "#7c3aed", // violet
      "#9333ea", // purple
      "#c026d3", // fuchsia
      "#db2777", // pink
      "#e11d48", // rose
      "#0f766e", // teal
    ];

    let hash = 0;
    if (username.length === 0) return colors[0];

    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Box sx={{ width: drawerWidth + 32, p: 2 }}>
      <Paper
        elevation={3}
        sx={{
          width: drawerWidth,
          height: "100vh",
          borderRadius: 3,
          backgroundColor: "#fff",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
          position: "fixed",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Logo and Brand */}
        <Box
          sx={{
            pt: 4,
            pb: 2,
            px: 3,
            background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)"
          }}
        >
          <Typography
            variant="h5"
            align="center"
            fontFamily="inherit"
            fontWeight="600"
            sx={{
              color: "#333",
              letterSpacing: "-0.5px"
            }}
          >
            ESG Panel
          </Typography>
          <Typography
            variant="body2"
            align="center"
            fontFamily="inherit"
            sx={{
              color: "#666",
              mt: 0.5,
              fontSize: "0.75rem"
            }}
          >
            Environmental · Social · Governance
          </Typography>
        </Box>

        <Divider sx={{ mx: 2 }} />

        {/* User profile section */}
        <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: getUserColor(currentUser),
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            {getInitial(currentUser)}
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography
              variant="subtitle1"
              fontFamily="inherit"
              sx={{
                fontWeight: 500,
                fontSize: "0.95rem",
                color: "#333"
              }}
            >
              {currentUser}
            </Typography>
            <Typography
              variant="caption"
              fontFamily="inherit"
              sx={{
                color: "#666",
                display: "block",
                lineHeight: 1.2
              }}
            >
              Active Session
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mx: 2, mb: 2 }} />

        {/* Navigation items */}
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <List sx={{ px: 2 }}>
            {menuItems.map((item) => (
              <Tooltip
                title={item.text}
                placement="right"
                key={item.text}
                arrow
              >
                <ListItem
                  button
                  onClick={() => handleMenuItemClick(item)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 2,
                    mb: 1,
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: item.active ? "rgba(0, 0, 0, 0.04)" : "transparent",
                    "&:hover": {
                      backgroundColor: item.active ? "rgba(0, 0, 0, 0.08)" : "rgba(0, 0, 0, 0.04)",
                      transform: "translateX(4px)",
                    },
                    ...(item.action === "logout" && {
                      mt: 2,
                      color: "#ef4444",
                      "&:hover": {
                        backgroundColor: "rgba(239, 68, 68, 0.08)",
                      }
                    })
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: item.active ? "#000" : "inherit",
                      minWidth: 40,
                      ...(item.action === "logout" && {
                        color: "#ef4444"
                      })
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.95rem",
                      fontFamily: "inherit",
                      fontWeight: item.active ? 500 : 400,
                    }}
                  />
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </Box>

        {/* Footer area */}
        <Box sx={{ p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography
            variant="caption"
            align="center"
            display="block"
            sx={{
              color: "#999",
              fontSize: "0.7rem",
              fontFamily: "inherit"
            }}
          >
            ESG Panel © 2025
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}