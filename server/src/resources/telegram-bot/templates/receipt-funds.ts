import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';

export const receiptFundsTelegramMessage = ({
  amount,
  createdAt,
}: {
  amount: number;
  createdAt: Date;
}) => {
  return `<b>Receipt of Funds</b>\n<b>Amount:</b> ${convertCentsToDollars(
    amount,
  )}$\n<b>Date:</b> ${createdAt}`;
};
