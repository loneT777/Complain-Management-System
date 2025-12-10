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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  MenuItem,
  TablePagination,
  InputAdornment
} from '@mui/material';
import { Edit, Delete, Add, Close, Search } from '@mui/icons-material';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    parent_id: '',
    category_name: '',
    description: '',
    division_id: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Pagination and search states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalRows, setTotalRows] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchDivisions();
  }, [page, rowsPerPage, searchQuery]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page + 1, // Laravel pages start from 1
        per_page: rowsPerPage,
        search: searchQuery
      });

      const response = await fetch(`/api/categories?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data.data || []);
      setTotalRows(data.pagination?.total || 0);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorMessage('Failed to load categories: ' + error.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await fetch('/api/public/divisions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDivisions(data.data || []);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      setDivisions([]);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        code: category.code || '',
        parent_id: category.parent_id || '',
        category_name: category.category_name || '',
        description: category.description || '',
        division_id: category.division_id || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        code: '',
        parent_id: '',
        category_name: '',
        description: '',
        division_id: ''
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      code: '',
      parent_id: '',
      category_name: '',
      description: '',
      division_id: ''
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSaveCategory = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      // Convert empty values to null
      const submitData = {
        ...formData,
        parent_id: formData.parent_id === '' ? null : formData.parent_id,
        division_id: formData.division_id === '' ? null : formData.division_id
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }
        setErrorMessage(data.message || 'Failed to save category');
        return;
      }

      setSuccessMessage(data.message || (editingCategory ? 'Category updated successfully' : 'Category created successfully'));
      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setErrorMessage('Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.message || 'Failed to delete category');
          return;
        }

        setSuccessMessage(data.message || 'Category deleted successfully');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        setErrorMessage('Error deleting category');
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    // Debounce search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setPage(0); // Reset to first page on search
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const getDivisionName = (divisionId) => {
    const division = divisions.find(d => d.id === divisionId);
    return division ? division.name : '-';
  };

  const getParentCategoryName = (parentId) => {
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.category_name : '-';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Categories</Typography>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Category
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage('')} sx={{ mb: 2 }}>
          <strong>Error:</strong> {errorMessage}
          <br />
          <Typography variant="caption">
            Make sure the database is configured and migrations are run: `php artisan migrate`
          </Typography>
        </Alert>
      )}

      {/* Search Box */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by code, name, or description..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: 2 }}>
          <CircularProgress />
          <Typography>Loading categories...</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Parent ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Division ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="7" sx={{ textAlign: 'center', p: 3 }}>
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell>{category.code}</TableCell>
                    <TableCell>{getParentCategoryName(category.parent_id)}</TableCell>
                    <TableCell>{category.category_name}</TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell>{getDivisionName(category.division_id)}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(category)} title="Edit">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(category.id)} title="Delete">
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

      {/* Pagination */}
      {!loading && categories.length > 0 && (
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          sx={{ mt: 2 }}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
            <IconButton size="small" onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              error={!!errors.code}
              helperText={errors.code ? errors.code[0] : ''}
              placeholder="e.g., CAT001"
            />

            <TextField
              fullWidth
              size="small"
              label="Parent Category"
              name="parent_id"
              value={formData.parent_id}
              onChange={handleInputChange}
              error={!!errors.parent_id}
              helperText={errors.parent_id ? errors.parent_id[0] : 'Optional'}
              placeholder="Enter parent category ID"
            />

            <TextField
              fullWidth
              size="small"
              label="Category Name"
              name="category_name"
              value={formData.category_name}
              onChange={handleInputChange}
              error={!!errors.category_name}
              helperText={errors.category_name ? errors.category_name[0] : ''}
              placeholder="Enter category name"
            />

            <TextField
              fullWidth
              size="small"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              error={!!errors.description}
              helperText={errors.description ? errors.description[0] : ''}
              placeholder="Enter description"
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              size="small"
              select
              label="Division"
              name="division_id"
              value={formData.division_id}
              onChange={handleInputChange}
              error={!!errors.division_id}
              helperText={errors.division_id ? errors.division_id[0] : 'Optional'}
            >
              <MenuItem value="">None</MenuItem>
              {divisions.map((division) => (
                <MenuItem key={division.id} value={division.id}>
                  {division.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained" color="primary">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
