import { FC } from 'react';

import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Translations from 'src/layouts/components/Translations';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	onCancelIvestment: () => void;
}

const CancelIvestModal: FC<Props> = ({ open, setOpen, onCancelIvestment }) => {
	return (
		<Dialog open={open} onClose={() => setOpen(false)}>
			<DialogTitle>
				<Translations text='InvestCancel' locale='buttons' />
			</DialogTitle>
			<DialogContent>
				<Translations text='InvestCancelMessage' locale='investment' />
			</DialogContent>
			<DialogActions>
				<Button variant='outlined' color='primary' onClick={() => setOpen(false)}>
					<Translations text='Cancel' locale='buttons' />
				</Button>
				<Button color='error' variant='contained' onClick={onCancelIvestment}>
					<Translations text='Submit' locale='buttons' />
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CancelIvestModal;
