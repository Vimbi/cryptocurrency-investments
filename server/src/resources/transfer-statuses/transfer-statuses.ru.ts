import { TransferStatusEnum } from './transfer-status.enum';

export const TransferStatusesRu = {
  [TransferStatusEnum.canceled]: 'Отменено',
  [TransferStatusEnum.completed]: 'Завершено',
  [TransferStatusEnum.pending]: 'В ожидании',
  [TransferStatusEnum.processed]: 'Просмотрено',
};
