"use client";
import { useState } from "react";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useUserStore } from "@/store/userStore";
import { useAccount } from "wagmi";
import Link from "next/link";

export default function RiderDashboard() {
  const deliveries = useDeliveryStore((state) => state.deliveries);
  const acceptDelivery = useDeliveryStore((state) => state.acceptDelivery);
  const completeDelivery = useDeliveryStore((state) => state.completeDelivery);
  const disputeDelivery = useDeliveryStore((state) => state.disputeDelivery);
  const { role } = useUserStore();
  const { address, isConnected } = useAccount();

  const availableDeliveries = deliveries.filter((d) => d.status === "Created");
  const activeDeliveries = deliveries.filter(
    (d) => d.status === "Accepted" && d.riderId === address
  );

  const handleAcceptDelivery = (deliveryId: number) => {
    if (!isConnected || !address || role !== "rider") {
      alert(
        "You must be connected and logged in as a rider to accept deliveries."
      );
      return;
    }
    acceptDelivery(deliveryId, address);
  };

  const handleCompleteDelivery = (deliveryId: number) => {
    completeDelivery(deliveryId);
  };

  const handleDisputeDelivery = (deliveryId: number) => {
    disputeDelivery(deliveryId);
  };

  if (role !== "rider" || !isConnected) {
    return (
      <div className="p-4 border rounded bg-gray-50 text-gray-500 text-center">
        Please connect your wallet and log in as a{" "}
        <span className="font-semibold">Rider</span> to view and accept
        deliveries.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Available Deliveries */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Available Deliveries</h2>
        {availableDeliveries.length === 0 ? (
          <p className="text-sm text-gray-500">
            No deliveries available at the moment.
          </p>
        ) : (
          <ul className="space-y-3">
            {availableDeliveries.map((d) => (
              <li key={d.id} className="border p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p>
                      <strong>ID:</strong> {d.id}
                    </p>
                    <p>
                      <strong>To:</strong> {d.receiver}
                    </p>
                    <p>
                      <strong>Amount:</strong> {d.amount} cUSD
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAcceptDelivery(d.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                      Accept
                    </button>
                    <Link
                      href={`/delivery/${d.id}`}
                      className="block text-blue-600 hover:text-blue-800 text-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Active Deliveries */}
      <section>
        <h2 className="text-lg font-semibold mb-2">My Active Deliveries</h2>
        {activeDeliveries.length === 0 ? (
          <p className="text-sm text-gray-500">No active deliveries yet.</p>
        ) : (
          <ul className="space-y-3">
            {activeDeliveries.map((d) => (
              <li key={d.id} className="border p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p>
                      <strong>ID:</strong> {d.id}
                    </p>
                    <p>
                      <strong>To:</strong> {d.receiver}
                    </p>
                    <p>
                      <strong>Amount:</strong> {d.amount} cUSD
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="text-orange-600">{d.status}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCompleteDelivery(d.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                      Complete
                    </button>
                    <button
                      onClick={() => handleDisputeDelivery(d.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                      Dispute
                    </button>
                    <Link
                      href={`/delivery/${d.id}`}
                      className="block text-blue-600 hover:text-blue-800 text-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* All Deliveries Summary */}
      <section>
        <h2 className="text-lg font-semibold mb-2">All Deliveries Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-100 p-3 rounded text-center">
            <p className="text-2xl font-bold">
              {deliveries.filter((d) => d.status === "Created").length}
            </p>
            <p className="text-sm text-gray-600">Available</p>
          </div>
          <div className="bg-blue-100 p-3 rounded text-center">
            <p className="text-2xl font-bold">
              {deliveries.filter((d) => d.status === "Accepted").length}
            </p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="bg-green-100 p-3 rounded text-center">
            <p className="text-2xl font-bold">
              {deliveries.filter((d) => d.status === "Completed").length}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="bg-red-100 p-3 rounded text-center">
            <p className="text-2xl font-bold">
              {deliveries.filter((d) => d.status === "Disputed").length}
            </p>
            <p className="text-sm text-gray-600">Disputed</p>
          </div>
        </div>
      </section>
    </div>
  );
}
