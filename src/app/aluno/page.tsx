'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Home, Layers, PenTool, BarChart2, BookOpen, Clock, 
  ChevronDown, ChevronRight, Flame, CheckCircle2, 
  XCircle, FileText, ArrowRight, LogOut, Menu, X,
  Printer, CheckSquare, Square, Sparkles
} from 'lucide-react';

export default function PortalAluno() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [secaoAtiva, setSecaoAtiva] = useState<'inicio' | 'conteudo' | 'redacao' | 'simulados' | 'biblioteca' | 'desempenho'>('inicio');
  const [materiaSelecionada, setMateriaSelecionada] = useState<string>('Matemática');
  const [menuConteudosAberto, setMenuConteudosAberto] = useState(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  // Dados reais do Supabase
  const [atividades, setAtividades] = useState<any[]>([]);
  const [simulados, setSimulados] = useState<any[]>([]);
  const [temaAtivo, setTemaAtivo] = useState<any>(null);
  const [minhasRedacoes, setMinhasRedacoes] = useState<any[]>([]);
  const [livros, setLivros] = useState<any[]>([]);

  // Respostas interativas e XP
  const [respostasAluno, setRespostasAluno] = useState<Record<string, string>>({});
  const [acertosSessao, setAcertosSessao] = useState(0);

  // Seleção de Questões para Apostila PDF Personalizada
  const [selecionadasPdf, setSelecionadasPdf] = useState<string[]>([]);

  // Simulado Cronometrado
  const [simuladoEmAndamento, setSimuladoEmAndamento] = useState<any>(null);
  const [tempoRestante, setTempoRestante] = useState<number>(0);
  const [respostasSimulado, setRespostasSimulado] = useState<Record<string, string>>({});
  const [resultadoSimulado, setResultadoSimulado] = useState<{ acertos: number; total: number } | null>(null);

  // Leitor de PDF Embutido
  const [pdfAberto, setPdfAberto] = useState<any>(null);

  // Oficina de Redação
  const [escrevendoRedacao, setEscrevendoRedacao] = useState(false);
  const [textoRedacao, setTextoRedacao] = useState('');
  const [redacaoEnviada, setRedacaoEnviada] = useState(false);

  const materias = [
    { nome: 'Linguagens', subtitulo: 'Português & Interpretação', cor: 'from-amber-500 to-orange-800' },
    { nome: 'Matemática', subtitulo: 'Álgebra, Geometria & Lógica', cor: 'from-cyan-600 to-slate-900' },
    { nome: 'Ciências', subtitulo: 'Natureza & Experimentos', cor: 'from-lime-600 to-emerald-950' },
    { nome: 'Humanas', subtitulo: 'História & Geografia', cor: 'from-slate-700 to-zinc-950' },
  ];

  useEffect(() => {
    const userStr = localStorage.getItem('epp_usuario');
    if (!userStr) { router.push('/login'); return; }
    const user = JSON.parse(userStr);
    setUsuario(user);
    carregarDados(user);
  }, [router]);

  useEffect(() => {
    if (!simuladoEmAndamento || tempoRestante <= 0) return;
    const timer = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          finalizarSimulado();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [simuladoEmAndamento, tempoRestante]);

  const carregarDados = async (user: any) => {
    const [ativs, sims, tema, reds, libs] = await Promise.all([
      supabase.from('atividades').select('*').eq('serie', user.serie),
      supabase.from('simulados').select('*').eq('serie_alvo', user.serie).eq('ativo', true),
      supabase.from('temas_redacao').select('*').eq('ativo', true).single(),
      supabase.from('redacoes_enviadas').select('*').eq('aluno_email', user.email).order('enviado_em', { ascending: false }),
      supabase.from('biblioteca').select('*')
    ]);
    if (ativs.data) setAtividades(ativs.data);
    if (sims.data) setSimulados(sims.data);
    if (tema.data) setTemaAtivo(tema.data);
    if (reds.data) setMinhasRedacoes(reds.data);
    if (libs.data) setLivros(libs.data.filter(l => l.serie === '6º ao 9º Ano' || l.serie === user.serie));
  };

  const responderQuestao = async (questao: any, letra: string) => {
    if (respostasAluno[questao.id]) return;
    setRespostasAluno(prev => ({ ...prev, [questao.id]: letra }));

    if (letra === questao.correta) {
      const novoXp = (usuario.xp || 0) + 20;
      setAcertosSessao(prev => prev + 1);
      const atualizado = { ...usuario, xp: novoXp };
      setUsuario(atualizado);
      localStorage.setItem('epp_usuario', JSON.stringify(atualizado));
      await supabase.from('usuarios_autorizados').update({ xp: novoXp }).eq('email', usuario.email);
    }
  };

  // Alternar seleção para PDF
  const toggleSelecaoPdf = (id: string) => {
    setSelecionadasPdf(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Gerar Apostila Personalizada em PDF (Impressão Limpa)
  const gerarApostilaPDF = () => {
    const questoesEscolhidas = atividades.filter(a => selecionadasPdf.includes(a.id));
    if (questoesEscolhidas.length === 0) return;

    const janela = window.open('', '_blank');
    if (!janela) return alert('Permita pop-ups no navegador para gerar o PDF da apostila.');

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Apostila EPP Nexo - ${usuario.nome}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1e293b; padding: 32px; max-width: 800px; margin: auto; }
          .header { border-bottom: 3px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          .logo { background: #F59E0B; color: #0f172a; font-weight: 900; padding: 6px 14px; border: 2px solid #0f172a; border-radius: 8px; font-size: 18px; }
          .info { font-size: 12px; text-align: right; line-height: 1.5; }
          .questao { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px dashed #cbd5e1; page-break-inside: avoid; }
          .q-titulo { font-size: 11px; font-weight: bold; color: #d97706; text-transform: uppercase; margin-bottom: 4px; }
          .q-enunciado { font-size: 14px; font-weight: bold; margin-bottom: 10px; line-height: 1.5; }
          .alternativa { font-size: 13px; margin: 5px 0 5px 12px; }
          .gabarito-box { margin-top: 40px; padding: 20px; background: #f8fafc; border: 2px solid #0f172a; border-radius: 12px; page-break-before: always; }
          .gabarito-box h2 { margin-top: 0; font-size: 16px; }
          .gab-item { font-size: 12px; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">EPP NEXO • LISTA DE EXERCÍCIOS</div>
          <div class="info">
            <strong>Aluno(a):</strong> ${usuario.nome}<br/>
            <strong>Série:</strong> ${usuario.serie} • <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>

        ${questoesEscolhidas.map((q, i) => `
          <div class="questao">
            <div class="q-titulo">Questão 0${i + 1} • ${q.disciplina} (${q.titulo})</div>
            <div class="q-enunciado">${q.enunciado}</div>
            <div class="alternativa">( A ) ${q.alternativa_a}</div>
            <div class="alternativa">( B ) ${q.alternativa_b}</div>
            <div class="alternativa">( C ) ${q.alternativa_c}</div>
            <div class="alternativa">( D ) ${q.alternativa_d}</div>
          </div>
        `).join('')}

        <div class="gabarito-box">
          <h2>Gabarito Oficial & Resolução Comentada</h2>
          ${questoesEscolhidas.map((q, i) => `
            <div class="gab-item">
              <strong>Questão 0${i + 1} — Resposta: Letra ${q.correta}</strong><br/>
              <span>${q.resolucao_comentada}</span>
            </div>
          `).join('')}
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    janela.document.write(html);
    janela.document.close();
  };

  const iniciarSimulado = (sim: any) => {
    setSimuladoEmAndamento(sim);
    setTempoRestante(sim.duracao_minutos * 60);
    setRespostasSimulado({});
    setResultadoSimulado(null);
  };

  const finalizarSimulado = () => {
    const questoesSim = atividades.filter(a => a.simulado_id === simuladoEmAndamento?.id);
    const listaFinal = questoesSim.length > 0 ? questoesSim : atividades;
    let acertos = 0;
    listaFinal.forEach(q => {
      if (respostasSimulado[q.id] === q.correta) acertos++;
    });
    setResultadoSimulado({ acertos, total: listaFinal.length });
    setSimuladoEmAndamento(null);
  };

  const formatarLinkEmbed = (url: string) => {
    if (url.includes('drive.google.com') && url.includes('/view')) {
      return url.replace('/view', '/preview');
    }
    return url;
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

  const questoesDaMateria = atividades.filter(a => a.disciplina === materiaSelecionada && !a.simulado_id);

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900 flex flex-col">
      {/* MODAL LEITOR DE PDF EMBUTIDO */}
      {pdfAberto && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col p-4 animate-pop-in">
          <div className="bg-white rounded-t-2xl px-6 py-3.5 flex justify-between items-center border-b-2 border-slate-900">
            <div>
              <span className="text-[10px] font-black text-amber-600 uppercase">{pdfAberto.categoria}</span>
              <h3 className="font-black text-sm">{pdfAberto.titulo}</h3>
            </div>
            <button onClick={() => setPdfAberto(null)} className="bg-slate-900 text-white p-2 rounded-full hover:bg-red-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <iframe src={formatarLinkEmbed(pdfAberto.url_pdf)} className="flex-1 w-full bg-white rounded-b-2xl" />
        </div>
      )}

      {/* BARRA FLUTUANTE PARA GERAR PDF PERSONALIZADO */}
      {selecionadasPdf.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-950 text-white px-5 py-3.5 rounded-2xl border-2 border-amber-400 shadow-[6px_6px_0px_#F59E0B] flex items-center gap-4 animate-pop-in">
          <div>
            <p className="text-xs font-black text-amber-400">{selecionadasPdf.length} questão(ões) marcada(s)</p>
            <p className="text-[11px] text-slate-300">Prontas para montar sua apostila</p>
          </div>
          <button
            onClick={gerarApostilaPDF}
            className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Baixar PDF
          </button>
          <button onClick={() => setSelecionadasPdf([])} className="text-slate-400 hover:text-white text-xs cursor-pointer">
            Limpar
          </button>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white/95 backdrop-blur-md border-b-2 border-slate-200 h-16 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => setMenuMobileAberto(!menuMobileAberto)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-amber-500 text-white font-black text-lg px-3 py-1 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]">
              EPP <span className="text-slate-950">NEXO</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-cyan-100 text-cyan-950 font-black text-xs px-3.5 py-1.5 rounded-full border-2 border-slate-900">
            {usuario.serie}
          </span>
          <div className="flex items-center gap-1.5 bg-amber-400 text-slate-950 border-2 border-slate-900 px-3.5 py-1.5 rounded-full text-xs font-black shadow-[2px_2px_0px_#0f172a]">
            <Flame className="w-3.5 h-3.5 fill-slate-950" /> {usuario.xp || 0} XP
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right leading-tight">
              <p className="text-xs font-black text-slate-900">{usuario.nome}</p>
              <button onClick={sair} className="text-[10px] text-red-600 font-bold hover:underline flex items-center gap-1 ml-auto cursor-pointer">
                <LogOut className="w-2.5 h-2.5" /> Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1440px] w-full mx-auto">
        {/* SIDEBAR */}
        <aside className={`${menuMobileAberto ? 'fixed inset-y-0 left-0 z-40 block pt-16' : 'hidden'} lg:block w-64 bg-white border-r-2 border-slate-200 shrink-0`}>
          <div className="p-4 space-y-1.5">
            <p className="px-3 text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Trilha de Estudos</p>

            <button onClick={() => setSecaoAtiva('inicio')} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-black cursor-pointer ${secaoAtiva === 'inicio' ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Home className="w-4 h-4" /> Início
            </button>

            <div>
              <button onClick={() => setMenuConteudosAberto(!menuConteudosAberto)} className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-black text-slate-700 hover:bg-slate-100 cursor-pointer">
                <span className="flex items-center gap-3"><Layers className="w-4 h-4" /> Disciplinas</span>
                {menuConteudosAberto ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {menuConteudosAberto && (
                <div className="pl-6 pr-2 py-1 space-y-1">
                  {materias.map((m) => (
                    <button key={m.nome} onClick={() => { setMateriaSelecionada(m.nome); setSecaoAtiva('conteudo'); setMenuMobileAberto(false); }} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${secaoAtiva === 'conteudo' && materiaSelecionada === m.nome ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'}`}>
                      • {m.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => { setSecaoAtiva('simulados'); setMenuMobileAberto(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-black cursor-pointer ${secaoAtiva === 'simulados' ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Clock className="w-4 h-4" /> Simulados
            </button>

            <button onClick={() => { setSecaoAtiva('redacao'); setEscrevendoRedacao(false); setMenuMobileAberto(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-black cursor-pointer ${secaoAtiva === 'redacao' ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'}`}>
              <PenTool className="w-4 h-4" /> Redação
            </button>

            <button onClick={() => { setSecaoAtiva('biblioteca'); setMenuMobileAberto(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-black cursor-pointer ${secaoAtiva === 'biblioteca' ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'}`}>
              <BookOpen className="w-4 h-4" /> Biblioteca PDF
            </button>

            <button onClick={() => { setSecaoAtiva('desempenho'); setMenuMobileAberto(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-black cursor-pointer ${secaoAtiva === 'desempenho' ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'}`}>
              <BarChart2 className="w-4 h-4" /> Meu Desempenho
            </button>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-6 lg:p-10">
          {secaoAtiva === 'inicio' && (
            <div className="space-y-8 max-w-5xl animate-fade-up">
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-8 text-white border-2 border-slate-900 shadow-[6px_6px_0px_#F59E0B] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-lg">
                  <span className="inline-flex items-center gap-1.5 bg-lime-400 text-slate-950 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" /> PLATAFORMA DE REFORÇO EPP NEXO
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-black">Bons estudos, {usuario.nome}!</h1>
                  <p className="text-sm text-slate-300">
                    Pratique questões interativas para ganhar XP ou selecione seus exercícios favoritos para gerar sua própria apostila em PDF.
                  </p>
                  <button onClick={() => setSecaoAtiva('conteudo')} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-6 py-3 rounded-2xl border-2 border-slate-950 shadow-[3px_3px_0px_#ffffff] cursor-pointer">
                    Começar Lista de Exercícios <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {materias.map((mat) => (
                  <button key={mat.nome} onClick={() => { setMateriaSelecionada(mat.nome); setSecaoAtiva('conteudo'); }} className={`h-36 rounded-3xl bg-gradient-to-br ${mat.cor} p-6 text-left text-white border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:-translate-y-1 transition-all flex flex-col justify-end cursor-pointer`}>
                    <span className="text-[11px] text-white/80 font-medium">{mat.subtitulo}</span>
                    <h4 className="text-xl font-black uppercase mt-0.5">{mat.nome}</h4>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUESTÕES INTERATIVAS + SELEÇÃO PARA APOSTILA PDF */}
          {secaoAtiva === 'conteudo' && (
            <div className="space-y-6 max-w-4xl animate-fade-up">
              <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a]">
                <div>
                  <h1 className="text-2xl font-black">{materiaSelecionada} • {usuario.serie}</h1>
                  <p className="text-xs text-slate-500">Responda na tela para ganhar XP ou marque para baixar em PDF</p>
                </div>
                <div className="flex items-center gap-2">
                  {questoesDaMateria.length > 0 && (
                    <button
                      onClick={() => {
                        const todosIds = questoesDaMateria.map(q => q.id);
                        const jaTemTodos = todosIds.every(id => selecionadasPdf.includes(id));
                        if (jaTemTodos) setSelecionadasPdf(prev => prev.filter(id => !todosIds.includes(id)));
                        else setSelecionadasPdf(prev => Array.from(new Set([...prev, ...todosIds])));
                      }}
                      className="text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-900 px-3.5 py-2 rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Selecionar Todas p/ PDF
                    </button>
                  )}
                  <span className="text-xs font-black bg-lime-400 text-slate-950 px-3.5 py-2 rounded-xl border border-slate-900">+20 XP / acerto</span>
                </div>
              </div>

              {questoesDaMateria.length === 0 ? (
                <p className="text-sm text-slate-500 bg-white p-8 rounded-3xl border-2 border-slate-200">Nenhuma questão cadastrada nesta matéria para o {usuario.serie} ainda.</p>
              ) : (
                questoesDaMateria.map((q, index) => {
                  const escolhida = respostasAluno[q.id];
                  const acertou = escolhida === q.correta;
                  const marcadaPdf = selecionadasPdf.includes(q.id);
                  const opcoes = [
                    { letra: 'A', texto: q.alternativa_a },
                    { letra: 'B', texto: q.alternativa_b },
                    { letra: 'C', texto: q.alternativa_c },
                    { letra: 'D', texto: q.alternativa_d },
                  ];

                  return (
                    <div key={q.id} className={`bg-white p-6 rounded-3xl border-2 transition-all space-y-4 ${marcadaPdf ? 'border-amber-500 shadow-[4px_4px_0px_#F59E0B]' : 'border-slate-200'}`}>
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="text-xs font-black text-amber-600 uppercase">Questão 0{index + 1} • {q.titulo}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleSelecaoPdf(q.id)}
                            className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 cursor-pointer ${
                              marcadaPdf ? 'bg-amber-400 border-slate-900 text-slate-950 font-black' : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {marcadaPdf ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                            {marcadaPdf ? 'Incluída no PDF' : 'Incluir no PDF'}
                          </button>

                          {escolhida && (
                            <span className={`text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 ${acertou ? 'bg-lime-400 text-slate-950' : 'bg-red-100 text-red-700'}`}>
                              {acertou ? <><CheckCircle2 className="w-3.5 h-3.5" /> Acertou (+20 XP)</> : <><XCircle className="w-3.5 h-3.5" /> Gabarito: {q.correta}</>}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm font-bold text-slate-800 leading-relaxed">{q.enunciado}</p>

                      <div className="space-y-2.5">
                        {opcoes.map((op) => {
                          let estilo = 'border-slate-200 hover:border-slate-900 hover:bg-slate-50';
                          if (escolhida) {
                            if (op.letra === q.correta) estilo = 'border-lime-600 bg-lime-100 font-bold text-lime-950';
                            else if (op.letra === escolhida) estilo = 'border-red-400 bg-red-50 text-red-900';
                          }
                          return (
                            <button
                              key={op.letra}
                              disabled={!!escolhida}
                              onClick={() => responderQuestao(q, op.letra)}
                              className={`w-full text-left p-3.5 rounded-2xl border-2 text-xs transition flex items-center gap-3 cursor-pointer ${estilo}`}
                            >
                              <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-black flex items-center justify-center shrink-0">
                                {op.letra}
                              </span>
                              <span>{op.texto}</span>
                            </button>
                          );
                        })}
                      </div>

                      {escolhida && (
                        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-xs space-y-1 animate-fade-up">
                          <p className="font-black text-slate-900">Resolução Comentada:</p>
                          <p className="text-slate-600">{q.resolucao_comentada}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* SIMULADOS */}
          {secaoAtiva === 'simulados' && (
            <div className="space-y-6 max-w-4xl animate-fade-up">
              <h1 className="text-2xl font-black">Simulados Cronometrados • {usuario.serie}</h1>

              {resultadoSimulado && (
                <div className="bg-lime-400 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] p-6 rounded-3xl text-slate-950 space-y-1 animate-pop-in">
                  <h2 className="text-xl font-black">Simulado Finalizado!</h2>
                  <p className="text-sm font-bold">Você acertou {resultadoSimulado.acertos} de {resultadoSimulado.total} questões.</p>
                </div>
              )}

              {simuladoEmAndamento ? (
                <div className="space-y-6">
                  <div className="bg-slate-950 text-white p-5 rounded-3xl border-2 border-amber-400 flex justify-between items-center sticky top-20 z-20">
                    <div>
                      <p className="text-xs text-amber-400 font-black">EM ANDAMENTO</p>
                      <h3 className="font-black text-base">{simuladoEmAndamento.titulo}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-lg font-black bg-white/10 px-3.5 py-1.5 rounded-xl">
                        {Math.floor(tempoRestante / 60)}:{String(tempoRestante % 60).padStart(2, '0')}
                      </span>
                      <button onClick={finalizarSimulado} className="bg-lime-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer">
                        Entregar Prova
                      </button>
                    </div>
                  </div>

                  {(atividades.filter(a => a.simulado_id === simuladoEmAndamento.id).length > 0
                    ? atividades.filter(a => a.simulado_id === simuladoEmAndamento.id)
                    : atividades
                  ).map((q, idx) => (
                    <div key={q.id} className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-3">
                      <p className="text-xs font-black text-slate-400">QUESTÃO 0{idx + 1}</p>
                      <p className="text-sm font-bold">{q.enunciado}</p>
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {['A', 'B', 'C', 'D'].map((letra) => (
                          <button
                            key={letra}
                            onClick={() => setRespostasSimulado(prev => ({ ...prev, [q.id]: letra }))}
                            className={`p-3.5 rounded-2xl border-2 text-left text-xs font-bold cursor-pointer ${
                              respostasSimulado[q.id] === letra ? 'bg-amber-400 border-slate-900' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {letra}) {q[`alternativa_${letra.toLowerCase()}`]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {simulados.length === 0 ? (
                    <p className="text-sm text-slate-500 bg-white p-8 rounded-3xl border-2 border-slate-200">Nenhum simulado agendado no momento.</p>
                  ) : (
                    simulados.map(s => (
                      <div key={s.id} className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] flex justify-between items-center">
                        <div>
                          <span className="bg-cyan-100 text-cyan-900 text-[10px] font-black px-3 py-1 rounded-full">DURAÇÃO: {s.duracao_minutos} MIN</span>
                          <h3 className="font-black text-lg mt-1.5">{s.titulo}</h3>
                        </div>
                        <button onClick={() => iniciarSimulado(s)} className="bg-amber-500 text-slate-950 font-black text-xs px-6 py-3 rounded-2xl border-2 border-slate-900 cursor-pointer">
                          Iniciar Simulado
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* REDAÇÃO */}
          {secaoAtiva === 'redacao' && (
            <div className="space-y-6 max-w-4xl animate-fade-up">
              <h1 className="text-2xl font-black">Oficina de Redação EPP</h1>
              {!escrevendoRedacao ? (
                <>
                  <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-3">
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full border border-slate-900">TEMA DA SEMANA</span>
                    <h2 className="text-xl font-black">{temaAtivo ? temaAtivo.titulo : 'Aguardando publicação do tema semanal'}</h2>
                    {temaAtivo?.textos_apoio && <p className="text-sm text-slate-600 whitespace-pre-wrap">{temaAtivo.textos_apoio}</p>}
                    {temaAtivo && (
                      <button onClick={() => { setEscrevendoRedacao(true); setRedacaoEnviada(false); }} className="bg-amber-500 text-slate-950 font-black text-sm px-6 py-3 rounded-2xl border-2 border-slate-900 cursor-pointer">
                        Escrever Redação
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-black text-base">Minhas Redações Enviadas ({minhasRedacoes.length})</h3>
                    {minhasRedacoes.map((r) => (
                      <div key={r.id} className="bg-white p-5 rounded-2xl border-2 border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400">{new Date(r.enviado_em).toLocaleDateString('pt-BR')}</span>
                          {r.corrigida ? (
                            <span className="bg-lime-400 border border-slate-900 text-slate-950 font-black text-xs px-3 py-1 rounded-full">Nota: {r.nota}</span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full">Aguardando correção</span>
                          )}
                        </div>
                        {r.comentario_professor && (
                          <p className="text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200"><strong>Feedback:</strong> {r.comentario_professor}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 space-y-4">
                  {redacaoEnviada ? (
                    <div className="bg-lime-400 p-4 rounded-2xl font-black text-slate-950">Redação enviada com sucesso!</div>
                  ) : (
                    <>
                      <textarea rows={12} value={textoRedacao} onChange={(e) => setTextoRedacao(e.target.value)} placeholder="Digite sua redação aqui..." className="w-full p-4 border-2 border-slate-300 rounded-2xl text-sm" />
                      <div className="flex justify-between">
                        <button onClick={() => setEscrevendoRedacao(false)} className="text-xs font-bold text-slate-500 cursor-pointer">Cancelar</button>
                        <button onClick={enviarRedacao} className="bg-amber-500 font-black text-sm px-6 py-3 rounded-2xl border-2 border-slate-900 cursor-pointer">Enviar para Correção</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* BIBLIOTECA VIRTUAL */}
          {secaoAtiva === 'biblioteca' && (
            <div className="space-y-4 max-w-4xl animate-fade-up">
              <h1 className="text-2xl font-black">Biblioteca Virtual EPP</h1>
              <div className="grid sm:grid-cols-3 gap-5">
                {livros.map((l) => (
                  <div key={l.id} className="bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between gap-4 hover:-translate-y-1 transition-all">
                    <div>
                      <div className="w-11 h-11 bg-cyan-400 border-2 border-slate-900 rounded-2xl flex items-center justify-center text-slate-950 mb-3">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-cyan-700 uppercase">{l.categoria} • {l.serie}</span>
                      <h3 className="font-black text-base mt-1">{l.titulo}</h3>
                    </div>
                    <button onClick={() => setPdfAberto(l)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 rounded-xl cursor-pointer">
                      Ler na Plataforma
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEU DESEMPENHO */}
          {secaoAtiva === 'desempenho' && (
            <div className="space-y-6 max-w-4xl animate-fade-up">
              <h1 className="text-2xl font-black">Meu Desempenho Geral</h1>
              <div className="grid sm:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#F59E0B]">
                  <p className="text-xs text-slate-500 font-black uppercase">Total de XP Acumulado</p>
                  <p className="text-3xl font-black text-amber-500 mt-2">{usuario.xp || 0} XP</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#84cc16]">
                  <p className="text-xs text-slate-500 font-black uppercase">Acertos nesta Sessão</p>
                  <p className="text-3xl font-black text-lime-600 mt-2">{acertosSessao}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a]">
                  <p className="text-xs text-slate-500 font-black uppercase">Redações Enviadas</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{minhasRedacoes.length}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
