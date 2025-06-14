import { create } from 'zustand';

interface Delivery {
  id: number;
  receiver: string;
  amount: number;
  status: 'Created' | 'Accepted' | 'Completed' | 'Disputed';
}

interface DeliveryState {
  deliveries: Delivery[];
  createDelivery: (receiver: string, amount: number) => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveries: [],
  createDelivery: (receiver, amount) => {
    const newDelivery = {
      id: get().deliveries.length + 1,
      receiver,
      amount,
      status: 'Created' as const,
    };
    set(state => ({ deliveries: [...state.deliveries, newDelivery] }));
  },
}));
