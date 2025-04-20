import React from 'react';
import { Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function LogCharts({ logs }) {
  // Group log counts by level
  const counts = logs.reduce((acc, l) => {
    acc[l[2]] = (acc[l[2]] || 0) + 1;
    return acc;
  }, {});
  const data = Object.entries(counts).map(([level, count]) => ({ level, count }));

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Log Levels Distribution</Typography>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="level" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default LogCharts;
