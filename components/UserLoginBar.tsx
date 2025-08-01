"use client";
import { useUserStore, UserRole } from "@/store/userStore";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useToast } from "./ToastProvider";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import NotificationSystem from "./NotificationSystem";

export default function UserLoginBar() {
  const { isConnected } = useAccount();
  const { role, setRole, reset, referrer, setReferrer } = useUserStore();
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    reset();
    router.push('/');
  };

  const handleResetRole = () => {
    reset();
    router.push('/');
    showToast("Role reset. Please choose your role again.", "info");
  };

  useEffect(() => {
    if (typeof window !== "undefined" && isConnected && !referrer) {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
        setReferrer(ref);
        showToast("Referrer set!", "success");
      }
    }
  }, [isConnected, referrer, setReferrer, showToast]);

  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 py-4 px-6 mb-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Brand & User Info */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">RiderTrust</span>
          </Link>
          
          {isConnected && role && (
            <div className="flex items-center gap-3">
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <span className="capitalize text-blue-600 dark:text-blue-400 font-medium text-sm bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                {role === "sender" ? "📦" : role === "rider" ? "🚴" : "📮"} {role}
              </span>
              <ConnectButton showBalance={false} accountStatus="address" />
            </div>
          )}
          
          {!isConnected && (
            <ConnectButton showBalance={false} accountStatus="address" />
          )}
        </div>

        {/* Right side - Navigation */}
        {isConnected && role && (
          <div className="flex items-center gap-3">
            <NotificationSystem />
            
            <Link
              href={`/${role}`}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                pathname === `/${role}` 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Dashboard
            </Link>
            
            <Link
              href="/profile"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                pathname === '/profile' 
                  ? 'bg-gray-600 text-white shadow-md' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              Profile
            </Link>
            
            <button
              onClick={handleResetRole}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
              title="Change role"
            >
              Switch Role
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
