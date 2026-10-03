export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ErroDeCampo = { campo: string; mensagem: string };

// Erro no formato devolvido pela API: { status, title, detail, codigo?, erros? }.
export class ErroDaApi extends Error {
  constructor(
    public status: number,
    mensagem: string,
    public codigo?: string,
    public erros: ErroDeCampo[] = [],
  ) {
    super(mensagem);
  }
}

export async function lerErro(res: Response, mensagemPadrao: string): Promise<ErroDaApi> {
  try {
    const corpo = await res.json();
    return new ErroDaApi(res.status, corpo.detail ?? mensagemPadrao, corpo.codigo, corpo.erros ?? []);
  } catch {
    return new ErroDaApi(res.status, mensagemPadrao);
  }
}
