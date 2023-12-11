import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';
import { IInvestmentCompletedTelegramMessage } from '../../../types/telegram-bot/invetsment-completed-telegram-message.interface';

export const investmentCompletedTelegramMessage = ({
  investmentDepositsAmount,
  income,
}: IInvestmentCompletedTelegramMessage) => {
  return `<b>Investment completed</b>\n<b>Investment deposits amount:</b> ${convertCentsToDollars(
    investmentDepositsAmount,
  )}$\n<b>Income:</b> ${convertCentsToDollars(income)}$`;
};
