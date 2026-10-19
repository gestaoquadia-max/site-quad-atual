"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import Kicker from "./Kicker";
import { useCart } from "@/lib/cart";
import { idDoItem } from "@/lib/itens";

const acaoPorTipo = {
  produto: "Adicionar ao carrinho",
  turma: "Adicionar ao carrinho",
  evento: "Adicionar ao carrinho",
};

export default function ProductCard({
  slug,
  href,
  tag,
  nome,
  desc,
  preco,
  precoSufixo,
  status,
  statusLabel,
  dark = false,
  tipo = "produto",
  nivelDoTitulo = "h3",
}: {
  slug: string;
  href?: string;
  tag: string;
  nome: string;
  desc: string;
  preco: string;
  precoSufixo?: string;
  status?: "aberta" | "breve" | "encerrada";
  statusLabel?: string;
  dark?: boolean;
  tipo?: "produto" | "turma" | "evento";
  // h2 quando o cartão vem logo abaixo do título da página (h1); h3 dentro de uma seção com h2.
  nivelDoTitulo?: "h2" | "h3";
}) {
  const Titulo = nivelDoTitulo;
  const { addItem } = useCart();
  const [adicionado, setAdicionado] = useState(false);
  const mostrarAcao = !status || status === "aberta";

  function handleAdicionar() {
    addItem({ id: idDoItem(tipo, slug), tipo, nome, tag, preco, precoSufixo });
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1500);
  }

  return (
    <div
      className={`group relative border border-l-[3px] border-l-blue p-6 h-full flex flex-col ${
        dark ? "bg-navy-mid border-dark border-l-blue" : "bg-white border-light border-l-blue"
      }`}
    >
      <Kicker color={dark ? "text-blue" : "text-blue-dark"}>{tag}</Kicker>
      <Titulo className={`font-display text-[21px] font-bold uppercase mt-2 mb-1.5 leading-tight ${dark ? "text-offwhite" : ""}`}>
        {nome}
      </Titulo>
      <p className={`text-sm mb-4 flex-1 ${dark ? "text-steel-light" : "text-[#5A6472]"}`}>{desc}</p>
      <div className={`flex justify-between items-center pt-3.5 border-t ${dark ? "border-dark" : "border-light"}`}>
        <span className={`font-display text-xl font-bold ${dark ? "text-blue" : "text-navy"}`}>
          {preco}
          {precoSufixo && <small className="text-xs font-medium text-steel">{precoSufixo}</small>}
        </span>
        {status && statusLabel && <StatusBadge status={status} label={statusLabel} />}
      </div>

      {(mostrarAcao || href) && (
        <div
          className={`pointer-events-none absolute inset-0 flex flex-col items-stretch justify-center gap-2 px-6 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:shadow ${
            dark ? "bg-navy-mid/80" : "bg-white/80"
          }`}
        >
          {mostrarAcao && (
            <button type="button" onClick={handleAdicionar} className="btn btn-blue w-full py-2.5 text-xs">
              {adicionado ? "Adicionado ✓" : acaoPorTipo[tipo]}
            </button>
          )}
          {href && (
            <Link
              href={href}
              className={`btn w-full py-2.5 text-center text-xs ${dark ? "btn-outline" : "btn-outline-dark"}`}
            >
              Detalhes
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
