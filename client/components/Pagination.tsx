import React from "react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  handlePageChange,
}) => {
  const maxPagesToShow = 5; // Maximum number of pages to display

  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  const pages = [];

  if (startPage > 1) {
    pages.push(
      <span key="ellipsis-start" className="mx-1 mt-1">
        ...
      </span>
    );
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <span
        key={i}
        onClick={() => handlePageChange(i)}
        className={`cursor-pointer rounded-lg px-3 py-2 mx-1 ${
          currentPage === i ? "bg-gray-300" : "bg-white"
        }`}
      >
        {i}
      </span>
    );
  }

  if (endPage < totalPages) {
    pages.push(
      <span key="ellipsis-end" className="mx-1 mt-1">
        ...
      </span>
    );
  }

  return <div className="flex justify-center mt-4">{pages}</div>;
};

export default Pagination;
