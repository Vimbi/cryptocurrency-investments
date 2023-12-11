// ** React Imports
import { FC, Fragment, useMemo, useState } from 'react';

// ** MUI Imports
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

import { TransferStatusesType, TransferTypesType } from 'src/types/apps/transfersType';

type DialogTransactionProps = {
	open: boolean;
	statusName: TransferStatusesType['name'] | null;
	type: TransferTypesType['name'] | null;
	setClose: () => void;
	onConfirm: (note: string) => void;
};

const DialogTransaction: FC<DialogTransactionProps> = ({ open, statusName, type, setClose, onConfirm }) => {
	const [note, setNote] = useState('');

	const getTitleText = useMemo(() => {
		if (statusName === 'canceled') {
			return { title: 'Причина отмены', text: 'Введите причину отмены перевода', label: 'Причина' };
		} else if (statusName === 'processed' && type === 'withdrawal') {
			return { title: 'Хэш операции', text: 'Введите хэш операции', label: 'Хэш' };
		}

		return { title: '', text: '', label: '' };
	}, [statusName]);

	const handleOnConfirm = () => {
		onConfirm(note);
	};

	const handleClose = () => setClose();

	return (
		<Fragment>
			<Dialog
				fullWidth
				maxWidth='sm'
				open={open}
				disableEscapeKeyDown
				aria-labelledby='alert-dialog-title'
				aria-describedby='alert-dialog-description'
				onClose={reason => {
					if (reason !== 'backdropClick') {
						handleClose();
					}
				}}
			>
				<DialogTitle id='alert-dialog-title'>{getTitleText.title}</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 5 }}>{getTitleText.text}</DialogContentText>
					<TextField
						value={note}
						onChange={e => setNote(e.target.value)}
						id='note'
						autoFocus
						fullWidth
						label={getTitleText.label}
					/>
				</DialogContent>
				<DialogActions className='dialog-actions-dense'>
					<Button onClick={handleClose}>Отмена</Button>
					<Button variant='contained' onClick={handleOnConfirm}>
						Подтвердить
					</Button>
				</DialogActions>
			</Dialog>
		</Fragment>
	);
};

export default DialogTransaction;
