import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { nome, serie, objetivo, horasPorDia, materiasFracas, assuntosErrados, mediaRedacao } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Chave OPENROUTER_API_KEY não configurada na Vercel.' }, { status: 500 });
    }

    const prompt = `Você é o Mentor Pedagógico Inteligente do EPP Nexo criando um Plano de Estudos Semanal 100% personalizado para ${nome} (${serie} do Ensino Fundamental).

DADOS REAIS DO ALUNO NA PLATAFORMA:
- Demanda / Objetivo Pessoal informado agora: "${objetivo}"
- Disponibilidade diária: ${horasPorDia} por dia
- Disciplinas com menor taxa de acerto: ${materiasFracas || 'Ainda sem histórico suficiente (focar na demanda pessoal)'}
- Assuntos específicos que o aluno errou recentemente: ${assuntosErrados || 'Nenhum erro registrado ainda'}
- Média atual nas redações: ${mediaRedacao ? `${mediaRedacao}/1000` : 'Nenhuma redação enviada ainda'}

Crie um roteiro prático de Segunda a Sábado conectando o objetivo pessoal do aluno com os pontos que ele precisa melhorar na plataforma (Trilhas de Questões, Simulados, Redação + IA, Caderno de Erros e Biblioteca PDF).

Retorne APENAS um JSON puro (sem markdown, sem crases) exatamente neste formato:
{
  "diagnostico": "Análise curta e motivadora de 2 frases explicando como o plano conecta o objetivo dele com o desempenho atual.",
  "dias": [
    {
      "dia": "Segunda-feira",
      "foco": "Nome da Disciplina ou Área",
      "atividade": "Descrição objetiva do que estudar e fazer (ex: Revisar teoria e resolver 5 questões de Equações)",
      "acao_modulo": "conteudo",
      "materia_alvo": "Matemática",
      "duracao": "45 min"
    }
  ]
}
Regras para "acao_modulo": use apenas um destes valores exatos: "conteudo", "redacao", "simulados", "biblioteca" ou "erros".
Regras para "materia_alvo": use "Matemática", "Linguagens", "Ciências" ou "Humanas".`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://epp-nexo.vercel.app',
        'X-Title': 'EPP Nexo Plano Estudos'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: 'Responda exclusivamente em JSON válido, sem markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Erro ao gerar plano.' }, { status: 500 });
    }

    let raw = data.choices?.[0]?.message?.content || '{}';
    raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const plano = JSON.parse(raw);

    return NextResponse.json({ plano });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Falha ao montar plano de estudos.' }, { status: 500 });
  }
}
