import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

function LogSummary({ logs }) {
  const total = logs.length;
  const errorCount = logs.filter(l => l[2] === 'ERROR').length;
  const warnCount = logs.filter(l => l[2] === 'WARN' || l[2] === 'WARNING').length;
  const infoCount = logs.filter(l => l[2] === 'INFO').length;

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Total Logs</Typography>
          <Typography variant="h4">{total}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Errors</Typography>
          <Typography variant="h4" color="error">{errorCount}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Warnings</Typography>
          <Typography variant="h4" color="warning.main">{warnCount}</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default LogSummary;
