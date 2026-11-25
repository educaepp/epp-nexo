'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Home, Layers, PenTool, BarChart2, BookOpen, Clock, 
  ChevronDown, ChevronRight, Flame, CheckCircle2, 
  XCircle, FileText, ArrowRight, LogOut, Menu, X,
  Printer, CheckSquare, Square, Sparkles, Trophy, Bot, 
  HelpCircle, Calendar, Target, RotateCcw, Play, Pause, AlertTriangle
} from 'lucide-react';

export default function PortalAluno() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [secaoAtiva, setSecaoAtiva] = useState<'inicio' | 'plano' | 'conteudo' | 'erros' | 'redacao' | 'simulados' | 'biblioteca' | 'ranking' | 'desempenho'>('inicio');
  const [materiaSelecionada, setMateriaSelecionada] = useState<string>('Matemática');
  const [menuConteudosAberto, setMenuConteudosAberto] = useState(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  const [atividades, setAtividades] = useState<any[]>([]);
  const [simulados, setSimulados] = useState<any[]>([]);
  const [temaAtivo, setTemaAtivo] = useState<any>(null);
  const [minhasRedacoes, setMinhasRedacoes] = useState<any[]>([]);
  const [livros, setLivros] = useState<any[]>([]);
  const [rankingAlunos, setRankingAlunos] = useState<any[]>([]);
  const [historicoRespostas, setHistoricoRespostas] = useState<any[]>([]);

  // Plano de Estudos Personalizado por Demanda
  const [demandaObjetivo, setDemandaObjetivo] = useState('');
  const [horasEstudo, setHorasEstudo] = useState('1 hora');
  const [gerandoPlano, setGerandoPlano] = useState(false);
  const [planoAtivo, setPlanoAtivo] = useState<any>(null);
  const [diasConcluidos, setDiasConcluidos] = useState<number[]>([]);

  // Timer Pomodoro Modo Foco
  const [pomodoroSegundos, setPomodoroSegundos] = useState(25 * 60);
  const [pomodoroRodando, setPomodoroRodando] = useState(false);

  // Respostas interativas, XP e Tutor IA
  const [respostasAluno, setRespostasAluno] = useState<Record<string, string>>({});
  const [explicacoesTutor, setExplicacoesTutor] = useState<Record<string, string>>({});
  const [carregandoTutor, setCarregandoTutor] = useState<string | null>(null);

  // Seleção para PDF Personalizado
  const [selecionadasPdf, setSelecionadasPdf] = useState<string[]>([]);

  // Simulado Cronometrado
  const [simuladoEmAndamento, setSimuladoEmAndamento] = useState<any>(null);
  const [tempoRestante, setTempoRestante] = useState<number>(0);
  const [respostasSimulado, setRespostasSimulado] = useState<Record<string, string>>({});
  const [resultadoSimulado, setResultadoSimulado] = useState<{ acertos: number; total: number } | null>(null);

  // Leitor de PDF Embutido
  const [pdfAberto, setPdfAberto] = useState<any>(null);

  // Oficina de Redação + Correção Instantânea IA
  const [escrevendoRedacao, setEscrevendoRedacao] = useState(false);
  const [textoRedacao, setTextoRedacao] = useState('');
  const [enviandoRedacao, setEnviandoRedacao] = useState(false);
  const [avaliacaoIaInstantanea, setAvaliacaoIaInstantanea] = useState<any>(null);

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
        if (prev <= 1) { finalizarSimulado(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [simuladoEmAndamento, tempoRestante]);

  useEffect(() => {
    if (!pomodoroRodando) return;
    const timer = setInterval(() => {
      setPomodoroSegundos((prev) => {
        if (prev <= 1) {
          setPomodoroRodando(false);
          return 25 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pomodoroRodando]);

  const carregarDados = async (user: any) => {
    const [ativs, sims, tema, reds, libs, rank, hist, planos] = await Promise.all([
      supabase.from('atividades').select('*').eq('serie', user.serie),
      supabase.from('simulados').select('*').eq('serie_alvo', user.serie).eq('ativo', true),
      supabase.from('temas_redacao').select('*').eq('ativo', true).single(),
      supabase.from('redacoes_enviadas').select('*').eq('aluno_email', user.email).order('enviado_em', { ascending: false }),
      supabase.from('biblioteca').select('*'),
      supabase.from('usuarios_autorizados').select('nome, serie, xp').eq('perfil', 'aluno').order('xp', { ascending: false }).limit(10),
      supabase.from('respostas_alunos').select('*').eq('aluno_email', user.email).order('respondido_em', { ascending: false }),
      supabase.from('planos_estudo').select('*').eq('aluno_email', user.email).order('criado_em', { ascending: false }).limit(1)
    ]);
    if (ativs.data) setAtividades(ativs.data);
    if (sims.data) setSimulados(sims.data);
    if (tema.data) setTemaAtivo(tema.data);
    if (reds.data) setMinhasRedacoes(reds.data);
    if (libs.data) setLivros(libs.data.filter(l => l.serie === '6º ao 9º Ano' || l.serie === user.serie));
    if (rank.data) setRankingAlunos(rank.data);
    if (hist.data) setHistoricoRespostas(hist.data);
    if (planos.data && planos.data.length > 0) setPlanoAtivo(planos.data[0].plano_json);
  };

  const ganharXP = async (pontos: number) => {
    const novoXp = (usuario.xp || 0) + pontos;
    const atualizado = { ...usuario, xp: novoXp };
    setUsuario(atualizado);
    localStorage.setItem('epp_usuario', JSON.stringify(atualizado));
    await supabase.from('usuarios_autorizados').update({ xp: novoXp }).eq('email', usuario.email);
  };

  const responderQuestao = async (questao: any, letra: string, modoSuperacao = false) => {
    if (respostasAluno[questao.id] && !modoSuperacao) return;
    setRespostasAluno(prev => ({ ...prev, [questao.id]: letra }));
    const acertou = letra === questao.correta;

    await supabase.from('respostas_alunos').insert([{
      aluno_email: usuario.email,
      questao_id: questao.id,
      disciplina: questao.disciplina,
      assunto: questao.titulo,
      acertou
    }]);

    if (acertou) {
      await ganharXP(modoSuperacao ? 25 : 20);
    }
    carregarDados(usuario);
  };

  const pedirAjudaTutorIA = async (questao: any) => {
    setCarregandoTutor(questao.id);
    try {
      const res = await fetch('/api/tutor-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serie: usuario.serie,
          disciplina: questao.disciplina,
          enunciado: questao.enunciado,
          alternativaEscolhida: respostasAluno[questao.id],
          alternativaCorreta: questao.correta
        })
      });
      const data = await res.json();
      setExplicacoesTutor(prev => ({ ...prev, [questao.id]: data.explicacao || 'Revise o enunciado com atenção.' }));
    } catch {
      setExplicacoesTutor(prev => ({ ...prev, [questao.id]: 'Não foi possível conectar ao Tutor IA agora.' }));
    } finally {
      setCarregandoTutor(null);
    }
  };

  // Diagnóstico conectado das disciplinas
  const estatisticasPorMateria = materias.map((m) => {
    const respMat = historicoRespostas.filter(r => r.disciplina === m.nome);
    const total = respMat.length;
    const acertos = respMat.filter(r => r.acertou).length;
    const taxa = total > 0 ? Math.round((acertos / total) * 100) : null;
    return { nome: m.nome, total, acertos, taxa };
  });

  const gerarPlanoEstudosIA = async () => {
    if (!demandaObjetivo.trim()) return;
    setGerandoPlano(true);
    setDiasConcluidos([]);

    const fracas = estatisticasPorMateria
      .filter(e => e.taxa !== null && e.taxa < 70)
      .map(e => `${e.nome} (${e.taxa}% de acerto)`)
      .join(', ');

    const assuntosErrados = Array.from(new Set(
      historicoRespostas.filter(r => !r.acertou && r.assunto).map(r => r.assunto)
    )).slice(0, 6).join(', ');

    const redacoesComNota = minhasRedacoes.filter(r => r.nota != null);
    const mediaRed = redacoesComNota.length > 0
      ? Math.round(redacoesComNota.reduce((acc, r) => acc + Number(r.nota), 0) / redacoesComNota.length)
      : null;

    try {
      const res = await fetch('/api/plano-estudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: usuario.nome,
          serie: usuario.serie,
          objetivo: demandaObjetivo.trim(),
          horasPorDia: horasEstudo,
          materiasFracas: fracas,
          assuntosErrados,
          mediaRedacao: mediaRed
        })
      });
      const data = await res.json();
      if (res.ok && data.plano) {
        setPlanoAtivo(data.plano);
        await supabase.from('planos_estudo').insert([{
          aluno_email: usuario.email,
          objetivo: demandaObjetivo.trim(),
          plano_json: data.plano
        }]);
      }
    } finally {
      setGerandoPlano(false);
    }
  };

  const concluirDiaPlano = async (idx: number) => {
    if (diasConcluidos.includes(idx)) return;
    setDiasConcluidos(prev => [...prev, idx]);
    await ganharXP(15);
  };

  const executarAcaoDoPlano = (diaItem: any) => {
    if (diaItem.materia_alvo) setMateriaSelecionada(diaItem.materia_alvo);
    if (diaItem.acao_modulo === 'redacao') setSecaoAtiva('redacao');
    else if (diaItem.acao_modulo === 'simulados') setSecaoAtiva('simulados');
    else if (diaItem.acao_modulo === 'biblioteca') setSecaoAtiva('biblioteca');
    else if (diaItem.acao_modulo === 'erros') setSecaoAtiva('erros');
    else setSecaoAtiva('conteudo');
  };

  const toggleSelecaoPdf = (id: string) => {
    setSelecionadasPdf(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

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
            <p style="font-size:12px;"><strong>Questão 0${i + 1} — Resposta: Letra ${q.correta}</strong><br/>${q.resolucao_comentada}</p>
          `).join('')}
        </div>
        <script>window.onload = function() { window.print(); };</script>
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

  const finalizarSimulado = async () => {
    const questoesSim = atividades.filter(a => a.simulado_id === simuladoEmAndamento?.id);
    const listaFinal = questoesSim.length > 0 ? questoesSim : atividades;
    let acertos = 0;

    for (const q of listaFinal) {
      const resp = respostasSimulado[q.id];
      if (resp) {
        const acertou = resp === q.correta;
        if (acertou) acertos++;
        await supabase.from('respostas_alunos').insert([{
          aluno_email: usuario.email,
          questao_id: q.id,
          disciplina: q.disciplina,
          assunto: q.titulo,
          acertou
        }]);
      }
    }

    if (acertos > 0) await ganharXP(acertos * 15);
    setResultadoSimulado({ acertos, total: listaFinal.length });
    setSimuladoEmAndamento(null);
    carregarDados(usuario);
  };

  const formatarLinkEmbed = (url: string) => {
    if (url.includes('drive.google.com') && url.includes('/view')) return url.replace('/view', '/preview');
    return url;
  };

  const enviarRedacaoComIA = async (usarIA: boolean) => {
    if (!textoRedacao.trim() || !usuario) return;
    setEnviandoRedacao(true);
    setAvaliacaoIaInstantanea(null);

    let notaFinal = null;
    let comentarioFinal = null;
    let jaCorrigida = false;

    if (usarIA) {
      try {
        const res = await fetch('/api/corrigir-redacao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tema: temaAtivo?.titulo || 'Tema Semanal EPP Nexo',
            texto: textoRedacao,
            serie: usuario.serie
          })
        });
        const data = await res.json();
        if (res.ok && data.avaliacao) {
          const av = data.avaliacao;
          setAvaliacaoIaInstantanea(av);
          notaFinal = av.nota_total;
          jaCorrigida = true;
          comentarioFinal = `[Correção IA EPP] C1: ${av.c1} | C2: ${av.c2} | C3: ${av.c3} | C4: ${av.c4} | C5: ${av.c5}\n\n✅ Pontos Fortes: ${av.pontos_fortes}\n\n🎯 Melhorias: ${av.pontos_melhoria}\n\n💬 Parecer: ${av.comentario_geral}`;
          await ganharXP(50);
        }
      } catch {
        // fallback manual
      }
    }

    await supabase.from('redacoes_enviadas').insert([{
      aluno_email: usuario.email,
      aluno_nome: usuario.nome,
      serie: usuario.serie,
      tema_id: temaAtivo?.id || null,
      texto_redacao: textoRedacao,
      nota: notaFinal,
      comentario_professor: comentarioFinal,
      corrigida: jaCorrigida
    }]);

    setEnviandoRedacao(false);
    if (!usarIA) {
      setEscrevendoRedacao(false);
      setTextoRedacao('');
    }
    carregarDados(usuario);
  };

  const sair = () => {
    localStorage.removeItem('epp_usuario');
    router.push('/login');
  };

  if (!usuario) return null;

  const questoesDaMateria = atividades.filter(a => a.disciplina === materiaSelecionada && !a.simulado_id);
  const idsErrados = new Set(historicoRespostas.filter(r => !r.acertou).map(r => r.questao_id));
  const questoesParaRevisar = atividades.filter(a => idsErrados.has(a.id));
  const patente = (usuario.xp || 0) >= 500 ? 'Lenda EPP' : (usuario.xp || 0) >= 200 ? 'Mestre Nexo' : (usuario.xp || 0) >= 60 ? 'Explorador' : 'Iniciante';

  const totalRespondidas = historicoRespostas.length;
  const totalAcertos = historicoRespostas.filter(r => r.acertou).length;
  const taxaGeral = totalRespondidas > 0 ? Math.round((totalAcertos / totalRespondidas) * 100) : 0;

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

      {/* BARRA FLUTUANTE PDF */}
      {selecionadasPdf.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-950 text-white px-5 py-3.5 rounded-2xl border-2 border-amber-400 shadow-[6px_6px_0px_#F59E0B] flex items-center gap-4 animate-pop-in">
          <div>
            <p className="text-xs font-black text-amber-400">{selecionadasPdf.length} questão(ões) marcada(s)</p>
            <p className="text-[11px] text-slate-300">Prontas para montar sua apostila</p>
          </div>
          <button onClick={gerarApostilaPDF} className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer">
            <Printer className="w-4 h-4" /> Baixar PDF
          </button>
          <button onClick={() => setSelecionadasPdf([])} className="text-slate-400 hover:text-white text-xs cursor-pointer">Limpar</button>
        </div>
      )}

      {/* HEADER COM MODO FOCO POMODORO */}
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

        <div className="flex items-center gap-2.5">
          {/* MINI CRONÔMETRO POMODORO */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-300 px-3 py-1 rounded-full text-xs font-bold">
            <span className="text-slate-500">Foco:</span>
            <span className="font-mono font-black text-slate-900">
              {Math.floor(pomodoroSegundos / 60)}:{String(pomodoroSegundos % 60).padStart(2, '0')}
            </span>
            <button
              onClick={() => setPomodoroRodando(!pomodoroRodando)}
              className="p-1 rounded-full bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950 cursor-pointer"
              title={pomodoroRodando ? 'Pausar Foco' : 'Iniciar 25m de Foco'}
            >
              {pomodoroRodando ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>

          <span className="hidden sm:inline-block bg-slate-900 text-amber-400 font-black text-[11px] px-3 py-1 rounded-full">
            {patente}
          </span>
          <span className="bg-cyan-100 text-cyan-950 font-black text-xs px-3 py-1.5 rounded-full border-2 border-slate-900">
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
        <aside className={`${menuMobileAberto ? 'fixed inset-y-0 left-0 z-40 block pt-16' : 'hidden'} lg:block w-64 bg-white border-r-2 border-slate-200 shrink-0`}>
          <div className="p-4 space-y-1.5">
            <p className="px-3 text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Ecossistema de Estudo</p>

            <button onClick={() => { setSecaoAtiva('inicio'); setMenuMobileAberto(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-black cursor-pointer ${secaoAtiva === 'inicio' ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Home className="w-4 h-4" /> Visão Geral
            </button>

            <button onClick={() => { setSecaoAtiva('plano'); setMenuMobileAberto(false); }} className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-black cursor-pointer ${secaoAtiva === 'plano' ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span className="flex items-center gap-3"><Calendar className="w-4 h-4" /> Plano IA</span>
              <span className="text-[9px] bg-slate-900 text-amber-400 font-black px-1.5 py-0.5 rounded-full">SOB DEMANDA</span>
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

            <button onClick={() => { setSecaoAtiva('erros'); setMenuMobileAberto(false); }} className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-black cursor-pointer ${secaoAtiva === 'erros' ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span className="flex items-center gap-3"><RotateCcw className="w-4 h-4" /> Caderno de Erros</span>
              {questoesParaRevisar.length > 0 && (
                <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-full">{questoesParaRevisar.length}</span>
              )}
            </button>

            <button onClick={() => { setSecaoAtiva('simulados'); setMenuMobileAberto(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-black cursor-pointer ${secaoAtiva === 'simulados' ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Clock className="w-4 h-4" /> Simulados
            </button>

            <button onClick={() => { setSecaoAtiva('redacao'); setEscrevendoRedacao(false); setAvaliacaoIaInstantanea(null); setMenuMobileAberto(false); }} className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-black cursor-pointer ${secaoAtiva === 'redacao' ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span className="flex items-center gap-3"><PenTool className="w-4 h-4" /> Redação + IA</span>
            </button>

            <button onClick={() => { setSecaoAtiva('biblioteca'); setMenuMobileAberto(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-black cursor-pointer ${secaoAtiva === 'biblioteca' ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'}`}>
              <BookOpen className="w-4 h-4" /> Biblioteca PDF
            </button>

            <button onClick={() => { setSecaoAtiva('ranking'); carregarDados(usuario); setMenuMobileAberto(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-black cursor-pointer ${secaoAtiva === 'ranking' ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Trophy className="w-4 h-4" /> Ranking EPP
            </button>

            <button onClick={() => { setSecaoAtiva('desempenho'); setMenuMobileAberto(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-black cursor-pointer ${secaoAtiva === 'desempenho' ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'}`}>
              <BarChart2 className="w-4 h-4" /> Raio-X & Notas
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-10">
          {/* VISÃO GERAL CONECTADA */}
          {secaoAtiva === 'inicio' && (
            <div className="space-y-8 max-w-5xl animate-fade-up">
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-8 text-white border-2 border-slate-900 shadow-[6px_6px_0px_#F59E0B] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <span className="inline-flex items-center gap-1.5 bg-lime-400 text-slate-950 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" /> CENTRAL INTELIGENTE DO ALUNO
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-black">Olá, {usuario.nome}!</h1>
                  <p className="text-sm text-slate-300">
                    Seus acertos, erros e redações alimentam seu <strong>Plano de Estudos IA</strong>. Diga qual é a sua próxima prova ou meta e monte sua trilha agora.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button onClick={() => setSecaoAtiva('plano')} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-6 py-3 rounded-2xl border-2 border-slate-950 shadow-[3px_3px_0px_#ffffff] cursor-pointer">
                      <Target className="w-4 h-4" /> Montar Meu Plano de Estudos
                    </button>
                    <button onClick={() => setSecaoAtiva('conteudo')} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-black text-sm px-5 py-3 rounded-2xl border border-white/30 cursor-pointer">
                      Praticar Questões <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* RESUMO CONECTADO NO BANNER */}
                <div className="bg-white/10 border border-white/20 p-5 rounded-2xl w-full md:w-64 space-y-3 backdrop-blur-sm">
                  <p className="text-[11px] font-black uppercase text-amber-400">Seu Pulso de Estudos</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Aproveitamento:</span>
                    <span className="font-black text-lime-400">{taxaGeral}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Questões para revisar:</span>
                    <span className="font-black text-amber-300">{questoesParaRevisar.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Plano semanal:</span>
                    <span className="font-black text-cyan-300">{planoAtivo ? 'Ativo' : 'Pendente'}</span>
                  </div>
                </div>
              </div>

              {/* ATALHOS INTELIGENTES */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {materias.map((mat) => {
                  const stat = estatisticasPorMateria.find(s => s.nome === mat.nome);
                  return (
                    <button key={mat.nome} onClick={() => { setMateriaSelecionada(mat.nome); setSecaoAtiva('conteudo'); }} className={`h-40 rounded-3xl bg-gradient-to-br ${mat.cor} p-6 text-left text-white border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:-translate-y-1 transition-all flex flex-col justify-between cursor-pointer`}>
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] font-black bg-black/30 px-2.5 py-1 rounded-full">
                          {stat?.taxa !== null ? `${stat?.taxa}% acerto` : 'Novo'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-white/80 font-medium">{mat.subtitulo}</span>
                        <h4 className="text-xl font-black uppercase mt-0.5">{mat.nome}</h4>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PLANO DE ESTUDOS GERADO PELA DEMANDA PESSOAL */}
          {secaoAtiva === 'plano' && (
            <div className="space-y-6 max-w-4xl animate-fade-up">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#F59E0B] space-y-5">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full border border-slate-900 uppercase">
                      Mentor IA Conectado ao seu Desempenho
                    </span>
                    <h1 className="text-2xl font-black mt-2">Plano de Estudos Sob Demanda</h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Escreva sua meta pessoal abaixo. A IA cruza seu objetivo com as matérias que você mais errou e suas notas de redação.
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black uppercase mb-1">Qual é a sua demanda ou meta agora?</label>
                    <input
                      type="text"
                      value={demandaObjetivo}
                      onChange={(e) => setDemandaObjetivo(e.target.value)}
                      placeholder="Ex: Tenho prova de Matemática e Ciências semana que vem e quero melhorar minha redação..."
                      className="w-full p-3.5 border-2 border-slate-300 focus:border-slate-900 rounded-2xl text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase mb-1">Tempo livre por dia</label>
                    <select
                      value={horasEstudo}
                      onChange={(e) => setHorasEstudo(e.target.value)}
                      className="w-full p-3.5 border-2 border-slate-300 rounded-2xl text-sm font-bold bg-white"
                    >
                      <option>30 minutos</option>
                      <option>1 hora</option>
                      <option>1 hora e 30 min</option>
                      <option>2 horas ou mais</option>
                    </select>
                  </div>
                </div>

                {/* SUGESTÕES RÁPIDAS DE DEMANDA */}
                <div className="flex flex-wrap gap-2">
                  {[
                    'Preparação para prova bimestral',
                    'Reforçar matérias que estou errando mais',
                    'Foco total em Matemática e Interpretação',
                    'Alcançar nota 900+ na Redação'
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setDemandaObjetivo(sug)}
                      className="text-[11px] font-bold bg-slate-100 hover:bg-amber-100 text-slate-700 px-3 py-1.5 rounded-full border border-slate-300 cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                <button
                  onClick={gerarPlanoEstudosIA}
                  disabled={gerandoPlano || !demandaObjetivo.trim()}
                  className="bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-sm px-7 py-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_#F59E0B] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${gerandoPlano ? 'animate-spin' : ''}`} />
                  {gerandoPlano ? 'Cruzando seu histórico e montando roteiro...' : 'Gerar Meu Plano Semanal Agora'}
                </button>
              </div>

              {planoAtivo && (
                <div className="space-y-4 animate-pop-in">
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border-2 border-slate-950">
                    <p className="text-[11px] font-black text-lime-400 uppercase mb-1">Diagnóstico da IA para você:</p>
                    <p className="text-sm text-slate-200 leading-relaxed">{planoAtivo.diagnostico}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {planoAtivo.dias?.map((d: any, idx: number) => {
                      const feito = diasConcluidos.includes(idx);
                      return (
                        <div key={idx} className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between gap-4 ${feito ? 'bg-lime-50 border-lime-600' : 'bg-white border-slate-200'}`}>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full border border-slate-900">
                                {d.dia} • {d.duracao}
                              </span>
                              <button
                                onClick={() => concluirDiaPlano(idx)}
                                className={`text-xs font-black px-3 py-1 rounded-full border cursor-pointer ${
                                  feito ? 'bg-lime-500 text-white border-lime-700' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-lime-100'
                                }`}
                              >
                                {feito ? '✓ Concluído (+15 XP)' : 'Marcar feito'}
                              </button>
                            </div>
                            <h3 className="font-black text-base text-slate-900">{d.foco}</h3>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{d.atividade}</p>
                          </div>

                          <button
                            onClick={() => executarAcaoDoPlano(d)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            Ir para atividade agora <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CADERNO DE ERROS (REVISÃO INTELIGENTE) */}
          {secaoAtiva === 'erros' && (
            <div className="space-y-6 max-w-4xl animate-fade-up">
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#ef4444] flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h1 className="text-2xl font-black flex items-center gap-2">
                    <RotateCcw className="w-6 h-6 text-red-500" /> Caderno de Erros & Superação
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Aqui ficam reunidas as questões que você errou. Refaça com calma e ganhe <strong>+25 XP</strong> por superação!
                  </p>
                </div>
                <span className="bg-red-100 text-red-800 font-black text-xs px-3.5 py-2 rounded-xl border border-red-300">
                  {questoesParaRevisar.length} para revisar
                </span>
              </div>

              {questoesParaRevisar.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-lime-500 mx-auto" />
                  <h3 className="font-black text-lg">Nenhum erro pendente!</h3>
                  <p className="text-xs text-slate-500">Continue resolvendo questões nas disciplinas ou simulados.</p>
                </div>
              ) : (
                questoesParaRevisar.map((q, idx) => (
                  <div key={q.id} className="bg-white p-6 rounded-3xl border-2 border-red-200 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-red-600 uppercase">Revisão 0{idx + 1} • {q.disciplina} ({q.titulo})</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">{q.enunciado}</p>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {['A', 'B', 'C', 'D'].map((letra) => (
                        <button
                          key={letra}
                          onClick={() => responderQuestao(q, letra, true)}
                          className={`p-3 rounded-2xl border-2 text-left text-xs font-bold cursor-pointer ${
                            respostasAluno[q.id] === letra
                              ? letra === q.correta
                                ? 'bg-lime-400 border-slate-900 text-slate-950'
                                : 'bg-red-100 border-red-400 text-red-900'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {letra}) {q[`alternativa_${letra.toLowerCase()}`]}
                        </button>
                      ))}
                    </div>
                    {respostasAluno[q.id] === q.correta && (
                      <p className="text-xs font-black text-lime-800 bg-lime-100 p-3 rounded-xl">
                        Excelente! Você superou esse erro (+25 XP). {q.resolucao_comentada}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* QUESTÕES + TUTOR IA + PDF */}
          {secaoAtiva === 'conteudo' && (
            <div className="space-y-6 max-w-4xl animate-fade-up">
              <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a]">
                <div>
                  <h1 className="text-2xl font-black">{materiaSelecionada} • {usuario.serie}</h1>
                  <p className="text-xs text-slate-500">Cada resposta alimenta automaticamente o seu Plano de Estudos IA</p>
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
                        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-xs space-y-3 animate-fade-up">
                          <div>
                            <p className="font-black text-slate-900">Resolução Comentada:</p>
                            <p className="text-slate-600 mt-0.5">{q.resolucao_comentada}</p>
                          </div>

                          {!acertou && !explicacoesTutor[q.id] && (
                            <button
                              onClick={() => pedirAjudaTutorIA(q)}
                              disabled={carregandoTutor === q.id}
                              className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-black px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              {carregandoTutor === q.id ? 'Tutor IA analisando seu erro...' : 'Ainda com dúvida? Pedir explicação ao Tutor IA'}
                            </button>
                          )}

                          {explicacoesTutor[q.id] && (
                            <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-xl text-slate-800 whitespace-pre-wrap leading-relaxed">
                              <p className="font-black text-amber-800 flex items-center gap-1 mb-1"><Bot className="w-4 h-4" /> Explicação do Tutor IA:</p>
                              {explicacoesTutor[q.id]}
                            </div>
                          )}
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
                  <p className="text-sm font-bold">Você acertou {resultadoSimulado.acertos} de {resultadoSimulado.total} questões (+{resultadoSimulado.acertos * 15} XP).</p>
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
                      <p className="text-xs font-black text-slate-400">QUESTÃO 0{idx + 1} • {q.disciplina}</p>
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

          {/* REDAÇÃO + CORREÇÃO INSTANTÂNEA COM IA */}
          {secaoAtiva === 'redacao' && (
            <div className="space-y-6 max-w-4xl animate-fade-up">
              <h1 className="text-2xl font-black">Oficina de Redação EPP • Correção com IA</h1>
              {!escrevendoRedacao ? (
                <>
                  <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-3">
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full border border-slate-900">TEMA DA SEMANA</span>
                    <h2 className="text-xl font-black">{temaAtivo ? temaAtivo.titulo : 'Tema Livre / Prática de Redação'}</h2>
                    {temaAtivo?.textos_apoio && <p className="text-sm text-slate-600 whitespace-pre-wrap">{temaAtivo.textos_apoio}</p>}
                    <button onClick={() => { setEscrevendoRedacao(true); setAvaliacaoIaInstantanea(null); }} className="bg-amber-500 text-slate-950 font-black text-sm px-6 py-3 rounded-2xl border-2 border-slate-900 cursor-pointer">
                      Escrever Redação Agora
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-black text-base">Minhas Redações Corrigidas ({minhasRedacoes.length})</h3>
                    {minhasRedacoes.map((r) => (
                      <div key={r.id} className="bg-white p-5 rounded-2xl border-2 border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400">{new Date(r.enviado_em).toLocaleDateString('pt-BR')}</span>
                          {r.corrigida ? (
                            <span className="bg-lime-400 border border-slate-900 text-slate-950 font-black text-xs px-3 py-1 rounded-full">Nota: {r.nota} / 1000</span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full">Aguardando professor</span>
                          )}
                        </div>
                        {r.comentario_professor && (
                          <p className="text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">{r.comentario_professor}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-black text-lg">Folha de Redação Digital</h2>
                    <span className="text-xs font-bold text-slate-500">{textoRedacao.length} caracteres</span>
                  </div>

                  <textarea
                    rows={12}
                    value={textoRedacao}
                    onChange={(e) => setTextoRedacao(e.target.value)}
                    placeholder="Escreva sua redação completa com introdução, desenvolvimento e conclusão..."
                    className="w-full p-4 border-2 border-slate-300 focus:border-slate-900 rounded-2xl text-sm outline-none leading-relaxed"
                  />

                  {avaliacaoIaInstantanea && (
                    <div className="bg-slate-950 text-white p-6 rounded-3xl border-2 border-lime-400 space-y-4 animate-pop-in">
                      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-4">
                        <div>
                          <span className="text-[10px] font-black bg-lime-400 text-slate-950 px-2.5 py-0.5 rounded-full uppercase">Boletim da Banca IA (+50 XP)</span>
                          <h3 className="text-xl font-black mt-1">Nota Final: {avaliacaoIaInstantanea.nota_total} / 1000</h3>
                        </div>
                        <div className="flex gap-2 text-xs font-black">
                          <span className="bg-white/10 px-2.5 py-1.5 rounded-lg">C1: {avaliacaoIaInstantanea.c1}</span>
                          <span className="bg-white/10 px-2.5 py-1.5 rounded-lg">C2: {avaliacaoIaInstantanea.c2}</span>
                          <span className="bg-white/10 px-2.5 py-1.5 rounded-lg">C3: {avaliacaoIaInstantanea.c3}</span>
                          <span className="bg-white/10 px-2.5 py-1.5 rounded-lg">C4: {avaliacaoIaInstantanea.c4}</span>
                          <span className="bg-white/10 px-2.5 py-1.5 rounded-lg">C5: {avaliacaoIaInstantanea.c5}</span>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4 text-xs">
                        <div className="bg-lime-950/50 border border-lime-500/40 p-4 rounded-2xl">
                          <p className="font-black text-lime-400 mb-1">✅ Pontos Fortes</p>
                          <p className="text-slate-200 leading-relaxed">{avaliacaoIaInstantanea.pontos_fortes}</p>
                        </div>
                        <div className="bg-amber-950/50 border border-amber-500/40 p-4 rounded-2xl">
                          <p className="font-black text-amber-400 mb-1">🎯 O que melhorar</p>
                          <p className="text-slate-200 leading-relaxed">{avaliacaoIaInstantanea.pontos_melhoria}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 bg-white/5 p-4 rounded-2xl leading-relaxed">
                        <strong className="text-white">Parecer Geral:</strong> {avaliacaoIaInstantanea.comentario_geral}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
                    <button onClick={() => setEscrevendoRedacao(false)} className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer">
                      Voltar
                    </button>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => enviarRedacaoComIA(false)}
                        disabled={enviandoRedacao}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-black text-xs px-5 py-3 rounded-xl cursor-pointer"
                      >
                        Enviar só para Professor
                      </button>
                      <button
                        onClick={() => enviarRedacaoComIA(true)}
                        disabled={enviandoRedacao}
                        className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs px-6 py-3 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] flex items-center gap-2 cursor-pointer"
                      >
                        <Bot className="w-4 h-4" />
                        {enviandoRedacao ? 'Banca IA corrigindo texto...' : 'Corrigir Agora com IA (+50 XP)'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RANKING EPP */}
          {secaoAtiva === 'ranking' && (
            <div className="space-y-6 max-w-3xl animate-fade-up">
              <div className="bg-slate-950 text-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#F59E0B] flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-amber-400 flex items-center gap-2"><Trophy className="w-6 h-6" /> Ranking Geral EPP Nexo</h1>
                  <p className="text-xs text-slate-300 mt-1">Os estudantes que mais acumulam XP resolvendo questões, planos e redações.</p>
                </div>
                <span className="bg-amber-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-full">TOP 10</span>
              </div>

              <div className="space-y-3">
                {rankingAlunos.map((al, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border-2 flex justify-between items-center ${idx === 0 ? 'bg-amber-50 border-amber-500 shadow-[4px_4px_0px_#F59E0B]' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                      <span className={`w-9 h-9 rounded-full font-black text-sm flex items-center justify-center border-2 border-slate-900 ${
                        idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-orange-300 text-slate-950' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {idx + 1}º
                      </span>
                      <div>
                        <p className="font-black text-sm">{al.nome}</p>
                        <p className="text-xs text-slate-500">{al.serie}</p>
                      </div>
                    </div>
                    <span className="font-black text-sm bg-slate-900 text-amber-400 px-3.5 py-1.5 rounded-full">
                      {al.xp || 0} XP
                    </span>
                  </div>
                ))}
              </div>
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

          {/* RAIO-X & DESEMPENHO POR DISCIPLINA */}
          {secaoAtiva === 'desempenho' && (
            <div className="space-y-6 max-w-4xl animate-fade-up">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <h1 className="text-2xl font-black">Raio-X de Desempenho Real</h1>
                <button onClick={() => setSecaoAtiva('plano')} className="bg-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl border-2 border-slate-900 cursor-pointer">
                  Gerar Plano p/ Melhorar Pontos Fracos
                </button>
              </div>

              <div className="grid sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#F59E0B]">
                  <p className="text-[11px] text-slate-500 font-black uppercase">XP Acumulado</p>
                  <p className="text-3xl font-black text-amber-500 mt-1">{usuario.xp || 0}</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">{patente}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#84cc16]">
                  <p className="text-[11px] text-slate-500 font-black uppercase">Taxa de Acerto</p>
                  <p className="text-3xl font-black text-lime-600 mt-1">{taxaGeral}%</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">{totalAcertos} de {totalRespondidas}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#ef4444]">
                  <p className="text-[11px] text-slate-500 font-black uppercase">Caderno de Erros</p>
                  <p className="text-3xl font-black text-red-500 mt-1">{questoesParaRevisar.length}</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">Questões p/ revisar</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a]">
                  <p className="text-[11px] text-slate-500 font-black uppercase">Redações</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{minhasRedacoes.length}</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">Textos enviados</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 space-y-4">
                <h2 className="font-black text-lg">Aproveitamento por Disciplina</h2>
                <div className="space-y-4">
                  {estatisticasPorMateria.map((st) => (
                    <div key={st.nome} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-black">
                        <span>{st.nome}</span>
                        <span className="flex items-center gap-2">
                          {st.taxa !== null && st.taxa < 60 && (
                            <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Atenção</span>
                          )}
                          <span>{st.taxa !== null ? `${st.taxa}% (${st.acertos}/${st.total})` : 'Sem questões respondidas'}</span>
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full transition-all ${st.taxa !== null && st.taxa < 60 ? 'bg-red-500' : 'bg-lime-500'}`}
                          style={{ width: `${st.taxa || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
