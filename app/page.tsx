import DeliveryForm from "@/components/DeliveryForm";
import DeliveryList from "@/components/DeliveryList";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          📦 RiderTrust - Local Delivery DApp
        </h1>
        <p className="text-gray-600 mb-6">
          Secure, transparent local deliveries powered by blockchain
        </p>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Customer Dashboard
          </Link>
          <Link
            href="/rider"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Rider Dashboard
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Create New Delivery</h2>
          <DeliveryForm />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Deliveries</h2>
          <DeliveryList />
        </div>
      </div>
    </main>
  );
}
