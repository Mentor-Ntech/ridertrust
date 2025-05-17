"use client";
import { useUserStore, UserRole } from "@/store/userStore";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function UserLoginBar() {
  const { address, isConnected } = useAccount();
  const { role, setRole, reset } = useUserStore();

  const handleLogout = () => {
    reset();
  };

  return (
    <div className="w-full bg-gray-100 py-3 px-4 flex items-center justify-between mb-6 rounded">
      <div className="flex items-center gap-4 w-full">
        <ConnectButton showBalance={false} accountStatus="address" />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="p-2 border rounded"
          disabled={!isConnected}>
          <option value="">Select role</option>
          <option value="sender">Sender</option>
          <option value="rider">Rider</option>
        </select>
        {isConnected && role && (
          <>
            <span className="capitalize text-blue-700">{role}</span>
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
