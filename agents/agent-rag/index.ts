/**
 * Agent RAG - Recherche Augmentée par Génération
 * Basé sur: agentic-rag + modernbert-rag du AI Engineering Hub
 * Adapté pour: OpenRouter API + architecture serverless
 */

import OpenAI from 'openai';

// Configuration
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/zakibelm/FinOps',
    'X-Title': 'FinOps RAG Agent'
  }
});

// Types de recherche
interface RAGOptions {
  sector?: 'restaurant' | 'retail' | 'manufacturing' | 'technology' | 'construction' | 'all';
  useWebFallback?: boolean;
  maxSources?: number;
  includeBenchmarks?: boolean;
}

// Base de connaissances simulée (à remplacer par vraie BDD vectorielle)
const KNOWLEDGE_BASE = {
  restaurant: {
    ratios: {
      'food_cost': { benchmark: 0.30, description: 'Coût des matières premières' },
      'labor_cost': { benchmark: 0.35, description: 'Coût du personnel' },
      'rent': { benchmark: 0.10, description: 'Loyer' },
      'operating_margin': { benchmark: 0.15, description: 'Marge opérationnelle' }
    },
    kpis: ['table_turnover', 'average_ticket', 'cost_per_cover']
  },
  retail: {
    ratios: {
      'gross_margin': { benchmark: 0.45, description: 'Marge brute' },
      'inventory_turnover': { benchmark: 6, description: 'Rotation des stocks' },
      'operating_margin': { benchmark: 0.12, description: 'Marge opérationnelle' }
    },
    kpis: ['sales_per_sqm', 'conversion_rate', 'inventory_days']
  },
  manufacturing: {
    ratios: {
      'gross_margin': { benchmark: 0.35, description: 'Marge brute' },
      'ebitda_margin': { benchmark: 0.18, description: 'Marge EBITDA' },
      'debt_ratio': { benchmark: 0.40, description: 'Ratio d\'endettement' }
    },
    kpis: ['capacity_utilization', 'defect_rate', 'lead_time']
  },
  technology: {
    ratios: {
      'gross_margin': { benchmark: 0.70, description: 'Marge brute' },
      'r_and_d_ratio': { benchmark: 0.20, description: 'R&D / CA' },
      'burn_rate': { benchmark: 'variable', description: 'Burn rate mensuel' }
    },
    kpis: ['mrr', 'cac', 'ltv', 'churn_rate']
  },
  construction: {
    ratios: {
      'gross_margin': { benchmark: 0.20, description: 'Marge brute' },
      'wcr_days': { benchmark: 90, description: 'BFR en jours' },
      'backlog_months': { benchmark: 6, description: ' carnet de commandes' }
    },
    kpis: ['project_margin', 'safety_incidents', 'on_time_delivery']
  }
};

/**
 * Génère des embeddings via OpenRouter
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Utiliser OpenRouter pour embeddings (text-embedding-3-small ou équivalent)
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/zakibelm/FinOps'
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small',
        input: text
      })
    });

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Erreur embedding:', error);
    // Fallback: retourner un mock pour démo
    return new Array(1536).fill(0).map(() => Math.random());
  }
}

/**
 * Recherche dans la base de connaissances sectorielle
 */
async function searchKnowledgeBase(
  query: string, 
  sector: string
): Promise<any[]> {
  const sectorData = KNOWLEDGE_BASE[sector.toLowerCase()];
  if (!sectorData) return [];

  // Simuler une recherche vectorielle (à remplacer par vraie BDD)
  const results = [];
  
  // Chercher dans les ratios
  for (const [key, value] of Object.entries(sectorData.ratios)) {
    if (query.toLowerCase().includes(key.toLowerCase()) ||
        value.description.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        type: 'ratio',
        name: key,
        ...value,
        relevance: 0.95
      });
    }
  }

  // Chercher dans les KPIs
  sectorData.kpis.forEach(kpi => {
    if (query.toLowerCase().includes(kpi.toLowerCase())) {
      results.push({
        type: 'kpi',
        name: kpi,
        relevance: 0.90
      });
    }
  });

  return results.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Fallback web search (simulé)
 */
async function webSearch(query: string): Promise<string> {
  // Dans la vraie implémentation, appeler Serper, Brave API, etc.
  console.log(`🔍 Recherche web pour: ${query}`);
  return `Informations web trouvées pour: ${query}`;
}

/**
 * Répond à une question avec RAG
 */
export async function queryRAG(
  question: string,
  options: RAGOptions = {}
): Promise<any> {
  const {
    sector = 'all',
    useWebFallback = true,
    maxSources = 5,
    includeBenchmarks = true
  } = options;

  console.log(`🤖 RAG Query: "${question}" [sector: ${sector}]`);

  try {
    // 1. Générer l'embedding de la question
    const queryEmbedding = await generateEmbedding(question);

    // 2. Recherche dans la base de connaissances
    let sources = [];
    
    if (sector !== 'all' && KNOWLEDGE_BASE[sector]) {
      const sectorResults = await searchKnowledgeBase(question, sector);
      sources = [...sectorResults];
    } else {
      // Chercher dans tous les secteurs
      for (const [sec, data] of Object.entries(KNOWLEDGE_BASE)) {
        const results = await searchKnowledgeBase(question, sec);
        sources = [...sources, ...results.map(r => ({ ...r, sector: sec }))];
      }
    }

    // 3. Fallback web si pas assez de sources
    if (sources.length < 2 && useWebFallback) {
      console.log('🌐 Fallback web activé');
      const webInfo = await webSearch(question);
      sources.push({
        type: 'web',
        content: webInfo,
        relevance: 0.70
      });
    }

    // 4. Générer la réponse avec LLM
    const context = sources
      .slice(0, maxSources)
      .map((s, i) => `[${i + 1}] ${JSON.stringify(s)}`)
      .join('\n');

    const systemPrompt = `Tu es un expert en analyse financière sectorielle.
Base ta réponse UNIQUEMENT sur les sources fournies.
Cite les sources [1], [2], etc. dans ta réponse.
Si les sources sont insuffisantes, indique-le clairement.`;

    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Question: ${question}\n\nSources:\n${context}\n\nRéponds de manière structurée avec citations.`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const answer = response.choices[0]?.message?.content;

    // 5. Retourner résultat structuré
    return {
      question,
      answer,
      sources: sources.slice(0, maxSources),
      metadata: {
        sector,
        sources_count: sources.length,
        used_web_fallback: sources.some(s => s.type === 'web'),
        confidence: sources.length > 0 ? 'high' : 'low'
      }
    };

  } catch (error) {
    console.error('❌ Erreur RAG:', error);
    return {
      question,
      answer: 'Erreur lors de la recherche. Veuillez réessayer.',
      sources: [],
      error: error.message
    };
  }
}

/**
 * Compare les benchmarks sectoriels
 */
export async function compareBenchmarks(
  metrics: Record<string, number>,
  sector: string
): Promise<any> {
  const sectorData = KNOWLEDGE_BASE[sector.toLowerCase()];
  if (!sectorData) {
    return { error: `Secteur ${sector} non trouvé` };
  }

  const comparisons = [];
  
  for (const [metric, value] of Object.entries(metrics)) {
    const benchmark = sectorData.ratios[metric];
    if (benchmark) {
      const diff = ((value - benchmark.benchmark) / benchmark.benchmark * 100).toFixed(1);
      comparisons.push({
        metric,
        your_value: value,
        benchmark: benchmark.benchmark,
        difference_percent: parseFloat(diff),
        status: parseFloat(diff) > 0 ? 'above' : 'below',
        description: benchmark.description
      });
    }
  }

  return {
    sector,
    comparisons,
    summary: {
      metrics_above: comparisons.filter(c => c.status === 'above').length,
      metrics_below: comparisons.filter(c => c.status === 'below').length,
      average_deviation: (comparisons.reduce((acc, c) => acc + Math.abs(c.difference_percent), 0) / comparisons.length).toFixed(1)
    }
  };
}

export { RAGOptions, KNOWLEDGE_BASE };
