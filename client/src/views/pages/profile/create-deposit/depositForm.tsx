import { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';

import { Typography, FormControl, TextField, FormHelperText, Button, CircularProgress } from '@mui/material';

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

interface defaultValues {
  amount: string;
  currencyAmount: string;
  fromAddress: string;
}

const defaultValues: defaultValues = {
  amount: '',
  currencyAmount: '',
  fromAddress: ''
};

type KeysAsString = `${keyof defaultValues}`;

type DepositFormProps = {
	activeCurrency: string;
};

const DepositForm: FC<DepositFormProps> = ({ activeCurrency }) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const { data: currencies, fixedCurrency } = useSelector((state: RootState) => state.currencies);
	const network = useSelector((state: RootState) => state.networks.currentNetwork);
  const currency = useSelector((state: RootState) => state.currencies.data?.find(currency => currency.id === activeCurrency))

	const timeout = useTimeout(1000);

	const { control, setError, clearErrors, setValue, handleSubmit, formState, getValues } = useForm({
		defaultValues
	});

	const currentCurrency = useMemo(() => {
		return currencies?.find(item => item.id === activeCurrency);
	}, [currencies, activeCurrency]);

	useEffect(() => {
		setIsLoading(true);
		clearErrors();
		timeout(() => {
			calculateAmount(getValues('amount'), 'amount');
		});
	}, [activeCurrency, fixedCurrency]);

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
    createDeposit({ amount: Number(data.amount), fromAddress: data.fromAddress });
  };

	const calculateAmount = async (value: string, key: KeysAsString) => {
		if (fixedCurrency?.id && value && key) {
			try {
				const data = {
					fixedCurrencyRateId: fixedCurrency.id
				};

				const response = await axios.post<{ amount: number; currencyAmount: number }>(
					authConfig.baseApiUrl + '/transfers/deposit/calculate-amount',
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

	const createDeposit = async (value: { amount: number, fromAddress: string }) => {
		if (fixedCurrency?.id) {
			try {
        const data: any = {
          fixedCurrencyRateId: fixedCurrency.id,
					amount: value.amount,
				};
        if (!!value.fromAddress) data.fromAddress = value.fromAddress;
				const response = await axios.post<TransferType>(
					authConfig.baseApiUrl + '/transfers/create-deposit',
					data,
					{
						headers: {
							Authorization: `Bearer ${storedToken}`
						}
					}
				);
				if (response.data?.id) {
					router.push('/apps/profile/transfers/' + response.data.id);
					toast.success(<Translations text='success' locale='labels' />, {
						position: 'bottom-center'
					});
				}
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
							if (!err.message) {
								setError('amount', {
									type: 'manual',
									message: err.key
								});
							}
						});
					} else if (error.response?.data.message) {
						toast.error(error.response?.data.message, {
							position: 'bottom-center'
						});
					} else {
						toast.error(<Translations text='error' locale='labels' />, {
							position: 'bottom-center'
						});
					}
				}
			}
		}
	};

	return (
		<form onSubmit={handleSubmit(submitForm)}>
			<FormControl fullWidth sx={{ mb: 5.25 }}>
				<Typography variant='h6'>{currentCurrency?.displayName}</Typography>
				<Controller
					name='currencyAmount'
					control={control}
					rules={{ required: true }}
					render={({ field: { value, onBlur } }) => (
						<TextField
							autoFocus
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
      {currency?.isSenderAddressRequired && (
        <FormControl fullWidth sx={{ mb: 5.25 }}>
          <Typography variant='h6'>{t('YourWalletAddress')}</Typography>
          <Controller
            name='fromAddress'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                autoFocus
                required={true}
                error={Boolean(formState.errors.fromAddress)}
                {...field}
              />
            )}
          />
          {formState.errors.fromAddress && (
            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.fromAddress.message}</FormHelperText>
          )}
        </FormControl>
      )}
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
				sx={{ mb: 5.25, mt: 4 }}
			>
				{isLoading ? <CircularProgress size={26} /> : <Translations text='TopUp' locale='buttons' />}
			</Button>
		</form>
	);
};

export default DepositForm;
