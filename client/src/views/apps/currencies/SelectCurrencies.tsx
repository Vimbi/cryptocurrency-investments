import { FC } from 'react';

import { Grid, Typography, Box, Button, BoxProps, Tooltip } from '@mui/material';
import { CurrencieType } from 'src/types/apps/currenciesType';

import { styled } from '@mui/material/styles';
import { useAbility } from 'src/hooks/useAbility';
import { NetworkType } from 'src/types/apps/networkType';
import Translations from 'src/layouts/components/Translations';

type SelectCurrencyProps = {
	data: CurrencieType[];
	networks: NetworkType[];
	selectCurrency: (id: string) => void;
};

const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
	position: 'relative',
	padding: theme.spacing(6),
	paddingTop: theme.spacing(14.75),
	borderRadius: theme.shape.borderRadius
}));

const SelectCurrency: FC<SelectCurrencyProps> = ({ data, networks, selectCurrency }) => {
	const ability = useAbility();

	return (
		<Grid container spacing={6}>
			{data?.map((item, index) => {
				const suitableNetwork = networks.find(net => net.currencyId === item.id);

				return (
					<Grid key={index} item xs={12} md={3}>
						<BoxWrapper
							sx={{
								border: theme => `1px solid ${theme.palette.divider}`,
								height: '100%',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-between'
							}}
						>
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'center',
									flexDirection: 'column',
									textAlign: 'center'
								}}
								mb={4}
							>
								<Typography variant='body2' sx={{ mt: 1.6, fontWeight: 600, alignSelf: 'center' }}>
									{item.symbol}
								</Typography>
								<Typography
									variant='h4'
									sx={{ fontWeight: 600, color: 'primary.main', lineHeight: 1.17 }}
								>
									{item.displayName}
								</Typography>
							</Box>
							<Tooltip
								title={!suitableNetwork ? <Translations text='NoTransferOption' locale='common' /> : ''}
							>
								<Box>
									{ability.can('create', 'transfers') && (
										<Button
											disabled={!suitableNetwork}
											fullWidth
											variant='contained'
											onClick={() => selectCurrency(item.id as string)}
										>
											<Translations text='Choose' locale='buttons' />
										</Button>
									)}
								</Box>
							</Tooltip>
						</BoxWrapper>
					</Grid>
				);
			})}
		</Grid>
	);
};

export default SelectCurrency;
