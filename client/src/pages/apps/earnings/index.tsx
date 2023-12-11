// ** React Imports
import { useEffect, useMemo, useState } from 'react';

import { toast } from 'react-hot-toast';

// ** MUI Imports
import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles';
import { Grid, LinearProgress } from '@mui/material';

import useMediaQuery from '@mui/material/useMediaQuery';

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux';

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings';
import useComponentDidMount from 'src/hooks/useComponentDidMount';
import * as cookie from 'cookie';

// ** Types
import { RootState, AppDispatch } from 'src/store';
import { CalendarSideBarItems, EventType } from 'src/types/apps/calendarTypes';

// ** FullCalendar & App Components Imports
import Calendar from 'src/views/apps/calendar/Calendar';
import SidebarLeft from 'src/views/apps/calendar/SidebarLeft';
import CalendarWrapper from 'src/@core/styles/libs/fullcalendar';
import AddEventSidebar from 'src/views/apps/calendar/AddEventSidebar';

// ** Actions
import {
	handleSelectEarning,
	fetchProduct,
	setSelectedProduct,
	fetchEarnings,
	createEarning,
	updateEarning
} from 'src/store/apps/earnings';

import { DatesSetArg } from '@fullcalendar/core';
import { CalendarApi } from '@fullcalendar/core';
import EarningsForm from 'src/views/pages/earnings/EarnigsForm';
import { EarningsData, ProductItemWithEarnings } from 'src/store/apps/earnings/types';
import { ThemeColor } from 'src/@core/layouts/types';
import { isAxiosError } from 'axios';
import moment from 'moment';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';

// ** CalendarColors
const calendarsColor = ['warning', 'black', 'info', 'primary'];

const Earnings = () => {
	// ** States
	const [calendarApi, setCalendarApi] = useState<null | CalendarApi>(null);
	const [datesParams, setDatesParams] = useState<null | DatesSetArg>(null);
	const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false);
	const [addEventSidebarOpen, setAddEventSidebarOpen] = useState<boolean>(false);

	// ** Hooks
	const {
		settings: { localeId }
	} = useSettings();
	const { t } = useTranslation('labels');
	const { settings } = useSettings();
	const dispatch = useDispatch<AppDispatch>();
	const isMount = useComponentDidMount();
	const { isLoading, products, selectedProducts, earnings, selectedEarning } = useSelector(
		(state: RootState) => state.earnings
	);

	// ** Vars
	const leftSidebarWidth = 260;
	const addEventSidebarWidth = 400;
	const { skin, direction } = settings;
	const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

	const productItems = useMemo<CalendarSideBarItems[]>(() => {
		return products.map(item => {
			return {
				value: item.displayName,
				id: item.id,
				checked: !!selectedProducts.find(product => item.id === product.id)
			};
		});
	}, [products, selectedProducts]);

	const productsItemsWithColor = useMemo<{ [x: string]: ThemeColor }>(() => {
		const res = products.map((item, index) => {
			return {
				[item.id]: calendarsColor[index]
			};
		});

		return Object.assign({}, ...res);
	}, [products]);

	const events = useMemo<EventType[]>(() => {
		return earnings.map((item, index) => {
			return {
				id: index,
				title: `${item.percentage}%`,
				allDay: true,
				start: item.date,
				end: null,
				extendedProps: {
					calendar: item.productId
				}
			};
		});
	}, [earnings, selectedProducts]);

	const filteredEvents = useMemo(
		() => events.filter(item => !!selectedProducts.find(product => product.id === item?.extendedProps?.calendar)),
		[events, selectedProducts]
	);

	useEffect(() => {
		if (isMount && selectedProducts.length === 0 && products.length > 0) {
			hanldeOnViewAll(true);
		}
	}, [isMount, products]);

	useEffect(() => {
		if (datesParams?.view.type === 'dayGridMonth') {
			const startDate = datesParams.startStr;
			const endDate = datesParams.endStr;
			dispatch(
				fetchEarnings({
					page: 1,
					limit: 1000,
					afterDate: startDate,
					beforeDate: endDate
				})
			);
		}
	}, [datesParams]);

	useEffect(() => {
		dispatch(fetchProduct({ localeId }));
	}, [dispatch]);

	const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen);

	const handleAddEventSidebarToggle = () => {
		handleSelectEarning({});
		setAddEventSidebarOpen(!addEventSidebarOpen);
	};

	const handleOnSelectEvent = (event: Record<string, any>) => {
		const target = new Date(event.date);
		const now = new Date();
		if (target.getTime() < now.getTime()) {
			if (moment().diff(target, 'days') === 0 && now.getHours() < 18) {
				dispatch(handleSelectEarning(event));
				handleAddEventSidebarToggle();
			}
		} else if (target.getTime() > now.getTime()) {
			dispatch(handleSelectEarning(event));
			handleAddEventSidebarToggle();
		}
	};

	const handleOnChecked = (productItem: ProductItemWithEarnings, value: boolean) => {
		if (value) {
			const newSelectedProducts = selectedProducts.filter(item => item.id !== productItem.id);
			dispatch(setSelectedProduct(newSelectedProducts));
		} else {
			const newSelectedProducts = [...selectedProducts, productItem];
			dispatch(setSelectedProduct(newSelectedProducts));
		}
	};

	const hanldeOnViewAll = (value: boolean) => {
		if (value) {
			const items = products.map(item => ({ id: item.id, name: item.displayName }));
			dispatch(setSelectedProduct(items));
		} else {
			dispatch(setSelectedProduct([]));
		}
	};

	const handleOnCreateEarning = async (data: EarningsData['item']) => {
		const startDate = datesParams?.startStr;
		const endDate = datesParams?.endStr;

		const res = await dispatch(
			createEarning({
				item: data,
				filter: {
					page: 1,
					limit: 1000,
					afterDate: startDate,
					beforeDate: endDate
				}
			})
		);
		if (isAxiosError(res.payload)) {
			if (res.payload.response?.data.message) {
				handleOnError(res.payload.response.data.message);
			}
		}
		handleAddEventSidebarToggle();
	};

	const handleOnUpdateEarning = async (data: EarningsData['item']) => {
		const startDate = datesParams?.startStr;
		const endDate = datesParams?.endStr;
		const res = await dispatch(
			updateEarning({
				item: data,
				filter: {
					page: 1,
					limit: 1000,
					afterDate: startDate,
					beforeDate: endDate
				}
			})
		);
		if (isAxiosError(res.payload)) {
			console.log(res.payload);
			if (res.payload.response?.data.message) {
				handleOnError(res.payload.response.data.message);
			}
		}
		handleAddEventSidebarToggle();
	};

	const handleOnError = (mes?: string | string[]) => {
		if (Array.isArray(mes)) {
			mes.map(i => toast.error(i, { position: 'bottom-center' }));
		} else {
			toast.error(mes ? mes : <Translations text='error' locale='labels' />, {
				position: 'bottom-center'
			});
		}
	};

	return (
		<Grid container>
			<Grid item xs={12}>
				{isLoading && <LinearProgress />}
			</Grid>
			<Grid item xs={12} sx={!isLoading ? { pt: 1 } : {}}>
				<CalendarWrapper
					className='app-calendar'
					sx={{
						boxShadow: skin === 'bordered' ? 0 : 6,
						...(skin === 'bordered' && { border: theme => `1px solid ${theme.palette.divider}` })
					}}
				>
					<SidebarLeft
						mdAbove={mdAbove}
						items={productItems}
						onViewAll={hanldeOnViewAll}
						viewAllChecked={products.length === selectedProducts.length}
						calendarsColor={productsItemsWithColor}
						leftSidebarOpen={leftSidebarOpen}
						leftSidebarWidth={leftSidebarWidth}
						handleSelectEvent={handleOnSelectEvent}
						handleOnChecked={handleOnChecked}
						handleLeftSidebarToggle={handleLeftSidebarToggle}
						handleAddEventSidebarToggle={handleAddEventSidebarToggle}
					/>
					<Box
						sx={{
							p: 5,
							pb: 0,
							flexGrow: 1,
							borderRadius: 1,
							boxShadow: 'none',
							backgroundColor: 'background.paper',
							...(mdAbove ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : {})
						}}
					>
						<Calendar
							events={filteredEvents}
							direction={direction}
							calendarApi={calendarApi}
							calendarsColor={productsItemsWithColor}
							setCalendarApi={setCalendarApi}
							handleUpdateDates={event => setDatesParams(event)}
							handleSelectEvent={handleOnSelectEvent}
							handleLeftSidebarToggle={handleLeftSidebarToggle}
							handleAddEventSidebarToggle={handleAddEventSidebarToggle}
						/>
					</Box>
					<AddEventSidebar
						title={
							selectedEarning?.percent ? `${t('earnings.updatePercent')}` : `${t('earnings.addPercent')}`
						}
						drawerWidth={addEventSidebarWidth}
						addEventSidebarOpen={addEventSidebarOpen}
						handleAddEventSidebarToggle={handleAddEventSidebarToggle}
					>
						<EarningsForm
							events={events}
							products={products}
							selectedEarning={selectedEarning}
							createEarnings={data => handleOnCreateEarning(data)}
							updateEarnings={data => handleOnUpdateEarning(data)}
						/>
					</AddEventSidebar>
				</CalendarWrapper>
			</Grid>
		</Grid>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'buttons', 'footer', 'labels'],
				null,
				['ru', 'en']
			))
		}
	};
};

export default Earnings;
