import { FC, useEffect, useRef, useState } from 'react';

import { Box, Typography } from '@mui/material';

import CustomAvatar from 'src/@core/components/mui/avatar';
import useTimeout from 'src/hooks/useTimeout';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import { getFixedCurrency } from 'src/store/apps/currencies';
import { useSelector } from 'react-redux';
import Translations from 'src/layouts/components/Translations';

type DepositCurrentProps = {
	activeNetwork: string | undefined;
};

const CurrentCourse: FC<DepositCurrentProps> = ({ activeNetwork }) => {
	const { fixedCurrency } = useSelector((state: RootState) => state.currencies);

	const intervalRef = useRef<ReturnType<typeof setInterval>>();

	const timeout = useTimeout(30000);

	const dispach = useDispatch<AppDispatch>();

	const [timer, setTimer] = useState<number>(30);

	useEffect(() => {
		dispach(getFixedCurrency({ networkId: activeNetwork }));
		handleOnFixedCurrensy();
	}, [activeNetwork]);

	const handleOnFixedCurrensy = () => {
		clearInterval(intervalRef.current);
		setTimer(30);
		if (activeNetwork) {
			intervalRef.current = setInterval(() => {
				setTimer(prev => prev - 1);
			}, 1000);
			timeout(() => {
				clearInterval(intervalRef.current);
				dispach(getFixedCurrency({ networkId: activeNetwork }));
				handleOnFixedCurrensy();
			});
		}
	};

	return (
		<Box sx={{ display: 'flex', alignItems: 'center' }}>
			<CustomAvatar variant='rounded' color='primary' sx={{ mr: 3, boxShadow: 3, width: 44, height: 44 }}>
				{timer}
			</CustomAvatar>
			<Box sx={{ display: 'flex', flexDirection: 'column' }}>
				<Typography variant='caption'>
					<Translations text='Course' locale='common' />
				</Typography>
				<Typography variant='h6'>
					{fixedCurrency?.rate ? parseFloat(Number(fixedCurrency.rate).toFixed(6)) : '0'}$
				</Typography>
			</Box>
		</Box>
	);
};

export default CurrentCourse;
