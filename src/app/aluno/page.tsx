'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Home, Layers, BookOpen, Clock, Flame, LogOut, Menu, X,
  Printer, CheckSquare, Square, Sparkles, Trophy, 
  HelpCircle, Calendar, RotateCcw, Play, Pause, 
  Bell, MessageSquare, Camera, Volume2, Upload, Send, Zap,
  Globe, Award, FileCheck2, ArrowRight, BarChart2
} from 'lucide-react';

export default function PortalAluno() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [secaoAtiva, setSecaoAtiva] = useState<'inicio' | 'plano' | 'conteudo' | 'erros' | 'duvidas' | 'redacao' | 'simulados' | 'biblioteca' | 'ranking' | 'desempenho'>('inicio');
  const [materiaSelecionada, setMateriaSelecionada] = useState<string>('Todas');
  const [filtroNivel, setFiltroNivel] = useState<string>('Todos');
  const [filtroPais, setFiltroPais] = useState<string>('Todos');
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
  const [minutosEstudadosTotal, setMinutosEstudadosTotal] = useState(0);

  // Plano de Estudos
  const [demandaObjetivo, setDemandaObjetivo] = useState('');
  const [horasEstudo, setHorasEstudo] = useState('1 hora');
  const [gerandoPlano, setGerandoPlano] = useState(false);
  const [planoAtivo, setPlanoAtivo] = useState<any>(null);

  // Questões, XP & Caderno PDF Personalizado
  const [respostasAluno, setRespostasAluno] = useState<Record<string, string>>({});
  const [explicacoesTutor, setExplicacoesTutor] = useState<Record<string, string>>({});
  const [carregandoTutor, setCarregandoTutor] = useState<string | null>(null);
  const [selecionadasPdf, setSelecionadasPdf] = useState<string[]>([]);
  const [tituloCadernoPdf, setTituloCadernoPdf] = useState('Caderno de Exercícios Personalizado');
  const [incluirGabaritoPdf, setIncluirGabaritoPdf] = useState(true);
  const [modalPreviewPdfAberto, setModalPreviewPdfAberto] = useState(false);

  // Simulado
  const [simuladoEmAndamento, setSimuladoEmAndamento] = useState<any>(null);
  const [tempoRestante, setTempoRestante] = useState<number>(0);
  const [respostasSimulado, setRespostasSimulado] = useState<Record<string, string>>({});
  const [resultadoSimulado, setResultadoSimulado] = useState<{ acertos: number; total: number } | null>(null);

  // Biblioteca
  const [pdfAberto, setPdfAberto] = useState<any>(null);

  // Redação por Foto
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
    const minsSalvos = Number(localStorage.getItem('epp_mins_' + user.email) || 0);
    const ciclosSalvos = Number(localStorage.getItem('epp_ciclos_' + user.email) || 0);
    setMinutosEstudadosTotal(minsSalvos);
    setCiclosConcluidos(ciclosSalvos);
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
            setCiclosConcluidos(c => {
              const novoC = c + 1;
              if (usuario?.email) localStorage.setItem('epp_ciclos_' + usuario.email, String(novoC));
              return novoC;
            });
            setMinutosEstudadosTotal(m => {
              const novoM = m + 25;
              if (usuario?.email) localStorage.setItem('epp_mins_' + usuario.email, String(novoM));
              return novoM;
            });
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
      supabase.from('atividades').select('*').in('serie', [user.serie, 'Todas as Séries', '6º ao 9º Ano']),
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

  const toggleSelecaoPdf = (id: string) => {
    setSelecionadasPdf(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const gerarPdfLindoCaderno = () => {
    const lista = atividades.filter(a => selecionadasPdf.includes(a.id));
    if (lista.length === 0) return;

    const janela = window.open('', '_blank', 'width=900,height=1000');
    if (!janela) {
      alert('Permita pop-ups no seu navegador para gerar e salvar o PDF.');
      return;
    }

    const dataHoje = new Date().toLocaleDateString('pt-BR');
    const htmlQuestoes = lista.map((q, idx) => `
      <div class="questao-card">
        <div class="questao-header">
          <span class="q-num">QUESTÃO ${String(idx + 1).padStart(2, '0')}</span>
          <span class="q-meta">${q.disciplina} • ${q.pais || 'Brasil'} (${q.banca || 'EPP Nexo'}) • Nível ${q.nivel || 'Médio'}</span>
        </div>
        <div class="q-titulo">${q.titulo}</div>
        <div class="q-enunciado">${q.enunciado}</div>
        <div class="alternativas">
          <div class="alt"><span class="bolinha">A</span> <span>${q.alternativa_a}</span></div>
          <div class="alt"><span class="bolinha">B</span> <span>${q.alternativa_b}</span></div>
          <div class="alt"><span class="bolinha">C</span> <span>${q.alternativa_c}</span></div>
          <div class="alt"><span class="bolinha">D</span> <span>${q.alternativa_d}</span></div>
        </div>
        <div class="rascunho">Espaço para cálculos / anotações:</div>
      </div>
    `).join('');

    const htmlGabarito = incluirGabaritoPdf ? `
      <div class="page-break"></div>
      <div class="gabarito-box">
        <h2>GABARITO COMENTADO & RESOLUÇÕES OFICIAIS</h2>
        <p class="sub-gab">Confira suas respostas e estude o passo a passo de cada questão selecionada.</p>
        <div class="grade-respostas">
          ${lista.map((q, idx) => `
            <div class="item-grade">
              <strong>Q${String(idx + 1).padStart(2, '0')}:</strong> <span class="letra-certa">${q.correta}</span>
            </div>
          `).join('')}
        </div>
        <div class="lista-resolucoes">
          ${lista.map((q, idx) => `
            <div class="res-item">
              <strong>Questão ${String(idx + 1).padStart(2, '0')} (${q.titulo}) — Gabarito: ${q.correta}</strong>
              <p>${q.resolucao_comentada || 'Resolução comentada disponível no portal EPP Nexo.'}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    janela.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>${tituloCadernoPdf} - EPP Nexo</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          * { box-sizing: border-box; }
          body {
            font-family: 'Plus Jakarta Sans', Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 28px;
            background: #ffffff;
            line-height: 1.5;
          }
          .capa-header {
            border: 2.5px solid #0f172a;
            border-radius: 18px;
            padding: 22px 26px;
            background: linear-gradient(135deg, #fffbeb 0%, #ffffff 65%, #f8fafc 100%);
            box-shadow: 5px 5px 0px #0f172a;
            margin-bottom: 24px;
          }
          .topo-marca {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 12px;
            margin-bottom: 14px;
          }
          .logo-badge {
            background: #f59e0b;
            color: #0f172a;
            font-weight: 800;
            padding: 6px 14px;
            border-radius: 10px;
            border: 2px solid #0f172a;
            font-size: 14px;
            letter-spacing: 0.5px;
          }
          .tag-serie {
            background: #0f172a;
            color: #fbbf24;
            font-weight: 800;
            font-size: 11px;
            padding: 5px 12px;
            border-radius: 99px;
            text-transform: uppercase;
          }
          h1 {
            margin: 0 0 10px 0;
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
          }
          .dados-aluno {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 12px;
            font-size: 12px;
            background: #f8fafc;
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid #cbd5e1;
          }
          .questao-card {
            border: 1.5px solid #cbd5e1;
            border-radius: 16px;
            padding: 18px 20px;
            margin-bottom: 18px;
            page-break-inside: avoid;
          }
          .questao-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            flex-wrap: wrap;
            gap: 6px;
          }
          .q-num {
            background: #0f172a;
            color: #ffffff;
            font-weight: 800;
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 8px;
          }
          .q-meta {
            font-size: 11px;
            font-weight: 700;
            color: #b45309;
            background: #fef3c7;
            padding: 3px 10px;
            border-radius: 99px;
          }
          .q-titulo {
            font-size: 13px;
            font-weight: 800;
            color: #334155;
            margin-bottom: 6px;
          }
          .q-enunciado {
            font-size: 13.5px;
            color: #0f172a;
            margin-bottom: 12px;
            white-space: pre-wrap;
          }
          .alternativas {
            display: flex;
            flex-direction: column;
            gap: 7px;
          }
          .alt {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            font-size: 13px;
            padding: 6px 10px;
            border-radius: 10px;
            background: #f8fafc;
          }
          .bolinha {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            border: 1.5px solid #0f172a;
            font-weight: 800;
            font-size: 11px;
            flex-shrink: 0;
            background: #ffffff;
          }
          .rascunho {
            margin-top: 12px;
            border-top: 1px dashed #cbd5e1;
            padding-top: 6px;
            height: 44px;
            font-size: 10px;
            color: #94a3b8;
          }
          .page-break { page-break-before: always; }
          .gabarito-box {
            border: 2px solid #0f172a;
            border-radius: 18px;
            padding: 22px;
            background: #f8fafc;
          }
          .gabarito-box h2 { margin: 0 0 4px 0; font-size: 18px; }
          .sub-gab { font-size: 12px; color: #475569; margin: 0 0 16px 0; }
          .grade-respostas {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 18px;
          }
          .item-grade {
            background: #ffffff;
            border: 1.5px solid #0f172a;
            padding: 6px 12px;
            border-radius: 10px;
            font-size: 12px;
          }
          .letra-certa {
            background: #a3e635;
            padding: 1px 6px;
            border-radius: 6px;
            font-weight: 800;
          }
          .res-item {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 12px 14px;
            margin-bottom: 10px;
            font-size: 12px;
            page-break-inside: avoid;
          }
          .res-item p { margin: 4px 0 0 0; color: #334155; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background:#0f172a;color:#fff;padding:12px 18px;border-radius:12px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:13px;font-weight:700;">Caderno pronto! Escolha <strong>"Salvar como PDF"</strong> ou imprima agora.</span>
          <button onclick="window.print()" style="background:#f59e0b;color:#0f172a;border:none;padding:8px 16px;border-radius:8px;font-weight:800;cursor:pointer;">Salvar PDF / Imprimir</button>
        </div>

        <div class="capa-header">
          <div class="topo-marca">
            <span class="logo-badge">EPP NEXO • REFORÇO ESCOLAR</span>
            <span class="tag-serie">${usuario.serie} • ${lista.length} QUESTÕES</span>
          </div>
          <h1>${tituloCadernoPdf}</h1>
          <div class="dados-aluno">
            <div><strong>Estudante:</strong> ${usuario.nome}</div>
            <div><strong>Data:</strong> ${dataHoje}</div>
            <div><strong>Nota / Acertos:</strong> ____ / ${lista.length}</div>
          </div>
        </div>

        ${htmlQuestoes}
        ${htmlGabarito}

        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 400); };
        </script>
      </body>
      </html>
    `);
    janela.document.close();
    setModalPreviewPdfAberto(false);
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

  const totalQuestoesSerie = atividades.filter(a => !a.simulado_id).length;
  const paisesDisponiveis = ['Todos', ...Array.from(new Set(atividades.map(a => a.pais || 'Brasil')))];

  const questoesFiltradas = atividades
    .filter(a => !a.simulado_id)
    .filter(a => materiaSelecionada === 'Todas' || a.disciplina === materiaSelecionada)
    .filter(a => filtroNivel === 'Todos' || (a.nivel || 'Médio') === filtroNivel)
    .filter(a => filtroPais === 'Todos' || (a.pais || 'Brasil') === filtroPais);

  const idsErrados = new Set(historicoRespostas.filter(r => !r.acertou).map(r => r.questao_id));
  const questoesParaRevisar = atividades.filter(a => idsErrados.has(a.id));
  const patente = (usuario.xp || 0) >= 600 ? 'Lenda EPP' : (usuario.xp || 0) >= 250 ? 'Mestre Nexo' : (usuario.xp || 0) >= 80 ? 'Explorador' : 'Iniciante';
  const naoLidasCount = notificacoes.filter(n => !n.lida).length;
  const totalRespondidas = historicoRespostas.length;
  const totalAcertos = historicoRespostas.filter(r => r.acertou).length;
  const taxaGeral = totalRespondidas > 0 ? Math.round((totalAcertos / totalRespondidas) * 100) : 0;

  const medalhas = [
    { titulo: 'Primeiro Passo', desc: 'Respondeu sua primeira questão', ativa: totalRespondidas >= 1 },
    { titulo: 'Foco Pomodoro', desc: 'Concluiu ciclos de estudo cronometrado', ativa: ciclosConcluidos >= 1 || (usuario.xp || 0) >= 30 },
    { titulo: 'Escritor EPP', desc: 'Enviou redação por foto', ativa: minhasRedacoes.length >= 1 },
    { titulo: 'Mente Global', desc: 'Alcançou 100+ XP no portal', ativa: (usuario.xp || 0) >= 100 },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col">
      {/* MODAL CONFIGURAR CADERNO DE QUESTÕES PDF */}
      {modalPreviewPdfAberto && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-pop-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border-2 border-slate-900 shadow-[8px_8px_0px_#F59E0B] p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase bg-amber-400 px-3 py-1 rounded-full border border-slate-900">
                Gerador de Caderno PDF • {selecionadasPdf.length} questões
              </span>
              <button onClick={() => setModalPreviewPdfAberto(false)} className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Título do Seu Caderno</label>
                <input
                  type="text"
                  value={tituloCadernoPdf}
                  onChange={(e) => setTituloCadernoPdf(e.target.value)}
                  className="w-full p-3 border-2 border-slate-300 focus:border-slate-900 rounded-2xl text-xs font-bold outline-none"
                />
              </div>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirGabaritoPdf}
                  onChange={(e) => setIncluirGabaritoPdf(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <div className="text-xs">
                  <p className="font-black text-slate-900">Incluir folha final com Gabarito & Resoluções Comentadas</p>
                  <p className="text-slate-500">Desmarque se quiser imprimir apenas as questões para simular uma prova real.</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalPreviewPdfAberto(false)} className="px-4 py-2.5 text-xs font-bold text-slate-500 cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={gerarPdfLindoCaderno}
                className="bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs px-6 py-3.5 rounded-2xl flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Gerar & Baixar PDF Lindo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RELÓGIO POMODORO */}
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

      {/* MODAL INSPEÇÃO REDAÇÃO CORRIGIDA */}
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

      {/* HEADER */}
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
          <button
            onClick={() => setPomodoroModalAberto(true)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 text-xs font-black cursor-pointer transition-all ${
              pomodoroRodando ? 'bg-amber-400 border-slate-900 text-slate-950 animate-pulse' : 'bg-slate-100 border-slate-300 text-slate-800 hover:border-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{String(Math.floor(pomodoroSegundos / 60)).padStart(2, '0')}:{String(pomodoroSegundos % 60).padStart(2, '0')}</span>
          </button>

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
        <aside className={`${menuMobileAberto ? 'fixed inset-y-0 left-0 z-40 block pt-16' : 'hidden'} lg:block w-64 bg-white border-r border-slate-200 shrink-0`}>
          <div className="p-4 space-y-1">
            <p className="px-3 text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Portal do Estudante</p>

            {[
              { id: 'inicio', label: 'Visão Geral', icon: Home },
              { id: 'plano', label: 'Plano IA Sob Demanda', icon: Calendar, badge: 'IA' },
              { id: 'conteudo', label: 'Banco Mundial & PDF', icon: Layers, badge: 'PDF' },
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
                    Resolva questões de vestibulares do Brasil e do mundo para ganhar XP, monte seu próprio caderno de exercícios em PDF ou envie a foto da sua redação.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button onClick={() => setSecaoAtiva('conteudo')} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3.5 rounded-2xl border-2 border-slate-900 flex items-center gap-2 cursor-pointer">
                      Montar Caderno & Questões <ArrowRight className="w-4 h-4" />
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

              {/* MURAL DE CONQUISTAS */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {medalhas.map((med, i) => (
                  <div key={i} className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${med.ativa ? 'bg-white border-slate-900 shadow-[3px_3px_0px_#84cc16]' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${med.ativa ? 'bg-lime-400 text-slate-950' : 'bg-slate-200 text-slate-400'}`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black">{med.titulo}</p>
                      <p className="text-[11px] text-slate-500">{med.desc}</p>
                    </div>
                  </div>
                ))}
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

          {/* BANCO MUNDIAL DE QUESTÕES + MONTADOR DE CADERNO PDF */}
          {secaoAtiva === 'conteudo' && (
            <div className="space-y-6 max-w-4xl animate-fade-up pb-20">
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <h1 className="text-2xl font-black flex items-center gap-2">
                      <Globe className="w-6 h-6 text-amber-500" /> Banco de Questões & Caderno PDF
                      <span className="ml-1 text-xs font-black bg-slate-950 text-amber-400 px-3 py-1 rounded-full">
                        {totalQuestoesSerie} {totalQuestoesSerie === 1 ? 'questão cadastrada' : 'questões cadastradas'} ({usuario.serie})
                      </span>
                      <button onClick={() => carregarDados(usuario)} className="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full border border-amber-400 cursor-pointer">
                        Atualizar
                      </button>
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Responda online para ganhar XP ou marque as questões que desejar para montar um <strong>Caderno de Questões em PDF</strong>.
                    </p>
                  </div>

                  {questoesFiltradas.length > 0 && (
                    <button
                      onClick={() => {
                        const todosIds = questoesFiltradas.map(q => q.id);
                        const todosMarcados = todosIds.every(id => selecionadasPdf.includes(id));
                        if (todosMarcados) {
                          setSelecionadasPdf(prev => prev.filter(id => !todosIds.includes(id)));
                        } else {
                          setSelecionadasPdf(prev => Array.from(new Set([...prev, ...todosIds])));
                        }
                      }}
                      className="text-xs font-black bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" /> Selecionar todas da lista ({questoesFiltradas.length})
                    </button>
                  )}
                </div>

                {/* FILTROS: DISCIPLINA, PAÍS/EXAME E DIFICULDADE */}
                <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Disciplina</label>
                    <select
                      value={materiaSelecionada}
                      onChange={(e) => setMateriaSelecionada(e.target.value)}
                      className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-xs font-black bg-white"
                    >
                      <option value="Todas">Todas as Disciplinas</option>
                      {materias.map(m => <option key={m.nome} value={m.nome}>{m.nome}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">País / Exame Internacional</label>
                    <select
                      value={filtroPais}
                      onChange={(e) => setFiltroPais(e.target.value)}
                      className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-xs font-black bg-white"
                    >
                      {paisesDisponiveis.map(p => <option key={p} value={p}>{p === 'Todos' ? 'Todos os Países' : p}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Nível & Recompensa XP</label>
                    <select
                      value={filtroNivel}
                      onChange={(e) => setFiltroNivel(e.target.value)}
                      className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-xs font-black bg-white"
                    >
                      <option value="Todos">Todos os Níveis</option>
                      <option value="Fácil">Fácil (+15 XP)</option>
                      <option value="Médio">Médio (+25 XP)</option>
                      <option value="Difícil">Difícil (+40 XP)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-600">
                  <span>
                    Mostrando <strong className="text-slate-950">{questoesFiltradas.length}</strong> de <strong className="text-slate-950">{totalQuestoesSerie}</strong> questões disponíveis para o <strong>{usuario.serie}</strong>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {materias.map(m => {
                      const qtdMat = atividades.filter(a => !a.simulado_id && a.disciplina === m.nome).length;
                      return (
                        <span key={m.nome} className="text-[10px] font-bold bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                          {m.nome}: <strong>{qtdMat}</strong>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {questoesFiltradas.length === 0 ? (
                <p className="text-sm text-slate-500 bg-white p-8 rounded-3xl border-2 border-slate-200">Nenhuma questão encontrada com esses filtros.</p>
              ) : (
                questoesFiltradas.map((q, index) => {
                  const escolhida = respostasAluno[q.id];
                  const acertou = escolhida === q.correta;
                  const xpQuestao = q.xp_valor || (q.nivel === 'Difícil' ? 40 : q.nivel === 'Fácil' ? 15 : 25);
                  const marcadaPdf = selecionadasPdf.includes(q.id);

                  return (
                    <div key={q.id} className={`bg-white p-6 rounded-3xl border-2 transition-all space-y-4 ${marcadaPdf ? 'border-amber-500 shadow-[4px_4px_0px_#F59E0B]' : 'border-slate-200'}`}>
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-amber-600 uppercase">0{index + 1} • {q.disciplina}</span>
                          <span className="text-[11px] font-black bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                            {q.pais || 'Brasil'} • {q.banca || 'EPP Nexo'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black bg-slate-100 px-2.5 py-1 rounded-full">{q.nivel || 'Médio'} • +{xpQuestao} XP</span>
                          <button
                            type="button"
                            onClick={() => toggleSelecaoPdf(q.id)}
                            className={`text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1.5 cursor-pointer transition-all ${
                              marcadaPdf ? 'bg-amber-400 border-slate-900 text-slate-950' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-900'
                            }`}
                          >
                            {marcadaPdf ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                            {marcadaPdf ? 'No Caderno PDF' : 'Add ao PDF'}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs font-black text-slate-500">{q.titulo}</p>
                      <p className="text-sm font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">{q.enunciado}</p>

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
                          <div className="flex justify-between items-center">
                            <span className={`font-black ${acertou ? 'text-lime-700' : 'text-red-600'}`}>
                              {acertou ? `Parabéns! Você ganhou +${xpQuestao} XP.` : `Resposta correta: Letra ${q.correta}`}
                            </span>
                          </div>
                          <p className="text-slate-600"><strong>Resolução:</strong> {q.resolucao_comentada}</p>
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

              {/* BARRA FLUTUANTE DO CADERNO DE QUESTÕES PDF */}
              {selecionadasPdf.length > 0 && (
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-950 text-white px-6 py-4 rounded-3xl border-2 border-amber-400 shadow-2xl flex flex-wrap items-center gap-4 animate-pop-in">
                  <div>
                    <p className="text-xs font-black text-amber-400">{selecionadasPdf.length} questão(ões) no seu caderno</p>
                    <p className="text-[11px] text-slate-300">Pronto para gerar sua apostila em PDF diagramada</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelecionadasPdf([])}
                      className="text-xs font-bold text-slate-400 hover:text-white px-3 py-2 cursor-pointer"
                    >
                      Limpar
                    </button>
                    <button
                      onClick={() => setModalPreviewPdfAberto(true)}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" /> Gerar Caderno PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REDAÇÃO POR FOTO */}
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

          {/* CENTRAL DE DÚVIDAS */}
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

          {/* PLANO IA, ERROS, SIMULADOS, BIBLIOTECA, RANKING E DESEMPENHO */}
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

          {secaoAtiva === 'desempenho' && (() => {
            const redacoesCorrigidas = minhasRedacoes.filter(r => r.nota != null);
            const mediaRedacoes = redacoesCorrigidas.length > 0
              ? Math.round(redacoesCorrigidas.reduce((acc, r) => acc + Number(r.nota), 0) / redacoesCorrigidas.length)
              : null;

            const materiasComDados = estatisticasPorMateria.filter(m => m.total > 0);
            const melhorMateria = [...materiasComDados].sort((a, b) => (b.taxa || 0) - (a.taxa || 0))[0];
            const piorMateria = [...materiasComDados].sort((a, b) => (a.taxa || 0) - (b.taxa || 0))[0];

            const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const chave = d.toISOString().slice(0, 10);
              const label = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
              const qtd = historicoRespostas.filter(r => (r.respondido_em || '').startsWith(chave)).length;
              return { label, qtd };
            });
            const maxDia = Math.max(...ultimos7Dias.map(d => d.qtd), 4);
            const horasFormatadas = minutosEstudadosTotal >= 60
              ? `${Math.floor(minutosEstudadosTotal / 60)}h ${minutosEstudadosTotal % 60}m`
              : `${minutosEstudadosTotal} min`;

            return (
              <div className="space-y-6 max-w-5xl animate-fade-up">
                <div className="bg-slate-950 text-white p-7 rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#F59E0B] flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-3 py-1 rounded-full">
                      Analytics Pedagógico • {usuario.serie}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black mt-2">Raio-X Completo de Evolução</h1>
                    <p className="text-xs text-slate-300 mt-1">
                      Acompanhe seu tempo de concentração, precisão nas questões, notas de redação e recomendações personalizadas.
                    </p>
                  </div>
                  <button
                    onClick={() => setPomodoroModalAberto(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl border-2 border-slate-900 flex items-center gap-2 cursor-pointer"
                  >
                    <Clock className="w-4 h-4" /> Abrir Pomodoro (+25 min)
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-600">Tempo de Estudo</span>
                    <p className="text-2xl font-black text-slate-950">{horasFormatadas}</p>
                    <p className="text-[11px] text-slate-500">{ciclosConcluidos} ciclo(s) Pomodoro</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#84cc16] space-y-1">
                    <span className="text-[10px] font-black uppercase text-lime-700">Questões Resolvidas</span>
                    <p className="text-2xl font-black text-slate-950">{totalRespondidas}</p>
                    <p className="text-[11px] text-slate-500">{totalAcertos} acertos ({taxaGeral}% precisão)</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#38bdf8] space-y-1">
                    <span className="text-[10px] font-black uppercase text-cyan-700">Redações Enviadas</span>
                    <p className="text-2xl font-black text-slate-950">{minhasRedacoes.length}</p>
                    <p className="text-[11px] text-slate-500">
                      {mediaRedacoes !== null ? `Média: ${mediaRedacoes}/1000` : 'Aguardando 1ª nota'}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#a855f7] space-y-1">
                    <span className="text-[10px] font-black uppercase text-purple-700">Nível & Pontuação</span>
                    <p className="text-2xl font-black text-slate-950">{usuario.xp || 0} XP</p>
                    <p className="text-[11px] text-slate-500">Patente: <strong>{patente}</strong></p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-lime-50 border-2 border-lime-500 p-5 rounded-3xl space-y-1.5">
                    <span className="text-[10px] font-black uppercase bg-lime-400 text-slate-950 px-2.5 py-0.5 rounded-full">Ponto Forte</span>
                    <h3 className="font-black text-sm text-slate-900">
                      {melhorMateria ? `${melhorMateria.nome} (${melhorMateria.taxa}% de acerto)` : 'Comece a resolver questões'}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {melhorMateria
                        ? `Excelente desempenho em ${melhorMateria.nome}! Experimente desafios nível Difícil para ganhar +40 XP.`
                        : 'Resolva exercícios no Banco Mundial para descobrirmos sua disciplina de maior destaque.'}
                    </p>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-400 p-5 rounded-3xl space-y-1.5">
                    <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">Foco Recomendado</span>
                    <h3 className="font-black text-sm text-slate-900">
                      {piorMateria && (piorMateria.taxa || 0) < 75
                        ? `Reforçar ${piorMateria.nome} (${piorMateria.taxa}%)`
                        : 'Ritmo Equilibrado'}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {questoesParaRevisar.length > 0
                        ? `Você tem ${questoesParaRevisar.length} questão(ões) no Caderno de Erros prontas para superação.`
                        : 'Continue alternando entre questões objetivas e redação semanal.'}
                    </p>
                  </div>

                  <div className="bg-indigo-50 border-2 border-indigo-400 p-5 rounded-3xl flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">Próximo Passo</span>
                      <h3 className="font-black text-sm text-slate-900 mt-1.5">Acelere sua preparação</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Use seus dados reais para gerar um roteiro semanal sob medida.</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSecaoAtiva('plano')} className="bg-slate-900 text-amber-400 text-[11px] font-black px-3 py-2 rounded-xl cursor-pointer">
                        Gerar Plano IA
                      </button>
                      {questoesParaRevisar.length > 0 && (
                        <button onClick={() => setSecaoAtiva('erros')} className="bg-white border border-slate-900 text-slate-900 text-[11px] font-black px-3 py-2 rounded-xl cursor-pointer">
                          Revisar Erros
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-black text-base">Constância nos Últimos 7 Dias</h2>
                        <p className="text-xs text-slate-500">Volume diário de questões praticadas</p>
                      </div>
                      <span className="text-[11px] font-black bg-slate-100 px-3 py-1 rounded-full">Meta: 5/dia</span>
                    </div>

                    <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-200">
                      {ultimos7Dias.map((dia, idx) => {
                        const alturaPct = Math.max(Math.round((dia.qtd / maxDia) * 100), dia.qtd > 0 ? 18 : 6);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-700">{dia.qtd > 0 ? dia.qtd : ''}</span>
                            <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl h-32 flex items-end overflow-hidden">
                              <div
                                style={{ height: `${alturaPct}%` }}
                                className={`w-full rounded-t-xl transition-all duration-500 ${dia.qtd > 0 ? 'bg-amber-400 border-t-2 border-x-2 border-slate-900' : 'bg-slate-200'}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between px-2 text-[11px] font-black uppercase text-slate-500">
                      {ultimos7Dias.map((dia, idx) => (
                        <span key={idx} className="flex-1 text-center">{dia.label}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 space-y-4">
                    <div>
                      <h2 className="font-black text-base">Aproveitamento por Área</h2>
                      <p className="text-xs text-slate-500">Percentual de acertos e total respondido por matéria</p>
                    </div>

                    <div className="space-y-4 pt-1">
                      {estatisticasPorMateria.map((st) => {
                        const pct = st.taxa || 0;
                        const corBarra = pct >= 75 ? 'bg-lime-400' : pct >= 50 ? 'bg-amber-400' : st.total > 0 ? 'bg-red-400' : 'bg-slate-200';
                        return (
                          <div key={st.nome} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-black text-slate-900">{st.nome}</span>
                              <span className="font-bold text-slate-500">
                                {st.acertos}/{st.total} acertos • <strong className="text-slate-950">{pct}%</strong>
                              </span>
                            </div>
                            <div className="w-full h-3.5 bg-slate-100 rounded-full border border-slate-300 overflow-hidden">
                              <div className={`h-full ${corBarra} transition-all duration-500`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <h2 className="font-black text-base">Histórico & Evolução das Redações</h2>
                      <p className="text-xs text-slate-500">Notas recebidas nas redações enviadas por foto (escala 0 a 1000)</p>
                    </div>
                    <button onClick={() => setSecaoAtiva('redacao')} className="text-xs font-black text-amber-700 hover:underline cursor-pointer">
                      Ir para Oficina de Redação →
                    </button>
                  </div>

                  {redacoesCorrigidas.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-xs text-slate-500 text-center">
                      Você ainda não possui redações com nota lançada. Envie uma foto na aba <strong>Redação por Foto</strong> para acompanhar sua curva de evolução aqui!
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {redacoesCorrigidas.slice().reverse().map((red, idx) => (
                        <div key={red.id} className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-black text-slate-500">
                            <span>REDAÇÃO #{idx + 1}</span>
                            <span>{new Date(red.enviado_em).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <p className="text-2xl font-black text-slate-950">{red.nota} <span className="text-xs font-bold text-slate-400">/1000</span></p>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600" style={{ width: `${Math.min((Number(red.nota) / 1000) * 100, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
}






