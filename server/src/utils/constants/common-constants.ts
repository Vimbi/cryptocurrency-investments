import { TransactionTypeEnum } from '../../resources/transaction-types/transaction-type.enum';

export const DEVELOPMENT = 'development';
export const PRODUCTION = 'production';
export const CODE_LENGTH = 6;
export const SHORT_LENGTH = 100;
export const AVERAGE_LENGTH = 200;
export const LONG_LENGTH = 1000;
export const HELPDESK_MESSAGE_LENGTH = 3500;
export const LARGE_LENGTH = 10000;
export const MAX_DECIMAL_PLACES = 2;
export const MAX_NUMBER_DIGITS_PERCENTAGE = 4;
export const MAX_NUMBER_DIGITS = 10;
export const MAX_NUMBER_DIGITS_CURRENCY = 11;
export const MAX_DECIMAL_PLACES_CURRENCY = 6;
export const FILES_NUMBER_LIMIT = 20;

// export const RATE_MAX_NUMBER_DIGITS = 10;
// export const RATE_MAX_DECIMAL_PLACES = 10;

export const PASSWORD_REGEX =
  /(?=.*[0-9])(?=.*[!"#$%&'()*+,-.\/:;<=>?@\]\[^_`{|}~”])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!"#$%&'()*+,-.\/:;<=>?@\]\[^_`{|}~”]{8,}/;

export const DEFAULT_LIMIT = 10;
export const DEFAULT_PAGE = 1;

export const DEPOSIT_TRANSACTION_TYPES = [
  TransactionTypeEnum.deposit,
  TransactionTypeEnum.income,
  TransactionTypeEnum.reward,
  TransactionTypeEnum.internalTransferIncoming,
];
