import * as yup from 'yup';

export const tagValidationSchema = yup.object().shape({
  warehouse_code: yup.string().required('form:error-code-required'),
  name: yup.string().required('form:error-name-required'),
  // description: yup.string().required('form:error-description-required'),
  // type: yup.object().nullable().required('form:error-type-required'),
});
