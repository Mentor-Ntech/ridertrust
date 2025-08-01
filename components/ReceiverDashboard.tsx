"use client";
import { useState } from "react";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useUserStore } from "@/store/userStore";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useToast } from "./ToastProvider";

export default function ReceiverDashboard() {
  const deliveries = useDeliveryStore((state) => state.deliveries);
  const confirmDeliveryByReceiver = useDeliveryStore((state) => state.confirmDeliveryByReceiver);
  const addReview = useDeliveryStore((state) => state.addReview);
  const { role } = useUserStore();
  const { address, isConnected } = useAccount();
  const { showToast } = useToast();
  
  const [otpInputs, setOtpInputs] = useState<{ [key: number]: string }>({});
  const [reviewData, setReviewData] = useState<{ [key: number]: { rating: number; comment: string } }>({});
  const [receiverNotes, setReceiverNotes] = useState<{ [key: number]: string }>({});

  // Filter deliveries for this receiver
  const incomingDeliveries = deliveries.filter((d) => 
    d.receiver.toLowerCase() === address?.toLowerCase()
  );
  
  const pendingDeliveries = incomingDeliveries.filter((d) => 
    d.status === "Created" || d.status === "Accepted" || d.status === "InTransit"
  );
  const awaitingConfirmation = incomingDeliveries.filter((d) => d.status === "Delivered");
  const completedDeliveries = incomingDeliveries.filter((d) => d.status === "Completed");
  const disputedDeliveries = incomingDeliveries.filter((d) => d.status === "Disputed");

  // Calculate stats
  const totalDeliveries = incomingDeliveries.length;
  const completionRate = totalDeliveries > 0 ? (completedDeliveries.length / totalDeliveries) * 100 : 0;
  const totalValue = completedDeliveries.reduce((sum, d) => sum + d.amount, 0);

  const handleConfirmDelivery = (deliveryId: number) => {
    const otpValue = otpInputs[deliveryId];
    const notes = receiverNotes[deliveryId] || "";
    
    if (!otpValue || otpValue.length !== 6) {
      showToast("Please enter a valid 6-digit OTP", "error");
      return;
    }

    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      showToast("Delivery not found", "error");
      return;
    }

    if (delivery.otp !== otpValue) {
      showToast("Invalid OTP. Please check with the rider.", "error");
      return;
    }

    confirmDeliveryByReceiver(deliveryId, otpValue, notes);
    setOtpInputs(prev => ({ ...prev, [deliveryId]: "" }));
    setReceiverNotes(prev => ({ ...prev, [deliveryId]: "" }));
    showToast("Delivery confirmed successfully! Funds released to rider.", "success");
  };

  const handleSubmitReview = (deliveryId: number) => {
    const review = reviewData[deliveryId];
    if (!review || !address) return;

    addReview(deliveryId, address, review.rating, review.comment);
    setReviewData(prev => ({ ...prev, [deliveryId]: { rating: 5, comment: "" } }));
    showToast("Review submitted successfully!", "success");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Created": return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "Accepted": return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "InTransit": return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      case "Delivered": return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      case "Completed": return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "Disputed": return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default: return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  if (role !== "receiver" || !isConnected) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Receiver Access Required
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Please connect your wallet and log in as a <span className="font-semibold text-purple-600 dark:text-purple-400">Receiver</span> to access the receiver dashboard.
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Receiver Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Track your incoming packages and confirm deliveries</p>
            </div>
            <div className="flex gap-2">
              <Link 
                href="/sender"
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
              >
                Switch to Sender
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
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Packages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDeliveries}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalValue.toFixed(2)} cUSD</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{awaitingConfirmation.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Awaiting Confirmation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Confirm Deliveries</h2>
              <p className="text-gray-600 dark:text-gray-300">Packages delivered and awaiting your confirmation</p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {awaitingConfirmation.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No deliveries awaiting confirmation.</p>
              ) : (
                <div className="space-y-6">
                  {awaitingConfirmation.map((delivery) => (
                    <div key={delivery.id} className="border border-purple-200 dark:border-purple-600 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Package #{delivery.id}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{delivery.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            From: {delivery.senderId.slice(0, 6)}...{delivery.senderId.slice(-4)}
                          </p>
                        </div>
                        <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm font-medium">
                          {delivery.amount} cUSD
                        </span>
                      </div>

                      {/* Delivery Proof */}
                      {delivery.deliveryProof && delivery.deliveryProof.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Proof:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {delivery.deliveryProof.map((proof, idx) => (
                              <div key={idx} className="text-center">
                                {proof.type === "photo" && (
                                  <img 
                                    src={proof.data} 
                                    alt="Delivery proof" 
                                    className="w-full h-20 object-cover rounded border"
                                  />
                                )}
                                <p className="text-xs text-gray-500 mt-1 capitalize">{proof.type}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* OTP Confirmation */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Enter 6-digit OTP from rider:
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="123456"
                            value={otpInputs[delivery.id] || ""}
                            onChange={(e) => setOtpInputs(prev => ({ ...prev, [delivery.id]: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-center text-lg font-mono tracking-wider dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes (optional):
                          </label>
                          <textarea
                            placeholder="Any feedback or notes about the delivery..."
                            value={receiverNotes[delivery.id] || ""}
                            onChange={(e) => setReceiverNotes(prev => ({ ...prev, [delivery.id]: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
                            rows={2}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmDelivery(delivery.id)}
                            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors text-sm"
                          >
                            Confirm Delivery
                          </button>
                          <Link 
                            href={`/delivery/${delivery.id}`}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tracking Deliveries */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Track Packages</h2>
              <p className="text-gray-600 dark:text-gray-300">Monitor your incoming deliveries</p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {pendingDeliveries.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No packages in transit.</p>
              ) : (
                <div className="space-y-4">
                  {pendingDeliveries.map((delivery) => (
                    <div key={delivery.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Package #{delivery.id}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{delivery.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>
                      
                      {delivery.riderId && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          Rider: {delivery.riderId.slice(0, 6)}...{delivery.riderId.slice(-4)}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{delivery.amount} cUSD</span>
                        <Link 
                          href={`/delivery/${delivery.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completed Deliveries */}
        {completedDeliveries.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delivery History</h2>
              <p className="text-gray-600 dark:text-gray-300">Your completed package deliveries</p>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {completedDeliveries.slice(-5).reverse().map((delivery) => (
                  <div key={delivery.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Package #{delivery.id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{delivery.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {delivery.actualDeliveryTime && new Date(delivery.actualDeliveryTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">{delivery.amount} cUSD</p>
                      <Link 
                        href={`/delivery/${delivery.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}