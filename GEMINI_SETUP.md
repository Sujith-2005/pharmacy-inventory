# Gemini Flash API Setup Guide

The chatbot uses Google Gemini Flash API for general-purpose queries. Follow these steps to enable it:

## Step 1: Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

## Step 2: Configure the API Key

1. Navigate to the `backend` directory
2. Create or edit the `.env` file
3. Add the following line:

```
GEMINI_API_KEY=your-api-key-here
```

Replace `your-api-key-here` with the API key you copied.

## Step 3: Restart the Backend Server

After adding the API key, restart your backend server:

```cmd
# Stop the server (Ctrl+C) and restart
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

## Features

With Gemini Flash enabled, the chatbot can:
- Answer general questions (weather, facts, explanations, etc.)
- Handle inventory queries with AI-powered responses
- Provide pharmacy-related information
- Engage in natural conversations
- Answer any type of query like Gemini Flash

## Free Tier Limits

The Gemini Flash API offers a generous free tier:
- **15 requests per minute**
- **1,000,000 tokens per minute**
- **1,500 requests per day**

These limits are sufficient for most pharmacy inventory management use cases.

## Without API Key

If you don't configure the API key, the chatbot will still work but with limited functionality:
- Basic inventory queries (stock, expiry, low stock)
- Simple responses
- No general AI capabilities

## Troubleshooting

If you encounter issues:
1. Verify your API key is correct in the `.env` file
2. Check that the backend server has been restarted
3. Ensure you have an internet connection (Gemini API requires internet)
4. Check the backend logs for any error messages
