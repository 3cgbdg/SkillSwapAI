import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

const SESSION_COLOR_KEYS = [
  'plum',
  'amber',
  'sage',
  'coral',
  'slate',
  'violet',
] as const;

export class CreateSessionDto {
  @IsNotEmpty({ message: 'Empty title' })
  title: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  meetingLink?: string;

  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString({}, { message: 'Invalid startsAt' })
  startsAt: string;

  @IsNotEmpty({ message: 'End time is required' })
  @IsDateString({}, { message: 'Invalid endsAt' })
  endsAt: string;

  @IsString()
  @IsNotEmpty({ message: 'Timezone is required' })
  timeZone: string;

  @IsNotEmpty({ message: 'Invalid color' })
  @IsIn(SESSION_COLOR_KEYS, { message: 'Invalid session color' })
  color: string;

  @IsNotEmpty({ message: 'Friend ID is empty' })
  friendId: string;
}
