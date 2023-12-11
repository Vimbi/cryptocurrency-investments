// ** MUI Imports
import Grid from '@mui/material/Grid';

// ** Types
import { InvoiceType } from 'src/types/apps/invoiceTypes';

// ** Demo Components Imports
import UserViewLeft from 'src/views/apps/user/view/UserViewLeft';
import UserViewRight from 'src/views/apps/user/view/UserViewRight';

type Props = {
	tab: string;
	invoiceData: InvoiceType[];
};

const UserView = ({ tab, invoiceData }: Props) => {
	// const userData = useSelector((state: RootState) => state.user.user)

	return (
		<Grid container spacing={6}>
			<Grid item xs={12} md={5} lg={4}>
				<UserViewLeft />
			</Grid>
			<Grid item xs={12} md={7} lg={8}>
				<UserViewRight tab={tab || 'overview'} invoiceData={invoiceData} />
			</Grid>
		</Grid>
	);
};

export default UserView;
