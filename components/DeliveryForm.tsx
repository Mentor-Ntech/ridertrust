"use client";
import { useState } from "react";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useUserStore } from "@/store/userStore";
import { useAccount } from "wagmi";

export default function DeliveryForm() {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const createDelivery = useDeliveryStore((state) => state.createDelivery);
  const { role } = useUserStore();
  const { address, isConnected } = useAccount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address || role !== "sender") {
      alert(
        "You must be connected and logged in as a sender to create a delivery."
      );
      return;
    }
    createDelivery(receiver, Number(amount), address);
    setReceiver("");
    setAmount("");
  };

  if (role !== "sender" || !isConnected) {
    return (
      <div className="p-4 border rounded bg-gray-50 text-gray-500 text-center">
        Please connect your wallet and log in as a{" "}
        <span className="font-semibold">Sender</span> to create a delivery.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
      <input
        type="text"
        placeholder="Receiver Wallet Address"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
        className="input input-bordered w-full"
      />
      <input
        type="number"
        placeholder="Amount in cUSD"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input input-bordered w-full"
      />
      <button type="submit" className="btn btn-primary w-full">
        Create Delivery
      </button>
    </form>
  );
}
