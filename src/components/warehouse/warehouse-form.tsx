import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
// utils
import { getErrorMessage } from '@/utils/form-error';
// hooks
import {
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
} from '@/data/warehouse';
// validations
import { tagValidationSchema } from './warehouse-validation-schema';
// components
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Card from '@/components/common/card';
import FileInput from '@/components/ui/file-input';
import Description from '@/components/ui/description';
import RichTextEditor from '@/components/ui/wysiwyg-editor/editor';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';

type FormValues = {
  warehouse_code: string;
  name: string;
  description: any;
  image: any;
};

const defaultValues = {
  image: '',
  warehouse_code: '',
  name: '',
  description: '',
};

type IProps = {
  initialValues?: any;
};
export default function CreateOrUpdateWarehouseForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    //@ts-ignore
    defaultValues: initialValues
      ? {
          ...initialValues,
        }
      : defaultValues,
    //@ts-ignore
    resolver: yupResolver(tagValidationSchema),
  });

  const { mutate: createWarehouse, isLoading: creating } =
    useCreateWarehouseMutation();
  const { mutate: updateWarehouse, isLoading: updating } =
    useUpdateWarehouseMutation();

  const onSubmit = async (values: FormValues) => {
    const input = {
      warehouse_code: values.warehouse_code,
      name: values.name,
      description: values.description,
      // image: {
      //   thumbnail: values?.image?.thumbnail,
      //   original: values?.image?.original,
      //   id: values?.image?.id,
      // },
    };

    try {
      if (!initialValues) {
        createWarehouse({
          ...input,
        });
      } else {
        updateWarehouse({
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
          } ${t('form:warehouse-description-helper-text')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label="Warehouse Code"
            {...register('warehouse_code')}
            error={t(errors.warehouse_code?.message!)}
            variant="outline"
            className="mb-5"
            required
          />
          <Input
            label="Name"
            {...register('name')}
            error={t(errors.name?.message!)}
            variant="outline"
            className="mb-5"
            required
          />
          <RichTextEditor
            title={t('form:input-label-description')}
            control={control}
            name="description"
            error={t(errors?.description?.message)}
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
              ? t('form:button-label-update-warehouse')
              : t('form:button-label-add-warehouse')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
