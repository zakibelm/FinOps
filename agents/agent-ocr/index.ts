/**
 * Agent OCR - Extraction intelligente de documents financiers
 * Basé sur: gemma3-ocr + LaTeX-OCR du AI Engineering Hub
 * Adapté pour: OpenRouter API
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Configuration OpenRouter
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/zakibelm/FinOps',
    'X-Title': 'FinOps OCR Agent'
  }
});

// Prompt système pour extraction financière
const SYSTEM_PROMPT = `Tu es un expert en extraction de données financières.
Ta mission: analyser des documents comptables et extraire les informations structurées.

Types de documents gérés:
- Relevés bancaires (transactions, soldes)
- Factures (montants, TVA, dates, fournisseurs)
- Bilans comptables (actif, passif)
- États de résultat (revenus, charges)
- Formulaires fiscaux

Règles:
1. Extraire TOUTES les données numériques avec précision
2. Préservier la structure des tableaux
3. Identifier les labels et les valeurs correspondantes
4. Formater les montants en nombres (pas de texte)
5. Convertir les dates au format ISO (YYYY-MM-DD)

Format de sortie: JSON structuré avec métadonnées du document.`;

interface OCROptions {
  documentType?: 'bank_statement' | 'invoice' | 'balance_sheet' | 'income_statement' | 'tax_form' | 'auto';
  extractTables?: boolean;
  extractFormulas?: boolean;
  language?: string;
}

/**
 * Encode une image en base64
 */
function encodeImage(imagePath: string): string {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

/**
 * Détecte le type de document basé sur le contenu
 */
async function detectDocumentType(imageBase64: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'anthropic/claude-3-5-sonnet-20241022',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          },
          {
            type: 'text',
            text: 'Quel type de document financier est-ce? Réponds uniquement avec: bank_statement, invoice, balance_sheet, income_statement, tax_form, ou unknown.'
          }
        ]
      }
    ],
    max_tokens: 50
  });

  return response.choices[0]?.message?.content?.trim().toLowerCase() || 'unknown';
}

/**
 * Extrait le texte et les données structurées d'un document
 */
export async function extractDocument(
  imagePath: string, 
  options: OCROptions = {}
): Promise<any> {
  try {
    // Vérifier que le fichier existe
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Fichier non trouvé: ${imagePath}`);
    }

    // Encoder l'image
    const base64Image = encodeImage(imagePath);
    
    // Détecter le type si auto
    let docType = options.documentType;
    if (docType === 'auto' || !docType) {
      docType = await detectDocumentType(base64Image) as any;
      console.log(`📄 Type de document détecté: ${docType}`);
    }

    // Construire le prompt spécifique au type
    let extractionPrompt = `Analyse ce document financier de type "${docType}" et extrais:
1. Toutes les données textuelles pertinentes
2. Les montants financiers avec leur contexte
3. Les dates importantes
4. Les entités (noms, sociétés)

Réponds en JSON structuré avec:
- metadata: {type, date_detection, confidence}
- raw_text: texte brut extrait
- structured_data: données structurées selon le type de document
- tables: [] si des tableaux sont présents`;

    if (options.extractFormulas) {
      extractionPrompt += `\n5. Les formules mathématiques en format LaTeX`;
    }

    // Appel API OpenRouter avec vision
    const response = await openai.chat.completions.create({
      model: 'google/gemma-3-27b-it', // ou 'anthropic/claude-3-5-sonnet-20241022' pour meilleure qualité
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            },
            {
              type: 'text',
              text: extractionPrompt
            }
          ]
        }
      ],
      max_tokens: 4000,
      temperature: 0.1
    });

    const result = response.choices[0]?.message?.content;
    
    // Parser le JSON si présent
    try {
      const jsonMatch = result?.match(/```json\n?([\s\S]*?)\n?```/) || 
                       result?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch (e) {
      console.log('⚠️ Pas de JSON détecté, retour texte brut');
    }

    return {
      metadata: { type: docType, confidence: 'medium' },
      raw_text: result,
      structured_data: null
    };

  } catch (error) {
    console.error('❌ Erreur OCR:', error);
    throw error;
  }
}

/**
 * Traitement par lot de plusieurs documents
 */
export async function batchExtract(
  imagePaths: string[],
  options?: OCROptions
): Promise<any[]> {
  console.log(`🔄 Traitement par lot de ${imagePaths.length} documents...`);
  
  const results = [];
  for (const path of imagePaths) {
    try {
      const result = await extractDocument(path, options);
      results.push({ path, success: true, data: result });
    } catch (error) {
      results.push({ path, success: false, error: error.message });
    }
  }
  
  return results;
}

// Export pour usage externe
export { SYSTEM_PROMPT, OCROptions };
