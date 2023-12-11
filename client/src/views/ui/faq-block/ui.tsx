import { FC, useState, SyntheticEvent } from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { styled } from '@mui/material/styles';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionDetails, { AccordionDetailsProps } from '@mui/material/AccordionDetails';

// ** Icon Imports
import Icon from 'src/@core/components/icon';
import Translations from 'src/layouts/components/Translations';

const Accordion = styled(MuiAccordion)<AccordionProps>(({ theme }) => ({
	boxShadow: 'none !important',
	border:
		theme.palette.mode === 'light' ? `1px solid ${theme.palette.grey[300]}` : `1px solid ${theme.palette.divider}`,
	'&:not(:last-of-type)': {
		borderBottom: 0
	},
	'&:before': {
		display: 'none'
	},
	'&.Mui-expanded': {
		margin: 'auto'
	},
	'&:first-of-type': {
		'& .MuiButtonBase-root': {
			borderTopLeftRadius: theme.shape.borderRadius,
			borderTopRightRadius: theme.shape.borderRadius
		}
	},
	'&:last-of-type': {
		'& .MuiAccordionSummary-root:not(.Mui-expanded)': {
			borderBottomLeftRadius: theme.shape.borderRadius,
			borderBottomRightRadius: theme.shape.borderRadius
		}
	}
}));

// Styled component for AccordionSummary component
const AccordionSummary = styled(MuiAccordionSummary)<AccordionSummaryProps>(({ theme }) => ({
	marginBottom: -1,
	padding: theme.spacing(0, 4),
	minHeight: theme.spacing(12),
	transition: 'min-height 0.15s ease-in-out',
	backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.background.default,
	borderBottom:
		theme.palette.mode === 'light' ? `1px solid ${theme.palette.grey[300]}` : `1px solid ${theme.palette.divider}`,
	'&.Mui-expanded': {
		minHeight: theme.spacing(12)
	},
	'& .MuiAccordionSummary-content.Mui-expanded': {
		margin: '10px 0'
	}
}));

// Styled component for AccordionDetails component
const AccordionDetails = styled(MuiAccordionDetails)<AccordionDetailsProps>(({ theme }) => ({
	padding: `${theme.spacing(4)} !important`
}));

const FAQ = [
	{
		key: 'panel1',
		title: 'q1',
		content: 'a1'
	},
	{
		key: 'panel2',
		title: 'q2',
		content: 'a2'
	},
	{
		key: 'panel3',
		title: 'q3',
		content: 'a3'
	},
	{
		key: 'panel4',
		title: 'q4',
		content: 'a4'
	},
	{
		key: 'panel5',
		title: 'q5',
		content: 'a5'
	},
	{
		key: 'panel6',
		title: 'q6',
		content: 'a6'
	}
];

export const FAQBlock: FC = () => {
	const [expanded, setExpanded] = useState<string | false>(false);

	const handleChange = (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
		setExpanded(isExpanded ? panel : false);
	};

	const expandIcon = (value: string) => <Icon icon={expanded === value ? 'mdi:minus' : 'mdi:plus'} />;

	return (
		<div className='faq-wrapper'>
			<Box>
				<Typography fontWeight='bold' variant='h3' sx={{ mb: 8 }}>
					FAQ
				</Typography>
				{FAQ.map(faq => (
					<Accordion key={faq.key} expanded={expanded === faq.key} onChange={handleChange(faq.key)}>
						<AccordionSummary expandIcon={expandIcon(faq.key)}>
							<Typography>
								<Translations text={faq.title} locale='faq' />
							</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Typography sx={{ whiteSpace: 'pre-wrap' }}>
								<Translations text={faq.content} locale='faq' />
							</Typography>
						</AccordionDetails>
					</Accordion>
				))}
			</Box>
			<div>
				<Image src='/images/wallet-and-hand.png' alt='FAQ' width={550} height={530} />
			</div>
		</div>
	);
};
