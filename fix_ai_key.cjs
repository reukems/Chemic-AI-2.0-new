const fs = require('fs');
let code = fs.readFileSync('src/engine/aiService.ts', 'utf8');
code = code.replace(
  "apiKey: import.meta.env.VITE_GEMINI_API_KEY",
  "apiKey: process.env.GEMINI_API_KEY || ''"
);
fs.writeFileSync('src/engine/aiService.ts', code);
