import { FC } from 'react';

import { Table, TableRow, TableHead, TableBody, TableCell, TableContainer, Paper } from '@mui/material';
import { Investment } from 'src/types/apps/investments';
import InvestmentRow from './InvestmentRow';

interface Props {
	allInvestments: Investment[];
	isLoading?: boolean;
}

const InvestmentsTable: FC<Props> = ({ allInvestments }) => {
	return (
		<TableContainer component={Paper}>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell />
						<TableCell>Всего инвестировано</TableCell>
						<TableCell>Следующее начисление</TableCell>
						<TableCell>Текущая прибыль</TableCell>
						<TableCell>Статус</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{allInvestments?.map((investment, index) => (
						<InvestmentRow key={index} investment={investment} />
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default InvestmentsTable;
