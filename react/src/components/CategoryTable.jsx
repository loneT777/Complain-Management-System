import React from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import { Edit, Delete } from '@mui/icons-material';

const CategoryTable = ({ categories, divisions, loading, handleEdit, handleDelete }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const getDivisionName = (divisionId) => {
    const division = divisions.find(d => d.id === divisionId);
    return division ? division.name : '-';
  };

  const getParentCategoryName = (parentId) => {
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.category_name : '-';
  };

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Parent Category</th>
            <th>Category Name</th>
            <th>Description</th>
            <th>Division</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-muted py-4">
                No categories found
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.code}</td>
                <td>{getParentCategoryName(category.parent_id)}</td>
                <td>{category.category_name}</td>
                <td>{category.description || '-'}</td>
                <td>{getDivisionName(category.division_id)}</td>
                <td className="text-center">
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit fontSize="small" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Delete fontSize="small" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default CategoryTable;
