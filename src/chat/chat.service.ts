import { Injectable, Logger } from '@nestjs/common';
import { ChatRequestDto, ChatResponseDto } from '../dto/chat.dto';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly llmService: LlmService) {}

  async processMessage(chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    const { message } = chatRequest;

    try {
      const reply = await this.llmService.generateResponse(message);
      return new ChatResponseDto(reply);
    } catch (error) {
      this.logger.error('Error processing message:', error);

      const errorMessage =
        error instanceof Error && error.message?.includes('Invalid API key')
          ? 'I am temporarily unavailable. Please check the API configuration.'
          : 'I apologize, but I encountered an error processing your request. Please try again.';

      return new ChatResponseDto(errorMessage);
    }
  }

  async *processMessageStream(
    chatRequest: ChatRequestDto,
  ): AsyncGenerator<string, void, unknown> {
    const { message } = chatRequest;

    try {
      const stream = this.llmService.generateStreamingResponse(message);

      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      this.logger.error('Error processing streaming message:', error);

      const errorMessage =
        error instanceof Error && error.message?.includes('Invalid API key')
          ? 'I am temporarily unavailable. Please check the API configuration.'
          : 'I apologize, but I encountered an error processing your request. Please try again.';

      yield errorMessage;
    }
  }
}
