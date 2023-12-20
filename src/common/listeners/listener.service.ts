import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../constants/rs-user';

@Injectable()
export class ListenerService {
  @OnEvent(EVENTS.SEND_OTP_EMAIL)
  sendOTPEmail(data: any) {
    console.log('Use your messenger service!', data);
  }
}
