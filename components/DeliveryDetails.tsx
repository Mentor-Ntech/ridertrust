'use client';
import { useParams } from 'next/navigation';
import { useDeliveryStore } from '@/store/deliveryStore';

export default function DeliveryDetails() {
  const { id } = useParams();
  const delivery = useDeliveryStore(state =>
    state.deliveries.find(d => d.id === Number(id))
  );

  if (!delivery) return <p className="text-center mt-4">Delivery not found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Delivery #{delivery.id}</h2>
      <p><strong>Receiver:</strong> {delivery.receiver}</p>
      <p><strong>Status:</strong> {delivery.status}</p>
      <p><strong>Amount:</strong> {delivery.amount} CELO</p>
    </div>
  );
}
