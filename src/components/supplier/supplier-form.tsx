import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
// utils
import { getErrorMessage } from '@/utils/form-error';
// hooks
import {
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} from '@/data/supplier';
// validations
import { supplierValidationSchema } from './supplier-validation-schema';
// components
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';

type FormValues = {
  supplier_code: string;
  company_name: string;
};

const defaultValues = {
  supplier_code: '',
  company_name: '',
};

type IProps = {
  initialValues?: any;
};

export default function CreateOrUpdateSupplierForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    //@ts-ignore
    defaultValues: initialValues
      ? {
          ...initialValues,
        }
      : defaultValues,
    //@ts-ignore
    resolver: yupResolver(supplierValidationSchema),
  });

  const { mutate: createSupplier, isLoading: creating } =
    useCreateSupplierMutation();
  const { mutate: updateSupplier, isLoading: updating } =
    useUpdateSupplierMutation();

  const onSubmit = async (values: FormValues) => {
    const input = {
      supplier_code: values.supplier_code,
      company_name: values.company_name,
    };

    try {
      if (!initialValues) {
        createSupplier({
          ...input,
        });
      } else {
        updateSupplier({
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
          } ${t('form:supplier-description-helper-text')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label="Supplier Code"
            {...register('supplier_code')}
            error={t(errors.supplier_code?.message!)}
            variant="outline"
            className="mb-5"
            required
          />
          <Input
            label="Company Name"
            {...register('company_name')}
            error={t(errors.company_name?.message!)}
            variant="outline"
            className="mb-5"
            required
          />
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
              ? t('form:button-label-update-supplier')
              : t('form:button-label-add-supplier')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
