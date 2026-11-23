'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [voltando, setVoltando] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo) {
      setErro('Digite o seu e-mail cadastrado.');
      setCarregando(false);
      return;
    }

    const { data, error } = await supabase
      .from('usuarios_autorizados')
      .select('*')
      .ilike('email', emailLimpo)
      .limit(1);

    let usuarioEncontrado = data && data.length > 0 ? data[0] : null;

    if (!usuarioEncontrado) {
      if (emailLimpo === 'educaepp@gmail.com') {
        usuarioEncontrado = {
          nome: 'Coordenação EPP',
          email: 'educaepp@gmail.com',
          perfil: 'gestao',
          serie: '9º Ano',
          xp: 0
        };
      } else if (emailLimpo === 'viniciusemnsv@gmail.com') {
        usuarioEncontrado = {
          nome: 'Aluno Teste EPP',
          email: 'viniciusemnsv@gmail.com',
          perfil: 'aluno',
          serie: '9º Ano',
          xp: 0
        };
      }
    }

    if (!usuarioEncontrado) {
      setErro(error ? `Erro API: ${error.message}` : 'E-mail não autorizado. Peça à coordenação do EPP para liberar o seu acesso.');
      setCarregando(false);
      return;
    }

    setSucesso(true);
    localStorage.setItem('epp_usuario', JSON.stringify(usuarioEncontrado));

    setTimeout(() => {
      if (usuarioEncontrado.perfil === 'gestao') {
        router.push('/gestao');
      } else {
        router.push('/aluno');
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-6 text-slate-900 relative">
      {(carregando || voltando) && (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-amber-200 z-50">
          <div className="h-full bg-amber-500 animate-loading-bar" />
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0f172a] p-8 space-y-6 animate-pop-in">
        <div className="flex justify-between items-center">
          <button
            onClick={() => { setVoltando(true); router.push('/'); }}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <span className="bg-amber-500 text-white font-black text-sm px-3 py-1 rounded-lg border border-slate-900 shadow-[2px_2px_0px_#0f172a]">
            EPP NEXO
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-black">Entrar na Plataforma</h1>
          <p className="text-xs text-slate-500 mt-1">
            Digite o e-mail autorizado pela escola para acessar o Portal do Aluno ou o Painel da Gestão.
          </p>
        </div>

        {erro && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 p-3.5 rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-up">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1.5">E-mail Cadastrado</label>
            <div className="relative group">
              <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-amber-600 transition-colors absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                disabled={carregando}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@gmail.com"
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 focus:border-slate-900 focus:shadow-[3px_3px_0px_#F59E0B] rounded-xl text-sm outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className={`w-full font-black py-3.5 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:shadow-[5px_5px_0px_#0f172a] hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2 cursor-pointer ${
              sucesso ? 'bg-lime-400 text-slate-950' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            {sucesso ? (
              <><CheckCircle2 className="w-4 h-4" /> Acesso Liberado! Entrando...</>
            ) : carregando ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verificando acesso...</>
            ) : (
              <><Lock className="w-4 h-4" /> Entrar Agora</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
