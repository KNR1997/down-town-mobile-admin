import {
  CategoryQueryOptions,
  CreateCustomerInput,
  Customer,
  CustomerPaginator,
  QueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const customerClient = {
  ...crudFactory<Customer, QueryOptions, CreateCustomerInput>(
    API_ENDPOINTS.CUSTOMERS
  ),
  paginated: ({ type, name, self, ...params }: Partial<CategoryQueryOptions>) => {
    return HttpClient.get<CustomerPaginator>(API_ENDPOINTS.CUSTOMERS, {
      searchJoin: 'and',
      self,
      ...params,
      search: HttpClient.formatSearchParams({ type, name }),
    });
  },
};
