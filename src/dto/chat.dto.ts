import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChatRequestDto {
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message cannot be empty' })
  @Transform(({ value }) => value?.trim())
  message: string;
}

export class ChatResponseDto {
  reply: string;

  constructor(reply: string) {
    this.reply = reply;
  }
}
