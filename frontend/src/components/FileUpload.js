import React, { useRef, useState } from 'react';
import { Button, Box, Typography, LinearProgress } from '@mui/material';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function FileUpload({ onSuccess, onError }) {
  const fileInput = useRef();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.log')) {
      onError('Only .log files are allowed.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await axios.post(`${BACKEND_URL}/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess(file.name);
    } catch (err) {
      onError('Upload failed.');
    }
    setUploading(false);
  };

  return (
    <Box>
      <Typography variant="h6">Upload Log File (.log)</Typography>
      <input
        type="file"
        accept=".log"
        style={{ display: 'none' }}
        ref={fileInput}
        onChange={handleUpload}
      />
      <Button
        variant="contained"
        onClick={() => fileInput.current.click()}
        disabled={uploading}
        sx={{ mt: 2 }}
      >
        Choose File
      </Button>
      {uploading && <LinearProgress sx={{ mt: 2 }} />}
    </Box>
  );
}

export default FileUpload;
