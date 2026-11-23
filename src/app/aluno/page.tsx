'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Home, Layers, PenTool, BarChart2, BookOpen, Clock, 
  ChevronDown, ChevronRight, Bell, Flame, 
  CheckCircle2, FileText, ArrowRight, LogOut, Menu
} from 'lucide-react';

export default function PortalAluno() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [secaoAtiva, setSecaoAtiva] = useState<'inicio' | 'conteudo' | 'redacao' | 'simulados' | 'biblioteca' | 'desempenho'>('inicio');
  const [materiaSelecionada, setMateriaSelecionada] = useState<string>('Matemática');
  const [menuConteudosAberto, setMenuConteudosAberto] = useState(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  // Dados do Supabase
  const [atividades, setAtividades] = useState<any[]>([]);
  const [temaAtivo, setTemaAtivo] = useState<any>(null);
  const [minhasRedacoes, setMinhasRedacoes] = useState<any[]>([]);
  const [livros, setLivros] = useState<any[]>([]);

  const [escrevendoRedacao, setEscrevendoRedacao] = useState(false);
  const [textoRedacao, setTextoRedacao] = useState('');
  const [redacaoEnviada, setRedacaoEnviada] = useState(false);

  const materias = [
    { nome: 'Linguagens', subtitulo: 'Português & Interpretação', cor: 'from-amber-600 to-orange-900', tag: 'bg-amber-500' },
    { nome: 'Matemática', subtitulo: 'Álgebra, Geometria & Lógica', cor: 'from-cyan-700 to-slate-900', tag: 'bg-cyan-500' },
    { nome: 'Ciências', subtitulo: 'Natureza & Experimentos', cor: 'from-lime-700 to-emerald-950', tag: 'bg-lime-500' },
    { nome: 'Humanas', subtitulo: 'História & Geografia', cor: 'from-slate-700 to-zinc-950', tag: 'bg-slate-600' },
  ];

  useEffect(() => {
    const userStr = localStorage.getItem('epp_usuario');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setUsuario(user);
    carregarDados(user);
  }, [router]);

  const carregarDados = async (user: any) => {
    const { data: ativs } = await supabase.from('atividades').select('*').eq('serie', user.serie);
    if (ativs) setAtividades(ativs);

    const { data: tema } = await supabase.from('temas_redacao').select('*').eq('ativo', true).single();
    if (tema) setTemaAtivo(tema);

    const { data: reds } = await supabase.from('redacoes_enviadas').select('*').eq('aluno_email', user.email).order('enviado_em', { ascending: false });
    if (reds) setMinhasRedacoes(reds);

    const { data: libs } = await supabase.from('biblioteca').select('*');
    if (libs) setLivros(libs);
  };

  const enviarRedacao = async () => {
    if (!textoRedacao.trim() || !usuario) return;
    await supabase.from('redacoes_enviadas').insert([{
      aluno_email: usuario.email,
      aluno_nome: usuario.nome,
      serie: usuario.serie,
      tema_id: temaAtivo?.id || null,
      texto_redacao: textoRedacao
    }]);
    setRedacaoEnviada(true);
    setTextoRedacao('');
    carregarDados(usuario);
  };

  const sair = () => {
    localStorage.removeItem('epp_usuario');
    router.push('/login');
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-800 flex flex-col">
      <header className="bg-white border-b border-slate-200 h-16 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => setMenuMobileAberto(!menuMobileAberto)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-amber-500 text-white font-black text-lg px-2.5 py-0.5 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
              EPP <span className="text-slate-900">NEXO</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-cyan-100 text-cyan-900 font-bold text-xs px-3 py-1 rounded-full border border-cyan-300">
            {usuario.serie}
          </span>
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /> {usuario.xp || 0} XP
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right leading-tight">
              <p className="text-xs font-bold text-slate-800">{usuario.nome}</p>
              <button onClick={sair} className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1 ml-auto">
                <LogOut className="w-2.5 h-2.5" /> Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1440px] w-full mx-auto">
        <aside className={`${menuMobileAberto ? 'fixed inset-y-0 left-0 z-40 block pt-16' : 'hidden'} lg:block w-64 bg-white border-r border-slate-200 shrink-0`}>
          <div className="p-4 space-y-1">
            <p className="px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">Menu</p>

            <button onClick={() => setSecaoAtiva('inicio')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${secaoAtiva === 'inicio' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Home className="w-4 h-4" /> Início
            </button>

            <div>
              <button onClick={() => setMenuConteudosAberto(!menuConteudosAberto)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                <span className="flex items-center gap-3"><Layers className="w-4 h-4" /> Conteúdos</span>
                {menuConteudosAberto ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {menuConteudosAberto && (
                <div className="pl-7 pr-2 py-1 space-y-1">
                  {materias.map((m) => (
                    <button key={m.nome} onClick={() => { setMateriaSelecionada(m.nome); setSecaoAtiva('conteudo'); }} className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900">
                      &gt; {m.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => { setSecaoAtiva('redacao'); setEscrevendoRedacao(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${secaoAtiva === 'redacao' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <PenTool className="w-4 h-4" /> Redação
            </button>

            <button onClick={() => setSecaoAtiva('biblioteca')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${secaoAtiva === 'biblioteca' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <BookOpen className="w-4 h-4" /> Biblioteca Virtual
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          {secaoAtiva === 'inicio' && (
            <div className="space-y-8 max-w-5xl">
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-lg">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400">PLATAFORMA DE REFORÇO EPP NEXO</span>
                  <h1 className="text-2xl sm:text-3xl font-black">Olá, {usuario.nome}!</h1>
                  <p className="text-sm text-slate-300">Acompanhe as atividades e o tema semanal de redação do {usuario.serie}.</p>
                  <button onClick={() => setSecaoAtiva('redacao')} className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 font-black text-sm px-5 py-2.5 rounded-full">
                    Ir para Redação <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {materias.map((mat) => (
                  <button key={mat.nome} onClick={() => { setMateriaSelecionada(mat.nome); setSecaoAtiva('conteudo'); }} className={`h-32 rounded-2xl bg-gradient-to-br ${mat.cor} p-5 text-left text-white flex flex-col justify-end`}>
                    <span className="text-[10px] text-white/70">{mat.subtitulo}</span>
                    <h4 className="text-lg font-black uppercase">{mat.nome}</h4>
                  </button>
                ))}
              </div>
            </div>
          )}

          {secaoAtiva === 'conteudo' && (
            <div className="space-y-4 max-w-4xl">
              <h1 className="text-2xl font-black">{materiaSelecionada} • {usuario.serie}</h1>
              {atividades.length === 0 ? (
                <p className="text-sm text-slate-500 bg-white p-6 rounded-2xl border border-slate-200">Nenhuma atividade publicada para esta série ainda.</p>
              ) : (
                atividades.map((ativ) => (
                  <div key={ativ.id} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                    <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{ativ.disciplina}</span>
                    <h3 className="font-black text-lg">{ativ.titulo}</h3>
                    <p className="text-sm text-slate-700">{ativ.enunciado}</p>
                    <details className="bg-lime-50 p-3 rounded-xl border border-lime-300 text-xs">
                      <summary className="font-bold cursor-pointer text-lime-900">Ver Resolução Comentada</summary>
                      <p className="mt-2 text-slate-700">{ativ.resolucao_comentada}</p>
                    </details>
                  </div>
                ))
              )}
            </div>
          )}

          {secaoAtiva === 'redacao' && (
            <div className="space-y-6 max-w-4xl">
              <h1 className="text-2xl font-black">Oficina de Redação EPP</h1>
              {!escrevendoRedacao ? (
                <>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full">TEMA DA SEMANA</span>
                    <h2 className="text-xl font-black">{temaAtivo ? temaAtivo.titulo : 'Aguardando publicação do tema semanal pela gestão'}</h2>
                    {temaAtivo?.textos_apoio && <p className="text-sm text-slate-600 whitespace-pre-wrap">{temaAtivo.textos_apoio}</p>}
                    {temaAtivo && (
                      <button onClick={() => { setEscrevendoRedacao(true); setRedacaoEnviada(false); }} className="bg-amber-500 text-slate-950 font-black text-sm px-6 py-2.5 rounded-full">
                        Escrever Redação
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-black text-base">Minhas Redações Enviadas ({minhasRedacoes.length})</h3>
                    {minhasRedacoes.map((r) => (
                      <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">{new Date(r.enviado_em).toLocaleDateString('pt-BR')}</span>
                          {r.corrigida ? (
                            <span className="bg-lime-100 text-lime-800 font-black text-xs px-3 py-1 rounded-full">Nota: {r.nota}</span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full">Aguardando correção</span>
                          )}
                        </div>
                        {r.comentario_professor && (
                          <p className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200"><strong>Feedback do Professor:</strong> {r.comentario_professor}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                  {redacaoEnviada ? (
                    <div className="bg-lime-100 p-4 rounded-xl font-bold text-lime-900">Redação enviada com sucesso!</div>
                  ) : (
                    <>
                      <textarea rows={12} value={textoRedacao} onChange={(e) => setTextoRedacao(e.target.value)} placeholder="Digite sua redação aqui..." className="w-full p-4 border border-slate-300 rounded-xl text-sm" />
                      <div className="flex justify-between">
                        <button onClick={() => setEscrevendoRedacao(false)} className="text-xs font-bold text-slate-500">Cancelar</button>
                        <button onClick={enviarRedacao} className="bg-amber-500 font-black text-sm px-6 py-2.5 rounded-full">Enviar para Correção</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {secaoAtiva === 'biblioteca' && (
            <div className="space-y-4 max-w-4xl">
              <h1 className="text-2xl font-black">Biblioteca Virtual EPP</h1>
              <div className="grid sm:grid-cols-3 gap-4">
                {livros.map((l) => (
                  <div key={l.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-600">{l.serie}</span>
                      <h3 className="font-black text-sm mt-1">{l.titulo}</h3>
                    </div>
                    <a href={l.url_pdf} target="_blank" rel="noreferrer" className="text-center bg-slate-900 text-white font-bold text-xs py-2 rounded-xl">
                      Abrir Material
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
