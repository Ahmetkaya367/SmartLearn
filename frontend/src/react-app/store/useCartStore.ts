import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CourseDetail } from "@/data/courseDetails";

export interface CartItem {
    id: string; // the courseId
    title: string;
    price: number;
    thumbnail: string;
    instructor: string;
}

interface CartState {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addToCart: (item) => {
                const currentItems = get().items;
                // Avoid adding duplicate classes to the cart
                if (!currentItems.find(i => i.id === item.id)) {
                    set({ items: [...currentItems, item] });
                }
            },
            removeFromCart: (id) => {
                set({ items: get().items.filter(i => i.id !== id) });
            },
            clearCart: () => set({ items: [] }),
            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + item.price, 0);
            }
        }),
        {
            name: "cart-storage"
        }
    )
);
