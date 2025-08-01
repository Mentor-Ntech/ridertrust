"use client";
<<<<<<< HEAD
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUserStore } from "@/store/userStore";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "./ToastProvider";
import ThemeToggle from "./ThemeToggle";

export default function UserLoginBar() {
  const { role, setRole, referrer, setReferrer } = useUserStore();
  const { address, isConnected } = useAccount();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check for referral parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get("ref");
    if (refParam && !referrer) {
      setReferrer(refParam);
      showToast(`Referred by ${refParam.slice(0, 6)}...${refParam.slice(-4)}`, "info");
    }
  }, [mounted, referrer, setReferrer, showToast]);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">RiderTrust</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/rider" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Rider
            </Link>
            <Link href="/profile" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Profile
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Role Selection */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRole("sender")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  role === "sender"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Sender
              </button>
              <button
                onClick={() => setRole("rider")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  role === "rider"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Rider
              </button>
            </div>

            {/* Wallet Connection */}
            <ConnectButton />

            {/* User Info */}
            {mounted && isConnected && address && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Role:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    role === "sender" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                    role === "rider" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}>
                    {role || "None"}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
=======
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
}>>>>>>> dc112a7 (fiixed:ui fix)

