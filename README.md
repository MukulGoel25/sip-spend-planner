# SIP Spend Planner (INDmoney prototype)
Static page (index.html) + one serverless function (api/ai.js) that calls Gemini with a server-side key.
Env vars on Vercel: GEMINI_API_KEY (required), GEMINI_MODEL (optional, default gemini-3.5-flash-lite).
If the AI is unreachable the app keeps working in rules mode (safe fallback).
