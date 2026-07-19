import * as yup from 'yup';

export const supplierValidationSchema = yup.object().shape({
  supplier_code: yup.string().required('form:error-code-required'),
  company_name: yup.string().required('Company Name is required'),
});
