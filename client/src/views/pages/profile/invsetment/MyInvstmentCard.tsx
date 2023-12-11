import { FC } from 'react';

import { Card, CardContent, CardHeader, Typography, Grid, Button } from '@mui/material';

import moment from 'moment';
import 'moment/locale/ru';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

import { Balance } from 'src/types/apps/accountStatementType';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';

moment.locale('ru');

interface Props {
	balance: Balance;
	onCancel: () => void;
}

const MyInvstmentCard: FC<Props> = ({ balance, onCancel }) => {
	const { t } = useTranslation('investment');

	return (
		<Card>
			<CardHeader
				title={`${t('MyInvestments')}`}
				action={
					<Button onClick={onCancel} disabled={!balance.invested} variant='outlined'>
						<Translations text='InvestCancel' locale='buttons' />
					</Button>
				}
			/>
			{!!balance.invested ? (
				<CardContent>
					<Typography variant='body2'>
						<Translations text='TotalFunds' locale='investment' />
					</Typography>
					<Typography color='primary' variant='h1'>
						$ {(!!balance ? balance?.balance + balance?.invested : 0).toFixed(2)}
					</Typography>
					<Grid container xs={12} spacing={4} sx={{ mt: 10 }}>
						<Grid item xs={12}>
							<Typography variant='body2'>
								<Translations text='until' locale='labels' />
							</Typography>
							<Typography variant='h6'>
								{balance?.investmentDueDate ? moment(balance.investmentDueDate).format('LL') : '-'}
							</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant='body2'>
								<Translations text='invested' locale='labels' />
							</Typography>
							<Typography variant='h6'>{balance?.invested.toFixed(2)}</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant='body2'>
								<Translations text='lastUpdate' locale='labels' />
							</Typography>
							<Typography variant='h6'>
								{balance?.lastUpdateDate ? moment(balance.lastUpdateDate).format('LL') : '-'}
							</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant='body2'>
								<Translations text='currentProfit' locale='labels' />
							</Typography>
							<Typography variant='h6'>{balance?.income ? balance.income : '-'}</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant='body2'>
								<Translations text='lastChargePercent' locale='labels' />
							</Typography>
							<Typography variant='h6' color='success.main' sx={{ '& svg': { mr: 5 } }}>
								<Icon icon='mdi:menu-up' />
								{balance?.lastIncomePercent ? balance.lastIncomePercent : '-'}
							</Typography>
						</Grid>
					</Grid>
				</CardContent>
			) : (
				<CardContent>
					<Typography>
						<Translations text='NoActiveInvest' locale='investment' />
					</Typography>
				</CardContent>
			)}
		</Card>
	);
};

export default MyInvstmentCard;
