import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';
import { IReferralRewardTelegramMessage } from '../../../types/telegram-bot/referral-reward-telegram-message.interface';
import { convertNumberToPercentage } from '../../../utils/convert-number-to-percentage';

export const referralRewardTelegramMessage = ({
  investmentAmount,
  referralRewardPercentage,
  referralRewardAmount,
  totalBalance,
  amountWithdrawalAvailable,
}: IReferralRewardTelegramMessage) => {
  return `<b>You have a new referral</b>\n<b>Investment amount:</b> ${convertCentsToDollars(
    investmentAmount,
  )}$\n<b>Your referral reward:</b> ${convertNumberToPercentage(
    referralRewardPercentage,
  )}%\n<b>Referral reward amount:</b> ${convertCentsToDollars(
    referralRewardAmount,
  )}$\n<b>Total amount on balance:</b> ${convertCentsToDollars(
    totalBalance,
  )}$\n<b>Available for withdrawal:</b> ${convertCentsToDollars(
    amountWithdrawalAvailable,
  )}$`;
};
