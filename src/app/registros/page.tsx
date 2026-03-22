"use client";

import { useEffect, useState } from "react";
import { Search, FileDown, User, Download, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { TransactionFormModal } from "@/components/TransactionFormModal";
import { format, parseISO, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RegistrosPage() {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("mes");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<any>(null);

  useEffect(() => { carregarDados(); }, []);

  async function carregarDados() {
    const { data } = await supabase.from('transacoes').select('*').order('data_competencia', { ascending: false });
    if (data) setTransacoes(data);
  }

  function abrirModalParaCriar() {
    setTransacaoSelecionada(null);
    setModalAberto(true);
  }

  const formatarMoeda = (valor: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  const hoje = new Date();
  
  // CORREÇÃO PROFUNDA DOS FILTROS (Lógica Nativa)
  const transacoesFiltradas = transacoes.filter(t => {
    if (busca && !t.descricao?.toLowerCase().includes(busca.toLowerCase()) && !t.nome?.toLowerCase().includes(busca.toLowerCase())) return false;
    if (filtroTipo !== "todos" && t.tipo !== filtroTipo) return false;
    
    // Se for todo histórico, não precisa filtrar data
    if (filtroPeriodo === "tudo") return true;

    try {
      const dataRef = parseISO(t.data_competencia);
      const anoRef = dataRef.getFullYear();
      const mesRef = dataRef.getMonth();
      const anoHoje = hoje.getFullYear();
      const mesHoje = hoje.getMonth();

      if (filtroPeriodo === "mes") return anoRef === anoHoje && mesRef === mesHoje;
      if (filtroPeriodo === "ano") return anoRef === anoHoje;
    } catch (e) { return true; }
    return true;
  });

  return (
    <div className="space-y-6 font-sans pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Registros de Caixa</h1>
          <p className="text-gray-500 text-sm mt-1">Histórico completo de entradas e saídas.</p>
        </div>
        <button onClick={abrirModalParaCriar} className="flex items-center gap-2 px-5 py-2.5 bg-[#ffab40] text-[#0a003d] font-bold rounded-lg hover:bg-[#e69a39] transition-colors shadow-sm">
          <FileText size={18} strokeWidth={2.5}/> Novo Lançamento
        </button>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar por descrição ou nome..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0097a7] transition-all" />
        </div>
        {/* CORREÇÃO VISUAL: Inputs de filtro mais limpos */}
        <select className="p-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0097a7] bg-white text-gray-700 shadow-sm" value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)}>
          <option value="mes">Este Mês</option><option value="ano">Este Ano</option><option value="tudo">Todo o Histórico</option>
        </select>
        <select className="p-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0097a7] bg-white text-gray-700 shadow-sm" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="todos">Todos os tipos</option><option value="receita">Apenas Entradas</option><option value="despesa">Apenas Saídas</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left table-auto">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                {/* AJUSTE: Nova Coluna solicitada */}
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente/Fornecedor</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                {/* AJUSTE: Nome da coluna de NF alterado para Ação */}
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {transacoesFiltradas.map((t) => {
                const vencido = t.status?.toLowerCase() === 'pendente' && isAfter(hoje, parseISO(t.data_vencimento));
                return (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-600 tabular-nums">{format(new Date(t.data_competencia), "dd MMM, yyyy", { locale: ptBR })}</td>
                    {/* AJUSTE: Exibição da nova coluna */}
                    <td className="px-5 py-4 text-gray-900 font-medium flex items-center gap-2.5"><div className="bg-gray-100 p-1.5 rounded-full text-gray-500"><User size={14}/></div>{t.nome}</td>
                    <td className="px-5 py-4 text-gray-600 truncate max-w-xs">{t.descricao || '-'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${t.tipo === 'receita' ? 'bg-emerald-50 text-[#0097a7]' : 'bg-gray-100 text-gray-600'}`}>{t.tipo === 'receita' ? 'Entrada' : 'Saída'}</span>
                    </td>
                    <td className={`px-5 py-4 font-bold ${t.tipo === 'receita' ? 'text-gray-900' : 'text-gray-600'}`}>{formatarMoeda(t.valor)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${t.status?.toLowerCase() === 'pago' || t.status?.toLowerCase() === 'recebido' ? 'bg-emerald-50 text-emerald-800' : vencido ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                        {vencido ? 'Atrasado' : t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        <button onClick={() => { setTransacaoSelecionada(t); setModalAberto(true); }} className="p-1.5 text-gray-400 hover:text-[#ffab40] rounded transition-colors" title="Editar Lançamento"><User size={16}/></button>
                        {/* AJUSTE: Botão de DOWNLOAD de NF adicionado */}
                        {t.arquivo_nf ? (
                            <a href={t.arquivo_nf} download={`NF_${t.nome}_${t.data_competencia}.pdf`} target="_blank" className="p-1.5 text-[#0097a7] hover:bg-[#0097a7]/10 rounded transition-colors" title="Baixar Nota Fiscal"><Download size={16} /></a>
                        ) : (<span className="text-gray-300">-</span>)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {transacoesFiltradas.length === 0 && (<div className="text-center p-12 text-gray-400 text-sm font-medium">Nenhum registro encontrado para este período.</div>)}
      </div>

      <TransactionFormModal aberto={modalAberto} onClose={() => setModalAberto(false)} carregarDados={carregarDados} edicaoData={transacaoSelecionada} />
    </div>
  );
}
