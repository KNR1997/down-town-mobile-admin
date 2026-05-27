import { useAtom } from 'jotai';
// contexts
import { customerNameAtom } from '@/contexts/checkout';
// components
import Input from '@/components/ui/input';

interface CustomerProps {
  label: string;
  count?: number;
  className?: string;
}

const CustomerNameGrid = ({ label, count, className }: CustomerProps) => {
  const [customerName, setCustomerName] = useAtom(customerNameAtom);

  const handleChange = (e: any) => {
    setCustomerName(e.target.value);
  };

  return (
    <div className={className}>
      <div className="mb-5 flex items-center justify-between md:mb-8">
        <div className="space-s-3 md:space-s-4 flex items-center">
          {count && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-base text-light lg:text-xl">
              {count}
            </span>
          )}
          <p className="text-lg capitalize text-heading lg:text-xl">{label}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          name="customerName"
          value={customerName}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default CustomerNameGrid;
