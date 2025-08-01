import { create } from "zustand";
import { useUserStore } from "./userStore";

interface Delivery {
  id: number;
  receiver: string;
  amount: number;
  status: "Created" | "Accepted" | "InTransit" | "Delivered" | "Completed" | "Disputed";
  senderId: string;
  riderId?: string;
  currentLocation?: { lat: number; lng: number } | null;
  // OTP and Confirmation System
  otp?: string;
  isConfirmedByReceiver?: boolean;
  deliveryProof?: Array<{
    type: "photo" | "signature" | "location";
    data: string; // base64 image or coordinate string
    timestamp: number;
  }>;
  receiverNotes?: string;
  // Enhanced delivery details
  description?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  estimatedDeliveryTime?: number;
  actualDeliveryTime?: number;
  // Existing fields
  reviews?: Array<{
    reviewer: string;
    rating: number;
    comment: string;
  }>;
  messages?: Array<{
    sender: string;
    text: string;
    timestamp: number;
  }>;
  disputeEvidence?: Array<{
    submitter: string;
    text: string;
    images: string[];
  }>;
  tips?: Array<{
    sender: string;
    amount: number;
    timestamp: number;
  }>;
  transactionLog?: Array<{
    type: string;
    actor: string;
    timestamp: number;
    details?: string;
  }>;
  referralRewarded?: boolean;
}

interface DeliveryState {
  deliveries: Delivery[];
  createDelivery: (receiver: string, amount: number, senderId: string, description?: string, pickupAddress?: string, deliveryAddress?: string) => void;
  acceptDelivery: (deliveryId: number, riderId: string) => void;
  markInTransit: (deliveryId: number) => void;
  markDelivered: (deliveryId: number, proof?: Array<{type: "photo" | "signature" | "location"; data: string}>) => void;
  confirmDeliveryByReceiver: (deliveryId: number, otp: string, receiverNotes?: string) => void;
  completeDelivery: (deliveryId: number) => void;
  disputeDelivery: (deliveryId: number) => void;
  updateDeliveryLocation: (deliveryId: number, location: { lat: number; lng: number } | null) => void;
  addReview: (deliveryId: number, reviewer: string, rating: number, comment: string) => void;
  addMessage: (deliveryId: number, sender: string, text: string) => void;
  addDisputeEvidence: (deliveryId: number, submitter: string, text: string, images: string[]) => void;
  addTip: (deliveryId: number, sender: string, amount: number) => void;
  addTransactionLog: (deliveryId: number, type: string, actor: string, details?: string) => void;
  generateOTP: (deliveryId: number) => string;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveries: [],
  createDelivery: (receiver, amount, senderId, description, pickupAddress, deliveryAddress) => {
    const deliveryId = get().deliveries.length + 1;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    
    const newDelivery = {
      id: deliveryId,
      receiver,
      amount,
      status: "Created" as const,
      senderId,
      otp,
      isConfirmedByReceiver: false,
      description: description || "Package delivery",
      pickupAddress,
      deliveryAddress,
      currentLocation: null,
      deliveryProof: [],
      reviews: [],
      messages: [],
      disputeEvidence: [],
      tips: [],
      transactionLog: [
        {
          type: "created",
          actor: senderId,
          timestamp: Date.now(),
          details: `Delivery created for ${amount} cUSD to ${receiver}. OTP: ${otp}`,
        },
      ],
    };
    set((state) => ({ deliveries: [...state.deliveries, newDelivery] }));
  },
  acceptDelivery: (deliveryId, riderId) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, status: "Accepted", riderId }
          : delivery
      ),
    }));
  },
  markInTransit: (deliveryId) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, status: "InTransit" }
          : delivery
      ),
    }));
  },
  markDelivered: (deliveryId, proof) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? { 
              ...delivery, 
              status: "Delivered",
              deliveryProof: proof ? proof.map(p => ({ ...p, timestamp: Date.now() })) : [],
              actualDeliveryTime: Date.now()
            }
          : delivery
      ),
    }));
  },
  confirmDeliveryByReceiver: (deliveryId, otp, receiverNotes) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) => {
        if (delivery.id === deliveryId && delivery.otp === otp) {
          return { 
            ...delivery, 
            status: "Completed" as const,
            isConfirmedByReceiver: true,
            receiverNotes: receiverNotes || ""
          };
        }
        return delivery;
      }),
    }));
  },
  generateOTP: (deliveryId) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, otp }
          : delivery
      ),
    }));
    return otp;
  },
  completeDelivery: (deliveryId) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) => {
        if (delivery.id === deliveryId) {
          return { ...delivery, status: "Completed" };
        }
        return delivery;
      }),
    }));
  },
  disputeDelivery: (deliveryId) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, status: "Disputed" }
          : delivery
      ),
    }));
  },
  updateDeliveryLocation: (deliveryId, location) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, currentLocation: location }
          : delivery
      ),
    }));
  },
  addReview: (deliveryId, reviewer, rating, comment) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? {
              ...delivery,
              reviews: [
                ...(delivery.reviews || []),
                { reviewer, rating, comment },
              ],
            }
          : delivery
      ),
    }));
  },
  addMessage: (deliveryId, sender, text) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? {
              ...delivery,
              messages: [
                ...(delivery.messages || []),
                { sender, text, timestamp: Date.now() },
              ],
            }
          : delivery
      ),
    }));
  },
  addDisputeEvidence: (deliveryId, submitter, text, images) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? {
              ...delivery,
              disputeEvidence: [
                ...(delivery.disputeEvidence || []),
                { submitter, text, images },
              ],
            }
          : delivery
      ),
    }));
  },
  addTip: (deliveryId, sender, amount) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? {
              ...delivery,
              tips: [
                ...(delivery.tips || []),
                { sender, amount, timestamp: Date.now() },
              ],
            }
          : delivery
      ),
    }));
  },
  addTransactionLog: (deliveryId, type, actor, details) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? {
              ...delivery,
              transactionLog: [
                ...(delivery.transactionLog || []),
                { type, actor, timestamp: Date.now(), details },
              ],
            }
          : delivery
      ),
    }));
  },
}));