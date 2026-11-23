import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { serie, disciplina, tema, quantidade, nivel } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave OPENROUTER_API_KEY não configurada nas Environment Variables da Vercel.' },
        { status: 500 }
      );
    }

    const prompt = `Você é um professor especialista da plataforma educacional brasileira EPP Nexo (6º ao 9º ano do Ensino Fundamental).
Crie exatamente ${quantidade} questões inéditas de múltipla escolha para o ${serie}, disciplina de ${disciplina}, sobre o assunto "${tema}".
Nível de dificuldade exigido: ${nivel}.

Diretrizes pedagógicas por nível:
- Fácil (Fixação): Direta ao ponto, avalia reconhecimento de conceitos básicos e regras fundamentais.
- Médio (Contextualizado): Enunciado com situação-problema cotidiana ou pequeno texto-base interpretativo (estilo SAEB/ENEM júnior).
- Profundo (Desafio & Raciocínio): Exige análise crítica, conexão entre conceitos, resolução em múltiplas etapas ou interpretação complexa.

Retorne APENAS um array JSON válido (sem markdown, sem crases \`\`\`, sem texto antes ou depois) exatamente nesta estrutura:
[
  {
    "serie": "${serie}",
    "disciplina": "${disciplina}",
    "titulo": "Subtópico específico da questão",
    "enunciado": "Enunciado completo, claro e bem contextualizado",
    "alternativa_a": "Texto da alternativa A",
    "alternativa_b": "Texto da alternativa B",
    "alternativa_c": "Texto da alternativa C",
    "alternativa_d": "Texto da alternativa D",
    "correta": "A",
    "resolucao_comentada": "Explicação pedagógica detalhada passo a passo do porquê a alternativa correta é a certa e o erro das demais."
  }
]`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://epp-nexo.vercel.app',
        'X-Title': 'EPP Nexo'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'system',
            content: 'Você responde exclusivamente em JSON puro, sem blocos de código markdown e sem texto explicativo fora do array.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Erro ao comunicar com o OpenRouter.' },
        { status: 500 }
      );
    }

    let textoResposta = data.choices?.[0]?.message?.content || '[]';
    textoResposta = textoResposta.replace(/```json/gi, '').replace(/```/g, '').trim();

    const questoes = JSON.parse(textoResposta);
    return NextResponse.json({ questoes });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro interno ao processar a resposta da IA.' },
      { status: 500 }
    );
  }
}
