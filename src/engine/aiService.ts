import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' }); // Make sure to use VITE_ prefix

const SYSTEM_PROMPT = `
You are the "Aki Assistant" (Chemic-AI V2.0).
Your core directive is absolute scientific accuracy. You are monitoring a 2D Chemistry Lab Simulation.
You will be provided with a JSON state representing the exact contents of the workbench containers.

CRITICAL RULES:
1. ONLY discuss the chemicals currently present in the JSON state.
2. DO NOT hallucinate reactions that are not happening.
3. If the user asks about a reaction, reference the specific reactants and their volumes/temperatures from the JSON.
4. Keep your responses concise, professional, and slightly playful (you can use occasional emotes like :3 or ^^).
5. If the workbench is empty or lacks reactive pairs, state clearly that nothing is happening.

Format your response as a helpful lab assistant.
`;

export async function askAkiAssistant(userMessage: string, currentState: any): Promise<string> {
    try {
        const stateContext = `CURRENT LAB STATE (JSON):\n${JSON.stringify(currentState, null, 2)}\n\nUSER QUERY: ${userMessage}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: 'Understood. I will strictly analyze the provided JSON state and maintain scientific accuracy.' }] },
                { role: 'user', parts: [{ text: stateContext }] }
            ],
            config: {
                temperature: 0.2, // Low temperature to prevent hallucination
            }
        });

        return response.text || "I was unable to analyze the situation.";
    } catch (error) {
        console.error("AI Error:", error);
        return "Error: Connection to Databank lost. Please check API configuration.";
    }
}