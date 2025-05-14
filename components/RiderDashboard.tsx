"use client";
import { useState } from "react";
import { useDeliveryStore } from "@/store/deliveryStore";
import Link from "next/link";

export default function RiderDashboard() {
  const [riderId, setRiderId] = useState("");

  const deliveries = useDeliveryStore((state) => state.deliveries);
  const acceptDelivery = useDeliveryStore((state) => state.acceptDelivery);
  const completeDelivery = useDeliveryStore((state) => state.completeDelivery);
  const disputeDelivery = useDeliveryStore((state) => state.disputeDelivery);

  const availableDeliveries = deliveries.filter((d) => d.status === "Created");
  const activeDeliveries = deliveries.filter(
    (d) => d.status === "Accepted" && d.riderId === riderId
  );

  const handleAcceptDelivery = (deliveryId: number) => {
    if (!riderId.trim()) {
      alert("Please enter your Rider ID first");
      return;
    }
    acceptDelivery(deliveryId, riderId);
  };

  const handleCompleteDelivery = (deliveryId: number) => {
    completeDelivery(deliveryId);
  };

  const handleDisputeDelivery = (deliveryId: number) => {
    disputeDelivery(deliveryId);
  };

  return (
    <div className="space-y-8">
      {/* Rider ID Setup */}
      <section className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Rider Setup</h2>
        {!riderId ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter your Rider ID"
              value={riderId}
              onChange={(e) => setRiderId(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={() => setRiderId(riderId)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Set Rider ID
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p>
              <strong>Rider ID:</strong> {riderId}
            </p>
            <button
              onClick={() => setRiderId("")}
              className="text-red-600 hover:text-red-800">
              Change
            </button>
          </div>
        )}
      </section>

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
