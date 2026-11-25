import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { serie, disciplina, assunto, nivel, quantidade, pais, banca } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY não configurada na Vercel.' }, { status: 500 });
    }

    const qtd = Math.min(Number(quantidade) || 3, 10);
    const paisAlvo = pais || 'Brasil';
    const bancaAlvo = banca || 'ENEM / OBMEP';

    const prompt = `Você é um elaborador especialista em exames nacionais e internacionais adaptados para estudantes do ${serie} do Ensino Fundamental no Brasil.
Crie ${qtd} questões de múltipla escolha em PORTUGUÊS inspiradas no estilo, contextualização e rigor do exame:
- País de origem: ${paisAlvo}
- Exame / Banca de referência: ${bancaAlvo}
- Disciplina: ${disciplina}
- Assunto: ${assunto}
- Nível de dificuldade: ${nivel || 'Médio'}

Adapte o vocabulário e a complexidade para que um aluno do ${serie} consiga resolver usando raciocínio lógico e os conteúdos da sua série, mantendo a identidade da prova (${bancaAlvo} - ${paisAlvo}).

Retorne APENAS um array JSON puro (sem markdown, sem crases) exatamente neste formato:
[
  {
    "titulo": "${assunto} (${bancaAlvo})",
    "enunciado": "Texto contextualizado da questão...",
    "alternativa_a": "Texto A",
    "alternativa_b": "Texto B",
    "alternativa_c": "Texto C",
    "alternativa_d": "Texto D",
    "correta": "A",
    "resolucao_comentada": "Explicação passo a passo clara da resolução."
  }
]`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://epp-nexo.vercel.app',
        'X-Title': 'EPP Nexo Banco Internacional'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: 'Responda exclusivamente com um array JSON válido, sem markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Erro na IA.' }, { status: 500 });
    }

    let raw = data.choices?.[0]?.message?.content || '[]';
    raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const questoes = JSON.parse(raw);

    return NextResponse.json({ questoes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Falha ao gerar questões.' }, { status: 500 });
  }
}
