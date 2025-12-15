import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { chatbotApi } from '../api/chatbot'
import toast from 'react-hot-toast'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(undefined)
  const messagesEndRef = useRef(null)

  const chatMutation = useMutation({
    mutationFn: (message) => chatbotApi.chat(message),
    onSuccess: (response) => {
      setSessionId(response.session_id)
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: response.response },
      ])
    },
    onError: () => {
      toast.error('Failed to get response from chatbot')
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    setMessages((prev) => [...prev, { role: 'user', content: input }])
    chatMutation.mutate({ message: input, session_id: sessionId })
    setInput('')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition"
      >
        <span className="text-2xl">💬</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-xl flex flex-col h-[500px]">
      <div className="bg-primary-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold">Inventory Assistant</h3>
        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Ask me about inventory, stock levels, expiry dates, or waste analytics!</p>
            <p className="text-sm mt-2">Try: "Do we have Azithromycin in stock?"</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content.split('\n').map((line, i) => (
                <p key={i} className="text-sm">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about inventory..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSend}
            disabled={chatMutation.isPending || !input.trim()}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
