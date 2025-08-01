"use client";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useUserStore } from "@/store/userStore";
import { useAccount } from "wagmi";
import Link from "next/link";

export default function DeliveryList() {
  const deliveries = useDeliveryStore((state) => state.deliveries);
  const { role } = useUserStore();
  const { address, isConnected } = useAccount();

  const filteredDeliveries =
    role === "sender" && isConnected && address
      ? deliveries.filter((d) => d.senderId === address)
      : deliveries;

  return (
    <div className="space-y-4 mt-6">
      {filteredDeliveries.length === 0 ? (
        <p className="text-gray-500 text-center">No deliveries found.</p>
      ) : (
        filteredDeliveries.map((delivery) => (
          <div key={delivery.id} className="p-4 border rounded">
            <p>
              <strong>ID:</strong> {delivery.id}
            </p>
            <p>
              <strong>Status:</strong> {delivery.status}
            </p>
            <Link href={`/delivery/${delivery.id}`} className="text-blue-600">
              View
            </Link>
          </div>
        ))
      )}
    </div>
  );
}