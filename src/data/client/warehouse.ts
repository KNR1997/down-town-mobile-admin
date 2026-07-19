import {
  Warehouse,
  WarehousePaginator,
  WarehouseQueryOptions,
  CreateWarehouseInput,
  QueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const warehouseClient = {
  ...crudFactory<Warehouse, QueryOptions, CreateWarehouseInput>(
    API_ENDPOINTS.WAREHOUSES
  ),
  paginated: ({ name, ...params }: Partial<WarehouseQueryOptions>) => {
    return HttpClient.get<WarehousePaginator>(API_ENDPOINTS.WAREHOUSES, {
      searchJoin: 'and',
      ...params,
      search: HttpClient.formatSearchParams({ name }),
    });
  },
};
