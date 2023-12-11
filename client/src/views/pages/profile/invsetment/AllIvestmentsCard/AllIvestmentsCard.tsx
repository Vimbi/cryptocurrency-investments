import { FC } from 'react';

import { Card, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';

import Icon from 'src/@core/components/icon';

import { useSelector } from 'react-redux';
import { RootState } from 'src/store';

import InvestmentsTable from './IvestmentsTable';

interface Props {
	onToggleAll: () => void;
}

const AllIvestmentsCard: FC<Props> = ({ onToggleAll }) => {
	const {
		investments: { data: allInvestments }
	} = useSelector((state: RootState) => state.investment);

	return (
		<Card>
			<CardHeader
				title='Все инвестици'
				action={
					<Tooltip title='Назад'>
						<IconButton color='primary' onClick={onToggleAll}>
							<Icon icon='mdi:keyboard-backspace' />
						</IconButton>
					</Tooltip>
				}
			></CardHeader>
			<CardContent>
				<InvestmentsTable allInvestments={allInvestments} />
			</CardContent>
		</Card>
	);
};

export default AllIvestmentsCard;
