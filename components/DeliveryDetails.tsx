"use client";
import { useParams } from "next/navigation";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useState } from "react";
import Link from "next/link";

export default function DeliveryDetails() {
  const { id } = useParams();
  const [riderId, setRiderId] = useState("");

  const delivery = useDeliveryStore((state) =>
    state.deliveries.find((d) => d.id === Number(id))
  );

  const acceptDelivery = useDeliveryStore((state) => state.acceptDelivery);
  const completeDelivery = useDeliveryStore((state) => state.completeDelivery);
  const disputeDelivery = useDeliveryStore((state) => state.disputeDelivery);

  if (!delivery) return <p className="text-center mt-4">Delivery not found.</p>;

  const handleAcceptDelivery = () => {
    if (!riderId.trim()) {
      alert("Please enter your Rider ID first");
      return;
    }
    acceptDelivery(delivery.id, riderId);
  };

  const handleCompleteDelivery = () => {
    completeDelivery(delivery.id);
  };

  const handleDisputeDelivery = () => {
    disputeDelivery(delivery.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Created":
        return "text-blue-600";
      case "Accepted":
        return "text-orange-600";
      case "Completed":
        return "text-green-600";
      case "Disputed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Delivery #{delivery.id}</h2>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Receiver:</span>
            <span className="font-mono text-sm">{delivery.receiver}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold">Amount:</span>
            <span className="text-lg font-bold text-green-600">
              {delivery.amount} cUSD
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold">Status:</span>
            <span
              className={`font-semibold ${getStatusColor(delivery.status)}`}>
              {delivery.status}
            </span>
          </div>

          {delivery.riderId && (
            <div className="flex justify-between items-center">
              <span className="font-semibold">Assigned Rider:</span>
              <span className="font-mono text-sm">{delivery.riderId}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-6">
          {delivery.status === "Created" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Accept This Delivery</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your Rider ID"
                  value={riderId}
                  onChange={(e) => setRiderId(e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={handleAcceptDelivery}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                  Accept
                </button>
              </div>
            </div>
          )}

          {delivery.status === "Accepted" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Manage Delivery</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCompleteDelivery}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                  Mark as Completed
                </button>
                <button
                  onClick={handleDisputeDelivery}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
                  Report Dispute
                </button>
              </div>
            </div>
          )}

          {delivery.status === "Completed" && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">
                ✅ Delivery Completed
              </h3>
              <p className="text-green-700 text-sm mt-1">
                This delivery has been successfully completed.
              </p>
            </div>
          )}

          {delivery.status === "Disputed" && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800">
                ⚠️ Delivery Disputed
              </h3>
              <p className="text-red-700 text-sm mt-1">
                This delivery has been reported as disputed and requires
                resolution.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
