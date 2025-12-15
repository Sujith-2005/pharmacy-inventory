import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

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
    const response = await axios.post(
      `${BASE_URL}/api/chatbot/chat`,
      message,
      {
        headers: {
          'Content-Type': 'application/json',
          // ❌ NO Authorization header here
        },
      }
    )
    return response.data
  },

  getSuggestions: async () => {
    const response = await axios.get(
      `${BASE_URL}/api/chatbot/suggestions`
    )
    return response.data
  },
}
