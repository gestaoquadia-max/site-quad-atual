"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  tipo: "produto" | "turma" | "evento";
  nome: string;
  tag?: string;
  preco: string;
  precoSufixo?: string;
  quantidade: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantidade">) => void;
  removeItem: (id: string) => void;
  updateQuantidade: (id: string, quantidade: number) => void;
  clear: () => void;
  totalCount: number;
  totalValor: number;
  temItemSobConsulta: boolean;
  // false até ler o carrinho salvo no navegador; evita mostrar "vazio" por um instante
  carregado: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "quad-carrinho";

export function parsePreco(preco: string): number | null {
  const normalizado = preco.trim().toLowerCase();
  if (normalizado === "gratuito") return 0;
  if (normalizado === "consulte" || normalizado === "—") return null;
  const numerico = preco.replace(/[^\d,]/g, "").replace(",", ".");
  const valor = parseFloat(numerico);
  return isNaN(valor) ? null : valor;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Hidratação: o carrinho só existe no navegador, então é lido depois da montagem.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignora storage indisponível/corrompido
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, carregado]);

  function addItem(item: Omit<CartItem, "quantidade">) {
    setItems((prev) => {
      const existente = prev.find((i) => i.id === item.id);
      if (existente) {
        if (item.tipo !== "produto") return prev;
        return prev.map((i) => (i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i));
      }
      return [...prev, { ...item, quantidade: 1 }];
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQuantidade(id: string, quantidade: number) {
    if (quantidade < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantidade } : i)));
  }

  const clear = useCallback(() => setItems([]), []);

  const totalCount = items.reduce((soma, i) => soma + i.quantidade, 0);
  const totalValor = items.reduce((soma, i) => {
    const valor = parsePreco(i.preco);
    return valor === null ? soma : soma + valor * i.quantidade;
  }, 0);
  const temItemSobConsulta = items.some((i) => parsePreco(i.preco) === null);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantidade, clear, totalCount, totalValor, temItemSobConsulta, carregado }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
