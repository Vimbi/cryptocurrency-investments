import { FC, ReactNode } from 'react';

import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material';

import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';

interface Props {
	onInvestmentClick?: () => void;
	headHidden?: boolean;
	content?: ReactNode;
}

const InvestBalanceCard: FC<Props> = ({ headHidden, content }) => {
	const { balance } = useSelector((state: RootState) => state.accountStatement);
	const { t } = useTranslation('investment');

	return (
		<Card>
			{!headHidden && <CardHeader title={`${t('FundsManagement')}`} />}
			<CardContent>
				{!!content && content}
				<Box>
					<Typography variant='body2'>
						<Translations text='AvailableWithdrawal' locale='investment' />
					</Typography>
					<Typography color='primary' variant='h3'>
						$ {!!balance?.balance ? balance.balance.toFixed(2) : 0}
					</Typography>
				</Box>
			</CardContent>
		</Card>
	);
};

export default InvestBalanceCard;
