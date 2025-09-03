import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private genAI: GoogleGenAI;
  private modelName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY not found in environment variables');
      throw new Error('GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenAI({
      apiKey: apiKey,
    });
    this.modelName =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash-001';
  }

  private getPrompt(userMessage: string): string {
    // Domain-specific prompt for finance
    return `
    You are an AI assistant specializing in finance. Your role is to provide helpful and accurate information on finance-related topics only. Here are your instructions:

      1. Only answer questions related to finance, investing, banking, economics, personal finance, financial planning, markets, cryptocurrencies, and closely related financial topics.

      2. For finance-related questions:
      - Provide informative and accurate responses based on your knowledge.
      - Use clear and concise language.
      - If appropriate, offer multiple perspectives or approaches.
      - Always include a disclaimer that your response is for educational purposes and not personalized financial advice.

      3. For non-finance questions:
      - Politely decline to answer.
      - Redirect the user to ask finance-related questions instead.
      - Use a phrase like: "I apologize, but I can only answer questions related to finance. Could you please ask a finance-related question instead?"

      4. Here is the user's message:
      <userMessage>
      ${userMessage}
      </userMessage>

      Remember, do not provide specific investment advice or make predictions about individual financial instruments. Your role is to educate and inform, not to give personalized financial recommendations.
    `;
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      const response = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: this.getPrompt(userMessage),
      });

      if (!response.text) {
        throw new Error('Empty response from Gemini API');
      }

      return response.text.trim();
    } catch (error) {
      this.logger.error('Error generating response from Gemini:', error);

      if (error instanceof Error && error.message?.includes('API key')) {
        throw new Error('Invalid API key configuration');
      }

      throw new Error('Unable to generate response. Please try again.');
    }
  }

  async *generateStreamingResponse(
    userMessage: string,
  ): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.genAI.models.generateContentStream({
        model: this.modelName,
        contents: this.getPrompt(userMessage),
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      this.logger.error(
        'Error generating streaming response from Gemini:',
        error,
      );

      if (error instanceof Error && error.message?.includes('API key')) {
        throw new Error('Invalid API key configuration');
      }

      throw new Error('Unable to generate response. Please try again.');
    }
  }
}
