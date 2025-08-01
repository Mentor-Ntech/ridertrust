"use client";
import { useState } from "react";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useUserStore } from "@/store/userStore";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useToast } from "./ToastProvider";
import DeliveryForm from "./DeliveryForm";

export default function SenderDashboard() {
  const deliveries = useDeliveryStore((state) => state.deliveries);
  const disputeDelivery = useDeliveryStore((state) => state.disputeDelivery);
  const addTip = useDeliveryStore((state) => state.addTip);
  const addTransactionLog = useDeliveryStore((state) => state.addTransactionLog);
  const { role } = useUserStore();
  const { address, isConnected } = useAccount();
  const { showToast } = useToast();
  const [tipAmounts, setTipAmounts] = useState<{ [key: number]: string }>({});

  const sentDeliveries = deliveries.filter((d) => d.senderId === address);
  const pendingDeliveries = sentDeliveries.filter((d) => d.status === "Created");
  const inProgressDeliveries = sentDeliveries.filter((d) => d.status === "Accepted");
  const completedDeliveries = sentDeliveries.filter((d) => d.status === "Completed");
  const disputedDeliveries = sentDeliveries.filter((d) => d.status === "Disputed");

  // Calculate stats
  const totalSpent = sentDeliveries.reduce((sum, d) => sum + d.amount, 0);
  const tipsSent = sentDeliveries.reduce((sum, d) => 
    sum + (d.tips?.filter(tip => tip.sender === address)?.reduce((tipSum, tip) => tipSum + tip.amount, 0) || 0), 0
  );
  const averageDeliveryValue = sentDeliveries.length > 0 ? totalSpent / sentDeliveries.length : 0;

  const handleSendTip = (deliveryId: number) => {
    const amount = Number(tipAmounts[deliveryId]);
    if (!amount || amount <= 0) {
      showToast("Enter a valid tip amount.", "error");
      return;
    }
    if (!address) {
      showToast("Wallet not connected.", "error");
      return;
    }
    
    addTip(deliveryId, address, amount);
    addTransactionLog(deliveryId, "tip", address, `Tip sent: ${amount} cUSD`);
    setTipAmounts(prev => ({ ...prev, [deliveryId]: "" }));
    showToast("Tip sent successfully!", "success");
  };

  const handleDispute = (deliveryId: number) => {
    disputeDelivery(deliveryId);
    showToast("Delivery marked as disputed. Please provide evidence in the delivery details.", "info");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Created": return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "Accepted": return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      case "Completed": return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "Disputed": return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default: return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  if (role !== "sender" || !isConnected) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Sender Access Required
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Please connect your wallet and log in as a <span className="font-semibold text-blue-600 dark:text-blue-400">Sender</span> to access the sender dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sender Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your delivery requests and track shipments</p>
            </div>
            <div className="flex gap-2">
              <Link 
                href="/rider"
                className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm"
              >
                Switch to Rider
              </Link>
              <Link 
                href="/profile"
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSpent.toFixed(2)} cUSD</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedDeliveries.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tips Sent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tipsSent.toFixed(2)} cUSD</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg. Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageDeliveryValue.toFixed(1)} cUSD</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create New Delivery */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Delivery</h2>
              <p className="text-gray-600 dark:text-gray-300">Send a package to someone</p>
            </div>
            <div className="p-6">
              <DeliveryForm />
            </div>
          </div>

          {/* Active Deliveries */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Deliveries</h2>
                <p className="text-gray-600 dark:text-gray-300">Track and manage your delivery requests</p>
              </div>
              <div className="p-6">
                {sentDeliveries.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">You haven&apos;t created any deliveries yet.</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {sentDeliveries.slice().reverse().map((delivery) => (
                      <div key={delivery.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Delivery #{delivery.id}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              To: {delivery.receiver.slice(0, 6)}...{delivery.receiver.slice(-4)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(delivery.status)}`}>
                              {delivery.status}
                            </span>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{delivery.amount} cUSD</p>
                          </div>
                        </div>

                        {delivery.riderId && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            Rider: {delivery.riderId.slice(0, 6)}...{delivery.riderId.slice(-4)}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 items-center">
                          <Link 
                            href={`/delivery/${delivery.id}`}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                          >
                            View Details
                          </Link>

                          {delivery.status === "Completed" && delivery.riderId && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="Tip amount"
                                min="0"
                                step="0.01"
                                value={tipAmounts[delivery.id] || ""}
                                onChange={(e) => setTipAmounts(prev => ({ ...prev, [delivery.id]: e.target.value }))}
                                className="border rounded px-2 py-1 text-sm w-24 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <button
                                onClick={() => handleSendTip(delivery.id)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                              >
                                Send Tip
                              </button>
                            </div>
                          )}

                          {delivery.status === "Accepted" && (
                            <button
                              onClick={() => handleDispute(delivery.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                            >
                              Report Issue
                            </button>
                          )}
                        </div>

                        {/* Tips Display */}
                        {delivery.tips && delivery.tips.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tips Sent:</p>
                            <div className="space-y-1">
                              {delivery.tips
                                .filter(tip => tip.sender === address)
                                .map((tip, idx) => (
                                  <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                    {tip.amount} cUSD on {new Date(tip.timestamp).toLocaleDateString()}
                                  </p>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Status Overview */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pendingDeliveries.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{inProgressDeliveries.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">In Progress</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedDeliveries.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{disputedDeliveries.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Disputed</p>
          </div>
        </div>
      </div>
    </div>
  );
}