import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CallType, CallStatus } from '../call/call.entity';

export class GetLogsQueryDto {
  @ApiPropertyOptional({ enum: CallType, description: 'Filter by call type' })
  @IsEnum(CallType)
  @IsOptional()
  type?: CallType;

  @ApiPropertyOptional({
    enum: CallStatus,
    description: 'Filter by call status',
  })
  @IsEnum(CallStatus)
  @IsOptional()
  status?: CallStatus;

  @ApiPropertyOptional({ description: 'Filter by recipient phone number' })
  @IsString()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({ description: 'Filter by caller phone number' })
  @IsString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field and order',
    example: 'createdAt:DESC',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;
}
