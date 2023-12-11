import * as moment from 'moment';

export const defineInvestmentDates = (investmentTerm: number) => {
  const now = moment();
  const noon = moment(now).clone().hour(12).minute(0).second(0);
  const isBeforeNoon = moment(now).isBefore(noon);
  const startDate = isBeforeNoon ? now : now.clone().add(1, 'days');
  const dueDate = startDate.clone().add(investmentTerm - 1, 'days');
  return { startDate, dueDate };
};
