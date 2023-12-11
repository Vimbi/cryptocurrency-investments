import { FC, useEffect, useState } from 'react';

import toast from 'react-hot-toast';

import {
	Grid,
	Card,
	CardHeader,
	CardContent,
	OutlinedInput,
	InputAdornment,
	IconButton,
	Tooltip,
	Box
} from '@mui/material';

import Icon from 'src/@core/components/icon';
import useClipboard from 'src/@core/hooks/useClipboard';
import { useAuth } from 'src/hooks/useAuth';
import Translations from 'src/layouts/components/Translations';

const TeamReferalLink: FC = () => {
	const clipboard = useClipboard();
	const auth = useAuth();
	const [referal, setReferal] = useState('');

	const handleOnClick = () => {
		clipboard.copy(referal);
		toast.success(<Translations text='Referral.codeCopied' locale='common' />, {
			duration: 2000
		});
	};

	const copyFullLink = () => {
		clipboard.copy(window.location.origin + '/register?referralCode=' + referal);
		toast.success(<Translations text='Referral.linkCopied' locale='common' />, {
			duration: 2000
		});
	};

	useEffect(() => {
		if (auth.user) setReferal(`${auth?.user.referralCode}`);
	}, []);

	return (
		<Card>
			<CardHeader title={<Translations text='Referral.code' locale='common' />} />
			<CardContent>
				<form>
					<Grid container spacing={5}>
						<Grid item xs={12} sm={6}>
							<Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
								<OutlinedInput
									fullWidth
									sx={{ pr: 1.25, mr: [0, 4] }}
									placeholder='http://referral.link'
									readOnly
									value={referal}
									endAdornment={
										<InputAdornment position='end'>
											<IconButton onClick={handleOnClick} size='medium' color='secondary'>
												<Icon icon='mdi:content-copy' />
											</IconButton>
										</InputAdornment>
									}
								/>
								<Tooltip
									title={<Translations text='Referral.copyLink' locale='common' />}
									placement='top'
								>
									<IconButton onClick={copyFullLink} size='medium' color='primary'>
										<Icon icon='mdi:link' />
									</IconButton>
								</Tooltip>
							</Box>
						</Grid>
					</Grid>
				</form>
			</CardContent>
		</Card>
	);
};

export default TeamReferalLink;
