"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { parsePreco } from "./format";

export type CartItem = {
  id: string;
  tipo: "produto" | "turma" | "evento" | "simulado";
  nome: string;
  tag?: string;
  preco: string;
  precoSufixo?: string;
  // Materiais: digital ou impresso (o impresso é retirado no Quad; o envio pelo correio depende do frete).
  formato?: "digital" | "impresso";
  // Simulados: carreira, edição e modalidade (presencial ou formato de estudo), revalidados em lib/simulados.ts.
  simulado?: { carreira: string; edicao: number | null; modalidade: string; sku: string; edicoesDoCombo?: number[] };
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
  // Nome do último item adicionado, para o aviso "adicionado ao carrinho" (some sozinho).
  aviso: string | null;
  fecharAviso: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "quad-carrinho";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const temporizadorDoAviso = useRef<ReturnType<typeof setTimeout>>(undefined);

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
    clearTimeout(temporizadorDoAviso.current);
    setAviso(item.nome);
    temporizadorDoAviso.current = setTimeout(() => setAviso(null), 3200);
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
  const fecharAviso = useCallback(() => setAviso(null), []);

  const totalCount = items.reduce((soma, i) => soma + i.quantidade, 0);
  const totalValor = items.reduce((soma, i) => {
    const valor = parsePreco(i.preco);
    return valor === null ? soma : soma + valor * i.quantidade;
  }, 0);
  const temItemSobConsulta = items.some((i) => parsePreco(i.preco) === null);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantidade, clear, totalCount, totalValor, temItemSobConsulta, carregado, aviso, fecharAviso }}
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
