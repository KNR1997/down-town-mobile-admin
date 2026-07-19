import { useRouter } from 'next/router';
import { QueryClient } from 'react-query';
import AsyncSelect from 'react-select/async';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
// utils
import { getErrorMessage } from '@/utils/form-error';
// client
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { purchaseOrderClient } from '@/data/client/purchase-order';
// hooks
import {
  useCreateGoodsReceivedNoteMutation,
  useUpdateGoodsReceivedNoteMutation,
} from '@/data/grn';
// types
import { GoodsReceivedNote, PurchaseOrder, PurchaseOrderItem } from '@/types';
// validations
import { grnValidationSchema } from './grn-validation-schema';
// components
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Button from '@/components/ui/button';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { selectStyles } from '@/components/ui/select/select.styles';

type IPurchaseOrderItem = {
  product?: {
    value: number;
    label: string;
  } | null;
  purchase_order_item_id: string;
  product_id: number;
  batch_number: string;
  received_quantity: number;
  purchase_price: number;
  manufacturing_date: string;
  expiry_date: string;
  remarks: string;
};

type FormValues = {
  name: string;
  slug: string;
  type: any;
  details: string;
  image: any;
  icon: any;
  purchase_order: {label: string, value: string};
  values: IPurchaseOrderItem[];
};

const defaultValues = {};

type IProps = {
  initialValues?: GoodsReceivedNote;
};
export default function CreateOrUpdateGRNForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    //@ts-ignore
    defaultValues: initialValues
      ? {
          ...initialValues,
          purchase_order: {
            label: initialValues.purchase_order.po_number,
            value: initialValues.purchase_order.id,
          },
          values: initialValues.items.map((item) => ({
            product_name: `${item.product.sku} - ${item.product.name}`,
            ordered_quantity: item.ordered_quantity,
            purchase_price: item.purchase_price,
          })),
        }
      : defaultValues,
    //@ts-ignore
    resolver: yupResolver(grnValidationSchema),
  });
  const { fields, replace, remove } = useFieldArray({
    control,
    name: 'values',
  });

  const { mutate: createGRN, isLoading: creating } =
    useCreateGoodsReceivedNoteMutation();
  const { mutate: updateGRN, isLoading: updating } =
    useUpdateGoodsReceivedNoteMutation();

  async function fetchAsyncPurchaseOrdersOptions(inputValue: string) {
    const queryClient = new QueryClient();
    const data = await queryClient.fetchQuery(
      [API_ENDPOINTS.PRODUCTS, { text: inputValue, page: 1 }],
      () => purchaseOrderClient.paginated({ name: inputValue, page: 1 }),
    );
    return data.data.map((purchase_order: PurchaseOrder) => ({
      value: purchase_order.id,
      label: `${purchase_order.po_number}`,
    }));
  }

  const queryClient = new QueryClient();

  async function onChangePurchaseOrder(option: any) {
    setValue('purchase_order', option);

    if (!option) {
      replace([]);
      return;
    }

    const purchaseOrder = await queryClient.fetchQuery(
      [API_ENDPOINTS.PURCHASE_ORDERS, option.value],
      () => purchaseOrderClient.get({ slug: option.value }),
    );

    replace(
      purchaseOrder.items.map((item: PurchaseOrderItem) => ({
        purchase_order_item_id: item.id,
        product_id: item.product.id,
        product_name: item.product.name,
        ordered_quantity: item.ordered_quantity,
        received_quantity: item.received_quantity,
        purchase_price: item.purchase_price ?? 0,
        batch_number: '',
        manufacturing_date: '',
        expiry_date: '',
        remarks: '',
      })),
    );
  }

  const onSubmit = async (values: FormValues) => {
    const input = {
      purchase_order: values.purchase_order.value,
      // supplier_id: values.purchase_order.supplier.id,
      // warehouse_id: values.purchase_order.warehouse.id,
      items: values.values.map((item) => ({
        purchase_order_item: item.purchase_order_item_id,
        product_id: item.product_id,
        quantity: item.received_quantity,
        unit_price: item.purchase_price,
        selling_price: item.purchase_price,
        purchase_price: item.purchase_price,
        batch_number: item.batch_number,
        // manufacturing_date: item.manufacturing_date,
        // expiry_date: item.expiry_date,
        remarks: item.remarks,
      })),
    };

    try {
      if (!initialValues) {
        createGRN({
          ...input,
          ...(initialValues?.slug && { slug: initialValues.slug }),
        });
      } else {
        updateGRN({
          ...input,
          id: initialValues.id!,
        });
      }
    } catch (err) {
      getErrorMessage(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } ${t('form:tag-description-helper-text')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="col-span-7">
            <Label>Purchase Order</Label>
            <Controller
              control={control}
              name="purchase_order"
              render={({ field }) => (
                <AsyncSelect
                  {...field}
                  styles={selectStyles}
                  isDisabled={!!initialValues}
                  cacheOptions
                  defaultOptions
                  loadOptions={fetchAsyncPurchaseOrdersOptions}
                  placeholder="Search Purchase Order"
                  value={field.value}
                  onChange={(option) => {
                    field.onChange(option);
                    onChangePurchaseOrder(option);
                  }}
                />
              )}
            />
          </div>
        </Card>
      </div>
      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } ${t('form:purchase-order-description-helper-text')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div>
            {fields.map((item: any & { id: string }, index) => (
              <div
                className="py-5 border-b border-dashed border-border-200 last:border-0 md:py-8"
                key={item.id}
              >
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4">
                    <Input
                      label="Product"
                      name="product_name"
                      disabled
                      value={item.product_name}
                    />
                  </div>

                  <div className="col-span-2">
                    <Input
                      label="Order Qty"
                      name="ordered_quantity"
                      disabled
                      value={item.ordered_quantity}
                    />
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      label="Received Qty"
                      {...register(`values.${index}.received_quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      label="Purchase Price"
                      {...register(`values.${index}.purchase_price`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* <Button
            type="button"
            onClick={() =>
              append({
                product: null,
                quantity: 1,
              })
            }
            className="w-full sm:w-auto"
          >
            {t('form:button-label-add-value')}
          </Button> */}
        </Card>
      </div>
      <StickyFooterPanel className="z-0">
        <div className="text-end">
          {initialValues && (
            <Button
              variant="outline"
              onClick={router.back}
              className="text-sm me-4 md:text-base"
              type="button"
            >
              {t('form:button-label-back')}
            </Button>
          )}

          <Button
            loading={creating || updating}
            disabled={creating || updating}
            className="text-sm md:text-base"
          >
            {initialValues
              ? t('form:button-label-update-grn')
              : t('form:button-label-add-grn')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
