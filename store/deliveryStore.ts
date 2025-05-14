import { create } from "zustand";

interface Delivery {
  id: number;
  receiver: string;
  amount: number;
  status: "Created" | "Accepted" | "Completed" | "Disputed";
  riderId?: string;
}

interface DeliveryState {
  deliveries: Delivery[];
  createDelivery: (receiver: string, amount: number) => void;
  acceptDelivery: (deliveryId: number, riderId: string) => void;
  completeDelivery: (deliveryId: number) => void;
  disputeDelivery: (deliveryId: number) => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveries: [],
  createDelivery: (receiver, amount) => {
    const newDelivery = {
      id: get().deliveries.length + 1,
      receiver,
      amount,
      status: "Created" as const,
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
  completeDelivery: (deliveryId) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, status: "Completed" }
          : delivery
      ),
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
}));
