'use client';

import { useEffect, useMemo, useState } from 'react';
import { MAX_PAGE_SIZE, getPaginationResult } from '@/lib/pagination';

export function usePagination<T>(items: T[], initialPageSize: number) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(Math.min(initialPageSize, MAX_PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [items]);

  const pagination = useMemo(() => getPaginationResult(items, page, pageSize), [items, page, pageSize]);

  useEffect(() => {
    if (pagination.currentPage !== page) {
      setPage(pagination.currentPage);
    }
  }, [page, pagination.currentPage]);

  function setPageSize(nextPageSize: number) {
    setPageSizeState(Math.max(1, Math.min(nextPageSize, MAX_PAGE_SIZE)));
    setPage(1);
  }

  return {
    ...pagination,
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
    setPage,
    setPageSize,
  };
}
