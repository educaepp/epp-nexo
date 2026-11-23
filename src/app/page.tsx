'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle2, Flame, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [navegando, setNavegando] = useState<string | null>(null);

  const irPara = (destino: string, tipo: string) => {
    setNavegando(tipo);
    router.push(destino);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900 flex flex-col relative overflow-x-hidden">
      {navegando && (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-amber-200 z-50">
          <div className="h-full bg-amber-500 animate-loading-bar" />
        </div>
      )}

      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-white font-black text-xl px-3 py-1 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:-rotate-2 transition-transform cursor-default">
            EPP <span className="text-slate-950">NEXO</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => irPara('/login', 'header')}
            disabled={!!navegando}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer"
          >
            {navegando === 'header' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Acessar Plataforma
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-up">
            <span className="inline-block bg-lime-400 border-2 border-slate-900 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase shadow-[2px_2px_0px_#0f172a]">
              Reforço Escolar • 6º ao 9º Ano
            </span>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight text-slate-950">
              Estudo ativo, simulados e redação em um só lugar.
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Plataforma exclusiva do reforço EPP. Resolva listas interativas, acumule XP, faça simulados cronometrados e envie suas redações para correção.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => irPara('/login', 'aluno')}
                disabled={!!navegando}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base px-7 py-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:shadow-[6px_6px_0px_#0f172a] hover:-translate-y-0.5 cursor-pointer"
              >
                {navegando === 'aluno' ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Abrindo Portal...</>
                ) : (
                  <>Entrar como Aluno <ArrowRight className="w-5 h-5" /></>
                )}
              </button>

              <button
                onClick={() => irPara('/login?perfil=gestao', 'gestao')}
                disabled={!!navegando}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold text-base px-6 py-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:shadow-[6px_6px_0px_#0f172a] hover:-translate-y-0.5 cursor-pointer"
              >
                {navegando === 'gestao' ? (
                  <><Loader2 className="w-5 h-5 animate-spin text-amber-600" /> Abrindo Gestão...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5 text-amber-600" /> Área da Gestão</>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-3xl border-2 border-slate-950 shadow-[8px_8px_0px_#F59E0B] hover:shadow-[10px_10px_0px_#F59E0B] hover:-translate-y-1 transition-all duration-300 space-y-6 animate-pop-in">
            <h2 className="text-xl font-black text-amber-400">O que você encontra no EPP Nexo:</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Questões Interativas com XP</p>
                  <p className="text-slate-400 text-xs">Correção imediata com resolução comentada por série e disciplina.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors">
                <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-bold">Simulados Cronometrados</p>
                  <p className="text-slate-400 text-xs">Treino real com tempo marcado e resultado automático.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors">
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
