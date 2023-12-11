import { useState, forwardRef, Fragment, FC, useEffect, useMemo } from 'react';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import DatePicker, { registerLocale } from 'react-datepicker';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import { ProductTarifType } from 'src/types/apps/tarifTypes';
import { EarningsData } from 'src/store/apps/earnings/types';
import { EventType } from 'src/types/apps/calendarTypes';
import { InputAdornment, OutlinedInput } from '@mui/material';
import ru from 'date-fns/locale/ru';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';

registerLocale('ru', ru);

interface DefaultStateType {
	percent: string;
	productId: string;
	date: Date;
}

const defaultState: DefaultStateType = {
	percent: '',
	date: new Date(),
	productId: ''
};

interface PickerProps {
	label?: string;
	error?: boolean;
	registername?: string;
}

interface EarningsFormProps {
	events?: EventType[];
	products: ProductTarifType[];
	selectedEarning: Record<string, any> | null;
	createEarnings: (data: EarningsData['item']) => void;
	updateEarnings: (data: EarningsData['item']) => void;
}

function formatIsoWithoutTimezone(date: Date | null | undefined) {
	if (!!date) {
		return `${date?.getFullYear()}-${(date?.getMonth() + 1).toString().padStart(2, '0')}-${date
			.getDate()
			.toString()
			.padStart(2, '0')}`;
	} else {
		return null;
	}
}

const EarningsForm: FC<EarningsFormProps> = ({ events, products, selectedEarning, createEarnings, updateEarnings }) => {
	const [values, setValues] = useState<DefaultStateType>(defaultState);
	const { t, i18n } = useTranslation('labels');

	const filteredMenuItems = useMemo(() => {
		if (!!selectedEarning?.percent) {
			return products;
		}
		const eventsInDay = events
			?.filter(item => {
				return item.start === new Date(values.date).toLocaleDateString().split('.').reverse().join('-');
			})
			.map(item => item.extendedProps?.calendar);

		return products.filter(product => !eventsInDay?.includes(product.id));
	}, [events, values]);

	useEffect(() => {
		if (selectedEarning && Object.keys(selectedEarning).length > 0) {
			setValues({
				date: new Date(selectedEarning.date),
				percent: selectedEarning.percent ? selectedEarning.percent.replace('%', '') : '',
				productId: selectedEarning.productId || ''
			});
		} else {
			setValues({
				date: new Date(),
				percent: '',
				productId: ''
			});
		}
	}, [selectedEarning]);

	const handleOnCreateEarnings = () => {
		createEarnings({
			date: formatIsoWithoutTimezone(values.date) ?? values.date,
			productId: values.productId,
			percentage: parseFloat(values.percent)
		});
	};

	const handleOnUpdateEarnings = () => {
		updateEarnings({
			date: formatIsoWithoutTimezone(values.date) ?? values.date,
			productId: values.productId,
			percentage: parseFloat(values.percent)
		});
	};

	const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
		return (
			<TextField
				inputRef={ref}
				fullWidth
				{...props}
				label={props.label || ''}
				sx={{ width: '100%' }}
				error={props.error}
			/>
		);
	});

	const RenderSidebarFooter = () => {
		if (selectedEarning === null || (selectedEarning !== null && selectedEarning.percent)) {
			return (
				<Fragment>
					<Button size='large' variant='contained' sx={{ mr: 4 }} onClick={handleOnUpdateEarnings}>
						<Translations text='Update' locale='buttons' />
					</Button>
				</Fragment>
			);
		} else {
			return (
				<Fragment>
					<Button
						disabled={filteredMenuItems.length === 0}
						size='large'
						variant='contained'
						sx={{ mr: 4 }}
						onClick={handleOnCreateEarnings}
					>
						<Translations text='Add' locale='buttons' />
					</Button>
				</Fragment>
			);
		}
	};

	return (
		<DatePickerWrapper>
			<form autoComplete='off'>
				<FormControl fullWidth sx={{ mb: 6 }}>
					<InputLabel>
						<Translations text='percent' locale='labels' />
					</InputLabel>
					<OutlinedInput
						endAdornment={<InputAdornment position='end'>%</InputAdornment>}
						label={<Translations text='percent' locale='labels' />}
						placeholder='2'
						value={values.percent}
						onChange={e => setValues({ ...values, percent: e.target.value })}
					/>
				</FormControl>
				<FormControl fullWidth sx={{ mb: 6 }}>
					<InputLabel id='event-calendar'>
						<Translations text='tariff' locale='labels' />
					</InputLabel>
					<Select
						label={<Translations text='tariff' locale='labels' />}
						value={values.productId}
						labelId='event-calendar'
						onChange={e => setValues({ ...values, productId: e.target.value })}
						disabled={filteredMenuItems.length === 0 || !!selectedEarning?.percent}
					>
						{filteredMenuItems.map((product, index) => {
							return (
								<MenuItem value={product.id} key={index}>
									{product.displayName}
								</MenuItem>
							);
						})}
					</Select>
				</FormControl>
				<Box sx={{ mb: 6 }}>
					<DatePicker
						locale={i18n.language}
						selected={values.date}
						id='event-start-date'
						dateFormat='dd.MM.yyyy'
						customInput={<PickersComponent label={`${t('date')}`} registername='startDate' />}
						onChange={(date: Date) => setValues({ ...values, date: new Date(date) })}
						disabled={!!selectedEarning?.percent}
					/>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<RenderSidebarFooter />
				</Box>
			</form>
		</DatePickerWrapper>
	);
};

export default EarningsForm;
