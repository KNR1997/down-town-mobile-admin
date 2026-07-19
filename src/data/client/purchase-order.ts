import {
  PurchaseOrder,
  PurchaseOrderPaginator,
  PurchaseOrderQueryOptions,
  CreatePurchaseOrderInput,
  QueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const purchaseOrderClient = {
  ...crudFactory<PurchaseOrder, QueryOptions, CreatePurchaseOrderInput>(
    API_ENDPOINTS.PURCHASE_ORDERS
  ),
  paginated: ({ name, ...params }: Partial<PurchaseOrderQueryOptions>) => {
    return HttpClient.get<PurchaseOrderPaginator>(API_ENDPOINTS.PURCHASE_ORDERS, {
      searchJoin: 'and',
      self,
      ...params,
      search: HttpClient.formatSearchParams({ name }),
    });
  },
};
