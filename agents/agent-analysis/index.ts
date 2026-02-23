/**
 * Agent Analysis - Analyse Financière Avancée
 * Basé sur: autogen-stock-analyst du AI Engineering Hub
 * Adapté pour: Analyse générique de sociétés (pas seulement stocks)
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/zakibelm/FinOps',
    'X-Title': 'FinOps Analysis Agent'
  }
});

// Types d'analyse
type AnalysisType = 'liquidity' | 'profitability' | 'solvency' | 'efficiency' | 'comprehensive';

interface FinancialData {
  balanceSheet?: {
    assets: number;
    liabilities: number;
    equity: number;
    currentAssets?: number;
    currentLiabilities?: number;
    inventory?: number;
    cash?: number;
    accountsReceivable?: number;
  };
  incomeStatement?: {
    revenue: number;
    grossProfit?: number;
    operatingIncome?: number;
    netIncome?: number;
    expenses?: number;
  };
  period?: string;
  currency?: string;
}

interface RatioResult {
  name: string;
  value: number;
  formula: string;
  interpretation: string;
  benchmark?: number;
  status: 'good' | 'warning' | 'critical';
}

interface AnalysisResult {
  type: AnalysisType;
  ratios: RatioResult[];
  summary: {
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
    keyStrengths: string[];
    keyRisks: string[];
    recommendations: string[];
  };
  details: any;
}

/**
 * Calcule les ratios de liquidité
 */
function calculateLiquidityRatios(data: FinancialData): RatioResult[] {
  const ratios: RatioResult[] = [];
  
  if (data.balanceSheet?.currentAssets && data.balanceSheet?.currentLiabilities) {
    const currentRatio = data.balanceSheet.currentAssets / data.balanceSheet.currentLiabilities;
    ratios.push({
      name: 'Current Ratio',
      value: parseFloat(currentRatio.toFixed(2)),
      formula: 'Current Assets / Current Liabilities',
      interpretation: currentRatio > 1.5 ? 'Bonne liquidité' : currentRatio > 1 ? 'Liquidité acceptable' : 'Risque de liquidité',
      benchmark: 1.5,
      status: currentRatio > 1.5 ? 'good' : currentRatio > 1 ? 'warning' : 'critical'
    });
    
    // Quick Ratio
    const inventory = data.balanceSheet.inventory || 0;
    const quickAssets = data.balanceSheet.currentAssets - inventory;
    const quickRatio = quickAssets / data.balanceSheet.currentLiabilities;
    ratios.push({
      name: 'Quick Ratio',
      value: parseFloat(quickRatio.toFixed(2)),
      formula: '(Current Assets - Inventory) / Current Liabilities',
      interpretation: quickRatio > 1 ? 'Très bonne liquidité immédiate' : 'Liquidité limitée sans vente stock',
      benchmark: 1,
      status: quickRatio > 1 ? 'good' : quickRatio > 0.8 ? 'warning' : 'critical'
    });
  }
  
  return ratios;
}

/**
 * Calcule les ratios de rentabilité
 */
function calculateProfitabilityRatios(data: FinancialData): RatioResult[] {
  const ratios: RatioResult[] = [];
  
  if (data.incomeStatement?.netIncome && data.incomeStatement?.revenue) {
    const netMargin = (data.incomeStatement.netIncome / data.incomeStatement.revenue) * 100;
    ratios.push({
      name: 'Net Profit Margin',
      value: parseFloat(netMargin.toFixed(2)),
      formula: '(Net Income / Revenue) × 100',
      interpretation: `${netMargin.toFixed(1)}% de marge nette`,
      benchmark: 10,
      status: netMargin > 15 ? 'good' : netMargin > 5 ? 'warning' : 'critical'
    });
  }
  
  if (data.incomeStatement?.grossProfit && data.incomeStatement?.revenue) {
    const grossMargin = (data.incomeStatement.grossProfit / data.incomeStatement.revenue) * 100;
    ratios.push({
      name: 'Gross Margin',
      value: parseFloat(grossMargin.toFixed(2)),
      formula: '(Gross Profit / Revenue) × 100',
      interpretation: `${grossMargin.toFixed(1)}% de marge brute`,
      benchmark: 40,
      status: grossMargin > 40 ? 'good' : grossMargin > 20 ? 'warning' : 'critical'
    });
  }
  
  // ROE
  if (data.incomeStatement?.netIncome && data.balanceSheet?.equity) {
    const roe = (data.incomeStatement.netIncome / data.balanceSheet.equity) * 100;
    ratios.push({
      name: 'Return on Equity (ROE)',
      value: parseFloat(roe.toFixed(2)),
      formula: '(Net Income / Equity) × 100',
      interpretation: `${roe.toFixed(1)}% de retour sur capitaux`,
      benchmark: 15,
      status: roe > 20 ? 'good' : roe > 10 ? 'warning' : 'critical'
    });
  }
  
  return ratios;
}

/**
 * Calcule les ratios de solvabilité
 */
function calculateSolvencyRatios(data: FinancialData): RatioResult[] {
  const ratios: RatioResult[] = [];
  
  if (data.balanceSheet?.totalLiabilities && data.balanceSheet?.totalAssets) {
    const debtRatio = (data.balanceSheet.totalLiabilities / data.balanceSheet.totalAssets) * 100;
    ratios.push({
      name: 'Debt Ratio',
      value: parseFloat(debtRatio.toFixed(2)),
      formula: '(Total Liabilities / Total Assets) × 100',
      interpretation: `${debtRatio.toFixed(1)}% d'endettement`,
      benchmark: 50,
      status: debtRatio < 40 ? 'good' : debtRatio < 60 ? 'warning' : 'critical'
    });
  }
  
  return ratios;
}

/**
 * Analyse complète
 */
export async function analyzeFinancials(
  data: FinancialData,
  analysisType: AnalysisType = 'comprehensive'
): Promise<AnalysisResult> {
  console.log(`📊 Analyse financière: ${analysisType}`);
  
  let allRatios: RatioResult[] = [];
  
  // Calculer les ratios selon le type demandé
  if (analysisType === 'liquidity' || analysisType === 'comprehensive') {
    allRatios = [...allRatios, ...calculateLiquidityRatios(data)];
  }
  
  if (analysisType === 'profitability' || analysisType === 'comprehensive') {
    allRatios = [...allRatios, ...calculateProfitabilityRatios(data)];
  }
  
  if (analysisType === 'solvency' || analysisType === 'comprehensive') {
    allRatios = [...allRatios, ...calculateSolvencyRatios(data)];
  }
  
  // Générer analyse IA
  const prompt = `En tant qu'analyste financier, analyse ces ratios et données:

Ratios calculés:
${JSON.stringify(allRatios, null, 2)}

Données brutes:
${JSON.stringify(data, null, 2)}

Fournis une analyse en JSON avec:
- overallHealth: 'excellent' | 'good' | 'fair' | 'poor'
- keyStrengths: [3 points forts]
- keyRisks: [3 risques identifiés]
- recommendations: [3 recommandations concrètes]`;

  const response = await openai.chat.completions.create({
    model: 'anthropic/claude-3-5-sonnet-20241022',
    messages: [
      { role: 'system', content: 'Tu es un analyste financier senior. Sois précis et factuel.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 2000
  });
  
  let summary;
  try {
    summary = JSON.parse(response.choices[0]?.message?.content || '{}');
  } catch (e) {
    summary = {
      overallHealth: 'fair',
      keyStrengths: ['Données analysées'],
      keyRisks: ['Analyse complémentaire recommandée'],
      recommendations: ['Consulter un expert']
    };
  }
  
  return {
    type: analysisType,
    ratios: allRatios,
    summary,
    details: {
      dataProvided: Object.keys(data),
      ratiosCalculated: allRatios.length,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Compare avec benchmarks sectoriels
 */
export async function compareToBenchmarks(
  ratios: RatioResult[],
  sector: string
): Promise<any> {
  // Utiliser agent-rag pour la comparaison
  console.log(`📈 Comparaison avec benchmarks ${sector}...`);
  
  const metrics = {};
  ratios.forEach(r => {
    metrics[r.name.toLowerCase().replace(/\s+/g, '_')] = r.value;
  });
  
  return {
    sector,
    metrics,
    comparison: 'Utiliser agent-rag pour comparaison détaillée'
  };
}

/**
 * Génère un rapport complet
 */
export async function generateReport(
  data: FinancialData,
  options: { format?: 'json' | 'markdown' | 'pdf'; includeCharts?: boolean } = {}
): Promise<string> {
  const analysis = await analyzeFinancials(data, 'comprehensive');
  
  if (options.format === 'json') {
    return JSON.stringify(analysis, null, 2);
  }
  
  // Format Markdown par défaut
  return `# Rapport d'Analyse Financière

## Vue d'ensemble
**Santé financière:** ${analysis.summary.overallHealth.toUpperCase()}

## Ratios clés
${analysis.ratios.map(r => `
### ${r.name}
- **Valeur:** ${r.value}
- **Formule:** ${r.formula}
- **Interprétation:** ${r.interpretation}
- **Statut:** ${r.status}
`).join('\n')}

## Forces identifiées
${analysis.summary.keyStrengths.map(s => `- ${s}`).join('\n')}

## Risques
${analysis.summary.keyRisks.map(r => `- ${r}`).join('\n')}

## Recommandations
${analysis.summary.recommendations.map(rec => `1. ${rec}`).join('\n')}

---
*Généré le ${new Date().toLocaleDateString()} par FinOps Analysis Agent*
`;
}

export { AnalysisType, FinancialData, RatioResult, AnalysisResult };
