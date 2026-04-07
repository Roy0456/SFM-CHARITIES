export const MAX_PAGE_SIZE = 1000;

export const CASE_PAGE_SIZE_OPTIONS = [25, 50, 100, 250, 500, 1000];
export const LARGE_LIST_PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 250, 500, 1000];
export const MEDIUM_LIST_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

export type PaginationResult<T> = {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startItem: number;
  endItem: number;
};

export function getPaginationResult<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  const safePageSize = Math.max(1, Math.min(pageSize, MAX_PAGE_SIZE));
  const totalItems = items.length;
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / safePageSize);
  const currentPage = totalItems === 0 ? 1 : Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * safePageSize;
  const endIndex = startIndex + safePageSize;

  return {
    items: items.slice(startIndex, endIndex),
    currentPage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
    startItem: totalItems === 0 ? 0 : startIndex + 1,
    endItem: Math.min(totalItems, endIndex),
  };
}
