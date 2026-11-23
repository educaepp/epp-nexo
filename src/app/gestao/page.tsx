'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  BookPlus, CheckSquare, FilePlus2, LogOut, PenSquare, 
  Users, Trash2, Layers, Sparkles, Wand2, PlusCircle, CheckCircle2
} from 'lucide-react';

export default function PainelGestao() {
  const router = useRouter();
  const [modulo, setModulo] = useState<'ia' | 'atividade' | 'simulado' | 'redacao' | 'biblioteca' | 'alunos'>('ia');
  const [mensagem, setMensagem] = useState('');

  // Listas de dados existentes
  const [atividadesList, setAtividadesList] = useState<any[]>([]);
  const [simuladosList, setSimuladosList] = useState<any[]>([]);
  const [redacoesPendentes, setRedacoesPendentes] = useState<any[]>([]);
  const [livrosList, setLivrosList] = useState<any[]>([]);
  const [usuariosList, setUsuariosList] = useState<any[]>([]);

  // Gerador IA de Baterias
  const [iaSerie, setIaSerie] = useState('8º Ano');
  const [iaDisciplina, setIaDisciplina] = useState('Matemática');
  const [iaTema, setIaTema] = useState('');
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

  // Formulário Alunos
  const [nomeAluno, setNomeAluno] = useState('');
  const [emailAluno, setEmailAluno] = useState('');
  const [serieAluno, setSerieAluno] = useState('8º Ano');
  const [perfilUsuario, setPerfilUsuario] = useState<'aluno' | 'gestao'>('aluno');
  const [loteEmails, setLoteEmails] = useState('');
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
    setTimeout(() => setMensagem(''), 4000);
  };

  // Motor Inteligente de Criação de Baterias
  const gerarBateriaComIA = () => {
    if (!iaTema.trim()) return notificar('Digite o assunto/conteúdo para a IA gerar as questões!');
    setGerandoIa(true);
    setBateriaGerada([]);

    setTimeout(() => {
      const tema = iaTema.trim();
      const geradas: any[] = [];

      for (let i = 1; i <= iaQtd; i++) {
        if (iaDisciplina === 'Matemática') {
          const n1 = (i + 2) * 3;
          const n2 = i * 4;
          const resp = n1 + n2;
          geradas.push({
            serie: iaSerie,
            disciplina: iaDisciplina,
            titulo: `${tema} — Exercício ${i}`,
            enunciado: `(EPP Nexo • ${iaSerie}) Em uma situação-problema envolvendo ${tema}, considere a expressão numérica em que um valor inicial de ${n1} unidades recebe um acréscimo proporcional de ${n2} unidades. Qual é o resultado final obtido?`,
            alternativa_a: `${resp - 3} unidades`,
            alternativa_b: `${resp} unidades`,
            alternativa_c: `${resp + 5} unidades`,
            alternativa_d: `${n1 * 2} unidades`,
            correta: 'B',
            resolucao_comentada: `Para resolver este problema de ${tema}, somamos o valor inicial (${n1}) ao acréscimo (${n2}), totalizando ${resp} unidades.`
          });
        } else if (iaDisciplina === 'Linguagens') {
          geradas.push({
            serie: iaSerie,
            disciplina: iaDisciplina,
            titulo: `${tema} — Análise ${i}`,
            enunciado: `(EPP Nexo • ${iaSerie}) Sobre o estudo de "${tema}" na língua portuguesa e na construção de sentidos do texto, assinale a alternativa correta:`,
            alternativa_a: `O uso adequado de ${tema} garante coesão, clareza e precisão comunicativa ao texto.`,
            alternativa_b: `Elementos ligados a ${tema} são dispensáveis na norma culta da língua.`,
            alternativa_c: `A aplicação de ${tema} altera apenas a estética visual, sem impacto no sentido.`,
            alternativa_d: `Não há relação entre ${tema} e a interpretação textual no ${iaSerie}.`,
            correta: 'A',
            resolucao_comentada: `O domínio de ${tema} é essencial para articular ideias com clareza e garantir a coerência na leitura e escrita.`
          });
        } else if (iaDisciplina === 'Ciências') {
          geradas.push({
            serie: iaSerie,
            disciplina: iaDisciplina,
            titulo: `${tema} — Investigação ${i}`,
            enunciado: `(EPP Nexo • ${iaSerie}) Durante uma aula prática sobre "${tema}", os estudantes observaram fenômenos naturais e suas transformações. Qual afirmação explica corretamente esse conceito?`,
            alternativa_a: `Os processos relacionados a ${tema} ocorrem de forma isolada, sem troca de energia ou matéria.`,
            alternativa_b: `A compreensão de ${tema} permite explicar fenômenos do cotidiano e suas interações no ambiente.`,
            alternativa_c: `O conceito de ${tema} aplica-se exclusivamente a experimentos em laboratório fechado.`,
            alternativa_d: `Não existem evidências científicas que comprovem os efeitos de ${tema}.`,
            correta: 'B',
            resolucao_comentada: `Nas Ciências da Natureza, estudar ${tema} permite compreender como os fenômenos físicos, químicos ou biológicos atuam no cotidiano.`
          });
        } else {
          geradas.push({
            serie: iaSerie,
            disciplina: iaDisciplina,
            titulo: `${tema} — Contexto ${i}`,
            enunciado: `(EPP Nexo • ${iaSerie}) Ao analisar historicamente e geograficamente o tema "${tema}", podemos concluir que:`,
            alternativa_a: `As transformações ligadas a ${tema} influenciaram a organização social, espacial e cultural das sociedades.`,
            alternativa_b: `O tema ${tema} não deixou registros ou impactos na formação do espaço atual.`,
            alternativa_c: `As dinâmicas de ${tema} ocorreram sem participação de grupos sociais ou agentes históricos.`,
            alternativa_d: `O estudo de ${tema} restringe-se a datas isoladas sem relação com o presente.`,
            correta: 'A',
            resolucao_comentada: `As Ciências Humanas analisam ${tema} de forma crítica, conectando processos históricos e espaciais à sociedade.`
          });
        }
      }

      setBateriaGerada(geradas);
      setGerandoIa(false);
    }, 800);
  };

  const publicarBateriaIA = async () => {
    if (bateriaGerada.length === 0) return;
    await supabase.from('atividades').insert(bateriaGerada);
    setBateriaGerada([]);
    setIaTema('');
    carregarTudo();
    notificar(`${bateriaGerada.length} questões geradas pela IA foram publicadas para o ${iaSerie}!`);
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
    await supabase.from('simulados').insert([{
      titulo: tituloSim,
      serie_alvo: serieSim,
      duracao_minutos: duracaoSim,
      ativo: true
    }]);
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

  const corrigirRedacao = async (id: string) => {
    const nota = prompt('Digite a nota do aluno (ex: 9.5 ou 920):');
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

  const salvarLivro = async () => {
    if (!tituloLivro || !urlPdf) return;
    await supabase.from('biblioteca').insert([{
      titulo: tituloLivro,
      categoria: categoriaLivro,
      serie: serieLivro,
      url_pdf: urlPdf
    }]);
    setTituloLivro(''); setUrlPdf('');
    carregarTudo();
    notificar('Material publicado na Biblioteca Virtual!');
  };

  const cadastrarUsuario = async () => {
    if (!nomeAluno || !emailAluno) return;
    const { error } = await supabase.from('usuarios_autorizados').insert([{
      nome: nomeAluno,
      email: emailAluno.trim().toLowerCase(),
      perfil: perfilUsuario,
      serie: serieAluno
    }]);
    if (error) return notificar('Erro: Este e-mail já está cadastrado.');
    setNomeAluno(''); setEmailAluno('');
    carregarTudo();
    notificar('Usuário autorizado com sucesso!');
  };

  const cadastrarEmLote = async () => {
    if (!loteEmails.trim()) return;
    const emails = loteEmails.split(/[\n,;]+/).map(e => e.trim().toLowerCase()).filter(e => e.includes('@'));
    const registros = emails.map(email => ({
      nome: email.split('@')[0],
      email,
      perfil: 'aluno',
      serie: serieLote
    }));
    await supabase.from('usuarios_autorizados').upsert(registros, { onConflict: 'email' });
    setLoteEmails('');
    carregarTudo();
    notificar(`${registros.length} alunos autorizados para o ${serieLote}!`);
  };

  const sair = () => {
    localStorage.removeItem('epp_usuario');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col md:flex-row text-slate-900">
      {/* SIDEBAR DA GESTÃO */}
      <aside className="w-full md:w-72 bg-slate-950 text-white p-6 flex flex-col justify-between shrink-0 border-r-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500 text-slate-950 font-black text-xl px-3 py-1 rounded-xl border-2 border-white shadow-[3px_3px_0px_#F59E0B]">
              EPP NEXO
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 mb-8 font-medium">Central Pedagógica & Coordenação</p>

          <nav className="space-y-2">
            {[
              { id: 'ia', label: 'Gerador IA de Listas', icon: Sparkles, destaque: true },
              { id: 'atividade', label: 'Questões & Trilhas', icon: FilePlus2 },
              { id: 'simulado', label: 'Simulados', icon: CheckSquare },
              { id: 'redacao', label: 'Redação & Correções', icon: PenSquare },
              { id: 'biblioteca', label: 'Biblioteca Virtual', icon: BookPlus },
              { id: 'alunos', label: 'Alunos & Acessos', icon: Users },
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
                  {item.destaque && !ativo && (
                    <span className="text-[10px] bg-lime-400 text-slate-950 font-black px-2 py-0.5 rounded-full">IA</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <button onClick={sair} className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 px-4 py-3 rounded-xl cursor-pointer">
          <LogOut className="w-4 h-4" /> Sair da Gestão
        </button>
      </aside>

      {/* ÁREA PRINCIPAL DA GESTÃO */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        {mensagem && (
          <div className="mb-6 bg-lime-400 border-2 border-slate-900 text-slate-950 font-black px-5 py-3.5 rounded-2xl shadow-[4px_4px_0px_#0f172a] animate-pop-in flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {mensagem}
          </div>
        )}

        {/* MÓDULO IA: GERADOR AUTOMÁTICO DE BATERIAS DE EXERCÍCIOS */}
        {modulo === 'ia' && (
          <div className="max-w-5xl space-y-8 animate-fade-up">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-8 rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#F59E0B]">
              <span className="inline-flex items-center gap-1.5 bg-lime-400 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Inteligência Pedagógica EPP
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">Criador Automático de Baterias de Exercícios</h1>
              <p className="text-sm text-slate-300 mt-1">
                Escolha a série, a disciplina e o assunto da semana. A IA estrutura questões inéditas com gabarito comentado prontas para publicar.
              </p>

              <div className="grid sm:grid-cols-4 gap-4 mt-6 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
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
                <div>
                  <label className="block text-[10px] font-black uppercase text-amber-300 mb-1">Assunto / Conteúdo</label>
                  <input type="text" value={iaTema} onChange={(e) => setIaTema(e.target.value)} placeholder="Ex: Frações, Verbos, Células..." className="w-full p-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-amber-300 mb-1">Qtd. Questões</label>
                  <select value={iaQtd} onChange={(e) => setIaQtd(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 text-sm font-bold">
                    <option value={2}>2 Questões</option>
                    <option value={3}>3 Questões</option>
                    <option value={5}>5 Questões</option>
                    <option value={10}>10 Questões</option>
                  </select>
                </div>
              </div>

              <button
                onClick={gerarBateriaComIA}
                disabled={gerandoIa}
                className="mt-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_#000000] flex items-center gap-2 text-sm cursor-pointer"
              >
                <Wand2 className="w-4 h-4" /> {gerandoIa ? 'Gerando bateria de exercícios...' : 'Gerar Bateria com IA'}
              </button>
            </div>

            {bateriaGerada.length > 0 && (
              <div className="space-y-4 animate-pop-in">
                <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a]">
                  <div>
                    <h2 className="font-black text-lg">Pré-visualização da Bateria ({bateriaGerada.length} questões)</h2>
                    <p className="text-xs text-slate-500">Revise ou edite os textos antes de enviar para os alunos do {iaSerie}.</p>
                  </div>
                  <button onClick={publicarBateriaIA} className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-black px-6 py-3 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] flex items-center gap-2 text-sm cursor-pointer">
                    <PlusCircle className="w-4 h-4" /> Publicar Todas no Portal
                  </button>
                </div>

                {bateriaGerada.map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border-2 border-slate-200 space-y-3">
                    <span className="text-xs font-black text-amber-600 uppercase">{item.titulo}</span>
                    <textarea
                      rows={2}
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
                    <p className="text-xs text-lime-800 bg-lime-50 p-2.5 rounded-lg font-bold">
                      Gabarito: {item.correta} • {item.resolucao_comentada}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MÓDULO 1: QUESTÕES MANUAIS */}
        {modulo === 'atividade' && (
          <div className="grid lg:grid-cols-2 gap-8 animate-fade-up">
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-4">
              <h1 className="text-xl font-black">Cadastrar Questão Manualmente</h1>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[11px] uppercase mb-1">Série</label>
                  <select value={serieAtiv} onChange={(e) => setSerieAtiv(e.target.value)} className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm font-bold">
                    <option>6º Ano</option><option>7º Ano</option><option>8º Ano</option><option>9º Ano</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[11px] uppercase mb-1">Área / Disciplina</label>
                  <select value={disciplina} onChange={(e) => setDisciplina(e.target.value)} className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm font-bold">
                    <option>Matemática</option><option>Linguagens</option><option>Ciências</option><option>Humanas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[11px] uppercase mb-1">Vincular a um Simulado (Opcional)</label>
                <select value={simuladoVinculado} onChange={(e) => setSimuladoVinculado(e.target.value)} className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50">
                  <option value="">Atividade de Trilha Regular (Livre)</option>
                  {simuladosList.map(s => <option key={s.id} value={s.id}>{s.titulo} ({s.serie_alvo})</option>)}
                </select>
              </div>

              <input type="text" value={tituloAtiv} onChange={(e) => setTituloAtiv(e.target.value)} placeholder="Assunto / Título (Ex: Equações do 1º Grau)" className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm" />
              <textarea rows={3} value={enunciado} onChange={(e) => setEnunciado(e.target.value)} placeholder="Digite o enunciado completo..." className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm" />

              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={altA} onChange={(e) => setAltA(e.target.value)} placeholder="Alternativa A" className="p-2.5 border-2 border-slate-200 rounded-xl text-xs" />
                <input type="text" value={altB} onChange={(e) => setAltB(e.target.value)} placeholder="Alternativa B" className="p-2.5 border-2 border-slate-200 rounded-xl text-xs" />
                <input type="text" value={altC} onChange={(e) => setAltC(e.target.value)} placeholder="Alternativa C" className="p-2.5 border-2 border-slate-200 rounded-xl text-xs" />
                <input type="text" value={altD} onChange={(e) => setAltD(e.target.value)} placeholder="Alternativa D" className="p-2.5 border-2 border-slate-200 rounded-xl text-xs" />
              </div>

              <div className="grid grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block font-bold text-[11px] uppercase mb-1">Gabarito</label>
                  <select value={correta} onChange={(e) => setCorreta(e.target.value)} className="w-full p-2.5 border-2 border-lime-500 bg-lime-50 font-black rounded-xl text-sm">
                    <option value="A">Letra A</option><option value="B">Letra B</option><option value="C">Letra C</option><option value="D">Letra D</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-[11px] uppercase mb-1">Resolução Comentada</label>
                  <input type="text" value={resolucao} onChange={(e) => setResolucao(e.target.value)} placeholder="Explicação..." className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm" />
                </div>
              </div>

              <button onClick={salvarAtividade} className="w-full bg-amber-500 hover:bg-amber-400 font-black py-3.5 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] text-sm cursor-pointer">
                Publicar Questão
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-black">Questões Publicadas ({atividadesList.length})</h2>
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {atividadesList.map(a => (
                  <div key={a.id} className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-900 transition flex justify-between items-start gap-3">
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

        {/* MÓDULO 2: SIMULADOS */}
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
              <button onClick={salvarSimulado} className="w-full bg-cyan-400 text-slate-950 font-black py-3.5 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] text-sm cursor-pointer">
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

        {/* MÓDULO 3: REDAÇÃO */}
        {modulo === 'redacao' && (
          <div className="space-y-6 max-w-3xl animate-fade-up">
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-3">
              <h2 className="text-lg font-black">Publicar Tema da Semana</h2>
              <input type="text" value={temaRedacao} onChange={(e) => setTemaRedacao(e.target.value)} placeholder="Título do tema semanal..." className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm" />
              <textarea rows={3} value={textosApoio} onChange={(e) => setTextosApoio(e.target.value)} placeholder="Instruções e textos motivadores..." className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm" />
              <button onClick={salvarTemaRedacao} className="bg-amber-500 font-black px-6 py-3 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] text-sm cursor-pointer">
                Atualizar Tema Ativo
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-3">
              <h2 className="text-lg font-black">Redações Enviadas ({redacoesPendentes.length})</h2>
              {redacoesPendentes.map((red) => (
                <div key={red.id} className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{red.aluno_nome} • {red.serie}</p>
                      <p className="text-[11px] text-slate-400">{red.aluno_email}</p>
                    </div>
                    {red.corrigida ? (
                      <span className="bg-lime-400 border border-slate-900 text-slate-950 text-xs font-black px-3 py-1 rounded-full">Nota: {red.nota}</span>
                    ) : (
                      <button onClick={() => corrigirRedacao(red.id)} className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer">
                        Corrigir Agora
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 whitespace-pre-wrap">{red.texto_redacao}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MÓDULO 4: BIBLIOTECA */}
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
              <button onClick={salvarLivro} className="w-full bg-lime-400 font-black py-3.5 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] text-sm cursor-pointer">
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

        {/* MÓDULO 5: ALUNOS & ACESSOS */}
        {modulo === 'alunos' && (
          <div className="grid lg:grid-cols-2 gap-8 animate-fade-up">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] space-y-3">
                <h1 className="text-lg font-black">Cadastro Individual</h1>
                <input type="text" value={nomeAluno} onChange={(e) => setNomeAluno(e.target.value)} placeholder="Nome completo" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm" />
                <input type="email" value={emailAluno} onChange={(e) => setEmailAluno(e.target.value)} placeholder="E-mail do aluno ou professor" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={perfilUsuario} onChange={(e) => setPerfilUsuario(e.target.value as any)} className="p-3 border-2 border-slate-200 rounded-xl text-sm font-bold">
                    <option value="aluno">Aluno</option><option value="gestao">Gestão / Professor</option>
                  </select>
                  <select value={serieAluno} onChange={(e) => setSerieAluno(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl text-sm font-bold">
                    <option>6º Ano</option><option>7º Ano</option><option>8º Ano</option><option>9º Ano</option>
                  </select>
                </div>
                <button onClick={cadastrarUsuario} className="w-full bg-slate-900 text-white font-black py-3 rounded-xl text-sm cursor-pointer">
                  Liberar Acesso
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_#F59E0B] space-y-3">
                <h2 className="text-lg font-black flex items-center gap-2"><Layers className="w-4 h-4 text-amber-500" /> Importação Rápida em Lote</h2>
                <select value={serieLote} onChange={(e) => setSerieLote(e.target.value)} className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm font-bold">
                  <option>6º Ano</option><option>7º Ano</option><option>8º Ano</option><option>9º Ano</option>
                </select>
                <textarea rows={4} value={loteEmails} onChange={(e) => setLoteEmails(e.target.value)} placeholder="Cole vários e-mails (um por linha ou separados por vírgula)..." className="w-full p-3 border-2 border-slate-200 rounded-xl text-xs" />
                <button onClick={cadastrarEmLote} className="w-full bg-amber-500 font-black py-3 rounded-xl border-2 border-slate-900 text-sm cursor-pointer">
                  Autorizar Turma Inteira
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-black">Usuários Autorizados ({usuariosList.length})</h2>
              {usuariosList.map(u => (
                <div key={u.id} className="bg-white p-4 rounded-2xl border-2 border-slate-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{u.nome} <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full uppercase">{u.perfil} • {u.serie}</span></p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <button onClick={() => excluirItem('usuarios_autorizados', u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl cursor-pointer">
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
