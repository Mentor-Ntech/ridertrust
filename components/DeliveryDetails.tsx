"use client";
import { useParams } from "next/navigation";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useUserStore } from "@/store/userStore";
import { useAccount } from "wagmi";
import { useToast } from "./ToastProvider";
import Link from "next/link";
import RiderLocationMap from "./RiderLocationMap";
import { useState } from "react";

export default function DeliveryDetails() {
  const { id } = useParams();
  const delivery = useDeliveryStore((state) =>
    state.deliveries.find((d) => d.id === Number(id))
  );
  const { addMessage, addDisputeEvidence, disputeDelivery } = useDeliveryStore();
  const { role } = useUserStore();
  const { address, isConnected } = useAccount();
  const { showToast } = useToast();
  
  const [newMessage, setNewMessage] = useState("");
  const [disputeText, setDisputeText] = useState("");
  const [showDispute, setShowDispute] = useState(false);

  if (!delivery) return <p className="text-center mt-4">Delivery not found.</p>;

  const handleSendMessage = () => {
    if (!newMessage.trim() || !address) return;
    
    addMessage(delivery.id, address, newMessage);
    setNewMessage("");
    showToast("Message sent!", "success");
  };

  const handleDispute = () => {
    if (!disputeText.trim() || !address) return;
    
    disputeDelivery(delivery.id);
    addDisputeEvidence(delivery.id, address, disputeText, []);
    setDisputeText("");
    setShowDispute(false);
    showToast("Dispute filed successfully", "success");
  };

  const canChat = isConnected && address && (
    address === delivery.senderId || 
    address === delivery.riderId || 
    address === delivery.receiver
  );

  const canDispute = isConnected && address && delivery.status !== "Completed" && (
    address === delivery.senderId || 
    address === delivery.receiver
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Delivery #{delivery.id}
          </h1>
          <Link 
            href={role ? `/${role}` : "/"}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Delivery Info & Map */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Delivery Information
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {delivery.description || "Package delivery"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {delivery.amount} cUSD
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      delivery.status === "Created" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                      delivery.status === "Accepted" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                      delivery.status === "InTransit" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" :
                      delivery.status === "Delivered" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" :
                      delivery.status === "Completed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}>
                      {delivery.status}
                    </span>
                  </div>
                  {delivery.otp && delivery.status === "Delivered" && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">OTP</p>
                      <p className="font-mono text-lg font-bold text-purple-600 dark:text-purple-400">
                        {delivery.otp}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sender</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">
                      {delivery.senderId.slice(0, 6)}...{delivery.senderId.slice(-4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receiver</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">
                      {delivery.receiver.slice(0, 6)}...{delivery.receiver.slice(-4)}
                    </p>
                  </div>
                  {delivery.riderId && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rider</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white">
                        {delivery.riderId.slice(0, 6)}...{delivery.riderId.slice(-4)}
                      </p>
                    </div>
                  )}
                </div>

                {(delivery.pickupAddress || delivery.deliveryAddress) && (
                  <div className="space-y-2">
                    {delivery.pickupAddress && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">📍 Pickup Address</p>
                        <p className="text-sm text-gray-900 dark:text-white">{delivery.pickupAddress}</p>
                      </div>
                    )}
                    {delivery.deliveryAddress && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">🏠 Delivery Address</p>
                        <p className="text-sm text-gray-900 dark:text-white">{delivery.deliveryAddress}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Map Section */}
            {delivery.currentLocation && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Rider&apos;s Location
                </h3>
                <div style={{ height: "300px", width: "100%" }}>
                  <RiderLocationMap 
                    lat={delivery.currentLocation.lat} 
                    lng={delivery.currentLocation.lng} 
                  />
                </div>
              </div>
            )}

            {/* Delivery Proof */}
            {delivery.deliveryProof && delivery.deliveryProof.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Delivery Proof
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {delivery.deliveryProof.map((proof, idx) => (
                    <div key={idx} className="text-center">
                      {proof.type === "photo" && (
                        <img 
                          src={proof.data} 
                          alt="Delivery proof" 
                          className="w-full h-32 object-cover rounded border"
                        />
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {proof.type} - {new Date(proof.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Chat & Actions */}
          <div className="space-y-6">
            {/* Chat Section */}
            {canChat && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Delivery Chat
                </h3>
                
                {/* Messages */}
                <div className="h-64 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  {!delivery.messages || delivery.messages.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {delivery.messages.map((message, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg max-w-xs ${
                            message.sender === address
                              ? "bg-blue-500 text-white ml-auto"
                              : "bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {message.sender.slice(0, 6)}...{message.sender.slice(-4)} • {" "}
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Dispute Section */}
            {canDispute && delivery.status !== "Disputed" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Dispute Resolution
                </h3>
                
                {!showDispute ? (
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      Having issues with this delivery? You can file a dispute.
                    </p>
                    <button
                      onClick={() => setShowDispute(true)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                    >
                      File a Dispute
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={disputeText}
                      onChange={(e) => setDisputeText(e.target.value)}
                      placeholder="Describe the issue with this delivery..."
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleDispute}
                        disabled={!disputeText.trim()}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm"
                      >
                        Submit Dispute
                      </button>
                      <button
                        onClick={() => setShowDispute(false)}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dispute Status */}
            {delivery.status === "Disputed" && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4">
                  🚨 Dispute Filed
                </h3>
                
                {delivery.disputeEvidence && delivery.disputeEvidence.length > 0 && (
                  <div className="space-y-3">
                    {delivery.disputeEvidence.map((evidence, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-900 dark:text-white">{evidence.text}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          By: {evidence.submitter.slice(0, 6)}...{evidence.submitter.slice(-4)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-sm text-red-700 dark:text-red-300 mt-4">
                  This delivery is under dispute review. Please wait for resolution.
                </p>
              </div>
            )}

            {/* Reviews Section */}
            {delivery.status === "Completed" && delivery.reviews && delivery.reviews.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Reviews
                </h3>
                <div className="space-y-3">
                  {delivery.reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {review.reviewer.slice(0, 6)}...{review.reviewer.slice(-4)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}