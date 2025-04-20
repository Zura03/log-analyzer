import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function LogTable({ logs }) {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 40 * 35, overflow: 'auto' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Timestamp</TableCell>
            <TableCell>Level</TableCell>
            <TableCell>Message</TableCell>
            <TableCell>Filename</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map(([id, filename, loglevel, timestamp, message]) => (
            <TableRow key={id}>
              <TableCell>{id}</TableCell>
              <TableCell>{timestamp}</TableCell>
              <TableCell>{loglevel}</TableCell>
              <TableCell>{message}</TableCell>
              <TableCell>{filename}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default LogTable;
