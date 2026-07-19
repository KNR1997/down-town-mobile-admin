import {
  Supplier,
  SupplierPaginator,
  SupplierQueryOptions,
  CreateSupplierInput,
  QueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const supplierClient = {
  ...crudFactory<Supplier, QueryOptions, CreateSupplierInput>(
    API_ENDPOINTS.SUPPLIERS
  ),
  paginated: ({ name, ...params }: Partial<SupplierQueryOptions>) => {
    return HttpClient.get<SupplierPaginator>(API_ENDPOINTS.SUPPLIERS, {
      searchJoin: 'and',
      self,
      ...params,
      search: HttpClient.formatSearchParams({ name }),
    });
  },
};
