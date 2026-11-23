import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { tema, texto, serie } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave OPENROUTER_API_KEY não configurada na Vercel.' },
        { status: 500 }
      );
    }

    const prompt = `Você é um corretor oficial de redações da plataforma educacional EPP Nexo, avaliando um texto de um aluno do ${serie} do Ensino Fundamental.
Tema da redação: "${tema || 'Tema Livre / Atualidades'}"
Texto do aluno:
"""
${texto}
"""

Avalie com rigor pedagógico adaptado ao ${serie}, atribuindo notas de 0 a 200 em cada uma das 5 competências (totalizando de 0 a 1000 pontos).
Retorne APENAS um objeto JSON válido (sem markdown, sem crases) exatamente nesta estrutura:
{
  "nota_total": 840,
  "c1": 160,
  "c2": 180,
  "c3": 160,
  "c4": 160,
  "c5": 180,
  "pontos_fortes": "Resumo claro do que o aluno fez bem.",
  "pontos_melhoria": "Erros gramaticais, de coesão ou argumentação encontrados e como corrigir.",
  "comentario_geral": "Parecer motivador e completo do professor corretor para o aluno."
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://epp-nexo.vercel.app',
        'X-Title': 'EPP Nexo Redacao'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: 'Responda exclusivamente em JSON puro, sem markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Erro na IA.' }, { status: 500 });
    }

    let raw = data.choices?.[0]?.message?.content || '{}';
    raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const avaliacao = JSON.parse(raw);

    return NextResponse.json({ avaliacao });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao corrigir redação.' }, { status: 500 });
  }
}
