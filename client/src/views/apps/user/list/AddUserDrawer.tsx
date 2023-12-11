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
// import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

// ** Actions Imports
// import { addCurrencie, editCurrencie } from 'src/store/apps/currencies';

// ** Types Imports
import { CurrencieType } from 'src/types/apps/currenciesType';
import { RootState } from 'src/store';

// import { toast } from 'react-hot-toast';

interface SidebarAddUserType {
	open: boolean;
	toggle: () => void;
}

// interface UserData {
// 	email: string;
// 	company: string;
// 	country: string;
// 	contact: number;
// 	fullName: string;
// }

// const showErrors = (field: string, valueLen: number, min: number) => {
// 	if (valueLen === 0) {
// 		return `${field} field is required`;
// 	} else if (valueLen > 0 && valueLen < min) {
// 		return `${field} must be at least ${min} characters`;
// 	} else {
// 		return '';
// 	}
// };

const Header = styled(Box)<BoxProps>(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(3, 4),
	justifyContent: 'space-between',
	backgroundColor: theme.palette.background.default
}));

const schema = yup.object().shape({
	phone: yup.string().required('Обязательное поле'),
	email: yup.string().required('Обязательное поле'),
	password: yup.string().required('Обязательное поле'),
	firstName: yup.string().required('Обязательное поле'),
	lastName: yup.string().required('Обязательное поле'),
	surname: yup.string().required('Обязательное поле'),
	roleId: yup.string().required('Обязательное поле'),
	statusId: yup.string().required('Обязательное поле')
});

const defaultValues = {
	phone: '',
	email: '',
	password: '',
	firstName: '',
	lastName: '',
	surname: '',
	roleId: '',
	statusId: ''
};

const SidebarAddUser: FC<SidebarAddUserType> = props => {
	// ** Props
	const { open, toggle } = props;

	// ** State
	// const [plan, setPlan] = useState<string>('basic');
	// const [role, setRole] = useState<string>('subscriber');

	// ** Hooks
	// const dispatch = useDispatch<AppDispatch>();
	const store = useSelector((state: RootState) => state.currencies.currentCurrencie);
	const {
		reset,
		control,
		handleSubmit,
		formState: { errors }
	} = useForm({ defaultValues, mode: 'onChange', resolver: yupResolver(schema) });
	const onSubmit = async (data: CurrencieType) => {
		console.log(data);

		// if (store) {
		// 	const diffData: CurrencieType = {};
		// 	Object.keys(data).map((key: string) => {
		// 		if (data[key] !== store[key]) {
		// 			diffData[key] = data[key];
		// 		}
		// 	});
		// 	if (Object.keys(diffData).length > 0) {
		// 		const resData = await dispatch(editCurrencie({ id: store.id!, data: diffData }));
		// 		toggle();
		// 		reset();
		// 		if (resData.payload === 200) {
		// 			toast.success('Успешно изменено');
		// 		} else {
		// 			toast.error('Произошла ошибка');
		// 		}
		// 	} else {
		// 		toggle();
		// 	}
		// } else {
		// 	dispatch(addCurrencie(data));
		// 	toggle();
		// 	reset();
		// }
	};

	const handleClose = () => {
		// setPlan('basic');
		// setRole('subscriber');
		toggle();
		reset();
	};
	useEffect(() => {
		if (store) {
			// const { displayName, symbol } = store;
			// reset({ displayName, symbol });
		} else {
			// reset({ displayName: '', symbol: '' });
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
				<Typography variant='h6'>{store?.displayName ? store.displayName : 'Добавить клиента'}</Typography>
				<IconButton size='small' onClick={handleClose} sx={{ color: 'text.primary' }}>
					<Icon icon='mdi:close' fontSize={20} />
				</IconButton>
			</Header>
			<Box sx={{ p: 5 }}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FormControl fullWidth sx={{ mb: 6 }}>
						<Controller
							name='phone'
							control={control}
							rules={{ required: true }}
							render={({ field: { value, onChange } }) => (
								<TextField
									value={value}
									label='Телефон'
									onChange={onChange}
									error={Boolean(errors.phone)}
								/>
							)}
						/>
						{errors.phone && (
							<FormHelperText sx={{ color: 'error.main' }}>{errors.phone.message}</FormHelperText>
						)}
					</FormControl>
					<FormControl fullWidth sx={{ mb: 6 }}>
						<Controller
							name='email'
							control={control}
							rules={{ required: true }}
							render={({ field: { value, onChange } }) => (
								<TextField
									value={value}
									label='Почта'
									onChange={onChange}
									error={Boolean(errors.email)}
								/>
							)}
						/>
						{errors.email && (
							<FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>
						)}
					</FormControl>
					<FormControl fullWidth sx={{ mb: 6 }}>
						<Controller
							name='password'
							control={control}
							rules={{ required: true }}
							render={({ field: { value, onChange } }) => (
								<TextField
									value={value}
									label='Пароль'
									onChange={onChange}
									error={Boolean(errors.password)}
								/>
							)}
						/>
						{errors.password && (
							<FormHelperText sx={{ color: 'error.main' }}>{errors.password.message}</FormHelperText>
						)}
					</FormControl>
					<FormControl fullWidth sx={{ mb: 6 }}>
						<Controller
							name='firstName'
							control={control}
							rules={{ required: true }}
							render={({ field: { value, onChange } }) => (
								<TextField
									value={value}
									label='Имя'
									onChange={onChange}
									error={Boolean(errors.firstName)}
								/>
							)}
						/>
						{errors.firstName && (
							<FormHelperText sx={{ color: 'error.main' }}>{errors.firstName.message}</FormHelperText>
						)}
					</FormControl>
					<FormControl fullWidth sx={{ mb: 6 }}>
						<Controller
							name='lastName'
							control={control}
							rules={{ required: true }}
							render={({ field: { value, onChange } }) => (
								<TextField
									value={value}
									label='Фамилия'
									onChange={onChange}
									error={Boolean(errors.lastName)}
								/>
							)}
						/>
						{errors.lastName && (
							<FormHelperText sx={{ color: 'error.main' }}>{errors.lastName.message}</FormHelperText>
						)}
					</FormControl>
					<FormControl fullWidth sx={{ mb: 6 }}>
						<Controller
							name='surname'
							control={control}
							rules={{ required: true }}
							render={({ field: { value, onChange } }) => (
								<TextField
									value={value}
									label='Отчество'
									onChange={onChange}
									error={Boolean(errors.surname)}
								/>
							)}
						/>
						{errors.surname && (
							<FormHelperText sx={{ color: 'error.main' }}>{errors.surname.message}</FormHelperText>
						)}
					</FormControl>

					<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: 12 }}>
						<Button fullWidth size='large' variant='outlined' color='secondary' onClick={handleClose}>
							Отмена
						</Button>
						<Button fullWidth size='large' type='submit' variant='contained'>
							Подтвердить
						</Button>
					</Box>
				</form>
			</Box>
		</Drawer>
	);
};

export default SidebarAddUser;
