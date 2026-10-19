"use client";

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { assinarSessao, getSessao, getUsuarioIdDoToken } from "./auth";
import { buscarAlunoAtual, buscarUsuario, type Aluno } from "./api";
import { ErroDaApi } from "./http";

export type UsuarioAtual = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  // null = o backend ainda não informa se o e-mail foi verificado.
  emailVerificado: boolean | null;
  // false quando os dados da conta (nome completo, e-mail, telefone) não vieram. Aí o nome exibido é o de guerra,
  // que é um conceito do app Viver o Quad: só serve de último recurso, nunca é mostrado como tal no site.
  dadosDaContaDisponiveis: boolean;
  // false quando os dados da conta não vieram: salvar o nome por cima do de guerra seria errado.
  podeEditarCadastro: boolean;
  aluno: Aluno | null;
};

type Estado = { usuario: UsuarioAtual | null; carregando: boolean; recarregar: () => void };

const UsuarioContext = createContext<Estado>({ usuario: null, carregando: false, recarregar: () => {} });

function lerToken() {
  return getSessao()?.tokenDeAcesso ?? null;
}

// undefined = ainda não sabemos (renderização no servidor / antes da hidratação).
export function useTokenDeAcesso(): string | null | undefined {
  return useSyncExternalStore(assinarSessao, lerToken, () => undefined);
}

// Aluno: tudo vem de /api/alunos/eu. Conta sem cadastro de aluno (professor, administrador)
// recebe 409 ali e usa /api/usuarios/{id}, que essas contas têm permissão de ler e editar.
async function carregarUsuarioAtual(id: string): Promise<UsuarioAtual> {
  try {
    const a = await buscarAlunoAtual();
    return {
      id,
      nome: a.nomeCompleto || a.nomeDeGuerra,
      email: a.email ?? null,
      telefone: a.telefone ?? null,
      cpf: a.cpf ?? null,
      emailVerificado: a.emailVerificado ?? null,
      dadosDaContaDisponiveis: !!a.nomeCompleto,
      podeEditarCadastro: !!a.nomeCompleto,
      aluno: a,
    };
  } catch (e) {
    if (!(e instanceof ErroDaApi && e.status === 409)) throw e;
  }

  const u = await buscarUsuario(id);
  return {
    id,
    nome: u.nome,
    email: u.email ?? null,
    telefone: u.telefone ?? null,
    cpf: u.cpf ?? null,
    emailVerificado: u.emailVerificado ?? null,
    dadosDaContaDisponiveis: true,
    podeEditarCadastro: true,
    aluno: null,
  };
}

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const token = useTokenDeAcesso();
  // Chaveado pelo id (e não pelo token) para não "piscar" quando o token é renovado.
  const id = token ? getUsuarioIdDoToken(token) : null;
  const [carregado, setCarregado] = useState<{ id: string; usuario: UsuarioAtual | null } | null>(null);
  // Incrementado para buscar de novo (ex.: depois de salvar o perfil) sem apagar o que está na tela.
  const [versao, setVersao] = useState(0);
  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    if (!id) return;

    let cancelado = false;
    carregarUsuarioAtual(id)
      .then((usuario) => {
        if (!cancelado) setCarregado({ id, usuario });
      })
      .catch(() => {
        if (!cancelado) setCarregado({ id, usuario: null });
      });
    return () => {
      cancelado = true;
    };
  }, [id, versao]);

  const pronto = !!id && carregado?.id === id;
  const estado: Estado = {
    usuario: pronto ? carregado.usuario : null,
    carregando: !!id && !pronto,
    recarregar,
  };

  return <UsuarioContext.Provider value={estado}>{children}</UsuarioContext.Provider>;
}

export function useUsuarioAtual() {
  return useContext(UsuarioContext).usuario;
}

export function useCarregandoUsuario() {
  return useContext(UsuarioContext).carregando;
}

export function useRecarregarUsuario() {
  return useContext(UsuarioContext).recarregar;
}
