import Link from 'next/link';
import { BookOpen, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="bg-white border-b-2 border-slate-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white font-black text-2xl px-3 py-1 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]">
            EPP <span className="text-slate-900">NEXO</span>
          </div>
          <span className="hidden sm:inline-block text-xs font-bold bg-cyan-100 text-cyan-800 px-2.5 py-1 rounded-full border border-cyan-300">
            6º ao 9º Ano • Reforço & Acompanhamento
          </span>
        </div>
        <div className="flex gap-3">
          <Link href="/aluno" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] transition">
            Sou Aluno
          </Link>
          <Link href="/gestao" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition">
            Gestão
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-lime-200 text-slate-900 font-bold px-4 py-1.5 rounded-full border-2 border-slate-900 mb-6">
          <Sparkles className="w-4 h-4" /> Plataforma Exclusiva dos Estudantes EPP
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mb-6">
          Seu estudo ativo, <span className="text-amber-500 underline decoration-slate-900">organizado</span> e sem distrações.
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
          Trilhas de exercícios comentados, simulados cronometrados, oficina semanal de redação e biblioteca virtual completa para você dominar todas as matérias do 6º ao 9º ano.
        </p>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a]">
            <div className="w-12 h-12 bg-cyan-400 rounded-xl border-2 border-slate-900 flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-slate-900" />
            </div>
            <h3 className="font-black text-xl mb-2">Listas & Simulados</h3>
            <p className="text-slate-600 text-sm">Resolva questões direcionadas para sua série com gabarito comentado passo a passo.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a]">
            <div className="w-12 h-12 bg-amber-400 rounded-xl border-2 border-slate-900 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-slate-900" />
            </div>
            <h3 className="font-black text-xl mb-2">Oficina de Redação</h3>
            <p className="text-slate-600 text-sm">Tema novo toda semana com correção detalhada da equipe pedagógica EPP.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a]">
            <div className="w-12 h-12 bg-lime-400 rounded-xl border-2 border-slate-900 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-slate-900" />
            </div>
            <h3 className="font-black text-xl mb-2">Biblioteca Virtual</h3>
            <p className="text-slate-600 text-sm">Apostilas, mapas mentais e livros paradidáticos organizados por ano escolar.</p>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-slate-500 border-t border-slate-200">
        EPP Nexo • Ambiente Pedagógico Restrito • Desenvolvido para Team EPP
      </footer>
    </div>
  );
}
