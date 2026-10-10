"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import seed from "@/app/_data.json";
import { createId, normalizeInvoice, type Invoice } from "./lib/invoice";
type InvoiceStore = {
  invoices: Invoice[];
  theme: "light" | "dark";
  ready: boolean;
  setReady: () => void;
  save: (invoice: Invoice) => string;
  remove: (id: string) => void;
  markPaid: (id: string) => void;
  toggleTheme: () => void;
};
export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      invoices: seed as Invoice[],
      theme: "light",
      ready: false,
      setReady: () => set({ ready: true }),
      save: (invoice) => {
        const id = invoice.id || createId(get().invoices);
        const next = normalizeInvoice({ ...invoice, id });
        set((state) => ({
          invoices: state.invoices.some((item) => item.id === id)
            ? state.invoices.map((item) => (item.id === id ? next : item))
            : [next, ...state.invoices],
        }));
        return id;
      },
      remove: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((invoice) => invoice.id !== id),
        })),
      markPaid: (id) =>
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.id === id && invoice.status === "pending"
              ? { ...invoice, status: "paid" }
              : invoice,
          ),
        })),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "invoice-app-v1",
      version: 1,
      skipHydration: true,
      partialize: (state) => ({ invoices: state.invoices, theme: state.theme }),
    },
  ),
);
