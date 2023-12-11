import { FC, useState } from 'react';

import authConfig from 'src/configs/auth';

import { Grid, Card, CardHeader, Button } from '@mui/material';
import Icon from 'src/@core/components/icon';

import TransferInfo from 'src/views/pages/profile/transfers/TransferInfo';
import TransferTxid from 'src/views/pages/profile/transfers/TransferTxid';
import TransferOperation from 'src/views/pages/profile/transfers/TransferOperation';
import DialogTransaction from 'src/views/components/dialogs/DialogTransaction';

import { useRouter } from 'next/router';

import TransferStatusAtction from './TransferStatusAtction';

import { TransferStatusesType, TransferType, TransferTypesType } from 'src/types/apps/transfersType';

import axios from 'axios';
import { toast } from 'react-hot-toast';
import Translations from 'src/layouts/components/Translations';

type TransferCardAdminProps = {
	transfer: Required<TransferType>;
	onReload?: () => void;
};

const TransferCardsAdmin: FC<TransferCardAdminProps> = ({ transfer, onReload }) => {
	const router = useRouter();

	const [modal, setModal] = useState<{
		isOpen: boolean;
		statusName: TransferStatusesType['name'] | null;
	}>({
		isOpen: false,
		statusName: null
	});

	const type = transfer.type.localeContent[0]?.displayName;

	const handleOnError = (text: string, error: any) => {
		if (axios.isAxiosError(error)) {
			toast.error(text);
		} else {
			toast('Ощибка');
		}
	};

	const handleOnSuccess = (text: string) => {
		toast.success(text);
		if (onReload) onReload();
	};

	const handleType = (transferType: TransferTypesType['name']) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		switch (transferType) {
			case 'deposit':
				return (status: 'cancel' | 'confirm' | 'process', data: Record<string, any>) =>
					axios.patch(
						`${authConfig.baseApiUrl}/transfers/${status}-deposit`,
						{ ...data, transferId: transfer.id },
						{
							headers: {
								Authorization: `Bearer ${storedToken}`
							}
						}
					);

			case 'withdrawal':
				return (status: 'cancel' | 'confirm' | 'process', data: Record<string, any>) =>
					axios.patch(
						`${authConfig.baseApiUrl}/transfers/${status}-withdrawal`,
						{ ...data, transferId: transfer.id },
						{
							headers: {
								Authorization: `Bearer ${storedToken}`
							}
						}
					);
		}
	};

	const handleOnSetStatus = (statusName: TransferStatusesType['name']) => {
		switch (statusName) {
			case 'processed':
				if (transfer.type.name == 'withdrawal') handleOnOpen(statusName);
				if (transfer.type.name == 'deposit') handleOnBase('process');
				break;
			case 'canceled':
				handleOnOpen(statusName);
				break;
			case 'completed':
				handleOnBase('confirm');
				break;
		}
	};

	const handleOnOpen = (statusName: TransferStatusesType['name']) => {
		setModal({
			isOpen: true,
			statusName: statusName
		});
	};

	const handleOnBase = async (type: 'confirm' | 'process') => {
		const apiType = handleType(transfer.type.name);
		await apiType(type, {})
			.then(() => {
				handleOnSuccess(`Трансфер ${type === 'process' ? 'просмотрен' : 'подтверждён'}`);
			})
			.catch(err => {
				if (type === 'process') {
					handleOnError('Нет хэша транзации', err);
				} else {
					handleOnError('Ошибка подтверждения трансфера', err);
				}
			});
	};

	const handleOnConfirm = async (note: string) => {
		const apiType = handleType(transfer.type.name);
		if (modal.statusName == 'processed' && transfer.type.name == 'withdrawal') {
			await apiType('process', { txId: note })
				.then(() => {
					handleOnSuccess('Трансфер просмотрен');
				})
				.catch(err => handleOnError('Заявка на вывод без хэша', err));
		}
		if (modal.statusName == 'canceled') {
			await apiType('cancel', { note: note })
				.then(() => {
					handleOnSuccess('Трансфер отменён');
				})
				.catch(err => {
					handleOnError('Нужно указать причину', err);
				});
		}

		handleOnClose();
	};

	const handleOnClose = () => {
		setModal({
			isOpen: false,
			statusName: null
		});
	};

	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<Grid container alignItems='center' spacing={2}>
					<Grid item height={48}>
						<Button
							onClick={() => router.push('/apps/transfers')}
							variant='contained'
							color='primary'
							startIcon={<Icon icon='mdi:backburger' />}
						>
							<Translations text='Back' locale='buttons' />
						</Button>
					</Grid>
				</Grid>
			</Grid>
			<Grid item xs={12}>
				<Card>
					<CardHeader
						title={type}
						action={<TransferStatusAtction status={transfer.status} setStatus={handleOnSetStatus} />}
					/>
				</Card>
			</Grid>
			{transfer.txId && (
				<Grid item xs={12}>
					<TransferTxid transferId={transfer.id} txId={transfer.txId} isAdmin={true} />
				</Grid>
			)}
			<Grid item xs={6}>
				<TransferInfo info={transfer} />
			</Grid>
			<Grid item xs={6}>
				<TransferOperation operation={transfer} />
			</Grid>
			<DialogTransaction
				open={modal.isOpen}
				statusName={modal.statusName}
				type={transfer.type.name}
				setClose={handleOnClose}
				onConfirm={handleOnConfirm}
			/>
		</Grid>
	);
};

export default TransferCardsAdmin;
