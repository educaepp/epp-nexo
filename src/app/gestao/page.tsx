'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BookPlus, CheckSquare, FilePlus2, Home, PenSquare, Users } from 'lucide-react';

export default function PainelGestao() {
  const [modulo, setModulo] = useState<'atividade' | 'simulado' | 'redacao' | 'biblioteca' | 'alunos'>('atividade');
  const [mensagem, setMensagem] = useState('');

  const notificar = (texto: string) => {
    setMensagem(texto);
    setTimeout(() => setMensagem(''), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col justify-between">
        <div>
          <div className="font-black text-2xl text-amber-400 mb-1">EPP NEXO</div>
          <p className="text-xs text-slate-400 mb-8">Painel da Gestão Pedagógica</p>

          <nav className="space-y-2">
            {[
              { id: 'atividade', label: 'Lançar Atividade', icon: FilePlus2 },
              { id: 'simulado', label: 'Criar Simulado', icon: CheckSquare },
              { id: 'redacao', label: 'Redação & Correções', icon: PenSquare },
              { id: 'biblioteca', label: 'Biblioteca Virtual', icon: BookPlus },
              { id: 'alunos', label: 'Alunos Autorizados', icon: Users },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setModulo(item.id as 'atividade' | 'simulado' | 'redacao' | 'biblioteca' | 'alunos')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                    modulo === item.id ? 'bg-amber-500 text-slate-950' : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <Link href="/" className="mt-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <Home className="w-4 h-4" /> Voltar ao Início
        </Link>
      </aside>

      <main className="flex-1 p-8">
        {mensagem && (
          <div className="mb-6 bg-lime-400 border-2 border-slate-900 text-slate-950 font-black px-4 py-3 rounded-xl shadow-[3px_3px_0px_#0f172a]">
            {mensagem}
          </div>
        )}

        {modulo === 'atividade' && (
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-900 max-w-2xl">
            <h1 className="text-2xl font-black mb-4">Lançar Nova Lista de Atividades</h1>
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-sm mb-1">Turma / Ano</label>
                <select className="w-full p-2.5 border-2 border-slate-900 rounded-xl">
                  <option>6º Ano</option>
                  <option>7º Ano</option>
                  <option>8º Ano</option>
                  <option>9º Ano</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">Disciplina</label>
                <input type="text" placeholder="Ex: Matemática, Português, Ciências..." className="w-full p-2.5 border-2 border-slate-900 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">Enunciado da Questão</label>
                <textarea rows={3} placeholder="Digite a pergunta..." className="w-full p-2.5 border-2 border-slate-900 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">Resolução Comentada (aparece após o aluno responder)</label>
                <textarea rows={2} placeholder="Explique passo a passo como resolver..." className="w-full p-2.5 border-2 border-slate-900 rounded-xl" />
              </div>
              <button onClick={() => notificar('Atividade publicada para os alunos!')} className="bg-amber-500 font-black px-6 py-3 rounded-xl border-2 border-slate-900">
                Publicar Atividade
              </button>
            </div>
          </div>
        )}

        {modulo === 'simulado' && (
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-900 max-w-2xl">
            <h1 className="text-2xl font-black mb-4">Agendar Simulado</h1>
            <div className="space-y-4">
              <input type="text" placeholder="Título do Simulado (Ex: 1º Simulado Bimestral)" className="w-full p-2.5 border-2 border-slate-900 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Tempo limite (minutos)" className="w-full p-2.5 border-2 border-slate-900 rounded-xl" />
                <select className="w-full p-2.5 border-2 border-slate-900 rounded-xl">
                  <option>Todas as turmas (6º ao 9º)</option>
                  <option>Apenas 9º Ano</option>
                </select>
              </div>
              <button onClick={() => notificar('Simulado criado e liberado no calendário!')} className="bg-cyan-400 font-black px-6 py-3 rounded-xl border-2 border-slate-900">
                Salvar Simulado
              </button>
            </div>
          </div>
        )}

        {modulo === 'redacao' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-900">
              <h2 className="text-xl font-black mb-3">Definir Tema da Redação da Semana</h2>
              <input type="text" placeholder="Digite o tema semanal..." className="w-full p-2.5 border-2 border-slate-900 rounded-xl mb-3" />
              <button onClick={() => notificar('Novo tema de redação atualizado!')} className="bg-amber-500 font-black px-5 py-2 rounded-xl border-2 border-slate-900">
                Atualizar Tema
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-slate-900">
              <h2 className="text-xl font-black mb-3">Redações Pendentes de Correção (1)</h2>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 flex justify-between items-center">
                <div>
                  <p className="font-bold">João Pedro Silva • 8º Ano</p>
                  <p className="text-xs text-slate-500">Enviado hoje • 210 palavras</p>
                </div>
                <button onClick={() => notificar('Nota e comentários enviados ao aluno!')} className="bg-lime-400 font-bold px-4 py-2 rounded-xl border-2 border-slate-900 text-sm">
                  Lançar Nota & Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        {modulo === 'biblioteca' && (
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-900 max-w-2xl">
            <h1 className="text-2xl font-black mb-4">Adicionar Livro / Apostila na Biblioteca</h1>
            <div className="space-y-4">
              <input type="text" placeholder="Título do Material" className="w-full p-2.5 border-2 border-slate-900 rounded-xl" />
              <input type="url" placeholder="Link do PDF (Google Drive ou Supabase Storage)" className="w-full p-2.5 border-2 border-slate-900 rounded-xl" />
              <select className="w-full p-2.5 border-2 border-slate-900 rounded-xl">
                <option>6º ao 9º Ano (Geral)</option>
                <option>6º Ano</option>
                <option>7º Ano</option>
                <option>8º Ano</option>
                <option>9º Ano</option>
              </select>
              <button onClick={() => notificar('Material adicionado à Biblioteca Virtual!')} className="bg-lime-400 font-black px-6 py-3 rounded-xl border-2 border-slate-900">
                Publicar na Biblioteca
              </button>
            </div>
          </div>
        )}

        {modulo === 'alunos' && (
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-900 max-w-2xl">
            <h1 className="text-2xl font-black mb-2">Controle de Acesso Restrito</h1>
            <p className="text-sm text-slate-600 mb-4">Apenas os e-mails ou matrículas cadastrados aqui conseguem entrar no EPP Nexo.</p>
            <div className="flex gap-2 mb-4">
              <input type="email" placeholder="E-mail do aluno matriculado..." className="flex-1 p-2.5 border-2 border-slate-900 rounded-xl" />
              <button onClick={() => notificar('Aluno autorizado com sucesso!')} className="bg-slate-900 text-white font-bold px-5 rounded-xl">
                Autorizar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
