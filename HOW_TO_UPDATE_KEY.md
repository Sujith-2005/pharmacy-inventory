# How to Update Your Gemini API Key

Since your current key is blocked, you need to generate a new one and update it in your hosting platform (Render).

## Step 1: Get a New Key
1.  Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2.  Click **"Create API Key"**.
3.  Select your project and click **"Create key in existing project"** (or create a new one).
4.  **Copy** the new key string (it starts with `AIza...`).

## Step 2: Update in Render (Backend)
1.  Go to your **[Render Dashboard](https://dashboard.render.com/)**.
2.  Click on your **Backend Service** (e.g., `pharmacy-inventory-backend`).
3.  On the left sidebar, click **"Environment"**.
4.  Scroll down to the list of environment variables.
5.  Find `GEMINI_API_KEY`.
6.  Click **"Edit"** and paste your **NEW** key.
7.  Click **"Save Changes"**.

## Step 3: Verify
1.  Render should automatically start a new deployment (you'll see a "Deploying..." indicator).
2.  If it doesn't auto-deploy, click the blue **"Manual Deploy"** button -> **"Deploy latest commit"**.
3.  Wait for it to say "Live".
4.  Try the Chatbot again on your website.

> [!NOTE]
> You do NOT need to change any code for this. It is purely a configuration change in Render.
