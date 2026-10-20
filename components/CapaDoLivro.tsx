// Capa provisória de material: o título sobre a cor do Quad, com lombada e páginas, enquanto não há arte de capa.
export const CORES_DA_CAPA = ["#123764", "#1A2A45", "#0D3E86", "#203452", "#173B6B", "#0F2A52"];

export default function CapaDoLivro({ titulo, cor, tamanhoDoTitulo = 17 }: { titulo: string; cor: string; tamanhoDoTitulo?: number }) {
  return (
    <div className="relative aspect-[17/23] w-full">
      <div aria-hidden="true" className="absolute bottom-[5px] right-[-7px] top-[5px] w-2 rounded-r-[3px] bg-[repeating-linear-gradient(90deg,#EEF2F7_0_1px,#C7D0DC_1px_2px)] shadow-[inset_-1px_0_0_rgba(0,0,0,0.15)]" />
      <div
        className="absolute inset-0 overflow-hidden rounded-[3px_7px_7px_3px] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_26px_40px_-18px_rgba(0,0,0,0.85),0_2px_4px_rgba(0,0,0,0.4)]"
        style={{ background: `linear-gradient(160deg, ${cor} 0%, #071426 100%)` }}
      >
        <div aria-hidden="true" className="absolute left-[16%] right-[10%] top-[12%]">
          <div className="text-[7.5px] font-bold tracking-[0.22em] text-azul-ceu">QUAD CONCURSOS</div>
          <div className="mt-2.5 h-0.5 w-[22px] bg-azul-vivo" />
          <div className="mt-3 font-display font-extrabold leading-[1.05] tracking-[-0.02em] text-white" style={{ fontSize: tamanhoDoTitulo }}>
            {titulo}
          </div>
        </div>
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-[12%] bg-[linear-gradient(90deg,rgba(0,0,0,0.38),rgba(255,255,255,0.10)_70%,rgba(0,0,0,0.10))]" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.10),transparent_40%)]" />
      </div>
    </div>
  );
}
