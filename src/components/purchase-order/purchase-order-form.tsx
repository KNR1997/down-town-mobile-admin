import { useRouter } from 'next/router';
import AsyncSelect from 'react-select/async';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Control,
  Controller,
  FieldErrors,
  useFieldArray,
  useForm,
} from 'react-hook-form';
// utils
import { QueryClient } from 'react-query';
// clients
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { productClient } from '@/data/client/product';
// hooks
import { useSuppliersQuery } from '@/data/supplier';
import {
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
} from '@/data/purchase-order';
import { useUsersQuery } from '@/data/user';
import { useWarehousesQuery } from '@/data/warehouse';
// types
import {
  ItemProps,
  Product,
  PurchaseOrder,
  PurchaseOrderStatus,
  Supplier,
  User,
  Warehouse,
} from '@/types';
// validations
import { purchaseOrderValidationSchema } from './purchase-order-validation-schema';
// components
import Label from '@/components/ui/label';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import SelectInput from '@/components/ui/select-input';
import Checkbox from '@/components/ui/checkbox/checkbox';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { selectStyles } from '@/components/ui/select/select.styles';
import ValidationError from '@/components/ui/form-validation-error';

function SelectSuppliers({
  control,
  errors,
}: {
  control: Control<FormValues>;
  errors: FieldErrors;
}) {
  const { locale } = useRouter();
  const { t } = useTranslation();
  const { suppliers, loading } = useSuppliersQuery({ language: locale });
  return (
    <div className="mb-5">
      <SelectInput
        label="Supplier"
        required
        name="supplier"
        control={control}
        // @ts-ignore
        getOptionLabel={(option: Supplier) => option.supplier_code}
        // @ts-ignore
        getOptionValue={(option: Supplier) => option.id}
        options={suppliers!}
        isLoading={loading}
      />
      <ValidationError message={t(errors.supplier?.message)} />
    </div>
  );
}

function SelectWarehouse({
  control,
  errors,
}: {
  control: Control<FormValues>;
  errors: FieldErrors;
}) {
  const { locale } = useRouter();
  const { t } = useTranslation();
  const { warehouses, loading } = useWarehousesQuery({ language: locale });
  return (
    <div className="mb-5">
      <SelectInput
        label="Warehouse"
        required
        name="warehouse"
        control={control}
        // @ts-ignore
        getOptionLabel={(option: Warehouse) => option.warehouse_code}
        // @ts-ignore
        getOptionValue={(option: Warehouse) => option.id}
        options={warehouses!}
        isLoading={loading}
      />
      <ValidationError message={t(errors.warehouse?.message)} />
    </div>
  );
}

function SelectUsers({
  control,
  errors,
}: {
  control: Control<FormValues>;
  errors: FieldErrors;
}) {
  const { t } = useTranslation();
  const { users, loading } = useUsersQuery({
    limit: 999,
    page: 1,
  });
  return (
    <div className="mb-5">
      <SelectInput
        label="Approved By"
        required
        name="approved_by"
        control={control}
        // @ts-ignore
        getOptionLabel={(option: User) => option.name}
        // @ts-ignore
        getOptionValue={(option: User) => option.id}
        options={users!}
        isLoading={loading}
      />
      <ValidationError message={t(errors.approved_by?.message)} />
    </div>
  );
}

type PurchaseOrderItem = {
  id: number | null;
  product?: {
    value: number;
    label: string;
  } | null;
  ordered_quantity: number;
};

type FormValues = {
  supplier: Supplier;
  warehouse: Warehouse;
  is_approved: boolean;
  approved_by: User | null;
  items: PurchaseOrderItem[];
};

const defaultValues: FormValues = {
  supplier: null as any,
  warehouse: null as any,
  is_approved: false,
  approved_by: null,
  items: [
    {
      id: null,
      product: null,
      ordered_quantity: 1,
    },
  ],
};

type IProps = {
  initialValues?: PurchaseOrder;
};

export default function CreateOrUpdatePurchaseOrderForm({
  initialValues,
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    //@ts-ignore
    defaultValues: initialValues
      ? {
          ...initialValues,
          is_approved: initialValues.status == PurchaseOrderStatus.APPROVED,
          items: initialValues.items.map((item) => ({
            id: item.id,
            product: {
              value: item.product.id,
              label: `${item.product.sku} - ${item.product.name}`,
            },
            ordered_quantity: item.ordered_quantity,
          })),
        }
      : defaultValues,
    //@ts-ignore
    resolver: yupResolver(purchaseOrderValidationSchema),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const { mutate: createPurchaseOrder, isLoading: creating } =
    useCreatePurchaseOrderMutation();
  const { mutate: updatePurchaseOrder, isLoading: updating } =
    useUpdatePurchaseOrderMutation();

  async function fetchAsyncOptions(inputValue: string) {
    const queryClient = new QueryClient();
    const data = await queryClient.fetchQuery(
      [API_ENDPOINTS.PRODUCTS, { text: inputValue, page: 1 }],
      () => productClient.paginated({ name: inputValue, page: 1 }),
    );

    return data.data.map((product: Product) => ({
      value: product.id,
      label: `${product.sku} - ${product.name}`,
    }));
  }

  const onSubmit = async (values: FormValues) => {
    const input = {
      supplier_id: values.supplier.id,
      warehouse_id: values.warehouse.id,
      is_approved: values.is_approved,
      approved_by: values.approved_by?.id,
      items: values.items.map((item) => ({
        id: item.id,
        product_id: item.product!.value,
        quantity: item.ordered_quantity,
      })),
    };

    try {
      if (!initialValues) {
        createPurchaseOrder({
          ...input,
        });
      } else {
        updatePurchaseOrder({
          ...input,
          id: initialValues.id!,
        });
      }
    } catch (err) {
      // getErrorMessage(err);
    }
  };

  const is_approved = watch('is_approved');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:my-8">
        <Description
          title={t('form:input-label-image')}
          details={t('form:tag-image-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="image" control={control} multiple={false} />
        </Card>
      </div> */}

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
          <SelectSuppliers control={control} errors={errors} />
          <SelectWarehouse control={control} errors={errors} />
          <Checkbox
            {...register('is_approved')}
            id="is_approved"
            label="Is Approved"
            // disabled={Boolean(is_external)}
            className="mb-5"
          />
          {is_approved && (
            <>
              <SelectUsers control={control} errors={errors} />
            </>
          )}
        </Card>
      </div>
      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title="Purchase Order Items"
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } ${t('form:purchase-order-items-description-helper-text')}`}
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
                  <div className="col-span-7">
                    <Label>Product</Label>
                    <Controller
                      control={control}
                      name={`items.${index}.product`}
                      render={({ field }) => (
                        <AsyncSelect
                          {...field}
                          styles={selectStyles}
                          cacheOptions
                          defaultOptions
                          loadOptions={fetchAsyncOptions}
                          placeholder="Search Product"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <Input
                      type="number"
                      min={1}
                      label="Quantity"
                      {...register(`items.${index}.ordered_quantity`, {
                        valueAsNumber: true,
                      })}
                      error={t(
                        errors?.items?.[index]?.ordered_quantity?.message,
                      )}
                    />
                  </div>
                  <div className="col-span-2 flex items-end">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => remove(index)}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={() =>
              append({
                id: null,
                product: null,
                ordered_quantity: 1,
              })
            }
            className="w-full sm:w-auto"
          >
            {t('form:button-label-add-value')}
          </Button>
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
              ? t('form:button-label-update-purchase-order')
              : t('form:button-label-add-purchase-order')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
