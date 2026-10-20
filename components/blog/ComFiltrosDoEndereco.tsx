"use client";

import { useSearchParams } from "next/navigation";
import type { Post } from "@/lib/data";
import ListaDoBlog from "./ListaDoBlog";

// /blog?cat=Editais&q=prf abre o blog já filtrado (links das categorias no artigo).
export default function ComFiltrosDoEndereco({ posts }: { posts: Post[] }) {
  const p = useSearchParams();
  const cat = p.get("cat");
  return <ListaDoBlog posts={posts} categoriaInicial={posts.some((x) => x.categoria === cat) ? cat : null} buscaInicial={p.get("q") ?? ""} />;
}
