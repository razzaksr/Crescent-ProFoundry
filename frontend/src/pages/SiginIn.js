import React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Container,
  Snackbar,
  Alert,
} from "@mui/material"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import Logo from "../assests/Crescent.png"
import { signIn } from "../axios"
import { useNavigate } from "react-router-dom"

export default function ZealousSignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [errors, setErrors] = useState({ email: "", password: "" })
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" })

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  const navigate = useNavigate()

  // Animation on mount - with a slight delay to ensure DOM is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev)
  }

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const newErrors = {
      email: email.trim() === "" ? "Email is required" : !emailRegex.test(email) ? "Invalid email format" : "",
      password: password.trim() === "" ? "Password is required" : "",
    }
    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: errors.email || errors.password,
        severity: "error",
      })
      return
    }

    setIsLoading(true)
    const userData = {
      email,
      password,
    }

    try {
      const data = await signIn(userData)
      if (data) {
        setSnackbar({
          open: true,
          message: "Login successful",
          severity: "success",
        })
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("true", JSON.stringify(data))
        setTimeout(() => {
          window.location.assign("/landing")
        }, 1500) // Delay navigation to show success message
      }
    } catch (error) {
      console.error("Login error:", error)
      let errorMessage = "An unexpected error occurred"
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "User not found"
        } else if (error.response.status === 400) {
          errorMessage = "Invalid password"
        } else if (error.response.status === 500) {
          errorMessage = error.response.data.msg || "Server error"
        }
      }
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, rgba(12, 131, 200, 0.05) 0%, rgba(252, 122, 70, 0.05) 100%)`,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Montserrat', sans-serif",
        padding: { xs: "16px", sm: "24px" },

        // Background decorative elements
        "&::before, &::after": {
          content: '""',
          position: "absolute",
          borderRadius: "50%",
          animation: "float 20s infinite ease-in-out",
        },
        "&::before": {
          top: "-10%",
          right: "-5%",
          width: { xs: "250px", md: "500px" },
          height: { xs: "250px", md: "500px" },
          background: "radial-gradient(circle, rgba(12, 131, 200, 0.08) 0%, rgba(12, 131, 200, 0) 70%)",
          animationDelay: "0s",
        },
        "&::after": {
          bottom: "-10%",
          left: "-5%",
          width: { xs: "200px", md: "400px" },
          height: { xs: "200px", md: "400px" },
          background: "radial-gradient(circle, rgba(252, 122, 70, 0.08) 0%, rgba(252, 122, 70, 0) 70%)",
          animationDelay: "-7s",
        },

        // Z-shaped decorative elements inspired by the logo
        "& .z-shape": {
          position: "absolute",
          opacity: 0.03,
          background: "#0c83c8",
          animation: "float 15s infinite ease-in-out",
        },

        // Animation keyframes
        "@keyframes float": {
          "0%, 100%": {
            transform: "translateY(0) translateX(0)",
          },
          "25%": {
            transform: "translateY(-15px) translateX(10px)",
          },
          "50%": {
            transform: "translateY(0) translateX(20px)",
          },
          "75%": {
            transform: "translateY(15px) translateX(10px)",
          },
        },

        "@keyframes pulse": {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.05)",
          },
        },

        // Typography
        "& *": {
          fontFamily: "'Montserrat', sans-serif",
        },
        "& h1, & h2, & h3, & h4, & h5, & h6": {
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 600,
        },
      }}
    >
      {/* Z-shaped decorative elements inspired by the logo */}
      <Box
        className="z-shape"
        sx={{
          top: "15%",
          left: "10%",
          width: { xs: "100px", md: "200px" },
          height: { xs: "20px", md: "30px" },
          transform: "rotate(-30deg)",
          animationDelay: "-3s",
        }}
      />
      <Box
        className="z-shape"
        sx={{
          top: "20%",
          left: "15%",
          width: { xs: "80px", md: "160px" },
          height: { xs: "20px", md: "30px" },
          transform: "rotate(30deg)",
          animationDelay: "-5s",
        }}
      />
      <Box
        className="z-shape"
        sx={{
          bottom: "25%",
          right: "12%",
          width: { xs: "100px", md: "200px" },
          height: { xs: "20px", md: "30px" },
          transform: "rotate(-30deg)",
          animationDelay: "-8s",
        }}
      />
      <Box
        className="z-shape"
        sx={{
          bottom: "30%",
          right: "17%",
          width: { xs: "80px", md: "160px" },
          height: { xs: "20px", md: "30px" },
          transform: "rotate(30deg)",
          animationDelay: "-10s",
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        {/* Using CSS transitions instead of Material UI transitions */}
        <Card
          sx={{
            width: "100%",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            borderRadius: "24px",
            overflow: "hidden",
            position: "relative",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",

            // Card decorative elements
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
            },
          }}
        >
          {/* Card pattern */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.02,
              backgroundImage: `radial-gradient(#0c83c8 1px, transparent 1px), radial-gradient(#fc7a46 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
              pointerEvents: "none",
            }}
          />

          {/* Logo Header */}
          <Box
            sx={{
              background: "linear-gradient(to right, rgba(12, 131, 200, 0.03), rgba(252, 122, 70, 0.03))",
              padding: { xs: "24px 24px 16px", md: "32px 32px 24px" },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: { xs: "200px", sm: "240px" },
                height: { xs: "60px", sm: "72px" },
                animation: "pulse 3s infinite ease-in-out",
                mb: 2,
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.9)",
                transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
                transitionDelay: "0.3s",
              }}
            >
              <img
                src={Logo}
                alt="Logo"
                className="logo"
                style={{ width: "200px", height: "100px" }}
              />
            </Box>

            <Typography
              variant="h6"
              component="h2"
              sx={{
                color: "rgba(0,0,0,0.7)",
                fontWeight: 500,
                textAlign: "center",
                fontSize: { xs: "0.9rem", sm: "1rem" },
                letterSpacing: "0.5px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
                transitionDelay: "0.5s",
              }}
            >
              Sign in to your account
            </Typography>
          </Box>

          <CardContent
            sx={{
              padding: { xs: "24px", md: "32px" },
              position: "relative",
            }}
          >
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color="#0c83c8" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  marginBottom: "24px",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(10px)",
                  transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
                  transitionDelay: "0.6s",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                    },
                    "&.Mui-focused": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                      "& fieldset": {
                        borderColor: "#0c83c8",
                        borderWidth: "2px",
                      },
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#0c83c8",
                  },
                  "& .MuiInputBase-input": {
                    padding: "14px 14px 14px 0",
                    fontSize: "1rem",
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color="#0c83c8" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                        sx={{
                          color: "#666",
                          transition: "transform 0.2s ease, color 0.2s ease",
                          "&:hover": {
                            transform: "scale(1.1)",
                            color: "#0c83c8",
                          },
                        }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  marginBottom: "16px",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(10px)",
                  transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
                  transitionDelay: "0.7s",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                    },
                    "&.Mui-focused": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                      "& fieldset": {
                        borderColor: "#0c83c8",
                        borderWidth: "2px",
                      },
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#0c83c8",
                  },
                  "& .MuiInputBase-input": {
                    padding: "14px 14px 14px 0",
                    fontSize: "1rem",
                  },
                }}
              />

              <Box
                sx={{
                  textAlign: "right",
                  marginBottom: "24px",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(10px)",
                  transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
                  transitionDelay: "0.8s",
                }}
              >
                {/* <Link
                  href="#"
                  underline="none"
                  sx={{
                    color: "#0c83c8",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-2px",
                      left: 0,
                      width: "0%",
                      height: "2px",
                      backgroundColor: "#0c83c8",
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "100%",
                    },
                  }}
                >
                  Forgot password?
                </Link> */}
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  padding: { xs: "12px", md: "14px" },
                  background: "linear-gradient(45deg, #0c83c8 0%, #0a6eaa 100%)",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  boxShadow: "0 4px 15px rgba(12, 131, 200, 0.3)",
                  position: "relative",
                  overflow: "hidden",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(10px)",
                  transition: "all 0.3s ease, opacity 0.5s ease-out, transform 0.5s ease-out",
                  transitionDelay: "0.9s",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    transition: "left 0.7s ease",
                  },
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(12, 131, 200, 0.4)",
                    transform: "translateY(-2px)",
                    "&::before": {
                      left: "100%",
                    },
                  },
                  "&:active": {
                    transform: "translateY(1px)",
                    boxShadow: "0 2px 10px rgba(12, 131, 200, 0.3)",
                  },
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
              </Button>

              <Box
                sx={{
                  textAlign: "center",
                  marginTop: "32px",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(10px)",
                  transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
                  transitionDelay: "1s",
                }}
              >
                <Typography
                  sx={{
                    color: "#fc7a46",
                    fontWeight: 500,
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-2px",
                      left: 0,
                      width: "0%",
                      height: "2px",
                      backgroundColor: "#fc7a46",
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "100%",
                    },
                  }}
                >
                  Learn, Practice, Implement, Career
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}