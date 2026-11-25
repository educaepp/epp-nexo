'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Home, Layers, PenTool, BarChart2, BookOpen, Clock, 
  ChevronDown, ChevronRight, Flame, CheckCircle2, 
  XCircle, FileText, ArrowRight, LogOut, Menu, X,
  Printer, CheckSquare, Square, Sparkles, Trophy, Bot, 
  HelpCircle, Calendar, Target, RotateCcw, Play, Pause, 
  Bell, MessageSquare, Camera, Volume2, Upload, Send, Zap
} from 'lucide-react';

export default function PortalAluno() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [secaoAtiva, setSecaoAtiva] = useState<'inicio' | 'plano' | 'conteudo' | 'erros' | 'duvidas' | 'redacao' | 'simulados' | 'biblioteca' | 'ranking' | 'desempenho'>('inicio');
  const [materiaSelecionada, setMateriaSelecionada] = useState<string>('Matemática');
  const [filtroNivel, setFiltroNivel] = useState<string>('Todos');
  const [menuConteudosAberto, setMenuConteudosAberto] = useState(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  const [atividades, setAtividades] = useState<any[]>([]);
  const [simulados, setSimulados] = useState<any[]>([]);
  const [temaAtivo, setTemaAtivo] = useState<any>(null);
  const [minhasRedacoes, setMinhasRedacoes] = useState<any[]>([]);
  const [livros, setLivros] = useState<any[]>([]);
  const [rankingAlunos, setRankingAlunos] = useState<any[]>([]);
  const [historicoRespostas, setHistoricoRespostas] = useState<any[]>([]);

  // Notificações
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [painelNotifAberto, setPainelNotifAberto] = useState(false);

  // Portal de Dúvidas
  const [duvidas, setDuvidas] = useState<any[]>([]);
  const [novaDuvidaDisc, setNovaDuvidaDisc] = useState('Matemática');
  const [novaDuvidaTexto, setNovaDuvidaTexto] = useState('');
  const [enviandoDuvida, setEnviandoDuvida] = useState(false);

  // Relógio Pomodoro Completo
  const [pomodoroModalAberto, setPomodoroModalAberto] = useState(false);
  const [pomodoroModo, setPomodoroModo] = useState<'foco' | 'pausa'>('foco');
  const [pomodoroSegundos, setPomodoroSegundos] = useState(25 * 60);
  const [pomodoroRodando, setPomodoroRodando] = useState(false);
  const [ciclosConcluidos, setCiclosConcluidos] = useState(0);

  // Plano de Estudos
  const [demandaObjetivo, setDemandaObjetivo] = useState('');
  const [horasEstudo, setHorasEstudo] = useState('1 hora');
  const [gerandoPlano, setGerandoPlano] = useState(false);
  const [planoAtivo, setPlanoAtivo] = useState<any>(null);
  const [diasConcluidos, setDiasConcluidos] = useState<number[]>([]);

  // Questões & XP
  const [respostasAluno, setRespostasAluno] = useState<Record<string, string>>({});
  const [explicacoesTutor, setExplicacoesTutor] = useState<Record<string, string>>({});
  const [carregandoTutor, setCarregandoTutor] = useState<string | null>(null);
  const [selecionadasPdf, setSelecionadasPdf] = useState<string[]>([]);

  // Simulado
  const [simuladoEmAndamento, setSimuladoEmAndamento] = useState<any>(null);
  const [tempoRestante, setTempoRestante] = useState<number>(0);
  const [respostasSimulado, setRespostasSimulado] = useState<Record<string, string>>({});
  const [resultadoSimulado, setResultadoSimulado] = useState<{ acertos: number; total: number } | null>(null);

  // Biblioteca
  const [pdfAberto, setPdfAberto] = useState<any>(null);

  // Redação por Foto + Correção Humana (3 dias, Áudio + Marcação Colorida) ou IA Rápida
  const [enviandoNovaRedacao, setEnviandoNovaRedacao] = useState(false);
  const [fotoRedacaoFile, setFotoRedacaoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [modalidadeCorrecao, setModalidadeCorrecao] = useState<'humana' | 'ia'>('humana');
  const [processandoRedacao, setProcessandoRedacao] = useState(false);
  const [redacaoInspecionada, setRedacaoInspecionada] = useState<any>(null);
  const [marcacaoAtivaIdx, setMarcacaoAtivaIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const materias = [
    { nome: 'Linguagens', subtitulo: 'Português & Interpretação', cor: 'from-amber-500 to-orange-700' },
    { nome: 'Matemática', subtitulo: 'Álgebra, Geometria & Lógica', cor: 'from-cyan-600 to-blue-900' },
    { nome: 'Ciências', subtitulo: 'Natureza & Experimentos', cor: 'from-emerald-600 to-teal-950' },
    { nome: 'Humanas', subtitulo: 'História & Geografia', cor: 'from-violet-600 to-slate-900' },
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
          if (pomodoroModo === 'foco') {
            setCiclosConcluidos(c => c + 1);
            ganharXP(15);
            setPomodoroModo('pausa');
            return 5 * 60;
          } else {
            setPomodoroModo('foco');
            return 25 * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pomodoroRodando, pomodoroModo]);

  const carregarDados = async (user: any) => {
    const [ativs, sims, tema, reds, libs, rank, hist, planos, notifs, duvs] = await Promise.all([
      supabase.from('atividades').select('*').eq('serie', user.serie),
      supabase.from('simulados').select('*').eq('serie_alvo', user.serie).eq('ativo', true),
      supabase.from('temas_redacao').select('*').eq('ativo', true).single(),
      supabase.from('redacoes_enviadas').select('*').eq('aluno_email', user.email).order('enviado_em', { ascending: false }),
      supabase.from('biblioteca').select('*'),
      supabase.from('usuarios_autorizados').select('nome, serie, xp').eq('perfil', 'aluno').order('xp', { ascending: false }).limit(10),
      supabase.from('respostas_alunos').select('*').eq('aluno_email', user.email).order('respondido_em', { ascending: false }),
      supabase.from('planos_estudo').select('*').eq('aluno_email', user.email).order('criado_em', { ascending: false }).limit(1),
      supabase.from('notificacoes').select('*').eq('destinatario_email', user.email).order('criado_em', { ascending: false }).limit(15),
      supabase.from('duvidas_alunos').select('*').eq('aluno_email', user.email).order('criado_em', { ascending: false })
    ]);
    if (ativs.data) setAtividades(ativs.data);
    if (sims.data) setSimulados(sims.data);
    if (tema.data) setTemaAtivo(tema.data);
    if (reds.data) setMinhasRedacoes(reds.data);
    if (libs.data) setLivros(libs.data.filter(l => l.serie === '6º ao 9º Ano' || l.serie === user.serie));
    if (rank.data) setRankingAlunos(rank.data);
    if (hist.data) setHistoricoRespostas(hist.data);
    if (planos.data && planos.data.length > 0) setPlanoAtivo(planos.data[0].plano_json);
    if (notifs.data) setNotificacoes(notifs.data);
    if (duvs.data) setDuvidas(duvs.data);
  };

  const ganharXP = async (pontos: number) => {
    if (!usuario) return;
    const novoXp = (usuario.xp || 0) + pontos;
    const atualizado = { ...usuario, xp: novoXp };
    setUsuario(atualizado);
    localStorage.setItem('epp_usuario', JSON.stringify(atualizado));
    await supabase.from('usuarios_autorizados').update({ xp: novoXp }).eq('email', usuario.email);
  };

  const marcarNotificacoesLidas = async () => {
    setPainelNotifAberto(!painelNotifAberto);
    const naoLidas = notificacoes.filter(n => !n.lida);
    if (naoLidas.length > 0) {
      await supabase.from('notificacoes').update({ lida: true }).eq('destinatario_email', usuario.email);
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    }
  };

  const enviarDuvida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaDuvidaTexto.trim()) return;
    setEnviandoDuvida(true);
    await supabase.from('duvidas_alunos').insert([{
      aluno_email: usuario.email,
      aluno_nome: usuario.nome,
      serie: usuario.serie,
      disciplina: novaDuvidaDisc,
      pergunta: novaDuvidaTexto.trim()
    }]);
    await supabase.from('notificacoes').insert([{
      destinatario_email: 'educaepp@gmail.com',
      titulo: `Nova Dúvida (${novaDuvidaDisc})`,
      mensagem: `${usuario.nome} (${usuario.serie}) enviou uma dúvida no portal.`,
      tipo: 'duvida'
    }]);
    setNovaDuvidaTexto('');
    setEnviandoDuvida(false);
    carregarDados(usuario);
  };

  const responderQuestao = async (questao: any, letra: string, modoSuperacao = false) => {
    if (respostasAluno[questao.id] && !modoSuperacao) return;
    setRespostasAluno(prev => ({ ...prev, [questao.id]: letra }));
    const acertou = letra === questao.correta;
    const xpGanho = questao.xp_valor || (questao.nivel === 'Difícil' ? 40 : questao.nivel === 'Fácil' ? 15 : 25);

    await supabase.from('respostas_alunos').insert([{
      aluno_email: usuario.email,
      questao_id: questao.id,
      disciplina: questao.disciplina,
      assunto: questao.titulo,
      acertou
    }]);

    if (acertou) {
      await ganharXP(modoSuperacao ? xpGanho + 10 : xpGanho);
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

  const selecionarFotoRedacao = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoRedacaoFile(file);
    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const enviarRedacaoPorFoto = async () => {
    if (!fotoRedacaoFile || !fotoPreview) return alert('Selecione ou tire uma foto nítida da sua redação.');
    setProcessandoRedacao(true);

    try {
      const nomeArquivo = `${usuario.email.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from('redacoes-fotos')
        .upload(nomeArquivo, fotoRedacaoFile, { contentType: fotoRedacaoFile.type, upsert: true });

      let urlPublica = fotoPreview;
      if (!uploadErr) {
        const { data: pubData } = supabase.storage.from('redacoes-fotos').getPublicUrl(nomeArquivo);
        if (pubData?.publicUrl) urlPublica = pubData.publicUrl;
      }

      const prazo3Dias = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

      if (modalidadeCorrecao === 'ia') {
        const res = await fetch('/api/corrigir-redacao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tema: temaAtivo?.titulo || 'Redação Semanal EPP Nexo',
            fotoBase64: fotoPreview,
            serie: usuario.serie
          })
        });
        const data = await res.json();
        const av = data.avaliacao || { nota_total: 800, c1: 160, c2: 160, c3: 160, c4: 160, c5: 160, comentario_geral: 'Redação analisada pela IA.', marcacoes: [] };

        await supabase.from('redacoes_enviadas').insert([{
          aluno_email: usuario.email,
          aluno_nome: usuario.nome,
          serie: usuario.serie,
          tema_id: temaAtivo?.id || null,
          texto_redacao: '[Redação enviada por foto - Correção Expressa IA]',
          foto_url: urlPublica,
          tipo_correcao: 'ia',
          nota: av.nota_total,
          comentario_professor: `[Correção Rápida IA] C1:${av.c1} | C2:${av.c2} | C3:${av.c3} | C4:${av.c4} | C5:${av.c5}\n\n${av.comentario_geral}`,
          marcacoes_json: av.marcacoes || [],
          corrigida: true
        }]);

        await ganharXP(50);
      } else {
        await supabase.from('redacoes_enviadas').insert([{
          aluno_email: usuario.email,
          aluno_nome: usuario.nome,
          serie: usuario.serie,
          tema_id: temaAtivo?.id || null,
          texto_redacao: '[Redação manuscrita enviada por foto - Aguardando Áudio e Marcações]',
          foto_url: urlPublica,
          tipo_correcao: 'humana',
          prazo_entrega: prazo3Dias,
          corrigida: false
        }]);

        await supabase.from('notificacoes').insert([{
          destinatario_email: 'educaepp@gmail.com',
          titulo: 'Nova Redação por Foto (Prazo: 3 dias)',
          mensagem: `${usuario.nome} (${usuario.serie}) enviou foto da redação para correção com áudio e marcações.`,
          tipo: 'redacao'
        }]);
      }

      setFotoRedacaoFile(null);
      setFotoPreview(null);
      setEnviandoNovaRedacao(false);
      carregarDados(usuario);
    } finally {
      setProcessandoRedacao(false);
    }
  };

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
    const fracas = estatisticasPorMateria.filter(e => e.taxa !== null && e.taxa < 70).map(e => `${e.nome} (${e.taxa}%)`).join(', ');
    const assuntosErrados = Array.from(new Set(historicoRespostas.filter(r => !r.acertou && r.assunto).map(r => r.assunto))).slice(0, 6).join(', ');
    const redacoesComNota = minhasRedacoes.filter(r => r.nota != null);
    const mediaRed = redacoesComNota.length > 0 ? Math.round(redacoesComNota.reduce((acc, r) => acc + Number(r.nota), 0) / redacoesComNota.length) : null;

    try {
      const res = await fetch('/api/plano-estudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: usuario.nome, serie: usuario.serie, objetivo: demandaObjetivo.trim(),
          horasPorDia: horasEstudo, materiasFracas: fracas, assuntosErrados, mediaRedacao: mediaRed
        })
      });
      const data = await res.json();
      if (res.ok && data.plano) {
        setPlanoAtivo(data.plano);
        await supabase.from('planos_estudo').insert([{ aluno_email: usuario.email, objetivo: demandaObjetivo.trim(), plano_json: data.plano }]);
      }
    } finally {
      setGerandoPlano(false);
    }
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
          aluno_email: usuario.email, questao_id: q.id, disciplina: q.disciplina, assunto: q.titulo, acertou
        }]);
      }
    }
    if (acertos > 0) await ganharXP(acertos * 20);
    setResultadoSimulado({ acertos, total: listaFinal.length });
    setSimuladoEmAndamento(null);
    carregarDados(usuario);
  };

  const formatarLinkEmbed = (url: string) => {
    if (url.includes('drive.google.com') && url.includes('/view')) return url.replace('/view', '/preview');
    return url;
  };

  const sair = () => {
    localStorage.removeItem('epp_usuario');
    router.push('/login');
  };

  if (!usuario) return null;

  const questoesDaMateria = atividades
    .filter(a => a.disciplina === materiaSelecionada && !a.simulado_id)
    .filter(a => filtroNivel === 'Todos' || (a.nivel || 'Médio') === filtroNivel);

  const idsErrados = new Set(historicoRespostas.filter(r => !r.acertou).map(r => r.questao_id));
  const questoesParaRevisar = atividades.filter(a => idsErrados.has(a.id));
  const patente = (usuario.xp || 0) >= 600 ? 'Lenda EPP' : (usuario.xp || 0) >= 250 ? 'Mestre Nexo' : (usuario.xp || 0) >= 80 ? 'Explorador' : 'Iniciante';
  const naoLidasCount = notificacoes.filter(n => !n.lida).length;
  const totalRespondidas = historicoRespostas.length;
  const totalAcertos = historicoRespostas.filter(r => r.acertou).length;
  const taxaGeral = totalRespondidas > 0 ? Math.round((totalAcertos / totalRespondidas) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col">
      {/* MODAL RELÓGIO POMODORO COMPLETO */}
      {pomodoroModalAberto && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-pop-in">
          <div className="bg-white w-full max-w-md rounded-3xl border-2 border-slate-900 shadow-[8px_8px_0px_#F59E0B] p-7 space-y-6 text-center">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase bg-amber-400 px-3 py-1 rounded-full border border-slate-900">
                Relógio Pomodoro • +15 XP/ciclo
              </span>
              <button onClick={() => setPomodoroModalAberto(false)} className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => { setPomodoroRodando(false); setPomodoroModo('foco'); setPomodoroSegundos(25 * 60); }}
                className={`px-4 py-1.5 rounded-full text-xs font-black cursor-pointer ${pomodoroModo === 'foco' ? 'bg-slate-900 text-amber-400' : 'bg-slate-100 text-slate-600'}`}
              >
                Foco (25 min)
              </button>
              <button
                onClick={() => { setPomodoroRodando(false); setPomodoroModo('pausa'); setPomodoroSegundos(5 * 60); }}
                className={`px-4 py-1.5 rounded-full text-xs font-black cursor-pointer ${pomodoroModo === 'pausa' ? 'bg-lime-400 text-slate-950' : 'bg-slate-100 text-slate-600'}`}
              >
                Descanso (5 min)
              </button>
            </div>

            <div className="py-6 bg-slate-950 text-white rounded-3xl border-2 border-slate-900">
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-widest">
                {pomodoroModo === 'foco' ? 'Tempo de Concentração' : 'Pausa Merecida'}
              </p>
              <p className="text-6xl font-mono font-black text-amber-400 mt-2">
                {String(Math.floor(pomodoroSegundos / 60)).padStart(2, '0')}:{String(pomodoroSegundos % 60).padStart(2, '0')}
              </p>
              <p className="text-xs text-slate-400 mt-2">Ciclos concluídos hoje: <strong className="text-lime-400">{ciclosConcluidos}</strong></p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setPomodoroRodando(!pomodoroRodando)}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] flex items-center justify-center gap-2 cursor-pointer"
              >
                {pomodoroRodando ? <><Pause className="w-4 h-4" /> Pausar</> : <><Play className="w-4 h-4" /> Iniciar</>}
              </button>
              <button
                onClick={() => { setPomodoroRodando(false); setPomodoroSegundos(pomodoroModo === 'foco' ? 25 * 60 : 5 * 60); }}
                className="px-5 bg-slate-100 hover:bg-slate-200 font-black rounded-2xl border-2 border-slate-300 text-xs cursor-pointer"
              >
                Zerar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE INSPEÇÃO DA REDAÇÃO CORRIGIDA (FOTO COM MARCAÇÕES COLORIDAS + ÁUDIO) */}
      {redacaoInspecionada && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-pop-in">
          <div className="bg-white w-full max-w-5xl rounded-3xl border-2 border-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-slate-950 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase bg-lime-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                  Devolutiva da Redação • Nota: {redacaoInspecionada.nota ?? 'Em análise'} / 1000
                </span>
                <h3 className="font-black text-base mt-1">Folha Marcada & Feedback em Áudio</h3>
              </div>
              <button onClick={() => { setRedacaoInspecionada(null); setMarcacaoAtivaIdx(null); }} className="p-2 bg-white/10 hover:bg-red-600 rounded-full cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 p-6 overflow-y-auto">
              {/* IMAGEM DA REDAÇÃO COM PINOS DE MARCAÇÃO COLORIDA */}
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-500 uppercase">Clique nos pontos coloridos na folha para ler as anotações:</p>
                <div className="relative rounded-2xl border-2 border-slate-900 overflow-hidden bg-slate-100">
                  <img src={redacaoInspecionada.foto_url} alt="Redação do Aluno" className="w-full h-auto object-contain" />
                  {(redacaoInspecionada.marcacoes_json || []).map((m: any, idx: number) => {
                    const corClasse = m.cor === 'verde' ? 'bg-lime-400 text-slate-950' : m.cor === 'vermelho' ? 'bg-red-500 text-white' : 'bg-amber-400 text-slate-950';
                    return (
                      <button
                        key={idx}
                        onClick={() => setMarcacaoAtivaIdx(idx)}
                        style={{ left: `${m.x}%`, top: `${m.y}%` }}
                        className={`-translate-x-1/2 -translate-y-1/2 absolute w-8 h-8 rounded-full font-black text-xs border-2 border-slate-950 shadow-lg flex items-center justify-center animate-bounce cursor-pointer ${corClasse}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ÁUDIO DO PROFESSOR + LISTA DE MARCAÇÕES COLORIDAS */}
              <div className="space-y-4">
                {redacaoInspecionada.audio_url && (
                  <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl space-y-2">
                    <p className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4" /> Comentário em Áudio da Correção:
                    </p>
                    <audio controls src={redacaoInspecionada.audio_url} className="w-full h-10" />
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-black uppercase text-slate-500">Marcações Coloridas na Folha ({(redacaoInspecionada.marcacoes_json || []).length})</p>
                  {(redacaoInspecionada.marcacoes_json || []).length === 0 ? (
                    <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl">Nenhuma marcação pontual adicionada nesta folha.</p>
                  ) : (
                    (redacaoInspecionada.marcacoes_json || []).map((m: any, idx: number) => {
                      const borda = m.cor === 'verde' ? 'border-lime-500 bg-lime-50' : m.cor === 'vermelho' ? 'border-red-400 bg-red-50' : 'border-amber-400 bg-amber-50';
                      return (
                        <div
                          key={idx}
                          onClick={() => setMarcacaoAtivaIdx(idx)}
                          className={`p-3.5 rounded-2xl border-2 text-xs cursor-pointer transition-all ${borda} ${marcacaoAtivaIdx === idx ? 'ring-2 ring-slate-900' : ''}`}
                        >
                          <span className="font-black uppercase mr-2">#{idx + 1} ({m.cor}):</span>
                          <span className="text-slate-800 font-medium">{m.texto}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                {redacaoInspecionada.comentario_professor && (
                  <div className="bg-slate-900 text-white p-4 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed">
                    <p className="font-black text-amber-400 mb-1">Parecer Geral:</p>
                    {redacaoInspecionada.comentario_professor}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LEITOR PDF */}
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

      {/* HEADER MODERNO COM NOTIFICAÇÕES & POMODORO */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuMobileAberto(!menuMobileAberto)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-amber-500 text-white font-black text-lg px-3 py-1 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]">
              EPP <span className="text-slate-950">NEXO</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {/* BOTÃO RELÓGIO POMODORO */}
          <button
            onClick={() => setPomodoroModalAberto(true)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 text-xs font-black cursor-pointer transition-all ${
              pomodoroRodando ? 'bg-amber-400 border-slate-900 text-slate-950 animate-pulse' : 'bg-slate-100 border-slate-300 text-slate-800 hover:border-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{String(Math.floor(pomodoroSegundos / 60)).padStart(2, '0')}:{String(pomodoroSegundos % 60).padStart(2, '0')}</span>
          </button>

          {/* SININHO DE NOTIFICAÇÕES */}
          <div className="relative">
            <button
              onClick={marcarNotificacoesLidas}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 relative cursor-pointer"
            >
              <Bell className="w-4 h-4 text-slate-800" />
              {naoLidasCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {naoLidasCount}
                </span>
              )}
            </button>

            {painelNotifAberto && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0f172a] p-4 z-50 space-y-3 animate-pop-in">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-black text-xs uppercase">Notificações ({notificacoes.length})</span>
                  <button onClick={() => setPainelNotifAberto(false)} className="text-xs text-slate-400 hover:text-slate-900">Fechar</button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notificacoes.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Nenhuma notificação ainda.</p>
                  ) : (
                    notificacoes.map((n) => (
                      <div key={n.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                        <p className="font-black text-slate-900">{n.titulo}</p>
                        <p className="text-slate-600">{n.mensagem}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-black">
            <Flame className="w-3.5 h-3.5 fill-amber-400" /> {usuario.xp || 0} XP • {patente}
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
        {/* MENU LATERAL */}
        <aside className={`${menuMobileAberto ? 'fixed inset-y-0 left-0 z-40 block pt-16' : 'hidden'} lg:block w-64 bg-white border-r border-slate-200 shrink-0`}>
          <div className="p-4 space-y-1">
            <p className="px-3 text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Portal do Estudante</p>

            {[
              { id: 'inicio', label: 'Visão Geral', icon: Home },
              { id: 'plano', label: 'Plano IA Sob Demanda', icon: Calendar, badge: 'IA' },
              { id: 'conteudo', label: 'Banco de Questões', icon: Layers },
              { id: 'erros', label: 'Caderno de Erros', icon: RotateCcw, badge: questoesParaRevisar.length || null },
              { id: 'redacao', label: 'Redação por Foto', icon: Camera, badge: '3 DIAS / IA' },
              { id: 'duvidas', label: 'Tirar Dúvidas', icon: MessageSquare },
              { id: 'simulados', label: 'Simulados', icon: Clock },
              { id: 'biblioteca', label: 'Biblioteca PDF', icon: BookOpen },
              { id: 'ranking', label: 'Ranking EPP', icon: Trophy },
              { id: 'desempenho', label: 'Raio-X & Notas', icon: BarChart2 },
            ].map((item: any) => {
              const Icon = item.icon;
              const ativo = secaoAtiva === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setSecaoAtiva(item.id); setMenuMobileAberto(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    ativo ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5"><Icon className="w-4 h-4" /> {item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] bg-slate-900 text-amber-400 px-2 py-0.5 rounded-full font-black">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <main className="flex-1 p-6 lg:p-10">
          {/* VISÃO GERAL */}
          {secaoAtiva === 'inicio' && (
            <div className="space-y-8 max-w-5xl animate-fade-up">
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white border-2 border-slate-900 shadow-[6px_6px_0px_#F59E0B] flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <span className="inline-flex items-center gap-1.5 bg-lime-400 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" /> {usuario.serie} • ECOSSISTEMA EPP NEXO
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-black">Bora evoluir hoje, {usuario.nome}?</h1>
                  <p className="text-sm text-slate-300">
                    Acerte questões para subir no ranking de XP, envie fotos das suas redações para receber áudio e marcações coloridas, ou use o Tutor IA a qualquer hora.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button onClick={() => setSecaoAtiva('conteudo')} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3.5 rounded-2xl border-2 border-slate-900 flex items-center gap-2 cursor-pointer">
                      Resolver Questões (+XP) <ArrowRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => setSecaoAtiva('redacao')} className="bg-white/10 hover:bg-white/20 text-white font-black text-xs px-5 py-3.5 rounded-2xl border border-white/30 flex items-center gap-2 cursor-pointer">
                      <Camera className="w-4 h-4 text-amber-400" /> Enviar Foto da Redação
                    </button>
                  </div>
                </div>

                <div className="bg-white/10 border border-white/20 p-5 rounded-3xl w-full lg:w-72 space-y-3 backdrop-blur-md">
                  <p className="text-xs font-black uppercase text-amber-400">Resumo Conectado</p>
                  <div className="flex justify-between text-xs"><span>Taxa de Acerto:</span><strong className="text-lime-400">{taxaGeral}%</strong></div>
                  <div className="flex justify-between text-xs"><span>XP Total:</span><strong className="text-amber-300">{usuario.xp || 0} XP</strong></div>
                  <div className="flex justify-between text-xs"><span>Dúvidas Respondidas:</span><strong className="text-cyan-300">{duvidas.filter(d => d.respondida).length}</strong></div>
                  <button onClick={() => setPomodoroModalAberto(true)} className="w-full bg-amber-400 text-slate-950 font-black text-xs py-2.5 rounded-xl mt-1 cursor-pointer">
                    Abrir Relógio Pomodoro
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {materias.map((mat) => {
                  const stat = estatisticasPorMateria.find(s => s.nome === mat.nome);
                  return (
                    <button key={mat.nome} onClick={() => { setMateriaSelecionada(mat.nome); setSecaoAtiva('conteudo'); }} className={`h-40 rounded-3xl bg-gradient-to-br ${mat.cor} p-6 text-left text-white border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:-translate-y-1 transition-all flex flex-col justify-between cursor-pointer`}>
                      <span className="text-[10px] font-black bg-black/30 px-2.5 py-1 rounded-full w-fit">
                        {stat?.taxa !== null ? `${stat?.taxa}% acerto` : 'Explorar'}
                      </span>
                      <div>
                        <span className="text-[11px] text-white/80">{mat.subtitulo}</span>
                        <h4 className="text-xl font-black uppercase mt-0.5">{mat.nome}</h4>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* BANCO DE QUESTÕES COM XP POR DIFICULDADE */}
          {secaoAtiva === 'conteudo' && (
            <div className="space-y-6 max-w-4xl animate-fade-up">
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <h1 className="text-2xl font-black">Banco de Questões • {materiaSelecionada}</h1>
                    <p className="text-xs text-slate-500">Cada questão acertada soma XP direto no seu perfil (Fácil: +15 XP | Médio: +25 XP | Difícil: +40 XP)</p>
                  </div>
                </div>

                {/* SELETOR DE DISCIPLINA E NÍVEL */}
                <div className="flex flex-wrap justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {materias.map(m => (
                      <button
                        key={m.nome}
                        onClick={() => setMateriaSelecionada(m.nome)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer ${materiaSelecionada === m.nome ? 'bg-slate-900 text-amber-400' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {m.nome}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    {['Todos', 'Fácil', 'Médio', 'Difícil'].map(niv => (
                      <button
                        key={niv}
                        onClick={() => setFiltroNivel(niv)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${filtroNivel === niv ? 'bg-amber-400 text-slate-950 border border-slate-900' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {niv}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {questoesDaMateria.length === 0 ? (
                <p className="text-sm text-slate-500 bg-white p-8 rounded-3xl border-2 border-slate-200">Nenhuma questão encontrada com esse filtro.</p>
              ) : (
                questoesDaMateria.map((q, index) => {
                  const escolhida = respostasAluno[q.id];
                  const acertou = escolhida === q.correta;
                  const xpQuestao = q.xp_valor || (q.nivel === 'Difícil' ? 40 : q.nivel === 'Fácil' ? 15 : 25);
                  return (
                    <div key={q.id} className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="text-xs font-black text-amber-600 uppercase">Questão 0{index + 1} • {q.titulo}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black bg-slate-100 px-2.5 py-1 rounded-full">{q.nivel || 'Médio'} • +{xpQuestao} XP</span>
                          {escolhida && (
                            <span className={`text-xs font-black px-3 py-1 rounded-full ${acertou ? 'bg-lime-400 text-slate-950' : 'bg-red-100 text-red-700'}`}>
                              {acertou ? `Acertou (+${xpQuestao} XP)` : `Gabarito: ${q.correta}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-800 leading-relaxed">{q.enunciado}</p>
                      <div className="space-y-2">
                        {['A', 'B', 'C', 'D'].map((letra) => {
                          let estilo = 'border-slate-200 hover:border-slate-900 hover:bg-slate-50';
                          if (escolhida) {
                            if (letra === q.correta) estilo = 'border-lime-600 bg-lime-100 font-bold text-lime-950';
                            else if (letra === escolhida) estilo = 'border-red-400 bg-red-50 text-red-900';
                          }
                          return (
                            <button
                              key={letra}
                              disabled={!!escolhida}
                              onClick={() => responderQuestao(q, letra)}
                              className={`w-full text-left p-3.5 rounded-2xl border-2 text-xs transition flex items-center gap-3 cursor-pointer ${estilo}`}
                            >
                              <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-black flex items-center justify-center shrink-0">{letra}</span>
                              <span>{q[`alternativa_${letra.toLowerCase()}`]}</span>
                            </button>
                          );
                        })}
                      </div>
                      {escolhida && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                          <p className="font-black">Resolução: <span className="font-normal text-slate-600">{q.resolucao_comentada}</span></p>
                          {!acertou && !explicacoesTutor[q.id] && (
                            <button onClick={() => pedirAjudaTutorIA(q)} disabled={carregandoTutor === q.id} className="bg-slate-900 text-amber-400 font-black px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer">
                              <HelpCircle className="w-3.5 h-3.5" /> {carregandoTutor === q.id ? 'Explicando...' : 'Pedir explicação ao Tutor IA'}
                            </button>
                          )}
                          {explicacoesTutor[q.id] && <p className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-slate-800">{explicacoesTutor[q.id]}</p>}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* OFICINA DE REDAÇÃO POR FOTO (CORREÇÃO EM 3 DIAS ÁUDIO+MARCAÇÃO OU IA RÁPIDA) */}
          {secaoAtiva === 'redacao' && (
            <div className="space-y-6 max-w-4xl animate-fade-up">
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-4">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full border border-slate-900 uppercase">
                      Envio por Foto da Folha Manuscrita
                    </span>
                    <h1 className="text-2xl font-black mt-2">{temaAtivo ? temaAtivo.titulo : 'Oficina de Redação EPP Nexo'}</h1>
                    {temaAtivo?.textos_apoio && <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{temaAtivo.textos_apoio}</p>}
                  </div>
                  {!enviandoNovaRedacao && (
                    <button onClick={() => setEnviandoNovaRedacao(true)} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3.5 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] flex items-center gap-2 cursor-pointer">
                      <Camera className="w-4 h-4" /> Enviar Foto da Redação
                    </button>
                  )}
                </div>

                {enviandoNovaRedacao && (
                  <div className="pt-4 border-t border-slate-200 space-y-5 animate-pop-in">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-400 hover:border-slate-900 rounded-3xl p-8 text-center cursor-pointer bg-slate-50 hover:bg-amber-50/40 transition-all"
                    >
                      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={selecionarFotoRedacao} className="hidden" />
                      {fotoPreview ? (
                        <div className="space-y-3">
                          <img src={fotoPreview} alt="Prévia da redação" className="max-h-72 mx-auto rounded-2xl border-2 border-slate-900" />
                          <p className="text-xs font-black text-lime-700">Foto carregada! Clique para trocar a imagem se desejar.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-10 h-10 text-amber-500 mx-auto" />
                          <p className="font-black text-sm">Toque aqui para tirar foto ou anexar a imagem da redação</p>
                          <p className="text-xs text-slate-500">Certifique-se de que a folha esteja bem iluminada e legível</p>
                        </div>
                      )}
                    </div>

                    {/* ESCOLHA ENTRE CORREÇÃO HUMANA (3 DIAS: ÁUDIO + MARCAÇÕES) OU IA IMEDIATA */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setModalidadeCorrecao('humana')}
                        className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          modalidadeCorrecao === 'humana' ? 'border-slate-900 bg-amber-50 shadow-[4px_4px_0px_#0f172a]' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <span className="text-[10px] font-black bg-slate-900 text-amber-400 px-2.5 py-0.5 rounded-full">ENTREGA EM ATÉ 3 DIAS</span>
                        <h3 className="font-black text-sm mt-2">Correção Completa da Equipe EPP</h3>
                        <p className="text-xs text-slate-600 mt-1">Devolutiva personalizada com <strong>áudio explicativo</strong> do professor e <strong>marcações coloridas</strong> direto na sua foto.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalidadeCorrecao('ia')}
                        className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          modalidadeCorrecao === 'ia' ? 'border-slate-900 bg-lime-50 shadow-[4px_4px_0px_#84cc16]' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <span className="text-[10px] font-black bg-lime-400 text-slate-950 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit"><Zap className="w-3 h-3" /> ATENDIMENTO IMEDIATO</span>
                        <h3 className="font-black text-sm mt-2">Correção Expressa com IA (+50 XP)</h3>
                        <p className="text-xs text-slate-600 mt-1">Leitura automática da sua foto na hora com nota nas 5 competências e pontos destacados na folha.</p>
                      </button>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button onClick={() => { setEnviandoNovaRedacao(false); setFotoPreview(null); }} className="text-xs font-bold text-slate-500 px-4 py-2 cursor-pointer">Cancelar</button>
                      <button
                        onClick={enviarRedacaoPorFoto}
                        disabled={processandoRedacao || !fotoPreview}
                        className="bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs px-6 py-3.5 rounded-2xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {processandoRedacao ? 'Enviando e processando imagem...' : 'Confirmar Envio da Redação'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* HISTÓRICO DE REDAÇÕES POR FOTO */}
              <div className="space-y-3">
                <h2 className="font-black text-lg">Minhas Redações Enviadas ({minhasRedacoes.length})</h2>
                {minhasRedacoes.map((r) => (
                  <div key={r.id} className="bg-white p-5 rounded-3xl border-2 border-slate-200 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      {r.foto_url && (
                        <img src={r.foto_url} alt="Miniatura" className="w-16 h-16 rounded-2xl object-cover border border-slate-300" />
                      )}
                      <div>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${r.corrigida ? 'bg-lime-400 text-slate-950' : 'bg-amber-100 text-amber-900'}`}>
                          {r.corrigida ? `Corrigida • Nota: ${r.nota}/1000` : `Em correção (Prazo: até ${r.prazo_entrega ? new Date(r.prazo_entrega).toLocaleDateString('pt-BR') : '3 dias'})`}
                        </span>
                        <p className="font-black text-sm mt-1">
                          {r.tipo_correcao === 'ia' ? 'Correção Expressa IA' : 'Correção Equipe EPP (Áudio + Marcações)'}
                        </p>
                        <p className="text-xs text-slate-400">Enviada em {new Date(r.enviado_em).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    {r.foto_url && (
                      <button
                        onClick={() => setRedacaoInspecionada(r)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        {r.audio_url && <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                        Abrir Folha & Devolutiva
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PORTAL PARA TIRAR DÚVIDAS */}
          {secaoAtiva === 'duvidas' && (
            <div className="space-y-6 max-w-4xl animate-fade-up">
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-4">
                <h1 className="text-2xl font-black flex items-center gap-2"><MessageSquare className="w-6 h-6 text-amber-500" /> Central de Dúvidas EPP</h1>
                <p className="text-xs text-slate-500">Travou em algum assunto ou exercício? Envie sua dúvida diretamente para os professores do reforço.</p>

                <form onSubmit={enviarDuvida} className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <select value={novaDuvidaDisc} onChange={(e) => setNovaDuvidaDisc(e.target.value)} className="p-3 border-2 border-slate-300 rounded-2xl text-xs font-black bg-white">
                      {materias.map(m => <option key={m.nome}>{m.nome}</option>)}
                    </select>
                    <input
                      type="text"
                      required
                      value={novaDuvidaTexto}
                      onChange={(e) => setNovaDuvidaTexto(e.target.value)}
                      placeholder="Escreva sua dúvida com detalhes..."
                      className="flex-1 p-3 border-2 border-slate-300 focus:border-slate-900 rounded-2xl text-xs outline-none"
                    />
                    <button type="submit" disabled={enviandoDuvida} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl border-2 border-slate-900 flex items-center gap-1.5 cursor-pointer">
                      <Send className="w-3.5 h-3.5" /> Enviar Dúvida
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-3">
                {duvidas.map((d) => (
                  <div key={d.id} className="bg-white p-5 rounded-3xl border-2 border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-amber-600 uppercase">{d.disciplina} • {new Date(d.criado_em).toLocaleDateString('pt-BR')}</span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${d.respondida ? 'bg-lime-400 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>
                        {d.respondida ? 'Respondida pelo Professor' : 'Aguardando resposta'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">Você perguntou: "{d.pergunta}"</p>
                    {d.resposta_professor && (
                      <div className="bg-lime-50 border-2 border-lime-500 p-4 rounded-2xl text-xs text-slate-800">
                        <p className="font-black text-lime-900 mb-1">Resposta da Equipe EPP:</p>
                        {d.resposta_professor}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLANO IA, CADERNO DE ERROS, SIMULADOS, BIBLIOTECA, RANKING E DESEMPENHO */}
          {secaoAtiva === 'plano' && (
            <div className="space-y-6 max-w-4xl animate-fade-up">
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#F59E0B] space-y-4">
                <h1 className="text-2xl font-black">Plano de Estudos IA Sob Demanda</h1>
                <div className="grid sm:grid-cols-3 gap-3">
                  <input type="text" value={demandaObjetivo} onChange={(e) => setDemandaObjetivo(e.target.value)} placeholder="Qual sua meta ou prova esta semana?" className="sm:col-span-2 p-3.5 border-2 border-slate-300 rounded-2xl text-xs" />
                  <select value={horasEstudo} onChange={(e) => setHorasEstudo(e.target.value)} className="p-3.5 border-2 border-slate-300 rounded-2xl text-xs font-bold bg-white">
                    <option>30 minutos</option><option>1 hora</option><option>2 horas</option>
                  </select>
                </div>
                <button onClick={gerarPlanoEstudosIA} disabled={gerandoPlano} className="bg-slate-950 text-amber-400 font-black text-xs px-6 py-3.5 rounded-2xl cursor-pointer">
                  {gerandoPlano ? 'Montando plano...' : 'Gerar Plano Semanal Conectado'}
                </button>
              </div>
              {planoAtivo && (
                <div className="grid md:grid-cols-2 gap-4">
                  {planoAtivo.dias?.map((d: any, idx: number) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border-2 border-slate-200 space-y-2">
                      <span className="text-xs font-black bg-amber-400 px-3 py-1 rounded-full">{d.dia} • {d.duracao}</span>
                      <h3 className="font-black text-base">{d.foco}</h3>
                      <p className="text-xs text-slate-600">{d.atividade}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {secaoAtiva === 'erros' && (
            <div className="space-y-4 max-w-4xl animate-fade-up">
              <h1 className="text-2xl font-black">Caderno de Erros ({questoesParaRevisar.length})</h1>
              {questoesParaRevisar.map((q) => (
                <div key={q.id} className="bg-white p-5 rounded-3xl border-2 border-red-200 space-y-3">
                  <p className="text-xs font-black text-red-600">{q.disciplina} • {q.titulo}</p>
                  <p className="text-sm font-bold">{q.enunciado}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map(l => (
                      <button key={l} onClick={() => responderQuestao(q, l, true)} className="p-3 border rounded-xl text-left text-xs font-bold hover:bg-slate-50 cursor-pointer">
                        {l}) {q[`alternativa_${l.toLowerCase()}`]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {secaoAtiva === 'simulados' && (
            <div className="space-y-4 max-w-4xl animate-fade-up">
              <h1 className="text-2xl font-black">Simulados Cronometrados</h1>
              {resultadoSimulado && <div className="bg-lime-400 p-4 rounded-2xl font-black text-sm">Você acertou {resultadoSimulado.acertos} de {resultadoSimulado.total}!</div>}
              {simuladoEmAndamento ? (
                <div className="space-y-4">
                  <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center">
                    <span className="font-black">{simuladoEmAndamento.titulo}</span>
                    <button onClick={finalizarSimulado} className="bg-lime-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl cursor-pointer">Finalizar</button>
                  </div>
                  {atividades.map((q, i) => (
                    <div key={q.id} className="bg-white p-5 rounded-2xl border space-y-2">
                      <p className="text-xs font-black">0{i + 1}. {q.enunciado}</p>
                      {['A', 'B', 'C', 'D'].map(l => (
                        <button key={l} onClick={() => setRespostasSimulado(p => ({ ...p, [q.id]: l }))} className={`block w-full text-left p-2.5 rounded-xl border text-xs ${respostasSimulado[q.id] === l ? 'bg-amber-300 font-bold' : ''}`}>
                          {l}) {q[`alternativa_${l.toLowerCase()}`]}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                simulados.map(s => (
                  <div key={s.id} className="bg-white p-5 rounded-3xl border-2 border-slate-900 flex justify-between items-center">
                    <h3 className="font-black">{s.titulo} ({s.duracao_minutos} min)</h3>
                    <button onClick={() => iniciarSimulado(s)} className="bg-amber-500 font-black text-xs px-5 py-2.5 rounded-xl border-2 border-slate-900 cursor-pointer">Iniciar</button>
                  </div>
                ))
              )}
            </div>
          )}

          {secaoAtiva === 'biblioteca' && (
            <div className="grid sm:grid-cols-3 gap-5 max-w-4xl animate-fade-up">
              {livros.map(l => (
                <div key={l.id} className="bg-white p-5 rounded-3xl border-2 border-slate-900 flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black text-cyan-700 uppercase">{l.categoria}</span>
                    <h3 className="font-black text-base mt-1">{l.titulo}</h3>
                  </div>
                  <button onClick={() => setPdfAberto(l)} className="w-full bg-slate-900 text-white font-black text-xs py-2.5 rounded-xl cursor-pointer">Abrir Apostila</button>
                </div>
              ))}
            </div>
          )}

          {secaoAtiva === 'ranking' && (
            <div className="space-y-3 max-w-3xl animate-fade-up">
              <h1 className="text-2xl font-black">Ranking EPP Nexo</h1>
              {rankingAlunos.map((al, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border-2 border-slate-200 flex justify-between items-center">
                  <span className="font-black text-sm">{i + 1}º • {al.nome} ({al.serie})</span>
                  <span className="bg-slate-900 text-amber-400 font-black text-xs px-3 py-1 rounded-full">{al.xp || 0} XP</span>
                </div>
              ))}
            </div>
          )}

          {secaoAtiva === 'desempenho' && (
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 max-w-4xl space-y-4 animate-fade-up">
              <h1 className="text-2xl font-black">Raio-X de Desempenho</h1>
              {estatisticasPorMateria.map(st => (
                <div key={st.nome} className="space-y-1">
                  <div className="flex justify-between text-xs font-black"><span>{st.nome}</span><span>{st.taxa !== null ? `${st.taxa}%` : '0%'}</span></div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-lime-500" style={{ width: `${st.taxa || 0}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
