'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  BookPlus, CheckSquare, FilePlus2, LogOut, PenSquare, 
  Users, Trash2, Layers, Sparkles, Wand2, PlusCircle, 
  CheckCircle2, AlertCircle, Bot, KeyRound, ExternalLink
} from 'lucide-react';

export default function PainelGestao() {
  const router = useRouter();
  const [modulo, setModulo] = useState<'alunos' | 'ia' | 'atividade' | 'simulado' | 'redacao' | 'biblioteca'>('alunos');
  const [mensagem, setMensagem] = useState('');
  const [erroIa, setErroIa] = useState('');

  const [atividadesList, setAtividadesList] = useState<any[]>([]);
  const [simuladosList, setSimuladosList] = useState<any[]>([]);
  const [redacoesPendentes, setRedacoesPendentes] = useState<any[]>([]);
  const [livrosList, setLivrosList] = useState<any[]>([]);
  const [usuariosList, setUsuariosList] = useState<any[]>([]);
  const [corrigindoId, setCorrigindoId] = useState<string | null>(null);

  // Gerador IA Real
  const [iaSerie, setIaSerie] = useState('8º Ano');
  const [iaDisciplina, setIaDisciplina] = useState('Matemática');
  const [iaTema, setIaTema] = useState('');
  const [iaNivel, setIaNivel] = useState('Médio (Contextualizado)');
  const [iaQtd, setIaQtd] = useState(3);
  const [gerandoIa, setGerandoIa] = useState(false);
  const [bateriaGerada, setBateriaGerada] = useState<any[]>([]);

  // Formulário Atividade Manual
  const [serieAtiv, setSerieAtiv] = useState('8º Ano');
  const [disciplina, setDisciplina] = useState('Matemática');
  const [tituloAtiv, setTituloAtiv] = useState('');
  const [enunciado, setEnunciado] = useState('');
  const [altA, setAltA] = useState('');
  const [altB, setAltB] = useState('');
  const [altC, setAltC] = useState('');
  const [altD, setAltD] = useState('');
  const [correta, setCorreta] = useState('A');
  const [resolucao, setResolucao] = useState('');
  const [simuladoVinculado, setSimuladoVinculado] = useState('');

  // Formulário Simulado
  const [tituloSim, setTituloSim] = useState('');
  const [serieSim, setSerieSim] = useState('8º Ano');
  const [duracaoSim, setDuracaoSim] = useState(60);

  // Formulário Redação
  const [temaRedacao, setTemaRedacao] = useState('');
  const [textosApoio, setTextosApoio] = useState('');

  // Formulário Biblioteca
  const [tituloLivro, setTituloLivro] = useState('');
  const [categoriaLivro, setCategoriaLivro] = useState('Apostila');
  const [urlPdf, setUrlPdf] = useState('');
  const [serieLivro, setSerieLivro] = useState('6º ao 9º Ano');

  // Formulário Alunos (Com Senha definida pela Gestão)
  const [nomeAluno, setNomeAluno] = useState('');
  const [emailAluno, setEmailAluno] = useState('');
  const [senhaAluno, setSenhaAluno] = useState('epp123');
  const [serieAluno, setSerieAluno] = useState('8º Ano');
  const [perfilUsuario, setPerfilUsuario] = useState<'aluno' | 'gestao'>('aluno');
  const [loteEmails, setLoteEmails] = useState('');
  const [senhaLote, setSenhaLote] = useState('epp123');
  const [serieLote, setSerieLote] = useState('8º Ano');

  useEffect(() => {
    const userStr = localStorage.getItem('epp_usuario');
    if (!userStr) { router.push('/login'); return; }
    const user = JSON.parse(userStr);
    if (user.perfil !== 'gestao') { router.push('/aluno'); return; }
    carregarTudo();
  }, [router]);

  const carregarTudo = async () => {
    const [ativs, sims, reds, libs, users] = await Promise.all([
      supabase.from('atividades').select('*').order('criado_em', { ascending: false }),
      supabase.from('simulados').select('*').order('criado_em', { ascending: false }),
      supabase.from('redacoes_enviadas').select('*').order('enviado_em', { ascending: false }),
      supabase.from('biblioteca').select('*').order('criado_em', { ascending: false }),
      supabase.from('usuarios_autorizados').select('*').order('nome', { ascending: true })
    ]);
    if (ativs.data) setAtividadesList(ativs.data);
    if (sims.data) setSimuladosList(sims.data);
    if (reds.data) setRedacoesPendentes(reds.data);
    if (libs.data) setLivrosList(libs.data);
    if (users.data) setUsuariosList(users.data);
  };

  const notificar = (texto: string) => {
    setMensagem(texto);
    setTimeout(() => setMensagem(''), 4500);
  };

  const gerarBateriaComIA = async () => {
    if (!iaTema.trim()) return notificar('Digite o assunto ou tema para a IA elaborar as questões!');
    setGerandoIa(true);
    setErroIa('');
    setBateriaGerada([]);

    try {
      const res = await fetch('/api/gerar-questoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serie: iaSerie,
          disciplina: iaDisciplina,
          tema: iaTema.trim(),
          quantidade: iaQtd,
          nivel: iaNivel
        })
      });

      const data = await res.json();
      if (!res.ok) setErroIa(data.error || 'Falha ao gerar questões com a IA.');
      else setBateriaGerada(data.questoes || []);
    } catch {
      setErroIa('Erro de conexão ao chamar a IA.');
    } finally {
      setGerandoIa(false);
    }
  };

  const publicarBateriaIA = async () => {
    if (bateriaGerada.length === 0) return;
    await supabase.from('atividades').insert(bateriaGerada);
    const total = bateriaGerada.length;
    setBateriaGerada([]);
    setIaTema('');
    carregarTudo();
    notificar(`${total} questões inéditas criadas pela IA foram publicadas para o ${iaSerie}!`);
  };

  const salvarAtividade = async () => {
    if (!enunciado || !altA || !altB) return notificar('Preencha o enunciado e as alternativas!');
    await supabase.from('atividades').insert([{
      serie: serieAtiv,
      disciplina,
      titulo: tituloAtiv || `Questão de ${disciplina}`,
      enunciado,
      alternativa_a: altA,
      alternativa_b: altB,
      alternativa_c: altC || 'Nenhuma das anteriores',
      alternativa_d: altD || 'Todas as anteriores',
      correta,
      resolucao_comentada: resolucao || 'Gabarito oficial confirmado pela equipe EPP.',
      simulado_id: simuladoVinculado || null
    }]);
    setTituloAtiv(''); setEnunciado(''); setAltA(''); setAltB(''); setAltC(''); setAltD(''); setResolucao('');
    carregarTudo();
    notificar('Questão publicada com sucesso!');
  };

  const excluirItem = async (tabela: string, id: string) => {
    await supabase.from(tabela).delete().eq('id', id);
    carregarTudo();
    notificar('Item removido com sucesso.');
  };

  const salvarSimulado = async () => {
    if (!tituloSim) return;
    await supabase.from('simulados').insert([{ titulo: tituloSim, serie_alvo: serieSim, duracao_minutos: duracaoSim, ativo: true }]);
    setTituloSim('');
    carregarTudo();
    notificar('Simulado criado com sucesso!');
  };

  const salvarTemaRedacao = async () => {
    if (!temaRedacao) return;
    await supabase.from('temas_redacao').update({ ativo: false }).eq('ativo', true);
    await supabase.from('temas_redacao').insert([{ titulo: temaRedacao, textos_apoio: textosApoio, ativo: true }]);
    setTemaRedacao(''); setTextosApoio('');
    notificar('Novo tema semanal de redação publicado!');
  };

  const corrigirRedacaoManual = async (id: string) => {
    const nota = prompt('Digite a nota do aluno (ex: 880):');
    if (!nota) return;
    const comentario = prompt('Digite o feedback pedagógico para o aluno:');
    await supabase.from('redacoes_enviadas').update({
      nota: parseFloat(nota),
      comentario_professor: comentario || 'Excelente evolução textual!',
      corrigida: true
    }).eq('id', id);
    carregarTudo();
    notificar('Nota e feedback enviados ao aluno!');
  };

  const corrigirRedacaoComIA = async (red: any) => {
    setCorrigindoId(red.id);
    try {
      const res = await fetch('/api/corrigir-redacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema: 'Tema Semanal EPP Nexo',
          texto: red.texto_redacao,
          serie: red.serie
        })
      });
      const data = await res.json();
      if (!res.ok) {
        notificar(`Erro na IA: ${data.error}`);
      } else {
        const av = data.avaliacao;
        const parecerCompleto = `Nota: ${av.nota_total}/1000 (C1: ${av.c1} | C2: ${av.c2} | C3: ${av.c3} | C4: ${av.c4} | C5: ${av.c5})\n\n✅ Pontos Fortes: ${av.pontos_fortes}\n\n🎯 O que melhorar: ${av.pontos_melhoria}\n\n💬 Parecer da Banca: ${av.comentario_geral}`;
        await supabase.from('redacoes_enviadas').update({
          nota: av.nota_total,
          comentario_professor: parecerCompleto,
          corrigida: true
        }).eq('id', red.id);
        carregarTudo();
        notificar(`Redação de ${red.aluno_nome} corrigida pela IA (${av.nota_total} pts)!`);
      }
    } catch {
      notificar('Erro ao conectar com a IA corretora.');
    } finally {
      setCorrigindoId(null);
    }
  };

  const salvarLivro = async () => {
    if (!tituloLivro || !urlPdf) return;
    await supabase.from('biblioteca').insert([{ titulo: tituloLivro, categoria: categoriaLivro, serie: serieLivro, url_pdf: urlPdf }]);
    setTituloLivro(''); setUrlPdf('');
    carregarTudo();
    notificar('Material publicado na Biblioteca Virtual!');
  };

  const cadastrarUsuario = async () => {
    if (!nomeAluno || !emailAluno || !senhaAluno) return notificar('Preencha nome, e-mail e senha!');
    const { error } = await supabase.from('usuarios_autorizados').insert([{
      nome: nomeAluno,
      email: emailAluno.trim().toLowerCase(),
      senha: senhaAluno.trim(),
      perfil: perfilUsuario,
      serie: serieAluno
    }]);
    if (error) return notificar('Erro: Este e-mail já está cadastrado.');
    setNomeAluno(''); setEmailAluno(''); setSenhaAluno('epp123');
    carregarTudo();
    notificar('Usuário cadastrado com senha e acesso liberado!');
  };

  const redefinirSenhaGestao = async (id: string, nome: string) => {
    const nova = prompt(`Digite a nova senha para ${nome}:`);
    if (!nova || nova.trim().length < 4) return;
    await supabase.from('usuarios_autorizados').update({ senha: nova.trim() }).eq('id', id);
    carregarTudo();
    notificar(`Senha de ${nome} atualizada com sucesso!`);
  };

  const cadastrarEmLote = async () => {
    if (!loteEmails.trim()) return;
    const emails = loteEmails.split(/[\n,;]+/).map(e => e.trim().toLowerCase()).filter(e => e.includes('@'));
    const registros = emails.map(email => ({
      nome: email.split('@')[0],
      email,
      senha: senhaLote.trim() || 'epp123',
      perfil: 'aluno',
      serie: serieLote
    }));
    await supabase.from('usuarios_autorizados').upsert(registros, { onConflict: 'email' });
    setLoteEmails('');
    carregarTudo();
    notificar(`${registros.length} alunos cadastrados para o ${serieLote} com senha "${senhaLote}"!`);
  };

  const sair = () => {
    localStorage.removeItem('epp_usuario');
    router.push('/login');
  };

  const totalAlunos = usuariosList.filter(u => u.perfil === 'aluno').length;
  const redacoesAguardando = redacoesPendentes.filter(r => !r.corrigida).length;

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col md:flex-row text-slate-900">
      <aside className="w-full md:w-72 bg-slate-950 text-white p-6 flex flex-col justify-between shrink-0 border-r-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500 text-slate-950 font-black text-xl px-3 py-1 rounded-xl border-2 border-white shadow-[3px_3px_0px_#F59E0B]">
              EPP NEXO
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 mb-6 font-medium">Central Pedagógica & Coordenação</p>

          <nav className="space-y-2">
            {[
              { id: 'alunos', label: 'Alunos & Cadastros', icon: Users, badge: String(totalAlunos) },
              { id: 'ia', label: 'Gerador IA de Listas', icon: Sparkles, badge: 'IA' },
              { id: 'atividade', label: 'Questões & Trilhas', icon: FilePlus2 },
              { id: 'simulado', label: 'Simulados', icon: CheckSquare },
              { id: 'redacao', label: 'Redação & IA Corretora', icon: PenSquare, badge: redacoesAguardando > 0 ? String(redacoesAguardando) : undefined },
              { id: 'biblioteca', label: 'Biblioteca Virtual', icon: BookPlus },
            ].map((item) => {
              const Icon = item.icon;
              const ativo = modulo === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setModulo(item.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-sm cursor-pointer ${
                    ativo
                      ? 'bg-amber-500 text-slate-950 border-2 border-white shadow-[3px_3px_0px_#ffffff]'
                      : 'hover:bg-slate-900 text-slate-300 border-2 border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" /> {item.label}
                  </span>
                  {item.badge && !ativo && (
                    <span className="text-[10px] bg-lime-400 text-slate-950 font-black px-2 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <a
            href="https://sistema-epp-rk66.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs px-4 py-3 rounded-xl border-2 border-white"
          >
            Sistema EPP <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <button onClick={sair} className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 px-4 py-3 rounded-xl cursor-pointer">
          <LogOut className="w-4 h-4" /> Sair da Gestão
        </button>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]">
            <p className="text-[10px] font-black uppercase text-slate-400">Alunos Cadastrados</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalAlunos}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_#F59E0B]">
            <p className="text-[10px] font-black uppercase text-slate-400">Banco de Questões</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{atividadesList.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_#06b6d4]">
            <p className="text-[10px] font-black uppercase text-slate-400">Simulados Ativos</p>
            <p className="text-2xl font-black text-cyan-600 mt-0.5">{simuladosList.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_#84cc16]">
            <p className="text-[10px] font-black uppercase text-slate-400">Redações Recebidas</p>
            <p className="text-2xl font-black text-lime-600 mt-0.5">{redacoesPendentes.length}</p>
          </div>
        </div>

        {mensagem && (
          <div className="mb-6 bg-lime-400 border-2 border-slate-900 text-slate-950 font-black px-5 py-3.5 rounded-2xl shadow-[4px_4px_0px_#0f172a] animate-pop-in flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {mensagem}
          </div>
        )}

        {/* MÓDULO ALUNOS & CADASTROS (EXCLUSIVO GESTÃO) */}
        {modulo === 'alunos' && (
          <div className="grid lg:grid-cols-2 gap-8 animate-fade-up">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-3">
                <h1 className="text-lg font-black">Cadastrar Novo Usuário (Com Senha)</h1>
                <input type="text" value={nomeAluno} onChange={(e) => setNomeAluno(e.target.value)} placeholder="Nome completo" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm" />
                <input type="email" value={emailAluno} onChange={(e) => setEmailAluno(e.target.value)} placeholder="E-mail de acesso" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm" />
                <div className="grid grid-cols-3 gap-2.5">
                  <input type="text" value={senhaAluno} onChange={(e) => setSenhaAluno(e.target.value)} placeholder="Senha inicial" className="p-3 border-2 border-amber-400 bg-amber-50 rounded-xl text-sm font-bold" />
                  <select value={perfilUsuario} onChange={(e) => setPerfilUsuario(e.target.value as any)} className="p-3 border-2 border-slate-200 rounded-xl text-sm font-bold">
                    <option value="aluno">Aluno</option><option value="gestao">Gestão</option>
                  </select>
                  <select value={serieAluno} onChange={(e) => setSerieAluno(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl text-sm font-bold">
                    <option>6º Ano</option><option>7º Ano</option><option>8º Ano</option><option>9º Ano</option>
                  </select>
                </div>
                <button onClick={cadastrarUsuario} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl text-sm cursor-pointer">
                  Concluir Cadastro
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#F59E0B] space-y-3">
                <h2 className="text-lg font-black flex items-center gap-2"><Layers className="w-4 h-4 text-amber-500" /> Cadastro Rápido de Turma em Lote</h2>
                <div className="grid grid-cols-2 gap-3">
                  <select value={serieLote} onChange={(e) => setSerieLote(e.target.value)} className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm font-bold">
                    <option>6º Ano</option><option>7º Ano</option><option>8º Ano</option><option>9º Ano</option>
                  </select>
                  <input type="text" value={senhaLote} onChange={(e) => setSenhaLote(e.target.value)} placeholder="Senha padrão da turma" className="w-full p-3 border-2 border-amber-400 bg-amber-50 rounded-xl text-sm font-bold" />
                </div>
                <textarea rows={4} value={loteEmails} onChange={(e) => setLoteEmails(e.target.value)} placeholder="Cole vários e-mails (um por linha ou separados por vírgula)..." className="w-full p-3 border-2 border-slate-200 rounded-xl text-xs" />
                <button onClick={cadastrarEmLote} className="w-full bg-amber-500 hover:bg-amber-400 font-black py-3.5 rounded-xl border-2 border-slate-900 text-sm cursor-pointer">
                  Cadastrar Turma Inteira
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-black">Usuários Cadastrados ({usuariosList.length})</h2>
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {usuariosList.map(u => (
                  <div key={u.id} className="bg-white p-4 rounded-2xl border-2 border-slate-200 flex justify-between items-center gap-3">
                    <div>
                      <p className="font-bold text-sm">
                        {u.nome}{' '}
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full uppercase">{u.perfil} • {u.serie}</span>
                      </p>
                      <p className="text-xs text-slate-400">{u.email} • Senha: <strong className="text-slate-700">{u.senha || 'epp123'}</strong></p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => redefinirSenhaGestao(u.id, u.nome)}
                        title="Alterar Senha"
                        className="text-amber-600 hover:bg-amber-50 p-2 rounded-xl cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button onClick={() => excluirItem('usuarios_autorizados', u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO IA GERADOR DE QUESTÕES */}
        {modulo === 'ia' && (
          <div className="max-w-5xl space-y-8 animate-fade-up">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-8 rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#F59E0B]">
              <span className="inline-flex items-center gap-1.5 bg-lime-400 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Inteligência Artificial EPP Nexo
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">Criador Inteligente de Questões por Nível</h1>

              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <div>
                  <label className="block text-[10px] font-black uppercase text-amber-300 mb-1">Série</label>
                  <select value={iaSerie} onChange={(e) => setIaSerie(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 text-sm font-bold">
                    <option>6º Ano</option><option>7º Ano</option><option>8º Ano</option><option>9º Ano</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-amber-300 mb-1">Disciplina</label>
                  <select value={iaDisciplina} onChange={(e) => setIaDisciplina(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 text-sm font-bold">
                    <option>Matemática</option><option>Linguagens</option><option>Ciências</option><option>Humanas</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-amber-300 mb-1">Assunto / Tema Detalhado</label>
                  <input type="text" value={iaTema} onChange={(e) => setIaTema(e.target.value)} placeholder="Ex: Equações do 1º Grau..." className="w-full p-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-amber-300 mb-1">Qtd. Questões</label>
                  <select value={iaQtd} onChange={(e) => setIaQtd(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 text-sm font-bold">
                    <option value={2}>2 Questões</option><option value={3}>3 Questões</option><option value={5}>5 Questões</option><option value={8}>8 Questões</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                {[
                  { nome: 'Fácil (Fixação)', desc: 'Conceitos diretos e base teórica' },
                  { nome: 'Médio (Contextualizado)', desc: 'Situações-problema e interpretação' },
                  { nome: 'Profundo (Desafio & Raciocínio)', desc: 'Análise crítica e múltiplas etapas' }
                ].map((nv) => (
                  <button
                    key={nv.nome}
                    type="button"
                    onClick={() => setIaNivel(nv.nome)}
                    className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                      iaNivel === nv.nome
                        ? 'bg-amber-500 text-slate-950 border-white font-black'
                        : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <p className="text-xs font-black">{nv.nome}</p>
                    <p className={`text-[11px] mt-0.5 ${iaNivel === nv.nome ? 'text-slate-900' : 'text-slate-400'}`}>{nv.desc}</p>
                  </button>
                ))}
              </div>

              {erroIa && (
                <div className="mt-4 bg-red-500/20 border border-red-400 text-red-200 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {erroIa}
                </div>
              )}

              <button
                onClick={gerarBateriaComIA}
                disabled={gerandoIa}
                className="mt-6 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black px-7 py-4 rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_#000000] flex items-center gap-2 text-sm cursor-pointer"
              >
                <Wand2 className={`w-4 h-4 ${gerandoIa ? 'animate-spin' : ''}`} />
                {gerandoIa ? 'A IA está elaborando as questões...' : 'Gerar Questões com IA Agora'}
              </button>
            </div>

            {bateriaGerada.length > 0 && (
              <div className="space-y-4 animate-pop-in">
                <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a]">
                  <div>
                    <h2 className="font-black text-lg">Questões Geradas ({bateriaGerada.length}) • {iaNivel}</h2>
                  </div>
                  <button onClick={publicarBateriaIA} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] flex items-center gap-2 text-sm cursor-pointer">
                    <PlusCircle className="w-4 h-4" /> Publicar Todas no Portal
                  </button>
                </div>

                {bateriaGerada.map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border-2 border-slate-200 space-y-3">
                    <span className="text-xs font-black text-amber-600 uppercase">Questão 0{idx + 1} • {item.titulo}</span>
                    <textarea
                      rows={3}
                      value={item.enunciado}
                      onChange={(e) => {
                        const copia = [...bateriaGerada];
                        copia[idx].enunciado = e.target.value;
                        setBateriaGerada(copia);
                      }}
                      className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium"
                    />
                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg border"><strong>A)</strong> {item.alternativa_a}</div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border"><strong>B)</strong> {item.alternativa_b}</div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border"><strong>C)</strong> {item.alternativa_c}</div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border"><strong>D)</strong> {item.alternativa_d}</div>
                    </div>
                    <p className="text-xs text-lime-900 bg-lime-100 p-3 rounded-xl font-bold">
                      Gabarito: Letra {item.correta} — {item.resolucao_comentada}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MÓDULO QUESTÕES MANUAIS */}
        {modulo === 'atividade' && (
          <div className="grid lg:grid-cols-2 gap-8 animate-fade-up">
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-4">
              <h1 className="text-xl font-black">Cadastrar Questão Manualmente</h1>
              <div className="grid grid-cols-2 gap-3">
                <select value={serieAtiv} onChange={(e) => setSerieAtiv(e.target.value)} className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm font-bold">
                  <option>6º Ano</option><option>7º Ano</option><option>8º Ano</option><option>9º Ano</option>
                </select>
                <select value={disciplina} onChange={(e) => setDisciplina(e.target.value)} className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm font-bold">
                  <option>Matemática</option><option>Linguagens</option><option>Ciências</option><option>Humanas</option>
                </select>
              </div>
              <select value={simuladoVinculado} onChange={(e) => setSimuladoVinculado(e.target.value)} className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50">
                <option value="">Atividade de Trilha Regular (Livre)</option>
                {simuladosList.map(s => <option key={s.id} value={s.id}>{s.titulo} ({s.serie_alvo})</option>)}
              </select>
              <input type="text" value={tituloAtiv} onChange={(e) => setTituloAtiv(e.target.value)} placeholder="Assunto / Título" className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm" />
              <textarea rows={3} value={enunciado} onChange={(e) => setEnunciado(e.target.value)} placeholder="Enunciado completo..." className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={altA} onChange={(e) => setAltA(e.target.value)} placeholder="Alternativa A" className="p-2.5 border-2 border-slate-200 rounded-xl text-xs" />
                <input type="text" value={altB} onChange={(e) => setAltB(e.target.value)} placeholder="Alternativa B" className="p-2.5 border-2 border-slate-200 rounded-xl text-xs" />
                <input type="text" value={altC} onChange={(e) => setAltC(e.target.value)} placeholder="Alternativa C" className="p-2.5 border-2 border-slate-200 rounded-xl text-xs" />
                <input type="text" value={altD} onChange={(e) => setAltD(e.target.value)} placeholder="Alternativa D" className="p-2.5 border-2 border-slate-200 rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-3 gap-3 items-center">
                <select value={correta} onChange={(e) => setCorreta(e.target.value)} className="w-full p-2.5 border-2 border-lime-500 bg-lime-50 font-black rounded-xl text-sm">
                  <option value="A">Letra A</option><option value="B">Letra B</option><option value="C">Letra C</option><option value="D">Letra D</option>
                </select>
                <input type="text" value={resolucao} onChange={(e) => setResolucao(e.target.value)} placeholder="Resolução comentada..." className="col-span-2 w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm" />
              </div>
              <button onClick={salvarAtividade} className="w-full bg-amber-500 hover:bg-amber-400 font-black py-3.5 rounded-xl border-2 border-slate-900 text-sm cursor-pointer">
                Publicar Questão
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-black">Questões Publicadas ({atividadesList.length})</h2>
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {atividadesList.map(a => (
                  <div key={a.id} className="bg-white p-4 rounded-2xl border-2 border-slate-200 flex justify-between items-start gap-3">
                    <div>
                      <span className="text-[10px] font-black bg-cyan-100 text-cyan-900 px-2.5 py-0.5 rounded-full">{a.serie} • {a.disciplina}</span>
                      <p className="font-bold text-sm mt-1.5">{a.titulo}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{a.enunciado}</p>
                    </div>
                    <button onClick={() => excluirItem('atividades', a.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO SIMULADOS */}
        {modulo === 'simulado' && (
          <div className="grid lg:grid-cols-2 gap-8 animate-fade-up">
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-4 h-fit">
              <h1 className="text-xl font-black">Criar Novo Simulado</h1>
              <input type="text" value={tituloSim} onChange={(e) => setTituloSim(e.target.value)} placeholder="Ex: 1º Simulado Bimestral EPP" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select value={serieSim} onChange={(e) => setSerieSim(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl text-sm font-bold">
                  <option>6º Ano</option><option>7º Ano</option><option>8º Ano</option><option>9º Ano</option>
                </select>
                <input type="number" value={duracaoSim} onChange={(e) => setDuracaoSim(Number(e.target.value))} placeholder="Minutos" className="p-3 border-2 border-slate-200 rounded-xl text-sm font-bold" />
              </div>
              <button onClick={salvarSimulado} className="w-full bg-cyan-400 text-slate-950 font-black py-3.5 rounded-xl border-2 border-slate-900 text-sm cursor-pointer">
                Criar Simulado
              </button>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-black">Simulados Ativos ({simuladosList.length})</h2>
              {simuladosList.map(s => (
                <div key={s.id} className="bg-white p-4 rounded-2xl border-2 border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">{s.serie_alvo} • {s.duracao_minutos} min</span>
                    <p className="font-bold text-sm mt-1">{s.titulo}</p>
                  </div>
                  <button onClick={() => excluirItem('simulados', s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MÓDULO REDAÇÃO */}
        {modulo === 'redacao' && (
          <div className="space-y-6 max-w-4xl animate-fade-up">
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-3">
              <h2 className="text-lg font-black">Publicar Tema da Semana</h2>
              <input type="text" value={temaRedacao} onChange={(e) => setTemaRedacao(e.target.value)} placeholder="Título do tema semanal..." className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm" />
              <textarea rows={3} value={textosApoio} onChange={(e) => setTextosApoio(e.target.value)} placeholder="Instruções e textos motivadores..." className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm" />
              <button onClick={salvarTemaRedacao} className="bg-amber-500 font-black px-6 py-3 rounded-xl border-2 border-slate-900 text-sm cursor-pointer">
                Atualizar Tema Ativo
              </button>
            </div>
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4">
              <h2 className="text-lg font-black">Redações Enviadas ({redacoesPendentes.length})</h2>
              {redacoesPendentes.map((red) => (
                <div key={red.id} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <p className="font-black text-sm">{red.aluno_nome} • {red.serie}</p>
                      <p className="text-[11px] text-slate-400">{red.aluno_email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {red.corrigida ? (
                        <span className="bg-lime-400 border border-slate-900 text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-full">Nota: {red.nota}</span>
                      ) : (
                        <>
                          <button
                            onClick={() => corrigirRedacaoComIA(red)}
                            disabled={corrigindoId === red.id}
                            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl border border-slate-900 text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            {corrigindoId === red.id ? 'IA Corrigindo...' : 'Corrigir com IA'}
                          </button>
                          <button onClick={() => corrigirRedacaoManual(red.id)} className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer">
                            Nota Manual
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">{red.texto_redacao}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MÓDULO BIBLIOTECA */}
        {modulo === 'biblioteca' && (
          <div className="grid lg:grid-cols-2 gap-8 animate-fade-up">
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-4 h-fit">
              <h1 className="text-xl font-black">Adicionar Material na Biblioteca</h1>
              <input type="text" value={tituloLivro} onChange={(e) => setTituloLivro(e.target.value)} placeholder="Título do Livro ou Apostila" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select value={categoriaLivro} onChange={(e) => setCategoriaLivro(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl text-sm font-bold">
                  <option>Apostila</option><option>Livro Paradidático</option><option>Mapa Mental</option>
                </select>
                <select value={serieLivro} onChange={(e) => setSerieLivro(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl text-sm font-bold">
                  <option>6º ao 9º Ano</option><option>6º Ano</option><option>7º Ano</option><option>8º Ano</option><option>9º Ano</option>
                </select>
              </div>
              <input type="url" value={urlPdf} onChange={(e) => setUrlPdf(e.target.value)} placeholder="Link do PDF (Google Drive da escola)" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm" />
              <button onClick={salvarLivro} className="w-full bg-lime-400 font-black py-3.5 rounded-xl border-2 border-slate-900 text-sm cursor-pointer">
                Publicar na Biblioteca
              </button>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-black">Acervo Publicado ({livrosList.length})</h2>
              {livrosList.map(l => (
                <div key={l.id} className="bg-white p-4 rounded-2xl border-2 border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full">{l.categoria} • {l.serie}</span>
                    <p className="font-bold text-sm mt-1">{l.titulo}</p>
                  </div>
                  <button onClick={() => excluirItem('biblioteca', l.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

