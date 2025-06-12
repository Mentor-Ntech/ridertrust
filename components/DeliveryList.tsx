'use client';
import { useDeliveryStore } from '@/store/deliveryStore';
import Link from 'next/link';

export default function DeliveryList() {
  const deliveries = useDeliveryStore(state => state.deliveries);

  return (
    <div className="space-y-4 mt-6">
      {deliveries.map(delivery => (
        <div key={delivery.id} className="p-4 border rounded">
          <p><strong>ID:</strong> {delivery.id}</p>
          <p><strong>Status:</strong> {delivery.status}</p>
          <Link href={`/delivery/${delivery.id}`} className="text-blue-600">View</Link>
        </div>
      ))}
    </div>
  );
}
