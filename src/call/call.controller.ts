import { Body, Controller, Post, Query, Req, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CallService } from './call.service';

@ApiTags('calls')
@Controller('calls')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Post('incoming')
  @ApiOperation({ summary: 'Handle incoming calls' })
  @ApiQuery({
    name: 'tries',
    required: false,
    description:
      'no. of tries, - incoming api being called - user not pressed any key or pressed invalid key',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        From: {
          type: 'string',
          description: 'The phone number of the caller.',
          example: '+1234567890',
        },
        To: {
          type: 'string',
          description:
            'The phone number of the recipient (your Twilio number).',
          example: '+0987654321',
        },
        CallSid: {
          type: 'string',
          description: 'Unique identifier for the call provided by Twilio.',
          example: 'CA12345678901234567890123456789012',
        },
        CallStatus: {
          type: 'string',
          description:
            'Current status of the call (e.g., "completed", "in-progress", "ringing").',
          example: 'in-progress',
        },
      },
      required: ['From', 'To', 'CallSid', 'CallStatus'],
      example: {
        From: '+1234567890',
        To: '+0987654321',
        CallSid: 'CA12345678901234567890123456789012',
        CallStatus: 'in-progress',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'handled incoming call successfully! - return twiml response for twilio',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal server error. - something wrong in handling incoming call',
  })
  async handleIncomingCall(
    @Body() body,
    @Query('tries') tries,
    @Res() res: Response,
  ) {
    try {
      console.log('helloe', body);
      const twiml = await this.callService.handleIncomingCall({
        ...body,
        tries,
      });
      return res.type('text/xml').send(twiml);
    } catch (err) {
      console.error('Error handling incoming call:', err);
      return res
        .status(err.statusCode || 500)
        .send(
          err.message ||
            'Internal server error. - something wrong in handling incoming call',
        );
    }
  }

  @Post('menu')
  @ApiOperation({ summary: 'Handle Key Press for incoming IVR calls' })
  @ApiQuery({
    name: 'tries',
    required: false,
    description:
      'no. of tries, - incoming api being called - user not pressed any key or pressed invalid key',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        From: {
          type: 'string',
          description: 'The phone number of the caller.',
          example: '+1234567890',
        },
        To: {
          type: 'string',
          description:
            'The phone number of the recipient (your Twilio number).',
          example: '+0987654321',
        },
        CallSid: {
          type: 'string',
          description: 'Unique identifier for the call provided by Twilio.',
          example: 'CA12345678901234567890123456789012',
        },
        Digits: {
          type: 'string',
          description: 'Digits pressed by the caller, if any.',
          example: '1234',
        },
        CallStatus: {
          type: 'string',
          description:
            'Current status of the call (e.g., "completed", "in-progress", "ringing").',
          example: 'in-progress',
        },
      },
      required: ['From', 'To', 'CallSid', 'CallStatus'],
      example: {
        From: '+1234567890',
        To: '+0987654321',
        CallSid: 'CA12345678901234567890123456789012',
        Digits: '1',
        CallStatus: 'in-progress',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'handled menu key press - return twiml response for twilio',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal server error. - something wrong in handling key press from ivr menu',
  })
  async handleMenuKeyPress(
    @Body() body,
    @Query('tries') tries,
    @Res() res: Response,
  ) {
    try {
      const twiml = await this.callService.handleMenuKeyPress({
        ...body,
        tries,
      });
      return res.type('text/xml').send(twiml);
    } catch (err) {
      console.error('Error handling menu key press:', err);
      return res
        .status(err.statusCode || 500)
        .send(err.message || 'Internal Server Error');
    }
  }

  @Post('voice-mail')
  @ApiOperation({ summary: 'Handle incoming voice mail recordings' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        From: {
          type: 'string',
          description: 'The phone number of the caller.',
          example: '+1234567890',
        },
        To: {
          type: 'string',
          description: 'The Twilio number receiving the call.',
          example: '+0987654321',
        },
        CallSid: {
          type: 'string',
          description: 'Unique identifier for the call provided by Twilio.',
          example: 'CA12345678901234567890123456789012',
        },
        RecordingUrl: {
          type: 'string',
          description: 'URL of the recorded voice message.',
          example:
            'https://api.twilio.com/2010-04-01/Accounts/AC1234567890/Recordings/RE1234567890',
        },
        RecordingDuration: {
          type: 'string',
          description: 'Duration of the recording in seconds.',
          example: '30',
        },
        CallStatus: {
          type: 'string',
          description: 'Current status of the call.',
          example: 'completed',
        },
      },
      required: [
        'From',
        'To',
        'CallSid',
        'RecordingUrl',
        'RecordingDuration',
        'CallStatus',
      ],
      example: {
        From: '+1234567890',
        To: '+0987654321',
        CallSid: 'CA12345678901234567890123456789012',
        RecordingUrl:
          'https://api.twilio.com/2010-04-01/Accounts/AC1234567890/Recordings/RE1234567890',
        RecordingDuration: '30',
        CallStatus: 'completed',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Voice mail handled successfully.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal server error occurred while handling the voice mail.',
  })
  async handleVoiceMail(@Body() body, @Res() res: Response): Promise<any> {
    try {
      const response = await this.callService.handleVoiceMail(body);
      return res.status(200).send(response);
    } catch (err) {
      console.error('Error in handling voice mail:', err);
      return res
        .status(err.statusCode || 500)
        .send(err.message || 'Internal Server Error');
    }
  }
}
