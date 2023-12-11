// ** React Imports
import { FC, useEffect } from 'react';

// ** MUI Imports
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box, { BoxProps } from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

// ** Third Party Imports
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux';

// ** Actions Imports
import { addCurrencie, editCurrencie } from 'src/store/apps/currencies';

// ** Types Imports
import { RootState, AppDispatch } from 'src/store';
import { CurrencieType } from 'src/types/apps/currenciesType';
import { toast } from 'react-hot-toast';
import Translations from 'src/layouts/components/Translations';

interface SidebarAddUserType {
	open: boolean;
	toggle: () => void;
}

const Header = styled(Box)<BoxProps>(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(3, 4),
	justifyContent: 'space-between',
	backgroundColor: theme.palette.background.default
}));

const schema = yup.object().shape({
	displayName: yup.string().required(),
	symbol: yup.string().required()
});

const defaultValues = {
	displayName: '',
	symbol: ''
};

const SidebarAddUser: FC<SidebarAddUserType> = props => {
	// ** Props
	const { open, toggle } = props;

	// ** Hooks
	const dispatch = useDispatch<AppDispatch>();
	const store = useSelector((state: RootState) => state.currencies.currentCurrencie);
	const {
		reset,
		control,
		handleSubmit,
		formState: { errors }
	} = useForm({ defaultValues, mode: 'onChange', resolver: yupResolver(schema) });
	const onSubmit = async (data: CurrencieType) => {
		if (store) {
			const diffData: CurrencieType = {};
			Object.keys(data).map((key: string) => {
				if (data[key] !== store[key]) {
					diffData[key] = data[key];
				}
			});
			if (Object.keys(diffData).length > 0) {
				const resData = await dispatch(editCurrencie({ id: store.id!, data: diffData }));
				toggle();
				reset();
				if (resData.payload === 200) {
					toast.success('Успешно изменено');
				} else if (resData.payload.message) {
					if (Array.isArray(resData.payload.message)) {
						resData.payload.message.map((i: string) => toast.error(i));
					} else {
						toast.error(resData.payload.message);
					}
				}
			} else {
				toggle();
			}
		} else {
			const resData = await dispatch(addCurrencie(data));
			if (resData.payload.statusCode === 400 && resData.payload.message) {
				if (Array.isArray(resData.payload.message)) {
					resData.payload.message.map((i: string) => toast.error(i));
				} else {
					toast.error(resData.payload.message);
				}
			}
			toggle();
			reset();
		}
	};

	const handleClose = () => {
		toggle();
		reset();
	};
	useEffect(() => {
		if (store) {
			const { displayName, symbol } = store;
			reset({ displayName, symbol });
		} else {
			reset({ displayName: '', symbol: '' });
		}
	}, [store]);

	return (
		<Drawer
			open={open}
			anchor='right'
			variant='temporary'
			onClose={handleClose}
			ModalProps={{ keepMounted: true }}
			sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
		>
			<Header>
				<Typography variant='h6'>
					{store?.displayName ? store.displayName : <Translations text='currency' locale='labels' />}
				</Typography>
				<IconButton size='small' onClick={handleClose} sx={{ color: 'text.primary' }}>
					<Icon icon='mdi:close' fontSize={20} />
				</IconButton>
			</Header>
			<Box sx={{ p: 5 }}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FormControl fullWidth sx={{ mb: 6 }}>
						<Controller
							name='displayName'
							control={control}
							rules={{ required: true }}
							render={({ field: { value, onChange } }) => (
								<TextField
									value={value}
									label={<Translations text='currency' locale='labels' />}
									onChange={onChange}
									error={Boolean(errors.displayName)}
								/>
							)}
						/>
						{errors.displayName && (
							<FormHelperText sx={{ color: 'error.main' }}>{errors.displayName.message}</FormHelperText>
						)}
					</FormControl>
					<FormControl fullWidth sx={{ mb: 6 }}>
						<Controller
							name='symbol'
							control={control}
							rules={{ required: true }}
							render={({ field: { value, onChange } }) => (
								<TextField
									value={value}
									label={<Translations text='currencyCode' locale='labels' />}
									onChange={onChange}
									error={Boolean(errors.symbol)}
								/>
							)}
						/>
						{errors.symbol && (
							<FormHelperText sx={{ color: 'error.main' }}>{errors.symbol.message}</FormHelperText>
						)}
					</FormControl>
					<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridGap: 12 }}>
						<Button fullWidth size='large' variant='outlined' color='secondary' onClick={handleClose}>
							<Translations text='Cancel' locale='buttons' />
						</Button>
						<Button fullWidth size='large' type='submit' variant='contained'>
							<Translations text='Submit' locale='buttons' />
						</Button>
					</Box>
				</form>
			</Box>
		</Drawer>
	);
};

export default SidebarAddUser;
