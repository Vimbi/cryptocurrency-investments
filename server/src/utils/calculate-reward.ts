export const calculateReward = ({
  amount,
  percentage,
}: {
  amount: number;
  percentage: number;
}) => {
  return Math.round((amount * percentage) / 100);
};
