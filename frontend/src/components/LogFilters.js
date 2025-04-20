import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const defaultFilters = { loglevel: '', filename: '', timestamp_from: '', timestamp_to: '' };

function LogFilters({ loglevels, filenames = [], filters, setFilters }) {
  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Log Level</InputLabel>
        <Select
          value={filters.loglevel}
          label="Log Level"
          onChange={e => setFilters(f => ({ ...f, loglevel: e.target.value }))}
        >
          <MenuItem value="">All</MenuItem>
          {loglevels.map(level => (
            <MenuItem key={level} value={level}>{level}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Filename</InputLabel>
        <Select
          value={filters.filename}
          label="Filename"
          onChange={e => setFilters(f => ({ ...f, filename: e.target.value }))}
        >
          <MenuItem value="">All</MenuItem>
          {filenames.map(filename => (
            <MenuItem key={filename} value={filename}>{filename}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ mt: 2 }}>
        <TextField
          label="Timestamp From"
          type="datetime-local"
          value={filters.timestamp_from || ''}
          onChange={e => {
            let v = e.target.value;
            if (v && v.length === 16) v += ':00'; // Add seconds if missing
            setFilters(f => ({ ...f, timestamp_from: v }));
          }}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Timestamp To"
          type="datetime-local"
          value={filters.timestamp_to || ''}
          onChange={e => {
            let v = e.target.value;
            if (v && v.length === 16) v += ':00'; // Add seconds if missing
            setFilters(f => ({ ...f, timestamp_to: v }));
          }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </Box>
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <button
          onClick={() => setFilters(defaultFilters)}
          style={{ background: '#1976d2', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
        >
          Reset Filters
        </button>
      </Box>
    </Box>
  );
}

export default LogFilters;
