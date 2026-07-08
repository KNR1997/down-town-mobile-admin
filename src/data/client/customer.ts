import {
  CreateCustomerInput,
  Customer,
  CustomerPaginator,
  CustomerQueryOptions,
  QueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const customerClient = {
  ...crudFactory<Customer, QueryOptions, CreateCustomerInput>(
    API_ENDPOINTS.CUSTOMERS,
  ),
  paginated: ({
    name,
    contact_number,
    ...params
  }: Partial<CustomerQueryOptions>) => {
    return HttpClient.get<CustomerPaginator>(API_ENDPOINTS.CUSTOMERS, {
      searchJoin: 'and',
      ...params,
      search: HttpClient.formatSearchParams({ name, contact_number }),
    });
  },
  fetchCustomer: ({ id }: { id: string }) => {
    return HttpClient.get<Customer>(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
  },
};
