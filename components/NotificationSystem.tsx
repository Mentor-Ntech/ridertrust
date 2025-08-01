"use client";
import { useEffect, useState } from "react";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useUserStore } from "@/store/userStore";
import { useAccount } from "wagmi";
import { useToast } from "./ToastProvider";

export default function NotificationSystem() {
  const deliveries = useDeliveryStore((state) => state.deliveries);
  const { role } = useUserStore();
  const { address, isConnected } = useAccount();
  const { showToast } = useToast();
  const [lastCheck, setLastCheck] = useState(Date.now());
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    timestamp: number;
    read: boolean;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) return;

    const checkForUpdates = () => {
      const now = Date.now();
      const newNotifications: typeof notifications = [];

      // Check for relevant deliveries based on user role
      deliveries.forEach((delivery) => {
        const isRelevant = 
          (role === "sender" && delivery.senderId === address) ||
          (role === "rider" && delivery.riderId === address) ||
          (role === "receiver" && delivery.receiver === address);

        if (!isRelevant) return;

        // Check for status changes (using transaction log as proxy for recent changes)
        const recentLogs = delivery.transactionLog?.filter(log => log.timestamp > lastCheck) || [];
        
        recentLogs.forEach((log) => {
          const notificationId = `${delivery.id}-${log.timestamp}`;
          
          // Don't create duplicate notifications
          if (notifications.some(n => n.id === notificationId)) return;

          let title = "";
          let message = "";
          let type: "info" | "success" | "warning" | "error" = "info";

          switch (log.type) {
            case "created":
              if (role === "sender") {
                title = "Delivery Created";
                message = `Your delivery request #${delivery.id} has been created and is now available for riders.`;
                type = "success";
              }
              break;
            case "accepted":
              if (role === "sender" || role === "receiver") {
                title = "Delivery Accepted";
                message = `Delivery #${delivery.id} has been accepted by a rider and will start soon.`;
                type = "success";
              }
              break;
            case "in_transit":
              if (role === "sender" || role === "receiver") {
                title = "Delivery In Transit";
                message = `Your package #${delivery.id} is now being delivered.`;
                type = "info";
              }
              break;
            case "delivered":
              if (role === "receiver") {
                title = "Package Delivered";
                message = `Package #${delivery.id} has been delivered. Please confirm receipt with the OTP.`;
                type = "warning";
              } else if (role === "sender") {
                title = "Package Delivered";
                message = `Your package #${delivery.id} has been delivered and is awaiting receiver confirmation.`;
                type = "info";
              }
              break;
            case "completed":
              if (role === "sender" || role === "rider") {
                title = "Delivery Completed";
                message = `Delivery #${delivery.id} has been completed successfully. Payment has been released.`;
                type = "success";
              }
              break;
            case "disputed":
              title = "Dispute Filed";
              message = `A dispute has been filed for delivery #${delivery.id}. Please check the details.`;
              type = "error";
              break;
          }

          if (title && message) {
            newNotifications.push({
              id: notificationId,
              title,
              message,
              type,
              timestamp: log.timestamp,
              read: false,
            });
          }
        });

        // Check for new messages
        const recentMessages = delivery.messages?.filter(msg => 
          msg.timestamp > lastCheck && msg.sender !== address
        ) || [];

        recentMessages.forEach((message) => {
          const notificationId = `msg-${delivery.id}-${message.timestamp}`;
          
          if (!notifications.some(n => n.id === notificationId)) {
            newNotifications.push({
              id: notificationId,
              title: "New Message",
              message: `New message in delivery #${delivery.id}: "${message.text.slice(0, 50)}${message.text.length > 50 ? '...' : ''}"`,
              type: "info",
              timestamp: message.timestamp,
              read: false,
            });
          }
        });
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        
        // Show toast for the most recent notification
        const latest = newNotifications.sort((a, b) => b.timestamp - a.timestamp)[0];
        showToast(latest.title, latest.type);
      }

      setLastCheck(now);
    };

    // Check immediately and then every 5 seconds
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 5000);

    return () => clearInterval(interval);
  }, [deliveries, address, role, isConnected, lastCheck, notifications, showToast]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  if (!isConnected) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5A7.5 7.5 0 0119 10a7.5 7.5 0 00-15 0c0 2.5 1.2 4.7 3 6.1L4 19h5m6-2c0 1.7-1.3 3-3 3s-3-1.3-3-3" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={clearNotifications}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === "success" ? "bg-green-500" :
                        notification.type === "warning" ? "bg-yellow-500" :
                        notification.type === "error" ? "bg-red-500" :
                        "bg-blue-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 10 && (
            <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing 10 of {notifications.length} notifications
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}