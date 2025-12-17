import { apiClient } from './client'
// @ts-ignore
import { mockChatbotResponse } from './mockData.js'

export interface ChatMessage {
  message: string
  session_id?: string
}

export interface ChatResponse {
  response: string
  session_id: string
  suggested_actions?: string[] | null
}

export const chatbotApi = {
  chat: async (message: ChatMessage): Promise<ChatResponse> => {
    try {
      const response = await apiClient.post('/api/chatbot/chat', message)
      return response.data
    } catch (error) {
      console.warn('Chatbot network error, using mock', error)
      return mockChatbotResponse as ChatResponse
    }
  },

  getSuggestions: async () => {
    try {
      const response = await apiClient.get('/api/chatbot/suggestions')
      return response.data
    } catch (error) {
      return ["Show Dashboard", "List Low Stock", "Forecast Demand"]
    }
  },
}
