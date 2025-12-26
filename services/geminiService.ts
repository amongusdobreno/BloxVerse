
import { GoogleGenAI, Type } from "@google/genai";
import { Experience } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateExperienceMetadata = async (prompt: string): Promise<Partial<Experience>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate BloxVerse-style game metadata for: ${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            suggestedRating: { type: Type.NUMBER }
          },
          required: ["title", "category", "description"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return { title: "New Blox Project", category: "Custom", description: "Default description." };
  }
};

export const getAIGameChat = async (history: string[], userInput: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User said: ${userInput}. Respond as a friendly and helpful BloxVerse player.`,
      config: {
        systemInstruction: "Você é um jogador veterano de BloxVerse extremamente amigável, gentil e prestativo. Use gírias leves de gamer de forma carinhosa. Ajude os iniciantes e seja positivo. Máximo 15 palavras."
      }
    });
    return response.text || "Olá amigo! Seja bem-vindo ao servidor! gg!";
  } catch {
    return "Ei! Que bom te ver por aqui! gg!";
  }
};

export const getStudioHelp = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: query,
      config: {
        systemInstruction: "Você é o BloxAI, o assistente técnico do BloxVerse Studio. Você ajuda usuários a criar scripts, localscripts e organizar a hierarquia de Parts. Fale em português. Seja direto e forneça exemplos de código quando necessário."
      }
    });
    return response.text || "Não foi possível processar sua dúvida agora.";
  } catch (error) {
    return "Erro ao conectar com o servidor de IA. Tente novamente.";
  }
};
