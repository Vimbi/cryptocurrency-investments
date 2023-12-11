import { FC, MouseEvent, useState } from 'react';

import Chip from 'src/@core/components/mui/chip';
import Icon from 'src/@core/components/icon';
import { Menu, MenuItem } from '@mui/material';

import { TransferStatusesType } from 'src/types/apps/transfersType';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';

const statuses = {
	pending: {
		icon: 'mdi:receipt-text-clock',
		color: 'warning',
		correctSpelling: 'pending',
		label: 'В ожидании'
	},
	completed: { icon: 'mdi:star', color: 'success', correctSpelling: 'complete', label: 'Завершено' },
	processed: { icon: 'mdi:publish', color: 'info', correctSpelling: 'publish', label: 'Просмотрено' },
	canceled: { icon: 'mdi:cancel', color: 'error', correctSpelling: 'cancel', label: 'Отменено' }
};

const TransferStatus = ({
	status,
	handleOnClick
}: {
	status: Required<TransferStatusesType>;
	handleOnClick: (event: MouseEvent<HTMLDivElement>) => void;
}) => {
	const statusObj = statuses[status.name];
	const loc = status.localeContent[0]?.displayName;

	return (
		<Chip
			onClick={handleOnClick}
			icon={<Icon icon={statusObj.icon} />}
			skin='light'
			size='medium'
			label={loc ?? statusObj.label}
			color={statusObj.color as 'warning' | 'success' | 'info' | 'error' | 'default' | 'primary' | 'secondary'}
			sx={{ textTransform: 'capitalize', pl: 1 }}
		/>
	);
};

type TransferStatusAtctionProps = {
	status: Required<TransferStatusesType>;
	setStatus: (name: TransferStatusesType['name']) => void;
};

const TransferStatusAtction: FC<TransferStatusAtctionProps> = ({ status, setStatus }) => {
	const { transferStatuses } = useSelector((state: RootState) => state.transfers);

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleOnOpen = (event: MouseEvent<HTMLDivElement>) => {
		if (status?.name === 'pending' || status?.name === 'processed') {
			setAnchorEl(event.currentTarget);
		}
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const hanldeOnClick = (name: TransferStatusesType['name']) => {
		setStatus(name);
		handleClose();
	};

	return (
		<>
			<TransferStatus status={status} handleOnClick={handleOnOpen} />
			{!!transferStatuses && (
				<Menu keepMounted anchorEl={anchorEl} onClose={handleClose} open={Boolean(anchorEl)}>
					{transferStatuses
						.filter(item => item.name !== status.name && item.name !== 'pending')
						.map(item => (
							<MenuItem
								onClick={() => hanldeOnClick(item.name)}
								key={item.id}
								sx={{
									'& svg': { color: statuses[`${item.name}`]?.color + '.main', mr: 2 }
								}}
							>
								<Icon icon={statuses[`${item.name}`].icon} />
								{item.localeContent[0]?.displayName ?? statuses[`${item.name}`].label}
							</MenuItem>
						))}
				</Menu>
			)}
		</>
	);
};

export default TransferStatusAtction;
