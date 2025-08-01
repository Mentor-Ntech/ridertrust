"use client";

interface StatusBadgeProps {
  status: "Created" | "Accepted" | "InTransit" | "Delivered" | "Completed" | "Disputed";
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Created":
        return {
          icon: "📝",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          pulse: false
        };
      case "Accepted":
        return {
          icon: "✅",
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          pulse: false
        };
      case "InTransit":
        return {
          icon: "🚚",
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
          pulse: true
        };
      case "Delivered":
        return {
          icon: "📦",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
          pulse: true
        };
      case "Completed":
        return {
          icon: "🎉",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          pulse: false
        };
      case "Disputed":
        return {
          icon: "⚠️",
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          pulse: true
        };
      default:
        return {
          icon: "❓",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          pulse: false
        };
    }
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm", 
    lg: "px-4 py-2 text-base"
  };

  const config = getStatusConfig(status);

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.color} ${sizeClasses[size]} ${
        config.pulse ? "animate-pulse" : ""
      }`}
    >
      <span>{config.icon}</span>
      {status}
    </span>
  );
}