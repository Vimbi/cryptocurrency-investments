import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';

import {
	Typography,
	FormControl,
	TextField,
	FormHelperText,
	Button,
	CircularProgress,
	Autocomplete
} from '@mui/material';

import { useSelector } from 'react-redux';

import { RootState } from 'src/store';
import { useForm, Controller } from 'react-hook-form';
import useTimeout from 'src/hooks/useTimeout';
import axios from 'axios';

import authConfig from 'src/configs/auth';
import { parseErrors } from 'src/@core/utils/parseErrors';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

import { TransferType } from 'src/types/apps/transfersType';
import { useTranslation } from 'next-i18next';
import Translations from 'src/layouts/components/Translations';
import WithdrawalConfirm from './WithdrawalConfirm';

interface defaultValues {
	amount: string;
	currencyAmount: string;
	withdrawalAddress: string;
}

const defaultValues: defaultValues = {
	amount: '',
	currencyAmount: '',
	withdrawalAddress: ''
};

type KeysAsString = `${keyof defaultValues}`;

type WithdrawalFormProps = {
	activeCurrency: string;
};

const WithdrawalForm: FC<WithdrawalFormProps> = ({ activeCurrency }) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const transferId = Boolean(router.query.transferConfirmId);
	const amountUrl = router.query.amount?.toString();
	const addressUrl = router.query.withdrawalAddress?.toString();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [openConfirm, setOpenConfirm] = useState(false);
	const prevCurrency = useRef(activeCurrency);
	const [currencyAddress, setCurrencyAddress] = useState<{ [key in keyof any]: string }>({});
	const { data: currencies, fixedCurrency } = useSelector((state: RootState) => state.currencies);
	const { data: wallets } = useSelector((state: RootState) => state.wallets);
	const network = useSelector((state: RootState) => state.networks.currentNetwork);

	const timeout = useTimeout(1000);

	const { control, setError, clearErrors, setValue, watch, handleSubmit, formState, getValues } = useForm({
		defaultValues
	});

	const currentCurrency = useMemo(() => {
		return currencies?.find(item => item.id === activeCurrency);
	}, [currencies, activeCurrency]);

	const options = useMemo((): string[] => {
		return wallets.filter(item => item.network.currencyId === activeCurrency).map(item => item.address);
	}, [wallets]);

	useEffect(() => {
		setIsLoading(true);
		clearErrors();
		timeout(() => {
			calculateAmount(getValues('amount'), 'amount');
		});
	}, [activeCurrency, fixedCurrency]);

	useEffect(() => {
		if (activeCurrency !== prevCurrency.current) {
			if (!!currencyAddress[activeCurrency]) {
				setValue('withdrawalAddress', currencyAddress[activeCurrency]);
			} else {
				setValue('withdrawalAddress', '');
			}
			prevCurrency.current = activeCurrency;
		}
	}, [activeCurrency]);

	useEffect(() => {
		setCurrencyAddress(prev => ({ ...prev, [activeCurrency]: getValues('withdrawalAddress') }));
	}, [watch('withdrawalAddress')]);

	const handleOnChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: KeysAsString) => {
		setValue(key, event.target.value);
		if (event.target.value) {
			setIsLoading(true);
			clearErrors();
			timeout(() => {
				calculateAmount(getValues(key), key);
			});
		} else {
			setError(key, {
				message: `${t('required')}`
			});
		}
	};

	const submitForm = (data: defaultValues) => {
		createWithDrawal({ amount: Number(data.amount), withdrawalAddress: data.withdrawalAddress });
	};

	const calculateAmount = async (value: string, key: KeysAsString) => {
		if (fixedCurrency?.id && value && key) {
			try {
				const data = {
					fixedCurrencyRateId: fixedCurrency.id
				};
				const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
				const response = await axios.post<{ amount: number; currencyAmount: number }>(
					authConfig.baseApiUrl + '/transfers/withdrawal/calculate-amount',
					{ ...data, [key]: Number(value) },
					{
						headers: {
							Authorization: `Bearer ${storedToken}`
						}
					}
				);
				const res = response.data;
				setValue('amount', String(res.amount));
				setValue('currencyAmount', String(res.currencyAmount));
				router.push({ query: { ...router.query, amount: res.amount } });
			} catch (error) {
				if (axios.isAxiosError(error)) {
					if (error.response?.data.message && Array.isArray(error.response?.data.message)) {
						const errors = parseErrors(error.response.data.message);
						errors.forEach(err => {
							if (err?.key) {
								setError(err.key as KeysAsString, {
									type: 'manual',
									message: err.message
								});
							}
						});
					}
				}
			} finally {
				setIsLoading(false);
			}
		} else {
			setIsLoading(false);
		}
	};

	const createWithDrawal = async (value: { amount: number; withdrawalAddress: string }) => {
		if (fixedCurrency?.id) {
			try {
				const data = {
          fixedCurrencyRateId: fixedCurrency.id,
					amount: value.amount,
					withdrawalAddress: value.withdrawalAddress
				};
				const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
				const response = await axios.post<TransferType>(
					authConfig.baseApiUrl + '/transfers/send-withdrawal-code',
					data,
					{
						headers: {
							Authorization: `Bearer ${storedToken}`
						}
					}
				);

				if (response.status === 201) {
					router.push({
						query: {
							...router.query,
							withdrawalAddress: value.withdrawalAddress,
							transferConfirmId: 'true'
						}
					});
				}
			} catch (error) {
				if (axios.isAxiosError(error) && error.response?.data.message) {
					if (Array.isArray(error.response?.data.message)) {
						const errors = parseErrors(error.response.data.message);
						errors.forEach(err => {
							if (err?.key) {
								setError(err.key as KeysAsString, {
									type: 'manual',
									message: err.message
								});
							}
							if (!err.message) {
								setError('amount', {
									type: 'manual',
									message: err.key
								});
							}
						});
					} else {
						toast.error(error.response.data.message, {
							position: 'bottom-center'
						});
					}
				}
			}
		}
	};

	const handleCloseConfirm = () => {
		setOpenConfirm(false);
	};

	useEffect(() => {
		if (transferId) setOpenConfirm(true);
	}, [transferId]);

	useEffect(() => {
		if (amountUrl && (!getValues('amount') || getValues('amount') !== amountUrl)) setValue('amount', amountUrl);
	}, [amountUrl]);
	useEffect(() => {
		if (addressUrl && (!getValues('withdrawalAddress') || getValues('withdrawalAddress') !== addressUrl))
			setValue('withdrawalAddress', addressUrl);
	}, [addressUrl]);

	return (
		<>
			<WithdrawalConfirm open={openConfirm} isLoading={isLoading} onClose={handleCloseConfirm} />
			<form onSubmit={handleSubmit(submitForm)}>
				<FormControl fullWidth sx={{ mb: 5.25 }}>
					<Typography variant='h6'>USDT</Typography>
					<Controller
						name='amount'
						control={control}
						rules={{ required: true }}
						render={({ field: { value, onBlur } }) => (
							<TextField
								autoFocus
								type='number'
								required={true}
								value={value}
								onBlur={onBlur}
								onChange={event => handleOnChange(event, 'amount')}
								error={Boolean(formState.errors.amount)}
							/>
						)}
					/>
					{formState.errors.amount && (
						<FormHelperText sx={{ color: 'error.main' }}>{formState.errors.amount.message}</FormHelperText>
					)}
				</FormControl>
				<FormControl fullWidth sx={{ mb: 12 }}>
					<Typography variant='h6'> На {currentCurrency?.displayName}</Typography>
					<Controller
						name='currencyAmount'
						control={control}
						rules={{ required: true }}
						render={({ field: { value, onBlur } }) => (
							<TextField
								type='number'
								value={value}
								onBlur={onBlur}
								onChange={event => handleOnChange(event, 'currencyAmount')}
								error={Boolean(formState.errors.currencyAmount)}
							/>
						)}
					/>
					{formState.errors.currencyAmount && (
						<FormHelperText sx={{ color: 'error.main' }}>
							{formState.errors.currencyAmount.message}
						</FormHelperText>
					)}
				</FormControl>
				<FormControl fullWidth sx={{ mb: 5.25 }}>
					<Controller
						name='withdrawalAddress'
						control={control}
						rules={{ required: true }}
						render={({ field: { value, onChange } }) => (
							<Autocomplete
								options={options}
								value={value}
								fullWidth
								freeSolo
								onChange={(e, value) => onChange(value)}
								renderInput={params => (
									<TextField
										{...params}
										value={value}
										onChange={event => onChange(event.target.value)}
										label={<Translations text='walletAddress' locale='labels' />}
										error={Boolean(formState.errors.withdrawalAddress)}
									/>
								)}
							/>
						)}
					/>
					{formState.errors.withdrawalAddress && (
						<FormHelperText sx={{ color: 'error.main' }}>
							{formState.errors.withdrawalAddress.message}
						</FormHelperText>
					)}
				</FormControl>
				{!network && (
					<Typography variant='body1'>
						<Translations text='NoTransferOption' locale='common' />
					</Typography>
				)}
				<Button
					fullWidth
					size='large'
					disabled={isLoading || !network}
					type='submit'
					variant='contained'
					sx={{ mb: 5.25 }}
				>
					{isLoading ? <CircularProgress size={26} /> : <Translations text='BringOut' locale='buttons' />}
				</Button>
			</form>
		</>
	);
};

export default WithdrawalForm;
