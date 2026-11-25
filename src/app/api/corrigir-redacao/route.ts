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
