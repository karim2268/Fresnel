import { GoogleGenAI } from "@google/genai";
import { CircuitParams, CircuitState } from "../types";

const getClient = () => {
  // In a real app, ensure process.env.API_KEY is set. 
  // For this generated code, we assume the environment is set up correctly.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const explainCircuitState = async (params: CircuitParams, state: CircuitState): Promise<string> => {
  const ai = getClient();

  const prompt = `
    Tu es un professeur de physique expert en électricité (niveau lycée/prépa).
    Analyse le circuit RLC série suivant connecté à un GBF pour un étudiant.
    
    ATTENTION : La bobine est RÉELLE, elle possède une inductance L et une résistance interne r.
    
    Paramètres :
    - Résistance du conducteur ohmique R = ${params.R} Ohms
    - Bobine : Inductance L = ${params.L} Henry, Résistance interne r = ${params.r} Ohms
    - Capacité C = ${params.C} Farad
    - Fréquence f = ${params.f} Hz
    - Tension Générateur U = ${params.U_gen} V

    État calculé :
    - Fréquence de résonance f0 = ${state.resonanceFreq.toFixed(2)} Hz
    - Impédance totale Z = ${state.Z.toFixed(2)} Ohms
    - Tension aux bornes de la bobine réelle (Ub) = ${state.U_coil_max.toFixed(2)} V
    - Tension aux bornes de C (UC) = ${state.UC_max.toFixed(2)} V
    - Déphasage tension GBF / courant = ${(state.phi * 180 / Math.PI).toFixed(2)} degrés

    Tâche pédagogique :
    1. Analyse la nature du circuit (Inductif, Capacitif ou Résonance) en citant les valeurs de tensions.
    2. Explique spécifiquement l'influence de la résistance interne 'r' de la bobine sur le diagramme de Fresnel (pourquoi le vecteur U_bobine n'est pas vertical à 90° ?).
    3. Commente l'état de résonance si on y est proche : quel est l'impact de 'r' sur l'intensité maximale ?
    
    Réponds en français, format Markdown, sois concis et didactique. Utilise des puces.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Désolé, je n'ai pas pu générer d'explication pour le moment.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Erreur de connexion à l'IA pédagogique. Veuillez vérifier votre clé API.";
  }
};