'use client';

type PaginationControlsProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  pageSizeOptions: number[];
  itemLabel: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function PaginationControls({
  page,
  pageSize,
  totalItems,
  totalPages,
  startItem,
  endItem,
  pageSizeOptions,
  itemLabel,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="pagination-bar" aria-label={`Paginacion de ${itemLabel}`}>
      <div className="pagination-summary">
        <strong>
          Mostrando {startItem}-{endItem} de {totalItems}
        </strong>
        <span>{itemLabel} en esta vista.</span>
      </div>

      <div className="pagination-actions">
        <label className="pagination-size">
          <span>Por pagina</span>
          <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="pagination-nav">
          <button className="pagination-nav-button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} type="button">
            Anterior
          </button>
          <span className="pagination-page-label">
            Pagina {page} de {totalPages}
          </span>
          <button
            className="pagination-nav-button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            type="button"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
