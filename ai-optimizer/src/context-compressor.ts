/**
 * Context Compressor
 * Compresse intelligemment le contexte pour économiser 30-50% de tokens
 */

export class ContextCompressor {
  
  /**
   * Compresse un document financier tout en gardant l'essentiel
   */
  compress(document: string, keepStructure: boolean = true): string {
    if (document.length < 1000) return document; // Pas besoin de compresser
    
    let compressed = document;
    
    // 1. Réduire les répétitions
    compressed = this.deduplicate(compressed);
    
    // 2. Summariser sections verbeuses
    compressed = this.summarizeSections(compressed);
    
    // 3. Normaliser nombres
    compressed = this.normalizeNumbers(compressed);
    
    // 4. Supprimer remplissage
    compressed = this.removeFluff(compressed);
    
    const savings = ((document.length - compressed.length) / document.length * 100).toFixed(1);
    console.log(`📦 Compression: ${document.length} → ${compressed.length} chars (-${savings}%)`);
    
    return compressed;
  }
  
  /**
   * Compress spécifiquement pour RAG retrieval
   */
  compressForRetrieval(documents: string[]): string[] {
    return documents.map(doc => {
      // Extraire seulement les phrases clés pour matching vectoriel
      const keySentences = this.extractKeySentences(doc, 3);
      return keySentences.join('. ');
    });
  }
  
  /**
   * Déduplique les informations
   */
  private deduplicate(text: string): string {
    // Regrouper lignes similaires
    const lines = text.split('\n');
    const unique = [...new Set(lines)];
    return unique.join('\n');
  }
  
  /**
   * Summarize les paragraphes longs
   */
  private summarizeSections(text: string): string {
    // Remplacer paragraphes > 200 chars par leur phrase clé
    return text.replace(/([^\n]{200,})\n/g, (match) => {
      const keyPoint = match.split('.')[0] + '.';
      return `[Résumé: ${keyPoint}]\n`;
    });
  }
  
  /**
   * Normalise la présentation des nombres
   */
  private normalizeNumbers(text: string): string {
    // Standardiser: "25 000 $" → "25000"
    return text
      .replace(/(\d)\s+(\d)/g, '$1$2')  // Enlever espaces dans nombres
      .replace(/\$\s*/g, '')             // Normaliser currency
      .replace(/(\d)\.00\b/g, '$1');    // Enlever .00 inutiles
  }
  
  /**
   * Supprime le fluff linguistique
   */
  private removeFluff(text: string): string {
    const fluffPatterns = [
      /\b(il est important de noter que|comme vous le savez|bien entendu)\b/gi,
      /\b(nous pouvons observer que|il convient de mentionner)\b/gi,
      /\b(tel que mentionné précédemment|de plus)\b/gi,
      /\s{2,}/g  // Espaces multiples
    ];
    
    let cleaned = text;
    fluffPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, ' ');
    });
    
    return cleaned.trim();
  }
  
  /**
   * Extraction de phrases clés
   */
  private extractKeySentences(text: string, count: number): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    // Scoring simple: phrases avec chiffres ou mots-clés importants
    const scored = sentences.map(sentence => {
      let score = 0;
      if (/\d/.test(sentence)) score += 2; // Contient chiffres
      if (/ratio|marge|rentabilité|croissance/i.test(sentence)) score += 3;
      if (/recommandation|conseil|action/i.test(sentence)) score += 2;
      return { sentence: sentence.trim(), score };
    });
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(s => s.sentence);
  }
  
  /**
   * Calcule le potentiel d'économie
   */
  calculateSavings(original: string, compressed: string): {
    charReduction: number;
    tokenEstimate: number;
    costSavings: number;
  } {
    const reduction = original.length - compressed.length;
    const tokenEstimate = Math.floor(reduction / 4);