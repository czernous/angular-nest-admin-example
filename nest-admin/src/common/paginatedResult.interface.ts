export class PaginatedResult {
  data: any[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}
