/**
 * OllamaClient.js - Core API Interaction Layer
 * Handles communication with local Ollama instance
 */

export class OllamaClient {
    constructor(baseUrl = 'http://localhost:11434') {
        this.baseUrl = baseUrl;
    }

    /**
     * Fetch available models from Ollama
     */
    async fetchModels() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (!response.ok) throw new Error('Ollama connection failed');
            return await response.json();
        } catch (error) {
            console.error('Ollama Error:', error);
            return { models: [] };
        }
    }

    /**
     * Send a prompt to Ollama (Streaming or Non-streaming)
     */
    async generate(model, prompt, options = {}, onChunk = null) {
        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    prompt,
                    stream: !!onChunk,
                    ...options
                })
            });

            if (!response.ok) throw new Error('Generation failed');

            if (onChunk) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.trim()) {
                            try {
                                const json = JSON.parse(line);
                                if (json.response) onChunk(json.response);
                                if (json.done) return;
                            } catch (e) {
                                console.warn('JSON Parse Error in stream:', e);
                            }
                        }
                    }
                }
            } else {
                return await response.json();
            }
        } catch (error) {
            console.error('Ollama Generate Error:', error);
            throw error;
        }
    }
}
