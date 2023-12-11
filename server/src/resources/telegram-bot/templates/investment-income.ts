import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';
import { IInvestmentIncomeTelegramMessage } from '../../../types/telegram-bot/investment-income-telegram-message.interface';

export const investmentIncomeTelegramMessage = ({
  dailyIncome,
  investmentStartDate,
  investmentDueDate,
  totalBalance,
  amountWithdrawalAvailable,
}: IInvestmentIncomeTelegramMessage) => {
  return `<b>Investment income</b>\n<b>Investment opening date:</b> ${investmentStartDate}\n<b>Investment end date:</b> ${investmentDueDate}\n<b>Income per day:</b> ${convertCentsToDollars(
    dailyIncome,
  )}$\n<b>Total amount on balance:</b> ${convertCentsToDollars(
    totalBalance,
  )}$\n<b>Available for withdrawal:</b> ${convertCentsToDollars(
    amountWithdrawalAvailable,
  )}$`;
};
