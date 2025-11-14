import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages === 0) return null;

  const pageNumbers = [];

  // Determine page number range to display (max 7 pages)
  let startPage = Math.max(1, currentPage - 3);
  let endPage = Math.min(totalPages, currentPage + 3);

  if (currentPage <= 4) {
    startPage = 1;
    endPage = Math.min(7, totalPages);
  } else if (currentPage + 3 >= totalPages) {
    startPage = Math.max(1, totalPages - 6);
    endPage = totalPages;
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const handleClick = (page) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav>
      <ul className="pagination justify-content-center">
        {currentPage > 1 && (
          <li className="page-item">
            <button className="page-link" onClick={() => handleClick(currentPage - 1)}>
              {'<'}
            </button>
          </li>
        )}

        {startPage > 1 && (
          <li className="page-item">
            <button className="page-link" onClick={() => handleClick(1)}>
              1
            </button>
          </li>
        )}

        {startPage > 2 && (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        )}

        {pageNumbers.map((page) => (
          <li
            key={page}
            className={`page-item ${page === currentPage ? "active" : ""}`}
          >
            <button className="page-link" onClick={() => handleClick(page)}>
              {page}
            </button>
          </li>
        ))}

        {endPage < totalPages - 1 && (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        )}

        {endPage < totalPages && (
          <li className="page-item">
            <button className="page-link" onClick={() => handleClick(totalPages)}>
              {totalPages}
            </button>
          </li>
        )}

        {currentPage < totalPages && (
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => handleClick(currentPage + 1)}
            >
              {'>'}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
