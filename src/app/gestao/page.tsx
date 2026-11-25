'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Users, Layers, Camera, MessageSquare, Sparkles, Mic, Square,
  CheckCircle2, Plus, Trash2, LogOut, Globe, Send, Volume2, Upload
} from 'lucide-react';

export default function PainelGestao() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [aba, setAba] = useState<'questoes' | 'redacoes' | 'duvidas' | 'alunos'>('questoes');

  // Dados
  const [alunos, setAlunos] = useState<any[]>([]);
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [redacoes, setRedacoes] = useState<any[]>([]);
  const [duvidas, setDuvidas] = useState<any[]>([]);

  // Novo Aluno
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSerie, setNovaSerie] = useState('9º Ano');
  const [novaSenha, setNovaSenha] = useState('epp123');

  // Gerador de Questões Mundiais
  const [serieQ, setSerieQ] = useState('9º Ano');
  const [disciplinaQ, setDisciplinaQ] = useState('Matemática');
  const [paisBancaQ, setPaisBancaQ] = useState('Brasil | ENEM / OBMEP');
  const [assuntoQ, setAssuntoQ] = useState('');
  const [nivelQ, setNivelQ] = useState('Médio');
  const [qtdQ, setQtdQ] = useState(3);
  const [gerandoQ, setGerandoQ] = useState(false);

  // Importador em Lote JSON
  const [jsonLote, setJsonLote] = useState('');

  // Estúdio de Correção de Redação por Foto
  const [redacaoSelecionada, setRedacaoSelecionada] = useState<any>(null);
  const [notaRed, setNotaRed] = useState(800);
  const [parecerRed, setParecerRed] = useState('');
  const [marcacoes, setMarcacoes] = useState<any[]>([]);
  const [corPino, setCorPino] = useState<'verde' | 'amarelo' | 'vermelho'>('verde');
  const [textoPino, setTextoPino] = useState('');
  const [coordPendente, setCoordPendente] = useState<{ x: number; y: number } | null>(null);

  // Gravador de Áudio
  const [gravandoAudio, setGravandoAudio] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [salvandoCorrecao, setSalvandoCorrecao] = useState(false);

  // Respostas Dúvidas
  const [respostasDuvidas, setRespostasDuvidas] = useState<Record<string, string>>({});

  useEffect(() => {
    const userStr = localStorage.getItem('epp_usuario');
    if (!userStr) { router.push('/login'); return; }
    const user = JSON.parse(userStr);
    if (user.perfil !== 'gestao') { router.push('/aluno'); return; }
    setUsuario(user);
    carregarTudo();
  }, [router]);

  const carregarTudo = async () => {
    const [als, qs, reds, duvs] = await Promise.all([
      supabase.from('usuarios_autorizados').select('*').order('nome'),
      supabase.from('atividades').select('*').order('criado_em', { ascending: false }).limit(40),
      supabase.from('redacoes_enviadas').select('*').order('enviado_em', { ascending: false }),
      supabase.from('duvidas_alunos').select('*').order('criado_em', { ascending: false })
    ]);
    if (als.data) setAlunos(als.data);
    if (qs.data) setQuestoes(qs.data);
    if (reds.data) setRedacoes(reds.data);
    if (duvs.data) setDuvidas(duvs.data);
  };

  const cadastrarAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoEmail.trim()) return;
    await supabase.from('usuarios_autorizados').insert([{
      nome: novoNome.trim(),
      email: novoEmail.trim().toLowerCase(),
      serie: novaSerie,
      perfil: 'aluno',
      senha: novaSenha.trim() || 'epp123',
      xp: 0
    }]);
    setNovoNome('');
    setNovoEmail('');
    carregarTudo();
  };

  const gerarQuestoesMundiais = async () => {
    if (!assuntoQ.trim()) return alert('Informe o assunto das questões.');
    setGerandoQ(true);
    const [pais, banca] = paisBancaQ.split(' | ');
    const xpAuto = nivelQ === 'Difícil' ? 40 : nivelQ === 'Fácil' ? 15 : 25;

    try {
      const res = await fetch('/api/gerar-questoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serie: serieQ,
          disciplina: disciplinaQ,
          assunto: assuntoQ,
          nivel: nivelQ,
          quantidade: qtdQ,
          pais,
          banca
        })
      });
      const data = await res.json();
      if (data.questoes && Array.isArray(data.questoes)) {
        const registros = data.questoes.map((q: any) => ({
          serie: serieQ,
          disciplina: disciplinaQ,
          titulo: q.titulo,
          enunciado: q.enunciado,
          alternativa_a: q.alternativa_a,
          alternativa_b: q.alternativa_b,
          alternativa_c: q.alternativa_c,
          alternativa_d: q.alternativa_d,
          correta: q.correta,
          resolucao_comentada: q.resolucao_comentada,
          nivel: nivelQ,
          xp_valor: xpAuto,
          pais,
          banca
        }));
        await supabase.from('atividades').insert(registros);
        setAssuntoQ('');
        carregarTudo();
        alert(`${registros.length} questões internacionais publicadas no banco!`);
      }
    } finally {
      setGerandoQ(false);
    }
  };

  const importarLoteJson = async () => {
    try {
      const parsed = JSON.parse(jsonLote);
      if (!Array.isArray(parsed)) return alert('O formato precisa ser uma lista JSON [ {...}, {...} ]');
      await supabase.from('atividades').insert(parsed);
      setJsonLote('');
      carregarTudo();
      alert(`${parsed.length} questões importadas com sucesso!`);
    } catch {
      alert('JSON inválido. Verifique a estrutura e tente novamente.');
    }
  };

  const clicarNaFolhaRedacao = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setCoordPendente({ x, y });
  };

  const adicionarMarcacaoColorida = () => {
    if (!coordPendente || !textoPino.trim()) return;
    setMarcacoes(prev => [...prev, { x: coordPendente.x, y: coordPendente.y, cor: corPino, texto: textoPino.trim() }]);
    setCoordPendente(null);
    setTextoPino('');
  };

  const iniciarGravacaoAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setGravandoAudio(true);
    } catch {
      alert('Não foi possível acessar o microfone. Permita o uso nas configurações do navegador.');
    }
  };

  const pararGravacaoAudio = () => {
    mediaRecorderRef.current?.stop();
    setGravandoAudio(false);
  };

  const finalizarCorrecaoRedacao = async () => {
    if (!redacaoSelecionada) return;
    setSalvandoCorrecao(true);

    try {
      let audioUrlFinal = redacaoSelecionada.audio_url || null;
      if (audioBlob) {
        const fileName = `audio_${redacaoSelecionada.id}_${Date.now()}.webm`;
        const { error } = await supabase.storage.from('correcoes-audios').upload(fileName, audioBlob, { contentType: 'audio/webm', upsert: true });
        if (!error) {
          const { data } = supabase.storage.from('correcoes-audios').getPublicUrl(fileName);
          if (data?.publicUrl) audioUrlFinal = data.publicUrl;
        }
      }

      await supabase.from('redacoes_enviadas').update({
        nota: Number(notaRed),
        comentario_professor: parecerRed,
        marcacoes_json: marcacoes,
        audio_url: audioUrlFinal,
        corrigida: true
      }).eq('id', redacaoSelecionada.id);

      await supabase.from('notificacoes').insert([{
        destinatario_email: redacaoSelecionada.aluno_email,
        titulo: `Redação Corrigida! Nota: ${notaRed}/1000`,
        mensagem: 'Sua redação foi devolvida com áudio explicativo e marcações coloridas na folha.',
        tipo: 'redacao'
      }]);

      setRedacaoSelecionada(null);
      setAudioBlob(null);
      setAudioPreviewUrl(null);
      carregarTudo();
    } finally {
      setSalvandoCorrecao(false);
    }
  };

  const responderDuvidaAluno = async (d: any) => {
    const resp = respostasDuvidas[d.id];
    if (!resp?.trim()) return;
    await supabase.from('duvidas_alunos').update({ resposta_professor: resp.trim(), respondida: true }).eq('id', d.id);
    await supabase.from('notificacoes').insert([{
      destinatario_email: d.aluno_email,
      titulo: `Dúvida Respondida (${d.disciplina})`,
      mensagem: 'Um professor do EPP Nexo respondeu à sua pergunta na Central de Dúvidas.',
      tipo: 'duvida'
    }]);
    carregarTudo();
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900">
      <header className="bg-slate-950 text-white px-6 h-16 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-amber-500 text-slate-950 font-black px-3 py-1 rounded-xl text-sm">EPP NEXO • GESTÃO</Link>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>{usuario.nome}</span>
          <button onClick={() => { localStorage.removeItem('epp_usuario'); router.push('/login'); }} className="text-red-400 font-bold flex items-center gap-1 cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'questoes', label: 'Banco Mundial de Questões', icon: Globe },
            { id: 'redacoes', label: `Redações por Foto (${redacoes.filter(r => !r.corrigida).length} pendentes)`, icon: Camera },
            { id: 'duvidas', label: `Dúvidas (${duvidas.filter(d => !d.respondida).length} abertas)`, icon: MessageSquare },
            { id: 'alunos', label: `Alunos (${alunos.length})`, icon: Users },
          ].map((t: any) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setAba(t.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 border-2 cursor-pointer ${
                  aba === t.id ? 'bg-amber-400 border-slate-900 text-slate-950 shadow-[3px_3px_0px_#0f172a]' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ABA 1: GERADOR MUNDIAL & IMPORTADOR */}
        {aba === 'questoes' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-4">
              <h2 className="text-lg font-black flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> Gerador de Vestibulares do Mundo (IA)</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <select value={serieQ} onChange={(e) => setSerieQ(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl text-xs font-bold">
                  <option>6º Ano</option><option>7º Ano</option><option>8º Ano</option><option>9º Ano</option>
                </select>
                <select value={disciplinaQ} onChange={(e) => setDisciplinaQ(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl text-xs font-bold">
                  <option>Matemática</option><option>Linguagens</option><option>Ciências</option><option>Humanas</option>
                </select>
                <select value={paisBancaQ} onChange={(e) => setPaisBancaQ(e.target.value)} className="sm:col-span-2 p-3 border-2 border-slate-200 rounded-xl text-xs font-bold">
                  <option>Brasil | IFPE (Instituto Federal de PE)</option><option>Brasil | ETE-PE (Escolas Técnicas Estaduais)</option><option>Brasil | ENEM / OBMEP</option>
                  <option>Brasil | SSA-UPE / FUVEST</option>
                  <option>EUA | SAT / ACT</option>
                  <option>Internacional | PISA (OCDE)</option>
                  <option>Reino Unido | Cambridge IGCSE / A-Levels</option>
                  <option>Japão | EJU</option>
                  <option>China | Gaokao</option>
                  <option>Espanha | Selectividad</option>
                </select>
                <input type="text" value={assuntoQ} onChange={(e) => setAssuntoQ(e.target.value)} placeholder="Assunto (ex: Equações, Interpretação, Ecologia...)" className="sm:col-span-2 p-3 border-2 border-slate-200 rounded-xl text-xs" />
                <select value={nivelQ} onChange={(e) => setNivelQ(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl text-xs font-bold">
                  <option>Fácil</option><option>Médio</option><option>Difícil</option>
                </select>
                <input type="number" min={1} max={10} value={qtdQ} onChange={(e) => setQtdQ(Number(e.target.value))} className="p-3 border-2 border-slate-200 rounded-xl text-xs font-bold" />
              </div>
              <button onClick={gerarQuestoesMundiais} disabled={gerandoQ} className="w-full bg-slate-950 text-amber-400 font-black text-xs py-3.5 rounded-2xl cursor-pointer">
                {gerandoQ ? 'Gerando questões internacionais...' : 'Gerar & Publicar no Banco'}
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
              <h2 className="text-lg font-black">Importação em Lote (JSON)</h2>
              <p className="text-xs text-slate-500">Cole um array JSON de questões reais de provas públicas para adicionar dezenas de questões instantaneamente.</p>
              <textarea rows={7} value={jsonLote} onChange={(e) => setJsonLote(e.target.value)} placeholder='[{"serie":"9º Ano","disciplina":"Matemática","pais":"EUA","banca":"SAT","titulo":"Álgebra","enunciado":"...","alternativa_a":"...","alternativa_b":"...","alternativa_c":"...","alternativa_d":"...","correta":"A","nivel":"Médio","xp_valor":25}]' className="w-full p-3 border-2 border-slate-200 rounded-2xl text-xs font-mono" />
              <button onClick={importarLoteJson} className="bg-amber-500 text-slate-950 font-black text-xs px-5 py-3 rounded-xl border-2 border-slate-900 cursor-pointer">
                Importar Lote Agora
              </button>
            </div>
          </div>
        )}

        {/* ABA 2: ESTÚDIO DE REDAÇÃO POR FOTO (PINOS COLORIDOS + ÁUDIO + 3 DIAS) */}
        {aba === 'redacoes' && (
          <div className="space-y-6">
            {redacaoSelecionada ? (
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-xl space-y-5">
                <div className="flex justify-between items-center">
                  <h2 className="font-black text-lg">Corrigindo Redação de {redacaoSelecionada.aluno_nome} ({redacaoSelecionada.serie})</h2>
                  <button onClick={() => setRedacaoSelecionada(null)} className="text-xs font-bold text-slate-500 cursor-pointer">Voltar à lista</button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-black text-slate-500 mb-2">1. Clique em qualquer ponto da foto para colocar uma marcação colorida:</p>
                    <div onClick={clicarNaFolhaRedacao} className="relative rounded-2xl border-2 border-slate-900 overflow-hidden cursor-crosshair bg-slate-100">
                      <img src={redacaoSelecionada.foto_url} alt="Folha do aluno" className="w-full h-auto" />
                      {marcacoes.map((m, i) => (
                        <span
                          key={i}
                          style={{ left: `${m.x}%`, top: `${m.y}%` }}
                          className={`-translate-x-1/2 -translate-y-1/2 absolute w-7 h-7 rounded-full font-black text-xs border-2 border-slate-950 flex items-center justify-center ${
                            m.cor === 'verde' ? 'bg-lime-400' : m.cor === 'vermelho' ? 'bg-red-500 text-white' : 'bg-amber-400'
                          }`}
                        >
                          {i + 1}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {coordPendente && (
                      <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl space-y-2">
                        <p className="text-xs font-black">Nova marcação em ({coordPendente.x}%, {coordPendente.y}%):</p>
                        <div className="flex gap-2">
                          {(['verde', 'amarelo', 'vermelho'] as const).map(c => (
                            <button key={c} type="button" onClick={() => setCorPino(c)} className={`px-3 py-1 rounded-lg text-xs font-black uppercase border ${corPino === c ? 'border-slate-900 ring-2 ring-slate-900' : 'border-slate-300'}`}>
                              {c}
                            </button>
                          ))}
                        </div>
                        <input type="text" value={textoPino} onChange={(e) => setTextoPino(e.target.value)} placeholder="Comentário deste ponto..." className="w-full p-2.5 border rounded-xl text-xs bg-white" />
                        <button type="button" onClick={adicionarMarcacaoColorida} className="bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-xl cursor-pointer">Fixar Pino na Folha</button>
                      </div>
                    )}

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <p className="text-xs font-black">2. Gravar Áudio da Correção pelo Microfone:</p>
                      <div className="flex items-center gap-3">
                        {!gravandoAudio ? (
                          <button type="button" onClick={iniciarGravacaoAudio} className="bg-red-600 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer">
                            <Mic className="w-4 h-4" /> Gravar Áudio
                          </button>
                        ) : (
                          <button type="button" onClick={pararGravacaoAudio} className="bg-slate-900 text-amber-400 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 animate-pulse cursor-pointer">
                            <Square className="w-4 h-4" /> Parar Gravação
                          </button>
                        )}
                        {audioPreviewUrl && <audio controls src={audioPreviewUrl} className="h-9 flex-1" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black mb-1">Nota Final (0 a 1000)</label>
                        <input type="number" max={1000} min={0} value={notaRed} onChange={(e) => setNotaRed(Number(e.target.value))} className="w-full p-2.5 border-2 border-slate-300 rounded-xl text-xs font-black" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black mb-1">Parecer Escrito Complementar</label>
                      <textarea rows={3} value={parecerRed} onChange={(e) => setParecerRed(e.target.value)} className="w-full p-3 border-2 border-slate-300 rounded-xl text-xs" />
                    </div>

                    <button onClick={finalizarCorrecaoRedacao} disabled={salvandoCorrecao} className="w-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs py-3.5 rounded-2xl border-2 border-slate-900 cursor-pointer">
                      {salvandoCorrecao ? 'Publicando devolutiva...' : 'Enviar Correção ao Aluno (Notificar)'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {redacoes.map(r => (
                  <div key={r.id} className="bg-white p-5 rounded-3xl border-2 border-slate-200 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${r.corrigida ? 'bg-lime-400' : 'bg-amber-300'}`}>
                        {r.corrigida ? `Corrigida (${r.nota}/1000)` : `Pendente • Entrega até ${r.prazo_entrega ? new Date(r.prazo_entrega).toLocaleDateString('pt-BR') : '3 dias'}`}
                      </span>
                      <h3 className="font-black text-sm mt-1">{r.aluno_nome} ({r.serie})</h3>
                    </div>
                    <button
                      onClick={() => {
                        setRedacaoSelecionada(r);
                        setNotaRed(r.nota || 800);
                        setParecerRed(r.comentario_professor || '');
                        setMarcacoes(r.marcacoes_json || []);
                      }}
                      className="bg-slate-900 text-amber-400 font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      Abrir Folha & Corrigir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 3: DÚVIDAS DOS ALUNOS */}
        {aba === 'duvidas' && (
          <div className="space-y-3">
            {duvidas.map(d => (
              <div key={d.id} className="bg-white p-5 rounded-3xl border-2 border-slate-200 space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs font-black text-amber-600">{d.aluno_nome} ({d.serie}) • {d.disciplina}</span>
                  <span className="text-[10px] font-black">{d.respondida ? 'Respondida' : 'Aguardando'}</span>
                </div>
                <p className="text-sm font-bold">{d.pergunta}</p>
                {d.respondida ? (
                  <p className="text-xs bg-lime-50 p-3 rounded-xl border border-lime-400"><strong>Resposta enviada:</strong> {d.resposta_professor}</p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={respostasDuvidas[d.id] || ''}
                      onChange={(e) => setRespostasDuvidas(p => ({ ...p, [d.id]: e.target.value }))}
                      placeholder="Escreva a resposta para o aluno..."
                      className="flex-1 p-2.5 border-2 border-slate-300 rounded-xl text-xs"
                    />
                    <button onClick={() => responderDuvidaAluno(d)} className="bg-slate-900 text-amber-400 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer">
                      <Send className="w-3.5 h-3.5" /> Responder
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ABA 4: ALUNOS */}
        {aba === 'alunos' && (
          <div className="space-y-6">
            <form onSubmit={cadastrarAluno} className="bg-white p-6 rounded-3xl border-2 border-slate-900 grid sm:grid-cols-4 gap-3">
              <input type="text" required value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome do aluno" className="p-3 border rounded-xl text-xs" />
              <input type="email" required value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} placeholder="E-mail" className="p-3 border rounded-xl text-xs" />
              <select value={novaSerie} onChange={(e) => setNovaSerie(e.target.value)} className="p-3 border rounded-xl text-xs font-bold">
                <option>6º Ano</option><option>7º Ano</option><option>8º Ano</option><option>9º Ano</option>
              </select>
              <button type="submit" className="bg-amber-500 font-black text-xs rounded-xl border-2 border-slate-900 cursor-pointer">Cadastrar Aluno</button>
            </form>

            <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 space-y-2">
              {alunos.map((a, i) => (
                <div key={i} className="flex justify-between items-center p-3 border-b last:border-none text-xs">
                  <span><strong>{a.nome}</strong> ({a.email}) • {a.serie}</span>
                  <span className="font-black bg-slate-100 px-2.5 py-1 rounded-full">{a.xp || 0} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

