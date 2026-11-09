"use client";

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { assinarSessao, temSessao } from "./auth";
import { buscarAlunoAtual, buscarMinhaConta, type Aluno, type TipoDeConta } from "./api";
import { ErroDaApi } from "./http";

export type UsuarioAtual = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  // null = o backend ainda não informa se o e-mail foi verificado.
  emailVerificado: boolean | null;
  // null = o backend ainda não informa se o celular foi confirmado.
  telefoneVerificado: boolean | null;
  // false quando os dados da conta (nome completo, e-mail, telefone) não vieram. Aí o nome exibido é o de guerra,
  // que é um conceito do app Viver o Quad: só serve de último recurso, nunca é mostrado como tal no site.
  dadosDaContaDisponiveis: boolean;
  // false quando os dados da conta não vieram: salvar o nome por cima do de guerra seria errado.
  podeEditarCadastro: boolean;
  aluno: Aluno | null;
  // O papel da conta. null = não deu para saber (a conta não é de aluno e /api/usuarios/eu não respondeu).
  tipo: TipoDeConta | null;
};

type Estado = { usuario: UsuarioAtual | null; carregando: boolean; recarregar: () => void };

const UsuarioContext = createContext<Estado>({ usuario: null, carregando: false, recarregar: () => {} });

// A sessão mora em cookies HttpOnly (lib/auth.ts): o site só sabe SE há sessão, pelo cookie quad_sessao.
// undefined = ainda não sabemos (renderização no servidor / antes da hidratação).
export function useSessaoAtiva(): boolean | undefined {
  return useSyncExternalStore(assinarSessao, temSessao, () => undefined);
}

// Para o aluno, tudo vem de /api/alunos/eu, que traz também o id da conta (usuarioId). Conta sem cadastro de aluno
// (professor, administrador) recebe 409 ali, e os dados e o papel dela vêm de /api/usuarios/eu; se nem essa
// responder, o site mostra só o essencial.
async function carregarUsuarioAtual(): Promise<UsuarioAtual> {
  try {
    const a = await buscarAlunoAtual();
    return {
      id: a.usuarioId,
      nome: a.nomeCompleto || a.nomeDeGuerra,
      email: a.email ?? null,
      telefone: a.telefone ?? null,
      cpf: a.cpf ?? null,
      emailVerificado: a.emailVerificadoEm === undefined ? null : a.emailVerificadoEm !== null,
      telefoneVerificado: a.telefoneVerificadoEm === undefined ? null : a.telefoneVerificadoEm !== null,
      dadosDaContaDisponiveis: !!a.nomeCompleto,
      podeEditarCadastro: !!a.nomeCompleto,
      aluno: a,
      tipo: "ALUNO",
    };
  } catch (e) {
    if (!(e instanceof ErroDaApi && e.status === 409)) throw e;
  }
  try {
    const c = await buscarMinhaConta();
    return {
      id: c.id,
      nome: c.nome || "Minha conta",
      email: c.email,
      telefone: c.telefone,
      cpf: c.cpf,
      emailVerificado: c.emailVerificadoEm !== null,
      telefoneVerificado: c.telefoneVerificadoEm !== null,
      // A edição do cadastro pelo site é a do aluno (PerfilConteudo): para as outras contas, continua fechada.
      dadosDaContaDisponiveis: false,
      podeEditarCadastro: false,
      aluno: null,
      tipo: c.tipo,
    };
  } catch {
    // Sem /api/usuarios/eu: só o essencial, abaixo.
  }
  return {
    id: "",
    nome: "Minha conta",
    email: null,
    telefone: null,
    cpf: null,
    emailVerificado: null,
    telefoneVerificado: null,
    dadosDaContaDisponiveis: false,
    podeEditarCadastro: false,
    aluno: null,
    tipo: null,
  };
}

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const ativa = useSessaoAtiva();
  // Cada login conta como uma sessão nova (a anterior pode ter sido de outra conta).
  const [sessao, setSessao] = useState(0);
  const [carregado, setCarregado] = useState<{ sessao: number; usuario: UsuarioAtual | null } | null>(null);
  // Incrementado para buscar de novo (ex.: depois de salvar o perfil) sem apagar o que está na tela.
  const [versao, setVersao] = useState(0);
  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  // Ao sair, a próxima entrada conta como sessão nova (ajuste durante a renderização, como recomenda o React).
  const [ativaAntes, setAtivaAntes] = useState(ativa);
  if (ativaAntes !== ativa) {
    setAtivaAntes(ativa);
    if (ativa === false) setSessao((s) => s + 1);
  }

  useEffect(() => {
    if (!ativa) return;

    let cancelado = false;
    carregarUsuarioAtual()
      .then((usuario) => {
        if (!cancelado) setCarregado({ sessao, usuario });
      })
      .catch(() => {
        if (!cancelado) setCarregado({ sessao, usuario: null });
      });
    return () => {
      cancelado = true;
    };
  }, [ativa, sessao, versao]);

  const pronto = !!ativa && carregado?.sessao === sessao;
  const estado: Estado = {
    usuario: pronto ? carregado.usuario : null,
    carregando: !!ativa && !pronto,
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
