
import React from 'react';
import DeliveryForm from '../components/forms/DeliveryForm';

const AddDelivery = () => {
  return (
    <div className="space-y-4 p-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Delivery</h1>
        <p className="text-sm text-muted-foreground">
          Submit new delivery records to the system
        </p>
      </div>
      <DeliveryForm />
    </div>
  );
};

export default AddDelivery;
