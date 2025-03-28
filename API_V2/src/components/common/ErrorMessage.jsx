import React from "react";
import { Box, Typography, Alert, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ErrorMessage = ({ error, onRetry, showUploadButton = false }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Error
      </Typography>
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
      {onRetry && (
        <Button
          variant="contained"
          color="primary"
          onClick={onRetry}
          sx={{ mr: 2 }}
        >
          Retry
        </Button>
      )}
      {showUploadButton && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/upload")}
        >
          Upload Data
        </Button>
      )}
    </Box>
  );
};

export default ErrorMessage;
