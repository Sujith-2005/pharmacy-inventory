import { apiClient } from './client'

export interface ChatMessage {
  message: string
  session_id?: string
}

export interface ChatResponse {
  response: string
  session_id: string
  suggested_actions?: string[]
}

export const chatbotApi = {
  chat: async (message: ChatMessage): Promise<ChatResponse> => {
    const response = await apiClient.post('/api/chatbot/chat', message)
    return response.data
  },

  getSuggestions: async () => {
    const response = await apiClient.get('/api/chatbot/suggestions')
    return response.data
  },
}


