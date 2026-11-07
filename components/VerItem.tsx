"use client";

import { useEffect } from "react";
import { verItem, type ItemDoAnalytics } from "@/lib/analytics";

// Conta no Analytics a visita à página de um produto (turma, material, evento, combo): o evento view_item, uma vez
// por página aberta. Não desenha nada.
export default function VerItem({ item }: { item: ItemDoAnalytics }) {
  const { item_id } = item;
  useEffect(() => {
    verItem(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- conta uma vez por produto, não a cada renderização
  }, [item_id]);
  return null;
}
