// ** React Imports
import { FC, useState } from 'react';

// ** MUI Imports
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import DialogSendCode from 'src/views/components/dialogs/DialogSendCode';
import { useAuth } from 'src/hooks/useAuth';
import { toast } from 'react-hot-toast';

// ** Config

import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { disableTwoFactor, enableTwoFactor } from 'src/store/apps/profile';
import Translations from 'src/layouts/components/Translations';

interface Props {
	isEnabled: boolean;
}

const TwoFactorAuthenticationCard: FC<Props> = ({ isEnabled }) => {
	// ** States
	const [open, setOpen] = useState<boolean>(false);
	const [code, setCode] = useState<string | null>(null);
	const [errorTwoFactor, setErrorTwoFactor] = useState<string | null>(null);

	const dispatch = useDispatch<AppDispatch>();

	const auth = useAuth();

	const successOpenDialogCallback = ({ code }: { code?: string }) => {
		setOpen(true);
		if (!!code) {
			setCode(code);
		}
	};

	const errorOpenDialigCallback = (message: string) => {
		toast.error(message, {
			position: 'bottom-center'
		});
	};

	const openDialog = () => {
		auth.sendCode(successOpenDialogCallback, errorOpenDialigCallback);
	};

	const closeDialog = () => {
		setCode(null);
		setOpen(false);
	};

	const handleOnConfim = (code: string) => {
		if (isEnabled) handleOnDisable(code);
		else handleOnEnable(code);
	};

	const handleOnEnable = (code: string) => {
		dispatch(
			enableTwoFactor({
				twoFactorAuthenticationCode: code,
				successCalback: () => {
					closeDialog();
					toast.success('Успешно', {
						position: 'bottom-center'
					});
				},
				errorCalback: () => setErrorTwoFactor('Wrong2FA')
			})
		);
	};

	const handleOnDisable = (code: string) => {
		dispatch(
			disableTwoFactor({
				twoFactorAuthenticationCode: code,
				successCalback: () => {
					closeDialog();
					toast.success(<Translations text='success' locale='labels' />, {
						position: 'bottom-center'
					});
				},
				errorCalback: () => setErrorTwoFactor('Wrong2FA')
			})
		);
	};

	return (
		<>
			<Card>
				<CardHeader title={<Translations text='2FA' locale='labels' />} />
				<CardContent>
					{isEnabled ? (
						<Button variant='contained' onClick={openDialog}>
							<Translations text='off' locale='buttons' />
						</Button>
					) : (
						<Button variant='contained' onClick={openDialog}>
							<Translations text='on' locale='buttons' />
						</Button>
					)}
				</CardContent>
			</Card>

			<DialogSendCode
				open={open}
				setIsClose={closeDialog}
				onConfirm={handleOnConfim}
				code={code}
				error={errorTwoFactor}
			/>
		</>
	);
};

export default TwoFactorAuthenticationCard;
