import {
  GoodsReceivedNote,
  GoodsReceivedNotePaginator,
  GoodsReceivedNoteQueryOptions,
  CreateGoodsReceivedNoteInput,
  QueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const grnClient = {
  ...crudFactory<GoodsReceivedNote, QueryOptions, CreateGoodsReceivedNoteInput>(
    API_ENDPOINTS.GRNS
  ),
  paginated: ({ name, ...params }: Partial<GoodsReceivedNoteQueryOptions>) => {
    return HttpClient.get<GoodsReceivedNotePaginator>(API_ENDPOINTS.GRNS, {
      searchJoin: 'and',
      self,
      ...params,
      search: HttpClient.formatSearchParams({ name }),
    });
  },
};
