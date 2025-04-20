import React from 'react';
import { Paper, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#1976d2', '#d32f2f', '#ffa000', '#388e3c', '#7b1fa2', '#0288d1', '#c2185b', '#fbc02d', '#455a64', '#afb42b'
];

function LogPieChart({ logs }) {
  // Group log counts by level
  const counts = logs.reduce((acc, l) => {
    acc[l[2]] = (acc[l[2]] || 0) + 1;
    return acc;
  }, {});
  const data = Object.entries(counts).map(([level, count]) => ({ level, count }));

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Log Levels Pie Chart</Typography>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="level"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#1976d2"
            label={({ level, percent }) => `${level} (${(percent * 100).toFixed(0)}%)`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default LogPieChart;
