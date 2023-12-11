import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.join(__dirname, '../../.env'),
});

export const sendMessageHeldeskTTL =
  parseInt(process.env.THROTTLER_SEND_MESSAGE_HELPDESK_SECONDS, 10) || 60;
export const sendMessageHeldeskLimit =
  parseInt(process.env.THROTTLER_SEND_MESSAGE_HELPDESK_LIMIT, 10) || 1;
export const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
