import { PaginationQueryDto } from '../dto/pagination-query.dto';

export type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export function getPaginationParams(query: PaginationQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function createPaginatedResult<T>(
  items: T[],
  totalItems: number,
  query: PaginationQueryDto,
): PaginatedResult<T> {
  const { page, limit } = getPaginationParams(query);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export function isPaginatedResult<T>(data: unknown): data is PaginatedResult<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as PaginatedResult<T>).items) &&
    typeof (data as PaginatedResult<T>).pagination === 'object' &&
    (data as PaginatedResult<T>).pagination !== null
  );
}
