import { BadRequestException } from '@nestjs/common';
import { parsePhoneNumber } from 'libphonenumber-js/mobile';
import { errorMsgs } from '../shared/error-messages';

interface ToNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}

export function toArray(value: string | string[]): any[] {
  return Array.isArray(value)
    ? value.map((id) => JSON.parse(id))
    : [JSON.parse(value)];
}

export function toLowerCase(value: string): string {
  return value.toLowerCase();
}

export function trim(value: string): string {
  return value?.trim();
}

export function toDate(value: string): Date {
  return new Date(value);
}

export function toBoolean(value: string): boolean {
  value = value.toLowerCase();

  return value === 'true' || value === '1' ? true : false;
}

export function toNumber(value: string, opts: ToNumberOptions = {}): number {
  let newValue: number = Number.parseInt(value || String(opts.default), 10);

  if (Number.isNaN(newValue)) {
    newValue = opts.default;
  }

  if (opts.min) {
    if (newValue < opts.min) {
      newValue = opts.min;
    }

    if (newValue > opts.max) {
      newValue = opts.max;
    }
  }

  return newValue;
}

export function hoursToMilliseconds(value: number) {
  if (value) {
    return value * 3600000;
  }
}

export function parseMobileNumber(value: string) {
  try {
    return parsePhoneNumber(
      value.toLowerCase().trim().replace(/[^\d]/g, ''),
      'RU',
    ).number;
  } catch (error) {
    throw new BadRequestException(`phone:${errorMsgs.mustBePhoneNumber}`);
  }
}
