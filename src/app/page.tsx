'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, CheckCircle2, Flame, ShieldCheck, ArrowRight, 
  Loader2, ExternalLink, Phone, Baby 
} from 'lucide-react';

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

      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-white font-black text-xl px-3 py-1 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:-rotate-2 transition-transform cursor-default">
            EPP <span className="text-slate-950">NEXO</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://vercel.com/sistema-epp/sistema-epp-rk66"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 bg-cyan-100 hover:bg-cyan-200 text-cyan-950 font-black text-xs px-4 py-2.5 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]"
          >
            Sistema EPP <ExternalLink className="w-3.5 h-3.5" />
          </a>

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

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col justify-center space-y-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-up">
            <span className="inline-block bg-lime-400 border-2 border-slate-900 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase shadow-[2px_2px_0px_#0f172a]">
              Reforço Escolar • 6º ao 9º Ano
            </span>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight text-slate-950">
              Estudo ativo, simulados e redação em um só lugar.
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Plataforma exclusiva do reforço EPP. Resolva listas interativas, acumule XP, faça simulados cronometrados e envie suas redações para correção com IA.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => irPara('/login', 'aluno')}
                disabled={!!navegando}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-6 py-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:shadow-[6px_6px_0px_#0f172a] hover:-translate-y-0.5 cursor-pointer"
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
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm px-5 py-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:shadow-[6px_6px_0px_#0f172a] hover:-translate-y-0.5 cursor-pointer"
              >
                {navegando === 'gestao' ? (
                  <><Loader2 className="w-5 h-5 animate-spin text-amber-600" /> Abrindo Gestão...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5 text-amber-600" /> Área da Gestão</>
                )}
              </button>

              <a
                href="https://vercel.com/sistema-epp/sistema-epp-rk66"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm px-5 py-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:shadow-[6px_6px_0px_#0f172a] hover:-translate-y-0.5"
              >
                Ir para Sistema EPP <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-3xl border-2 border-slate-950 shadow-[8px_8px_0px_#F59E0B] hover:shadow-[10px_10px_0px_#F59E0B] hover:-translate-y-1 transition-all duration-300 space-y-6 animate-pop-in">
            <h2 className="text-xl font-black text-amber-400">O que você encontra no EPP Nexo:</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Questões Interativas com XP & Tutor IA</p>
                  <p className="text-slate-400 text-xs">Correção imediata, apostila PDF personalizada e explicação passo a passo.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors">
                <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-bold">Simulados Cronometrados & Ranking</p>
                  <p className="text-slate-400 text-xs">Treino real com tempo marcado e pódio semanal da escola.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors">
                <BookOpen className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Oficina de Redação & Biblioteca PDF</p>
                  <p className="text-slate-400 text-xs">Envio semanal de redação com correção por competências e apostilas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BANNER EDUCAÇÃO INFANTIL */}
        <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0f172a] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-up">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center shrink-0">
              <Baby className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase bg-cyan-100 text-cyan-950 px-2.5 py-0.5 rounded-full border border-slate-900">
                Atendimento Especializado
              </span>
              <h3 className="text-xl font-black mt-1">Para estudantes da Educação Infantil</h3>
              <p className="text-xs text-slate-600 mt-1">
                Acompanhamento pedagógico dedicado para os pequenos. Entre em contato diretamente com a nossa equipe:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://wa.me/5581993972138"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs px-5 py-3.5 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]"
            >
              <Phone className="w-4 h-4" /> (81) 99397-2138
            </a>
            <a
              href="https://instagram.com/educaepp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-5 py-3.5 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_#F59E0B]"
            >
              <svg className="w-4 h-4 text-amber-400 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              @educaepp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
