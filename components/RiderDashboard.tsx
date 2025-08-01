"use client";
import { useState, useEffect } from "react";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useUserStore } from "@/store/userStore";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useToast } from "./ToastProvider";

export default function RiderDashboard() {
  const deliveries = useDeliveryStore((state) => state.deliveries);
  const acceptDelivery = useDeliveryStore((state) => state.acceptDelivery);
  const markInTransit = useDeliveryStore((state) => state.markInTransit);
  const markDelivered = useDeliveryStore((state) => state.markDelivered);
  const completeDelivery = useDeliveryStore((state) => state.completeDelivery);
  const updateDeliveryLocation = useDeliveryStore((state) => state.updateDeliveryLocation);
  const { role } = useUserStore();
  const { address, isConnected } = useAccount();
  const { showToast } = useToast();
  const [locationSharing, setLocationSharing] = useState<{ [key: number]: boolean }>({});
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null);
  const [deliveryPhotos, setDeliveryPhotos] = useState<{ [key: number]: string }>({});

  const availableDeliveries = deliveries.filter((d) => d.status === "Created");
  const acceptedDeliveries = deliveries.filter(
    (d) => d.status === "Accepted" && d.riderId === address
  );
  const inTransitDeliveries = deliveries.filter(
    (d) => d.status === "InTransit" && d.riderId === address
  );
  const deliveredDeliveries = deliveries.filter(
    (d) => d.status === "Delivered" && d.riderId === address
  );
  const completedDeliveries = deliveries.filter(
    (d) => d.status === "Completed" && d.riderId === address
  );

  // Active deliveries include accepted, in transit, and delivered (awaiting confirmation)
  const activeDeliveries = [...acceptedDeliveries, ...inTransitDeliveries, ...deliveredDeliveries];

  // Calculate earnings and stats
  const totalEarnings = completedDeliveries.reduce((sum, d) => sum + d.amount, 0);
  const tipsReceived = completedDeliveries.reduce((sum, d) => 
    sum + (d.tips?.reduce((tipSum, tip) => tipSum + tip.amount, 0) || 0), 0
  );
  const averageRating = completedDeliveries.length > 0 
    ? completedDeliveries.reduce((sum, d) => {
        const avgDeliveryRating = d.reviews?.reduce((rSum, r) => rSum + r.rating, 0) || 0;
        return sum + (d.reviews?.length ? avgDeliveryRating / d.reviews.length : 0);
      }, 0) / completedDeliveries.length
    : 0;

  const handleAcceptDelivery = (deliveryId: number) => {
    if (!isConnected || !address || role !== "rider") {
      showToast("You must be connected and logged in as a rider to accept deliveries.", "error");
      return;
    }
    acceptDelivery(deliveryId, address);
    showToast("Delivery accepted!", "success");
  };

  const handleCompleteDelivery = (deliveryId: number) => {
    completeDelivery(deliveryId);
    showToast("Delivery marked as completed!", "success");
  };

  const handleMarkInTransit = (deliveryId: number) => {
    markInTransit(deliveryId);
    showToast("Delivery marked as in transit.", "success");
  };

  const handleUploadPhoto = async (deliveryId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(deliveryId);
    
    // Convert to base64 for demo (in production, upload to IPFS or cloud storage)
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setDeliveryPhotos(prev => ({ ...prev, [deliveryId]: base64 }));
      setUploadingPhoto(null);
      showToast("Photo uploaded successfully!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleMarkDelivered = (deliveryId: number) => {
    const photo = deliveryPhotos[deliveryId];
    const proof = photo ? [{ type: "photo" as const, data: photo }] : [];
    
    markDelivered(deliveryId, proof);
    showToast("Package marked as delivered! Share the OTP with the receiver to complete the delivery.", "success");
  };

  const handleShareLocation = (deliveryId: number) => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }
    
    setLocationSharing(prev => ({ ...prev, [deliveryId]: true }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateDeliveryLocation(deliveryId, {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationSharing(prev => ({ ...prev, [deliveryId]: false }));
        showToast("Location shared!", "success");
      },
      (error) => {
        showToast("Failed to get location: " + error.message, "error");
        setLocationSharing(prev => ({ ...prev, [deliveryId]: false }));
      }
    );
  };

  if (role !== "rider" || !isConnected) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Rider Access Required
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Please connect your wallet and log in as a <span className="font-semibold text-blue-600 dark:text-blue-400">Rider</span> to access the rider dashboard.
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rider Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your deliveries and track your earnings</p>
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
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalEarnings.toFixed(2)} cUSD</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageRating.toFixed(1)}/5</p>
              </div>
            </div>
                </div>
                
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tips Received</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tipsReceived.toFixed(2)} cUSD</p>
              </div>
            </div>
          </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Deliveries */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Available Deliveries</h2>
              <p className="text-gray-600 dark:text-gray-300">Browse and accept new delivery requests</p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {availableDeliveries.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No available deliveries at the moment.</p>
        ) : (
          <div className="space-y-4">
                                    {availableDeliveries.map((delivery) => (
                    <div key={delivery.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Delivery #{delivery.id}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{delivery.description}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            To: {delivery.receiver.slice(0, 6)}...{delivery.receiver.slice(-4)}
                          </p>
                          {delivery.pickupAddress && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              📍 From: {delivery.pickupAddress}
                            </p>
                          )}
                          {delivery.deliveryAddress && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              🏠 To: {delivery.deliveryAddress}
                            </p>
                          )}
                        </div>
                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                          {delivery.amount} cUSD
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleAcceptDelivery(delivery.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          Accept Delivery
                        </button>
                        <Link 
                          href={`/delivery/${delivery.id}`}
                          className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
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

          {/* Active Deliveries */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Deliveries</h2>
              <p className="text-gray-600 dark:text-gray-300">Manage your current delivery assignments</p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeDeliveries.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">You don&apos;t have any active deliveries.</p>
              ) : (
                <div className="space-y-4">
                  {activeDeliveries.map((delivery) => (
                    <div key={delivery.id} className="border border-blue-200 dark:border-blue-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Delivery #{delivery.id}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{delivery.description}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            To: {delivery.receiver.slice(0, 6)}...{delivery.receiver.slice(-4)}
                          </p>
                          {delivery.deliveryAddress && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              📍 {delivery.deliveryAddress}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Status: <span className={`font-medium ${
                              delivery.status === "Accepted" ? "text-yellow-600 dark:text-yellow-400" :
                              delivery.status === "InTransit" ? "text-orange-600 dark:text-orange-400" :
                              delivery.status === "Delivered" ? "text-purple-600 dark:text-purple-400" :
                              "text-blue-600 dark:text-blue-400"
                            }`}>{delivery.status}</span>
                          </p>
                          {delivery.otp && delivery.status === "Delivered" && (
                            <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mt-1">
                              🔐 OTP: <span className="font-bold text-purple-600 dark:text-purple-400">{delivery.otp}</span>
                            </p>
                          )}
                        </div>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {delivery.amount} cUSD
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Photo Upload for InTransit deliveries */}
                        {delivery.status === "InTransit" && (
                          <div className="border-t pt-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Upload delivery proof photo:
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUploadPhoto(delivery.id, e)}
                                className="text-sm"
                                disabled={uploadingPhoto === delivery.id}
                              />
                              {uploadingPhoto === delivery.id && (
                                <span className="text-sm text-gray-500">Uploading...</span>
                              )}
                            </div>
                            {deliveryPhotos[delivery.id] && (
                              <img 
                                src={deliveryPhotos[delivery.id]} 
                                alt="Delivery proof" 
                                className="mt-2 w-20 h-20 object-cover rounded border"
                              />
                            )}
                          </div>
                        )}

                        {/* Action buttons based on status */}
                        <div className="flex gap-2 flex-wrap">
                          {delivery.status === "Accepted" && (
                            <button
                              onClick={() => handleMarkInTransit(delivery.id)}
                              className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                            >
                              Start Delivery
                            </button>
                          )}
                          
                          {delivery.status === "InTransit" && (
                            <button
                              onClick={() => handleMarkDelivered(delivery.id)}
                              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                            >
                              Mark as Delivered
                            </button>
                          )}

                          {delivery.status === "Delivered" && (
                            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                              ⏳ Waiting for receiver confirmation...
                            </div>
                          )}

                          <button
                            onClick={() => handleShareLocation(delivery.id)}
                            disabled={locationSharing[delivery.id]}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                          >
                            {locationSharing[delivery.id] ? "Sharing..." : "Share Location"}
                          </button>
                          
                          <Link 
                            href={`/delivery/${delivery.id}`}
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                          >
                            Chat & Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
          </div>
              )}
          </div>
          </div>
        </div>

        {/* Recent Reviews */}
        {completedDeliveries.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Reviews</h2>
              <p className="text-gray-600 dark:text-gray-300">Feedback from your recent deliveries</p>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {completedDeliveries
                  .filter(d => d.reviews && d.reviews.length > 0)
                  .slice(-5)
                  .reverse()
                  .map((delivery) => 
                    delivery.reviews?.map((review, idx) => (
                      <div key={`${delivery.id}-${idx}`} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center mb-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                            Delivery #{delivery.id}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 dark:text-gray-300 text-sm">"{review.comment}"</p>
                        )}
                      </div>
                    ))
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}