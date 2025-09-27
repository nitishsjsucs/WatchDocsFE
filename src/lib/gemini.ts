import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: string;
}

export class GeminiChat {
  private chat: any;
  private url: string;
  private domain: string;

  constructor(url: string) {
    this.url = url;
    this.domain = new URL(url).hostname;
    if (genAI) {
      this.initializeChat();
    }
  }

  private initializeChat() {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const systemPrompt = `You are an AI assistant helping users monitor and track changes on websites. The user wants to watch the website: ${this.url} (${this.domain}).

Your role is to:
1. Ask clarifying questions about what specific aspects of the website they want to monitor
2. Help them understand what changes they can track
3. Suggest monitoring strategies based on the website type
4. Provide insights about the website's structure and content

Key areas to explore:
- What specific content or elements they want to track
- How often they want to check for changes
- What type of changes are important to them (text, images, layout, etc.)
- Whether they want to track specific pages or the entire site
- Any specific keywords or elements they're interested in

Be conversational, helpful, and ask one focused question at a time to understand their monitoring needs better. Start your responses with a natural greeting or statement, not with bullet points.

When providing responses, use markdown formatting to make your messages clear and well-structured:
- Use **bold** for emphasis
- Use bullet points for lists
- Use \`code\` for technical terms or URLs
- Use numbered lists for step-by-step instructions
- Use > blockquotes for important notes or warnings`;

    this.chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: `Hello! I'm here to help you monitor and track changes on **${this.domain}**. 

I can help you set up monitoring for various aspects of this website. To get started, could you tell me what specific content or changes you're most interested in tracking? 

For example, are you looking to monitor specific **text content**, track when new pages or posts are added, or are you interested in changes to product information or pricing? What would be most valuable for you to know about when it changes on this site?` }],
        },
      ],
    });
  }

  async sendMessage(message: string): Promise<string> {
    if (!genAI || !this.chat) {
      console.error('Gemini AI not initialized. API Key:', import.meta.env.VITE_GEMINI_API_KEY ? 'Present' : 'Missing');
      throw new Error('Gemini AI not initialized. Please add your API key to .env file.');
    }
    
    try {
      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to get response from AI assistant');
    }
  }

  getDomain(): string {
    return this.domain;
  }

  getUrl(): string {
    return this.url;
  }
}
