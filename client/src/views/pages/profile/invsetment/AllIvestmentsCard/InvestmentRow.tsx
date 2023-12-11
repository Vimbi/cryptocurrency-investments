// ** React Imports
import { FC, Fragment } from 'react';

// ** MUI Imports
// import Box from '@mui/material/Box';
// import Table from '@mui/material/Table';
// import Collapse from '@mui/material/Collapse';
// import TableRow from '@mui/material/TableRow';
// import TableHead from '@mui/material/TableHead';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import Typography from '@mui/material/Typography';
// import IconButton from '@mui/material/IconButton';
// import Chip from 'src/@core/components/mui/chip';

// ** Icon Imports
// import Icon from 'src/@core/components/icon';

// import moment from 'moment';

// const statuses = {
// 	canceled: { color: 'error', label: 'Отменено' },
// 	completed: { color: 'primary', label: 'Завершено' },
// 	active: { color: 'info', label: 'Активно' }
// };
// const types = {
// 	deposit: { color: 'success', label: 'Пополнение' },
// 	withdrawal: { color: 'error', label: 'Вывод' },
// 	income: { color: 'info', label: 'Начисление процентов' }
// };

import { Investment } from 'src/types/apps/investments';

interface Props {
	investment: Investment;
}

const InvestmentRow: FC<Props> = ({ investment }) => {
	// const [open, setOpen] = useState<boolean>(false);

	console.log(investment);

	return (
		<Fragment>
			{/* <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
				<TableCell>
					<IconButton aria-label='expand row' size='small' onClick={() => setOpen(!open)}>
						<Icon icon={open ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
					</IconButton>
				</TableCell>
				<TableCell component='th' scope='row'>
					{investment.amount}
				</TableCell>
				<TableCell>
					{investment.completedAt || investment.canceledAt ? '-' : moment(investment.dueDate).format('LL')}
				</TableCell>
				<TableCell>{investment.income}</TableCell>
				<TableCell>
					{investment.canceledAt ? (
						<Chip
							skin='light'
							size='small'
							label={statuses.canceled.label}
							color={statuses.canceled.color as any}
							sx={{ textTransform: 'capitalize' }}
						/>
					) : investment.completedAt ? (
						<Chip
							skin='light'
							size='small'
							label={statuses.completed.label}
							color={statuses.completed.color as any}
							sx={{ textTransform: 'capitalize' }}
						/>
					) : (
						<Chip
							skin='light'
							size='small'
							label={statuses.active.label}
							color={statuses.active.color as any}
							sx={{ textTransform: 'capitalize' }}
						/>
					)}
				</TableCell>
			</TableRow>
			<TableRow>
				<TableCell colSpan={6} sx={{ py: '0 !important' }}>
					<Collapse in={open} timeout='auto' unmountOnExit>
						<Box sx={{ m: 2 }}>
							<Typography variant='h6' gutterBottom component='div'>
								История операций
							</Typography>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell />
										<TableCell>Инвестировано</TableCell>
										<TableCell>Дата операции</TableCell>
										<TableCell>Тип операции</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{investment.investmentTransactions.map(r => (
										<TableRow key={r.id}>
											<TableCell />
											<TableCell component='th' scope='row'>
												{r.amount}
											</TableCell>
											<TableCell>{moment(r.createdAt).format('LLL')}</TableCell>
											<TableCell>
												<Chip
													skin='light'
													size='small'
													label={types[r.type.name].label}
													color={types[r.type.name].color as any}
													sx={{ textTransform: 'capitalize' }}
												/>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Box>
					</Collapse>
				</TableCell>
			</TableRow> */}
		</Fragment>
	);
};

export default InvestmentRow;
