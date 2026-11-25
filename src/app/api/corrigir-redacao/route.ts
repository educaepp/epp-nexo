'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Lock, Mail, ArrowLeft, AlertCircle, Loader2, 
  CheckCircle2, KeyRound, Eye, EyeOff, ShieldAlert 
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<'login' | 'esqueci'>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [etapaRecuperacao, setEtapaRecuperacao] = useState<1 | 2>(1);
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [codigoGerado, setCodigoGerado] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [voltando, setVoltando] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      setErro('Preencha o e-mail e a senha cadastrados.');
      setCarregando(false);
      return;
    }

    let usuarioEncontrado: any = null;
    let erroSupabase: string | null = null;

    try {
      const { data, error } = await supabase
        .from('usuarios_autorizados')
        .select('*')
        .ilike('email', emailLimpo)
        .limit(1);

      if (error) erroSupabase = error.message;
      if (data && data.length > 0) usuarioEncontrado = data[0];
    } catch (err: any) {
      erroSupabase = err.message;
    }

    // Fallback seguro caso o banco ainda não esteja conectado ou retorne Invalid API key
    if (!usuarioEncontrado) {
      if (emailLimpo === 'educaepp@gmail.com' && ['epp123', 'educaepp2026', 'vinitopbr123'].includes(senhaLimpa)) {
        usuarioEncontrado = {
          nome: 'Coordenação EPP',
          email: 'educaepp@gmail.com',
          perfil: 'gestao',
          serie: '9º Ano',
          xp: 0,
          senha: senhaLimpa
        };
      } else if (emailLimpo === 'viniciusemnsv@gmail.com' && ['epp123', 'vinitopbr123'].includes(senhaLimpa)) {
        usuarioEncontrado = {
          nome: 'Vinicius',
          email: 'viniciusemnsv@gmail.com',
          perfil: 'aluno',
          serie: '9º Ano',
          xp: 0,
          senha: senhaLimpa
        };
      }
    }

    if (!usuarioEncontrado) {
      if (erroSupabase?.toLowerCase().includes('invalid api key')) {
        setErro('Chave do Supabase inválida na Vercel (NEXT_PUBLIC_SUPABASE_ANON_KEY). Atualize nas configurações da Vercel e faça Redeploy.');
      } else {
        setErro(erroSupabase ? `Erro API: ${erroSupabase}` : 'E-mail não cadastrado. Solicite à Gestão do EPP que realize o seu cadastro.');
      }
      setCarregando(false);
      return;
    }

    const senhaBanco = usuarioEncontrado.senha || 'epp123';
    if (senhaBanco !== senhaLimpa) {
      setErro('Senha incorreta. Tente novamente ou clique em "Esqueci minha senha".');
      setCarregando(false);
      return;
    }

    setSucesso('Acesso liberado! Entrando...');
    localStorage.setItem('epp_usuario', JSON.stringify(usuarioEncontrado));

    setTimeout(() => {
      if (usuarioEncontrado.perfil === 'gestao') {
        router.push('/gestao');
      } else {
        router.push('/aluno');
      }
    }, 450);
  };

  const iniciarRecuperacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    const emailLimpo = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('usuarios_autorizados')
      .select('*')
      .ilike('email', emailLimpo)
      .limit(1);

    if (error) {
      setErro(`Erro ao conectar ao banco: ${error.message}`);
      setCarregando(false);
      return;
    }

    if (!data || data.length === 0) {
      setErro('E-mail não encontrado no sistema. Apenas usuários cadastrados pela Gestão podem redefinir a senha.');
      setCarregando(false);
      return;
    }

    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    await supabase
      .from('usuarios_autorizados')
      .update({ codigo_recuperacao: codigo })
      .eq('email', emailLimpo);

    setCodigoGerado(codigo);
    setEtapaRecuperacao(2);
    setCarregando(false);
  };

  const concluirRecuperacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    if (codigoDigitado.trim() !== codigoGerado) {
      setErro('Código de verificação inválido.');
      setCarregando(false);
      return;
    }

    if (novaSenha.trim().length < 4) {
      setErro('A nova senha deve ter pelo menos 4 caracteres.');
      setCarregando(false);
      return;
    }

    const emailLimpo = email.trim().toLowerCase();
    await supabase
      .from('usuarios_autorizados')
      .update({ senha: novaSenha.trim(), codigo_recuperacao: null })
      .eq('email', emailLimpo);

    setSucesso('Senha redefinida com sucesso! Faça login agora.');
    setCarregando(false);
    setSenha('');
    setCodigoDigitado('');
    setNovaSenha('');
    setEtapaRecuperacao(1);
    setModo('login');
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

        {modo === 'login' ? (
          <>
            <div>
              <h1 className="text-2xl font-black">Entrar na Plataforma</h1>
              <p className="text-xs text-slate-500 mt-1">
                Informe o e-mail e a senha fornecidos pela Gestão do EPP.
              </p>
            </div>

            {erro && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 p-3.5 rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-up">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{erro}</span>
              </div>
            )}

            {sucesso && (
              <div className="bg-lime-100 border-2 border-lime-500 text-lime-900 p-3.5 rounded-xl text-xs font-black flex items-center gap-2 animate-fade-up">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> <span>{sucesso}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1.5">E-mail Cadastrado</label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-amber-600 transition-colors absolute left-3.5 top-3.5"
@'
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { tema, texto, fotoBase64, serie } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY não configurada.' }, { status: 500 });
    }

    const instrucao = `Você é uma banca corretora oficial de redação escolar para alunos do ${serie || 'Ensino Fundamental'} do EPP Nexo.
Tema: "${tema}".
Avalie a redação enviada (seja por texto ou pela imagem manuscrita anexada) nas 5 competências (0 a 200 cada, total 0 a 1000).
Além das notas, gere até 4 marcações visuais com coordenadas percentuais (x, y de 15 a 85) apontando trechos importantes na folha e um feedback acolhedor e técnico.

Retorne APENAS um JSON puro neste formato exato:
{
  "nota_total": 840,
  "c1": 160,
  "c2": 180,
  "c3": 160,
  "c4": 160,
  "c5": 180,
  "pontos_fortes": "Resumo dos acertos",
  "pontos_melhoria": "O que ajustar",
  "comentario_geral": "Parecer completo e motivador",
  "marcacoes": [
    { "x": 30, "y": 25, "cor": "verde", "texto": "Ótima abertura e apresentação do tema!" },
    { "x": 55, "y": 60, "cor": "amarelo", "texto": "Atenção à conectividade entre os parágrafos." }
  ]
}`;

    const userContent: any[] = [{ type: 'text', text: texto ? `${instrucao}\n\nTexto: ${texto}` : instrucao }];
    if (fotoBase64) {
      userContent.push({
        type: 'image_url',
        image_url: { url: fotoBase64 }
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://epp-nexo.vercel.app',
        'X-Title': 'EPP Nexo Redacao Foto IA'
      },
      body: JSON.stringify({
        model: fotoBase64 ? 'google/gemini-2.0-flash-exp:free' : 'openrouter/free',
        messages: [{ role: 'user', content: userContent }],
        temperature: 0.4
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Erro na correção IA.' }, { status: 500 });
    }

    let raw = data.choices?.[0]?.message?.content || '{}';
    raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const avaliacao = JSON.parse(raw);

    return NextResponse.json({ avaliacao });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Falha ao processar redação.' }, { status: 500 });
  }
}
