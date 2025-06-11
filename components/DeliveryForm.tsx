'use client';
import { useState } from 'react';
import { useDeliveryStore } from '@/store/deliveryStore';

export default function DeliveryForm() {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const createDelivery = useDeliveryStore(state => state.createDelivery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDelivery(receiver, Number(amount));
    setReceiver('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
      <input
        type="text"
        placeholder="Receiver Wallet Address"
        value={receiver}
        onChange={e => setReceiver(e.target.value)}
        className="input input-bordered w-full"
      />
      <input
        type="number"
        placeholder="Amount in cUSD"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="input input-bordered w-full"
      />
      <button type="submit" className="btn btn-primary w-full">Create Delivery</button>
    </form>
  );
}
