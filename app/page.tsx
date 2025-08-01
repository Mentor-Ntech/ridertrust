"use client";
import { useAccount } from "wagmi";
import { useUserStore, UserRole } from "@/store/userStore";
import DeliveryForm from "@/components/DeliveryForm";
import DeliveryList from "@/components/DeliveryList";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function HomePage() {
  const { isConnected } = useAccount();
  const { role, setRole } = useUserStore();
  const router = useRouter();
  const { showToast } = useToast();

  // Auto-redirect to dashboard if user has a role selected
  useEffect(() => {
    if (isConnected && role && typeof window !== 'undefined') {
      // Only auto-redirect if user doesn't have a specific route in mind
      const hasSpecificRoute = window.location.hash || window.location.search.includes('ref=');
      if (!hasSpecificRoute) {
        const timer = setTimeout(() => {
          router.push(`/${role}`);
        }, 2000); // 2 second delay to show welcome message
        
        return () => clearTimeout(timer);
      }
    }
  }, [isConnected, role, router]);

  const handleRoleSelection = (selectedRole: UserRole) => {
    if (!isConnected) {
      showToast("Please connect your wallet first", "error");
      return;
    }
    
    setRole(selectedRole);
    showToast(`Welcome! Taking you to your ${selectedRole} dashboard...`, "success");
    
    // Small delay for better UX
    setTimeout(() => {
      router.push(`/${selectedRole}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center text-white">
            <div className="mb-8">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                RiderTrust
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                The Future of Local Delivery
              </p>
              <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto opacity-90">
                Secure, transparent, and efficient local deliveries powered by blockchain technology. 
                Connect riders with senders in a trustless, decentralized ecosystem.
              </p>
            </div>
            
            {!isConnected ? (
              <div className="space-y-4">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto">
                  <h2 className="text-2xl font-bold mb-4">Get Started Today</h2>
                  <p className="text-white opacity-90 mb-6">
                    Connect your wallet to join the decentralized delivery revolution
                  </p>
                  <div className="text-sm opacity-75">
                    <p>✨ No registration fees</p>
                    <p>🔒 Secure blockchain escrow</p>
                    <p>📱 Real-time tracking</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-8 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Welcome to RiderTrust</h2>
                {role ? (
                  <div className="text-center mb-8">
                    <p className="text-white opacity-90 mb-4">
                      Welcome back, <span className="font-semibold capitalize">{role}</span>!
                    </p>
                    <p className="text-white opacity-75 text-sm mb-4">
                      Redirecting you to your dashboard...
                    </p>
                    <div className="flex justify-center gap-4">
                      <Link 
                        href={`/${role}`}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Go to Dashboard Now
                      </Link>
                      <Link 
                        href="/profile"
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-white opacity-90 mb-8 text-center">
                    Choose your role to access your personalized dashboard
                  </p>
                )}
                <div className="grid md:grid-cols-3 gap-6">
                  <button 
                    onClick={() => handleRoleSelection("sender")}
                    className="group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                        <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Sender</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        Send packages and track deliveries
                      </p>
                      <div className="text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 text-sm">
                        Send Package →
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handleRoleSelection("rider")}
                    className="group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                        <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Rider</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        Deliver packages and earn money
                      </p>
                      <div className="text-green-600 dark:text-green-400 font-medium group-hover:text-green-700 dark:group-hover:text-green-300 text-sm">
                        Start Riding →
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleRoleSelection("receiver")}
                    className="group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                        <svg className="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Receiver</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        Track and confirm package deliveries
                      </p>
                      <div className="text-purple-600 dark:text-purple-400 font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300 text-sm">
                        Track Packages →
                      </div>
                    </div>
                  </button>
                </div>
                
                <div className="mt-8 text-center">
                  <Link 
                    href="/profile"
                    className="inline-flex items-center text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    View Your Profile & Stats
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose RiderTrust?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built for the modern delivery ecosystem with cutting-edge blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secure Escrow</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Funds are held in smart contract escrow until delivery is confirmed. 
                No more payment disputes or lost funds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Real-time Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track your delivery in real-time with GPS location sharing. 
                Know exactly where your package is at every moment.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Instant Payments</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatic payments released upon successful delivery. 
                No waiting, no delays, just instant crypto payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">100%</div>
              <div className="text-gray-600 dark:text-gray-300">Secure</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">0%</div>
              <div className="text-gray-600 dark:text-gray-300">Fees</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">Instant</div>
              <div className="text-gray-600 dark:text-gray-300">Payments</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Simple, secure, and efficient delivery process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Senders create a delivery request with receiver address and payment amount. 
                Funds are locked in smart contract escrow.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Accept & Deliver</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Riders accept available deliveries and complete them with real-time location tracking. 
                Communication happens through the platform.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Get Paid</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upon successful delivery confirmation, funds are automatically released to the rider. 
                Instant crypto payments, no delays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Deliveries */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Recent Activity
          </h2>
          <div className="max-w-4xl mx-auto">
            <DeliveryList />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Delivering?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of riders and senders already using RiderTrust for secure, 
            efficient local deliveries powered by blockchain technology.
          </p>
          <div className="space-x-4">
            <Link 
              href="/rider" 
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Become a Rider
            </Link>
            <Link 
              href="/profile" 
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}