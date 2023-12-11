// ** MUI Imports
import { Box } from '@mui/material';

// ** Custom Components Imports
import PlanDetails from 'src/@core/components/plan-details';

// ** Types
import { ProductTarifType } from 'src/types/apps/tarifTypes';
import { Investment } from 'src/types/apps/investments';

interface Props {
	data: ProductTarifType[] | null;
	invest?: Partial<Investment>;
}

const PricingPlans = (props: Props) => {
	// ** Props
	const { data, invest } = props;

	return (
		<Box sx={{ display: 'grid', gap: 6, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' } }}>
			{data?.map((item: ProductTarifType, i) => (
				<Box key={i}>
					<PlanDetails data={item} invest={invest} />
				</Box>
			))}
		</Box>
	);
};

export default PricingPlans;
