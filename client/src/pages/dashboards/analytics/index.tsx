// ** MUI Imports
import Grid from '@mui/material/Grid';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Custom Components Imports
import CardStatisticsVerticalComponent from 'src/@core/components/card-statistics/card-stats-vertical';

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts';

// ** MUI Imports
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

//
import { useEffect, useState } from 'react';
import axios from 'axios';
import authConfig from 'src/configs/auth';
import { DashoboardData, DashboardPreview } from 'src/views/dashboards/dashboadTypes';

const dashboardParts: DashboardPreview[] = [
	{ key: 'announcements', displayName: 'Объявления', icon: 'mdi:bell-badge' },
	{ key: 'comments', displayName: 'Комментарии', icon: 'mdi:comment-multiple' },
	{ key: 'questions', displayName: 'Вопросы', icon: 'mdi:chat-question' },
	{ key: 'reviews', displayName: 'Обзоры', icon: 'mdi:view-dashboard-edit' },
	{ key: 'stores', displayName: 'Магазины', icon: 'mdi:cart' },
	{ key: 'users', displayName: 'Пользователи', icon: 'mdi:account-group' }
];

const AnalyticsDashboard = () => {
	const [selectedInterval, setSelectedInterval] = useState<string>('today');
	const [dashboard, setDashboard] = useState<DashoboardData>();

	const handleChange = (event: SelectChangeEvent) => {
		setSelectedInterval(event.target.value as string);
	};

	const fetchDashboard = async () => {
		let fromDate: string;
		const today = new Date().toISOString().split('T')[0]; // Получаем текущую дату
		switch (selectedInterval) {
			case 'today':
				// Если выбран интервал "сегодня", fromDate будет равен текущей дате
				fromDate = today;
				break;
			case 'week':
				// Если выбран интервал "неделя", fromDate будет равен дате, которая была неделю назад
				const weekAgo = new Date();
				weekAgo.setDate(weekAgo.getDate() - 7);
				fromDate = weekAgo.toISOString().split('T')[0];
				break;
			case 'month':
				// Если выбран интервал "месяц", fromDate будет равен дате, которая была месяц назад
				const monthAgo = new Date();
				monthAgo.setMonth(monthAgo.getMonth() - 1);
				fromDate = monthAgo.toISOString().split('T')[0];
				break;
			case 'year':
				// Если выбран интервал "год", fromDate будет равен дате, которая была год назад
				const yearAgo = new Date();
				yearAgo.setFullYear(yearAgo.getFullYear() - 1);
				fromDate = yearAgo.toISOString().split('T')[0];
				break;
			default:
				fromDate = today; // Если выбран некорректный интервал, fromDate будет равен текущей дате
				break;
		}
		try {
			const resData = await axios.get(`${authConfig.baseApiUrl}/dashboard`, {
				params: { fromDate, untilData: today }
			});
			setDashboard(resData.data);
		} catch (err) {
			console.log(err, '>>>');
		}
	};

	useEffect(() => {
		fetchDashboard();
	}, [selectedInterval]);

	return (
		<ApexChartWrapper>
			<Grid container spacing={6}>
				<Grid item xs={12}>
					<Grid container xs={12} spacing={6}>
						<Grid item xs={12}>
							<Card>
								<CardContent>
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'flex-start',
											flexWrap: 'nowrap',
											alignItems: 'center',
											gap: '1rem'
										}}
									>
										<Typography variant='h6'>Показан контент за:</Typography>
										<FormControl>
											<Select
												size='small'
												value={selectedInterval}
												onChange={handleChange}
												id='controlled-select'
												labelId='controlled-select-label'
											>
												<MenuItem value='today'>Сегодня</MenuItem>
												<MenuItem value='week'>Неделю</MenuItem>
												<MenuItem value='month'>Месяц</MenuItem>
												<MenuItem value='year'>Год</MenuItem>
											</Select>
										</FormControl>
									</Box>
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={12}>
					<Grid container xs={12} spacing={6}>
						{dashboard
							? dashboardParts.map(item => (
									<Grid key={item.key} item xs={12} sm={6} md={4}>
										<CardStatisticsVerticalComponent
											stats={`${dashboard[`${item.key}`]}`}
											title={item.displayName}
											icon={<Icon icon={item.icon} />}
											trendNumber=''
											subtitle=''
										/>
									</Grid>
							  ))
							: ''}
					</Grid>
				</Grid>
			</Grid>
		</ApexChartWrapper>
	);
};

export default AnalyticsDashboard;
