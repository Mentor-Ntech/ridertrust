import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";

import DeliveryEscrowABI from "../components/abi/DeliveryEscrow.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x...";

// Types
export interface Delivery {
  id: bigint;
  sender: `0x${string}`;
  receiver: `0x${string}`;
  rider: `0x${string}`;
  amount: bigint;
  status: number; // 0: Created, 1: Accepted, 2: Completed, 3: Disputed
}

export enum DeliveryStatus {
  Created = 0,
  Accepted = 1,
  Completed = 2,
  Disputed = 3,
}

export function useDeliveryEscrow() {
  const { address, isConnected } = useAccount();

  // Read contract functions
  const {
    data: deliveries,
    isLoading: isLoadingDeliveries,
    refetch: refetchDeliveries,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DeliveryEscrowABI,
    functionName: "getDeliveries",
  });

  const { data: deliveryExists } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DeliveryEscrowABI,
    functionName: "deliveryExists",
    args: [BigInt(0)], // Fixed: Using BigInt() constructor instead of BigInt literal
  });

  // Write contract functions
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Create delivery
  const createDelivery = async (receiver: `0x${string}`, amount: string) => {
    if (!isConnected) throw new Error("Wallet not connected");

    const amountInWei = parseEther(amount);

    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: DeliveryEscrowABI,
      functionName: "createDelivery",
      args: [receiver, amountInWei],
      value: amountInWei,
    });
  };

  // Accept delivery
  const acceptDelivery = async (deliveryId: bigint) => {
    if (!isConnected) throw new Error("Wallet not connected");

    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: DeliveryEscrowABI,
      functionName: "acceptDelivery",
      args: [deliveryId],
    });
  };

  // Complete delivery
  const completeDelivery = async (deliveryId: bigint) => {
    if (!isConnected) throw new Error("Wallet not connected");

    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: DeliveryEscrowABI,
      functionName: "completeDelivery",
      args: [deliveryId],
    });
  };

  // Dispute delivery
  const disputeDelivery = async (deliveryId: bigint) => {
    if (!isConnected) throw new Error("Wallet not connected");

    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: DeliveryEscrowABI,
      functionName: "disputeDelivery",
      args: [deliveryId],
    });
  };

  // Helper functions
  const getDeliveryById = (id: number): Delivery | undefined => {
    if (!deliveries || !Array.isArray(deliveries)) return undefined;
    return deliveries[id] as Delivery;
  };

  const getDeliveriesByUser = (userAddress: `0x${string}`): Delivery[] => {
    if (!deliveries || !Array.isArray(deliveries)) return [];
    return deliveries.filter(
      (delivery: Delivery) =>
        delivery.sender === userAddress ||
        delivery.receiver === userAddress ||
        delivery.rider === userAddress
    ) as Delivery[];
  };

  const getAvailableDeliveries = (): Delivery[] => {
    if (!deliveries || !Array.isArray(deliveries)) return [];
    return deliveries.filter(
      (delivery: Delivery) => delivery.status === DeliveryStatus.Created
    ) as Delivery[];
  };

  const getMyDeliveries = (): Delivery[] => {
    if (!address || !deliveries || !Array.isArray(deliveries)) return [];
    return getDeliveriesByUser(address);
  };

  const getMyRiderDeliveries = (): Delivery[] => {
    if (!address || !deliveries || !Array.isArray(deliveries)) return [];
    return deliveries.filter(
      (delivery: Delivery) => delivery.rider === address
    ) as Delivery[];
  };

  const getMySenderDeliveries = (): Delivery[] => {
    if (!address || !deliveries || !Array.isArray(deliveries)) return [];
    return deliveries.filter(
      (delivery: Delivery) => delivery.sender === address
    ) as Delivery[];
  };

  const getMyReceiverDeliveries = (): Delivery[] => {
    if (!address || !deliveries || !Array.isArray(deliveries)) return [];
    return deliveries.filter(
      (delivery: Delivery) => delivery.receiver === address
    ) as Delivery[];
  };

  const formatAmount = (amount: bigint): string => {
    return formatEther(amount);
  };

  const getStatusText = (status: number): string => {
    switch (status) {
      case DeliveryStatus.Created:
        return "Created";
      case DeliveryStatus.Accepted:
        return "Accepted";
      case DeliveryStatus.Completed:
        return "Completed";
      case DeliveryStatus.Disputed:
        return "Disputed";
      default:
        return "Unknown";
    }
  };

  return {
    // Contract data
    deliveries: deliveries as Delivery[] | undefined,
    isLoadingDeliveries,
    refetchDeliveries,

    // Transaction state
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,

    // Contract functions
    createDelivery,
    acceptDelivery,
    completeDelivery,
    disputeDelivery,

    // Helper functions
    getDeliveryById,
    getDeliveriesByUser,
    getAvailableDeliveries,
    getMyDeliveries,
    getMyRiderDeliveries,
    getMySenderDeliveries,
    getMyReceiverDeliveries,
    formatAmount,
    getStatusText,

    // Contract info
    contractAddress: CONTRACT_ADDRESS,
    isConnected,
    address,
  };
}
