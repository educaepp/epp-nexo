import Link from 'next/link';
import { BookOpen, CheckCircle2, Flame, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-white font-black text-xl px-3 py-1 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]">
            EPP <span className="text-slate-950">NEXO</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-5 py-2.5 rounded-full transition">
            Acessar Plataforma
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-lime-400 border-2 border-slate-900 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase">
              Reforço Escolar • 6º ao 9º Ano
            </span>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight text-slate-950">
              Estudo ativo, simulados e redação em um só lugar.
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Plataforma exclusiva do reforço EPP. Resolva listas interativas, acumule XP, faça simulados cronometrados e envie suas redações para correção.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/login" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-base px-7 py-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] transition">
                Entrar como Aluno <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login?perfil=gestao" className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-base px-6 py-4 rounded-2xl border-2 border-slate-900 transition">
                <ShieldCheck className="w-5 h-5 text-amber-600" /> Área da Gestão
              </Link>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-3xl border-2 border-slate-950 shadow-[8px_8px_0px_#F59E0B] space-y-6">
            <h2 className="text-xl font-black text-amber-400">O que você encontra no EPP Nexo:</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Questões Interativas com XP</p>
                  <p className="text-slate-400 text-xs">Correção imediata com resolução comentada por série e disciplina.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Simulados Cronometrados</p>
                  <p className="text-slate-400 text-xs">Treino real com tempo marcado e resultado automático.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Oficina de Redação & Biblioteca PDF</p>
                  <p className="text-slate-400 text-xs">Envio semanal de redação com nota e apostilas integradas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
