import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';

const Divisions = () => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/divisions');
      // const data = await response.json();
      // setDivisions(data);
      
      // Mock data for now
      setDivisions([]);
    } catch (error) {
      console.error('Error fetching divisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    // TODO: Implement add functionality
    console.log('Add division');
  };

  const handleEdit = (id) => {
    // TODO: Implement edit functionality
    console.log('Edit division:', id);
  };

  const handleDelete = (id) => {
    // TODO: Implement delete functionality
    console.log('Delete division:', id);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Divisions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAdd}
        >
          Add Division
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Division Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {divisions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" color="textSecondary" sx={{ py: 3 }}>
                      No divisions found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                divisions.map((division) => (
                  <TableRow key={division.id} hover>
                    <TableCell>{division.id}</TableCell>
                    <TableCell>{division.name}</TableCell>
                    <TableCell>{division.code}</TableCell>
                    <TableCell>{division.description}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(division.id)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(division.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Divisions;
