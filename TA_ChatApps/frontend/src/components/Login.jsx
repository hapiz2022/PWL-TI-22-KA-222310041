import React, { useState, useEffect } from "react";
import {
  Box, Button, TextField, Typography, CircularProgress,
  Paper, Stepper, Step, StepLabel
} from "@mui/material";
import axios from "axios";
import Confetti from "react-confetti";
import { motion } from "framer-motion";

const Login = ({ onLoggedIn }) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [windowDims, setWindowDims] = useState({ width: 0, height: 0 });
  const [requirePassword, setRequirePassword] = useState(false);

  useEffect(() => {
    setWindowDims({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const celebrate = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
  };

  const handleSendCode = async () => {
    setError("");
    setLoading(true);
    const trimmedPhone = phone.trim();
    if (!trimmedPhone.startsWith("+")) {
      setError("Phone number must start with '+' (e.g. +628xxxxxxx)");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/auth/send-code", { phone: trimmedPhone });
      if (res.data.status === "code_sent") setStep(2);
      else setError("Unexpected response from server");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3001/auth/verify", { code });

      if (res.data.status === "authenticated") {
        localStorage.setItem("telegramSession", res.data.session);
        onLoggedIn(res.data.userId);
      } else if (res.data.status === "need_password") {
        setRequirePassword(true);
        setStep(3);
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Verification failed";
      setError(msg.includes("PHONE_CODE_INVALID") ? "Invalid code. Please try again." : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3001/auth/verify", { code, password });

      if (res.data.status === "authenticated") {
        localStorage.setItem("telegramSession", res.data.session);
        onLoggedIn(res.data.userId);
      } else {
        setError("Wrong password");
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Password verification failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Enter Phone", "Enter Code", ...(requirePassword ? ["2FA Password"] : [])];

  const renderStep = () => {
    const props = {
      fullWidth: true,
      variant: "outlined",
      sx: { mb: 2, borderRadius: 2 }
    };

    switch (step) {
      case 1:
        return (
          <>
            <TextField
              label="Phone Number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+62xxxxxxxxxxx"
              {...props}
            />
            <Button variant="contained" onClick={handleSendCode} disabled={loading} fullWidth>
              {loading ? <CircularProgress size={24} /> : "Send Code"}
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <TextField
              label="Telegram Code"
              value={code}
              onChange={e => setCode(e.target.value)}
              {...props}
            />
            <Button variant="contained" onClick={handleVerifyCode} disabled={loading} fullWidth>
              {loading ? <CircularProgress size={24} /> : "Verify Code"}
            </Button>
          </>
        );
      case 3:
        return (
          <>
            <TextField
              label="2FA Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              {...props}
            />
            <Button variant="contained" onClick={handleSubmitPassword} disabled={loading} fullWidth>
              {loading ? <CircularProgress size={24} /> : "Submit Password"}
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (error && !loading) celebrate();
  }, [error]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        position: "relative",
        background: "linear-gradient(135deg, #c3ecf9 0%, #f9e0f3 100%)",
        overflow: "hidden",
      }}
    >
      
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 30, repeat: Infinity }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: "radial-gradient(circle at 30% 30%, #b2ebf2 0%, transparent 50%), radial-gradient(circle at 70% 70%, #ffcdd2 0%, transparent 50%)",
        }}
      />

      {confetti && <Confetti width={windowDims.width} height={windowDims.height} recycle={false} />}

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ zIndex: 2 }}
      >
        <Paper
          elevation={12}
          sx={{
            width: "100%",
            maxWidth: 420,
            height: 520,
            px: 4,
            py: 5,
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          }}
        >
          <Box>
            {/* Icon */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Box
                  component="svg"
                  width={56}
                  height={56}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  sx={{ color: theme => theme.palette.primary.main }}
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </Box>
              </motion.div>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                Login to Chat
              </Typography>
            </Box>

            {/* Steps */}
            <Stepper activeStep={step - 1} alternativeLabel sx={{ mb: 3 }}>
              {steps.map(label => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStep()}
          </Box>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: "center" }}>
              {error}
            </Typography>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Login;
