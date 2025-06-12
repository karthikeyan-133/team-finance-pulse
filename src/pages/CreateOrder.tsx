
import OrderDetailsForm from '@/components/forms/OrderDetailsForm';

const CreateOrder = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Order</h1>
        <p className="text-gray-600">Create and manage delivery orders</p>
      </div>
      <OrderDetailsForm />
    </div>
  );
};

export default CreateOrder;
