'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
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

    const usuarioEncontrado = data && data.length > 0 ? data[0] : null;

    if (!usuarioEncontrado) {
      // Acesso direto garantido para os e-mails principais da escola caso a chave pública esteja restrita
      if (emailLimpo === 'educaepp@gmail.com') {
        localStorage.setItem('epp_usuario', JSON.stringify({
          nome: 'Coordenação EPP',
          email: 'educaepp@gmail.com',
          perfil: 'gestao',
          serie: '9º Ano',
          xp: 0
        }));
        router.push('/gestao');
        return;
      }
      if (emailLimpo === 'viniciusemnsv@gmail.com') {
        localStorage.setItem('epp_usuario', JSON.stringify({
          nome: 'Aluno Teste EPP',
          email: 'viniciusemnsv@gmail.com',
          perfil: 'aluno',
          serie: '9º Ano',
          xp: 0
        }));
        router.push('/aluno');
        return;
      }

      setErro(error ? `Erro API: ${error.message}` : 'E-mail não autorizado. Peça à coordenação do EPP para liberar o seu acesso.');
      setCarregando(false);
      return;
    }

    localStorage.setItem('epp_usuario', JSON.stringify(usuarioEncontrado));

    if (usuarioEncontrado.perfil === 'gestao') {
      router.push('/gestao');
    } else {
      router.push('/aluno');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-6 text-slate-900">
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0f172a] p-8 space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <span className="bg-amber-500 text-white font-black text-sm px-3 py-1 rounded-lg border border-slate-900">
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
          <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-xl text-xs font-bold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1.5">E-mail Cadastrado</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@gmail.com"
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 focus:border-slate-900 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3.5 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] transition text-sm flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> {carregando ? 'Verificando acesso...' : 'Entrar Agora'}
          </button>
        </form>
      </div>
    </div>
  );
}
