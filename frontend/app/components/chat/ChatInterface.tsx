'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Paperclip, Loader2 } from 'lucide-react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Message } from '@/types/chat'

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket('ws://localhost:3001/ws/stream')

  // Auto-scroll vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Recevoir messages WebSocket
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data)
      
      if (data.type === 'progress') {
        // Mise à jour progression
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1]
          if (lastMsg?.role === 'assistant' && lastMsg.isStreaming) {
            return [...prev.slice(0, -1), { ...lastMsg, content: data.message }]
          }
          return prev
        })
      } else if (data.type === 'complete') {
        // Message complet
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1]
          if (lastMsg?.role === 'assistant' && lastMsg.isStreaming) {
            return [...prev.slice(0, -1), { ...lastMsg, content: data.result, isStreaming: false }]
          }
          return [...prev, { role: 'assistant', content: data.result, isStreaming: false }]
        })
        setIsLoading(false)
      }
    }
  }, [lastMessage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Ajouter message utilisateur
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    // Ajouter message placeholder assistant
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '🔍 Analyse en cours...',
      isStreaming: true 
    }])

    // Envoyer via WebSocket ou API
    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'full-diagnostic',
          document: { query: userMessage },
          options: { streaming: true }
        })
      })

      const data = await response.json()
      
      if (data.status === 'queued') {
        // Connecter WebSocket pour streaming
        sendMessage(JSON.stringify({ jobId: data.jobId }))
      }
    } catch (error) {
      console.error('Error:', error)
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Upload fichier
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, {
        role: 'user',
        content: `📄 Document uploadé: ${file.name}`
      }])
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header du chat */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">💰 GrantOS Financial</h1>
          <p className="text-sm text-gray-500">
            {connectionStatus === 'connected' ? '🟢 Connecté' : '🟡 Connexion...'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Pipeline 3-paliers actif
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💼</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Bienvenue sur FinOps
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Votre analyste financier IA. Posez-moi des questions sur vos bilans, 
              comptes de résultat, ou demandez une analyse de subventions.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Analyse ce bilan', 'Calcule le ratio de liquidité', 'Quelles subventions pour ma PME?', 'Diagnostic santé financière'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              {message.isStreaming && (
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs text-gray-500">Analyse en cours...</span>
                </div>
              )}
              <div className="prose prose-sm max-w-none">
                {message.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Posez votre question financière... (Shift+Enter pour nouvelle ligne)"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={isLoading}
            />
            <label className="absolute right-3 bottom-3 cursor-pointer text-gray-400 hover:text-gray-600">
              <Paperclip className="w-5 h-5" />
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.xlsx,.csv"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-2">
          FinOps utilise un pipeline 3-paliers optimisé. Les analyses complexes utilisent Claude + DeepSeek + Claude (-43% de coûts)
        </p>
      </div>
    </div>
  )
}
