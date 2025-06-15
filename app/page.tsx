import DeliveryForm from '@/components/DeliveryForm';
import DeliveryList from '@/components/DeliveryList';

export default function HomePage() {
  return (
    <main className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">📦 RiderTrust - Local Delivery DApp</h1>
      <DeliveryForm />
      <DeliveryList />
    </main>
  );
}
