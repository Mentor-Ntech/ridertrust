'use client';
import { useState } from 'react';
import { useDeliveryStore } from '@/store/deliveryStore';
import { useAccount } from 'wagmi';
import { useToast } from './ToastProvider';

export default function DeliveryForm() {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const createDelivery = useDeliveryStore(state => state.createDelivery);
  const { address } = useAccount();
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      showToast('Please connect your wallet first', 'error');
      return;
    }
    
    if (!receiver || !amount || !description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      createDelivery(receiver, Number(amount), address, description, pickupAddress, deliveryAddress);
      // Reset form
      setReceiver('');
      setAmount('');
      setDescription('');
      setPickupAddress('');
      setDeliveryAddress('');
      showToast('Delivery request created successfully!', 'success');
    } catch (error) {
      showToast('Failed to create delivery request', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create Delivery Request</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Receiver Address *
          </label>
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="0x... (wallet address of receiver)"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            The wallet address of the person receiving the package
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Package Description *
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., Documents, Electronics, Food, etc."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pickup Address
            </label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Where should the rider collect the package?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Delivery Address
            </label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Where should the package be delivered?"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Delivery Fee (cUSD) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., 5.00"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Amount to pay the rider for delivery (held in escrow until confirmed)
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Create Delivery Request
        </button>
      </form>
    </div>
  );
}
