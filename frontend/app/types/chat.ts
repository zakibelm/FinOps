export interface Message {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  timestamp?: Date
}

export interface AnalysisRequest {
  type: 'full-diagnostic' | 'ratio-simple' | 'subvention-check' | 'quick-calc'
  document: {
    query: string
    data?: any
    fileUrl?: string
  }
  options?: {
    sector?: string
    region?: string
    streaming?: boolean
  }
}

export interface AnalysisResponse {
  status: 'queued' | 'processing' | 'completed' | 'error'
  jobId?: string
  estimatedTime?: number
  result?: string
  metrics?: {
    totalDuration: number
    totalCost: number
    cacheHit: boolean
  }
}

export interface User {
  id: string
  name: string
  email: string
  role: 'cpa' | 'client' | 'admin'
  plan: 'free' | 'pro' | 'enterprise'
}
