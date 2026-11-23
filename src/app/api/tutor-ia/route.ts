import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { serie, disciplina, enunciado, alternativaEscolhida, alternativaCorreta } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Chave OPENROUTER_API_KEY ausente.' }, { status: 500 });
    }

    const prompt = `Você é o Tutor Inteligente do EPP Nexo ajudando um aluno do ${serie} na matéria de ${disciplina}.
Questão: "${enunciado}"
O aluno marcou a alternativa ${alternativaEscolhida}, mas o gabarito correto é ${alternativaCorreta}.
Explique em 3 tópicos curtos, didáticos e encorajadores (linguagem acessível para ${serie}):
1. Por que a alternativa ${alternativaEscolhida} não está correta.
2. O raciocínio passo a passo para chegar na resposta certa (${alternativaCorreta}).
3. Uma dica de ouro para não errar questões parecidas na prova.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://epp-nexo.vercel.app',
        'X-Title': 'EPP Nexo Tutor'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6
      })
    });

    const data = await response.json();
    const explicacao = data.choices?.[0]?.message?.content || 'Não foi possível gerar a explicação agora.';
    return NextResponse.json({ explicacao });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
