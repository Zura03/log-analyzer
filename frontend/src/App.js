import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid, Snackbar, Alert } from '@mui/material';
import FileUpload from './components/FileUpload';
import LogFilters from './components/LogFilters';
import LogTable from './components/LogTable';
import LogSummary from './components/LogSummary';
import LogCharts from './components/LogCharts';
import LogPieChart from './components/LogPieChart';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function App() {
  const [logs, setLogs] = useState([]);
  const [loglevels, setLoglevels] = useState([]);
  const [filenames, setFilenames] = useState([]);
  const [filters, setFilters] = useState({ loglevel: '', filename: '', timestamp_from: '', timestamp_to: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchLogs = async (filters = {}) => {
    let url = `${BACKEND_URL}/logs/?`;
    if (filters.loglevel) url += `loglevel=${filters.loglevel}&`;
    if (filters.filename) url += `filename=${filters.filename}&`;
    if (filters.timestamp_from) url += `timestamp_from=${encodeURIComponent(filters.timestamp_from)}&`;
    if (filters.timestamp_to) url += `timestamp_to=${encodeURIComponent(filters.timestamp_to)}&`;
    // Remove trailing & or ?
    url = url.replace(/[&?]$/, '');
    const res = await axios.get(url);
    setLogs(res.data.logs);
  };

  const fetchLoglevels = async () => {
    const res = await axios.get(`${BACKEND_URL}/loglevels/`);
    setLoglevels(res.data.loglevels);
  };
  const fetchFilenames = async () => {
    const res = await axios.get(`${BACKEND_URL}/filenames/`);
    setFilenames(res.data.filenames);
  };
  useEffect(() => {
    fetchLogs(filters);
    fetchLoglevels();
    fetchFilenames();
    // eslint-disable-next-line
  }, [filters]);

  const handleUploadSuccess = (uploadedFilename) => {
    setSnackbar({ open: true, message: 'Log file uploaded and parsed!', severity: 'success' });
    setFilters(f => ({ ...f, filename: uploadedFilename }));
    // fetchLogs will be triggered by useEffect when filters change
    fetchLoglevels();
  };
  const handleUploadError = (msg) => {
    setSnackbar({ open: true, message: msg, severity: 'error' });
  };
  const handleClearLogs = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/logs/`);
      setSnackbar({ open: true, message: 'All logs cleared!', severity: 'success' });
      fetchLogs(filters);
      fetchLoglevels();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to clear logs.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f0f4f8 0%, #e3eafc 100%)', fontFamily: 'Roboto, Arial, sans-serif', py: 4 }}>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, letterSpacing: 2, color: '#1976d2', mb: 3, textShadow: '1px 2px 6px #e3eafc' }}>
            Log Analyzer Dashboard
          </Typography>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <button onClick={handleClearLogs} style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', boxShadow: '0 2px 8px rgba(211,47,47,0.15)' }}>
              Clear All Logs
            </button>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)' }}>
                <FileUpload onSuccess={handleUploadSuccess} onError={handleUploadError} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)' }}>
                <LogFilters loglevels={loglevels} filenames={filenames} filters={filters} setFilters={setFilters} />
              </Paper>
            </Grid>
          </Grid>
          <Box my={3}>
            <LogSummary logs={logs} />
          </Box>
          <Box my={3}>
            <LogCharts logs={logs} />
          </Box>
          <Box my={3}>
            <LogPieChart logs={logs} />
          </Box>
          <Box my={3}>
            <LogTable logs={logs} />
          </Box>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
          </Snackbar>
        </Box>

      </Container>
    </Box>
  );
}


export default App;
