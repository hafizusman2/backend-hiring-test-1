import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { appConfig } from 'src/config/app.config';
import * as Twilio from 'twilio';
import {
  Call,
  CallStatus,
  CallStatus as CallStatusEnum,
  CallType,
} from './call.entity';
import { Repository } from 'typeorm';
import { GetLogsQueryDto } from 'src/dto/call.dto';

@Injectable()
export class CallService {
  private config;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Call) private readonly callRepository: Repository<Call>,
  ) {
    this.config = appConfig(this.configService);
  }

  async createCall(callData) {
    const newCall = await this.callRepository.save(callData);

    return newCall;
  }

  async upsertCall(callData) {
    const newCall = await this.callRepository.upsert(callData, ['sid']);

    return newCall;
  }
  async updateCall(where, data: Partial<Call>): Promise<Call> {
    const call = await this.callRepository.findOne({
      where,
    });

    if (!call) {
      throw new Error('Call does not exist');
    }

    if (
      (!data.duration || data.duration == 0) &&
      data.status === CallStatus.COMPLETED
    ) {
      const currentDate = new Date();

      const timezoneOffsetInMinutes = currentDate.getTimezoneOffset();

      //   to handle timezone offset
      // call.createdAt time is already in utc, being converted to utc again - will be adjusted by timezone offset
      const timezoneOffsetInMilliseconds = timezoneOffsetInMinutes * 60 * 1000;

      data.duration = Math.ceil(
        (currentDate.getTime() -
          call.createdAt.getTime() +
          timezoneOffsetInMilliseconds) /
          1000,
      );
    }

    Object.assign(call, data);

    return await this.callRepository.save(call);
  }

  async handleIncomingCall(body): Promise<string> {
    const { CallSid, To, From, CallStatus } = body;
    let tries = parseInt(body.tries || '0', 10);

    const twiml = new Twilio.twiml.VoiceResponse();

    await this.upsertCall({
      sid: CallSid,
      status: CallStatus,
      to: To,
      from: From,
    });

    if (tries >= 3) {
      // End the call after 3 failed attempts
      twiml.say(
        'You have exceeded the maximum number of attempts. Goodbye. - You can call again',
      );

      await this.updateCall(
        {
          sid: CallSid,
        },
        {
          status: CallStatusEnum.COMPLETED,
        },
      );
      twiml.hangup();
    } else {
      twiml
        .gather({
          numDigits: 1,
          action: `/calls/menu?tries=${tries + 1}`,
          method: 'POST',
        })
        .say(
          'Welcome to the IVR System. Press 1 to be connected, or 2 to leave a voicemail.',
        );

      twiml.redirect(`/calls/incoming?tries=${tries + 1}`);
    }

    return twiml.toString();
  }

  async handleVoiceMail(body): Promise<any> {
    const { CallSid, RecordingDuration, RecordingUrl } = body;

    const call = await this.updateCall(
      {
        sid: CallSid,
      },
      {
        status: CallStatusEnum.COMPLETED,
        type: CallType.VOICEMAIL,
        duration: RecordingDuration,
        voicemailUrl: RecordingUrl,
      },
    );

    return call;
  }

  async handleMenuKeyPress(body): Promise<void> {
    const { Digits, CallSid, To, From, CallStatus } = body;
    const tries = parseInt(body.tries || '0', 10);

    const twiml = new Twilio.twiml.VoiceResponse();

    if (Digits == '1') {
      twiml.say('Forwarding your call.');
      const dial = twiml.dial({
        record: 'record-from-ringing',
      });
      dial.number(this.config.forwardToPhone);

      await this.updateCall(
        {
          sid: CallSid,
        },
        {
          status: CallStatusEnum.COMPLETED,
          type: CallType.FORWARDED,
        },
      );

      twiml.say('Thank You');
    } else if (Digits == '2') {
      twiml.say(
        'Please leave a message after the beep -  press * to end voicemail',
      );
      twiml.record({
        maxLength: 20,
        playBeep: true,
        finishOnKey: '*',
        action: '/calls/voice-mail',
        method: 'POST',
      });
    } else {
      twiml.say('incorrect key pressed!!!');
      twiml.redirect(`/calls/incoming?tries=${tries + 1}`);
    }

    return twiml.toString();
  }

  async getLogs(query: GetLogsQueryDto) {
    const { type, status, to, from, page, limit, sortBy } = query;
    const [sortField, sortOrder] = sortBy
      ? sortBy.split(':')
      : ['createdAt', 'DESC'];

    const qb = this.callRepository.createQueryBuilder('call');

    if (type) qb.andWhere('call.type = :type', { type });
    if (status) qb.andWhere('call.status = :status', { status });
    if (to) qb.andWhere('call.to = :to', { to });
    if (from) qb.andWhere('call.from = :from', { from });

    qb.orderBy(`call.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    if (page && limit) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
