import { useEffect, useRef, useState } from 'react'

export function useWebSocket(url: string) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    const socket = new WebSocket(url)
    ws.current = socket

    socket.onopen = () => {
      setConnectionStatus('connected')
      console.log('WebSocket connected')
    }

    socket.onclose = () => {
      setConnectionStatus('disconnected')
      console.log('WebSocket disconnected')
    }

    socket.onmessage = (event) => {
      setLastMessage(event)
    }

    return () => {
      socket.close()
    }
  }, [url])

  const sendMessage = (data: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(data)
    }
  }

  return { connectionStatus, lastMessage, sendMessage }
}
