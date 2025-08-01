"use client";
import { useState } from "react";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useUserStore } from "@/store/userStore";
import { useAccount } from "wagmi";
import { useToast } from "./ToastProvider";
import Link from "next/link";

export default function ProfilePage() {
  const deliveries = useDeliveryStore((state) => state.deliveries);
  const { role, referrer, referrals, rewards } = useUserStore();
  const { address, isConnected } = useAccount();
  const { showToast } = useToast();
  const [copiedReferral, setCopiedReferral] = useState(false);

  if (!isConnected || !address) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Wallet Connection Required
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Please connect your wallet to view your profile.
        </p>
      </div>
    );
  }

  const sentDeliveries = deliveries.filter((d) => d.senderId === address);
  const riderDeliveries = deliveries.filter((d) => d.riderId === address);
  const allUserDeliveries = [...sentDeliveries, ...riderDeliveries];
  
  // Calculate comprehensive stats
  const totalDeliveries = allUserDeliveries.length;
  const completedDeliveries = allUserDeliveries.filter(d => d.status === "Completed");
  const completionRate = totalDeliveries > 0 ? (completedDeliveries.length / totalDeliveries) * 100 : 0;
  
  // Earnings (for riders)
  const totalEarnings = riderDeliveries
    .filter(d => d.status === "Completed")
    .reduce((sum, d) => sum + d.amount, 0);
  
  // Tips received (for riders)
  const tipsReceived = riderDeliveries.reduce((sum, d) => 
    sum + (d.tips?.reduce((tipSum, tip) => tipSum + tip.amount, 0) || 0), 0
  );
  
  // Tips sent (for senders)
  const tipsSent = sentDeliveries.reduce((sum, d) => 
    sum + (d.tips?.filter(tip => tip.sender === address)?.reduce((tipSum, tip) => tipSum + tip.amount, 0) || 0), 0
  );
  
  // Total spent (for senders)
  const totalSpent = sentDeliveries.reduce((sum, d) => sum + d.amount, 0);
  
  // Ratings calculations
  const allReviews = completedDeliveries.flatMap(d => d.reviews || []);
  const reviewsAboutUser = allReviews.filter(r => r.reviewer !== address); // Reviews others gave to this user
  const reviewsByUser = allReviews.filter(r => r.reviewer === address); // Reviews this user gave to others
  
  const averageRatingReceived = reviewsAboutUser.length > 0 
    ? reviewsAboutUser.reduce((sum, r) => sum + r.rating, 0) / reviewsAboutUser.length 
    : 0;
  
  const averageRatingGiven = reviewsByUser.length > 0 
    ? reviewsByUser.reduce((sum, r) => sum + r.rating, 0) / reviewsByUser.length 
    : 0;

  // Referral link
  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}?ref=${address}` 
    : '';

  const copyReferralLink = () => {
    if (navigator.clipboard && referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopiedReferral(true);
      showToast("Referral link copied!", "success");
      setTimeout(() => setCopiedReferral(false), 2000);
    }
  };

  const totalRewards = rewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
              <p className="text-gray-600 dark:text-gray-300">
                {address.slice(0, 6)}...{address.slice(-4)} • {role ? role.charAt(0).toUpperCase() + role.slice(1) : "No role selected"}
              </p>
            </div>
            {role && (
              <div className="flex gap-2">
                <Link 
                  href={role === "rider" ? "/rider" : "/sender"}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
                >
                  Back to Dashboard
                </Link>
                <Link 
                  href="/"
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  Home
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Deliveries</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate.toFixed(1)}%</p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {averageRatingReceived > 0 ? averageRatingReceived.toFixed(1) : "N/A"}/5
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Referrals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{referrals?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Financial Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Financial Overview</h2>
            </div>
            <div className="p-6 space-y-4">
              {role === "rider" && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Total Earnings</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{totalEarnings.toFixed(2)} cUSD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Tips Received</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{tipsReceived.toFixed(2)} cUSD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Total Income</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                      {(totalEarnings + tipsReceived).toFixed(2)} cUSD
                    </span>
                  </div>
                </>
              )}
              
              {role === "sender" && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Total Spent on Deliveries</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{totalSpent.toFixed(2)} cUSD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Tips Given</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{tipsSent.toFixed(2)} cUSD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Total Expenditure</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                      {(totalSpent + tipsSent).toFixed(2)} cUSD
                    </span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">Rewards Earned</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{totalRewards.toFixed(2)} points</span>
              </div>
            </div>
          </div>

          {/* Ratings & Reviews */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ratings & Reviews</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Reviews Received</span>
                <span className="font-semibold text-gray-900 dark:text-white">{reviewsAboutUser.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Reviews Given</span>
                <span className="font-semibold text-gray-900 dark:text-white">{reviewsByUser.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Average Rating Received</span>
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.round(averageRatingReceived) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {averageRatingReceived > 0 ? averageRatingReceived.toFixed(1) : "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Average Rating Given</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {averageRatingGiven > 0 ? averageRatingGiven.toFixed(1) : "N/A"}
                </span>
              </div>

              {reviewsAboutUser.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Recent Reviews</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {reviewsAboutUser.slice(-3).reverse().map((review, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 mr-2">
                            {[...Array(review.rating)].map((_, i) => (
                              <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 dark:text-gray-300 mt-1">"{review.comment}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Referral System */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Referral Program</h2>
            </div>
            <div className="p-6 space-y-4">
              {referrer && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Referred by:</span>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {referrer.slice(0, 6)}...{referrer.slice(-4)}
                  </p>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Your Referral Link:</span>
                <div className="flex gap-2 mt-1">
                  <input 
                    type="text" 
                    value={referralLink}
                    readOnly
                    className="flex-1 text-sm border rounded px-2 py-1 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <button 
                    onClick={copyReferralLink}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      copiedReferral 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copiedReferral ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {referrals && referrals.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">People You&apos;ve Referred</h3>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {referrals.map((ref, i) => (
                      <div key={i} className="font-mono text-sm text-gray-900 dark:text-white">
                        {ref.slice(0, 6)}...{ref.slice(-4)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rewards & Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Rewards & Achievements</h2>
            </div>
            <div className="p-6">
              {rewards && rewards.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-white">Total Points</span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {totalRewards}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {rewards.slice(-5).reverse().map((reward, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {reward.type}
                          </span>
                          {reward.details && (
                            <p className="text-xs text-gray-600 dark:text-gray-300">{reward.details}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                          +{reward.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No rewards earned yet. Complete deliveries and refer friends to earn points!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}