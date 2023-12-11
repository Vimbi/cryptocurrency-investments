'use client';
import { Tooltip, IconButton, Dialog, DialogContent, DialogTitle, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import Icon from 'src/@core/components/icon';
import Translations from 'src/layouts/components/Translations';
import dynamic from 'next/dynamic';
import axios from 'axios';
import authConfig from 'src/configs/auth';

const AllUsers = () => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const OrgChartReferrals = dynamic(() => import('./OrgChart'), { ssr: false });

	const [open, setOpen] = useState(false);
	const [data, setData] = useState<any>(null);

	const getTeam = async () => {
		if (open) {
			const res = await axios.get(`${authConfig.baseApiUrl}/users/all`, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			setData(res.data);
		}
	};

	useEffect(() => {
		getTeam();
	}, [open]);

	return (
		<>
			<Tooltip title={<Translations text='ReferralCard' locale='buttons' />}>
				<IconButton color='primary' onClick={() => setOpen(true)}>
					<Icon icon='mdi:sitemap' />
				</IconButton>
			</Tooltip>
			<Dialog open={open} fullScreen onClose={() => setOpen(false)}>
				<DialogTitle>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Translations text='ReferralCard' locale='buttons' />
						<IconButton color='primary' onClick={() => setOpen(false)}>
							<Icon icon='mdi:close' />
						</IconButton>
					</Box>
				</DialogTitle>
				<DialogContent>
					<OrgChartReferrals data={data} />
				</DialogContent>
			</Dialog>
		</>
	);
};

export default AllUsers;
