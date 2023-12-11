// ** MUI Imports
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

// import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// **
import { useEffect, useState } from 'react';
import { useAuth } from 'src/hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import authConfig from 'src/configs/auth';
import axios from 'axios';
import { fetchUserData } from 'src/store/apps/user';

// ** Type Imports
import { Controller, useForm } from 'react-hook-form';
import { AppDispatch, RootState } from 'src/store';

interface SocialAccountsType {
	name: string;
	key: string;
	link: string | null;
	logo: string;
}

const UserViewConnection = () => {
	const [activeHandlingAccount, setActiveHandlingAccount] = useState<number>(0);
	const [socialAccounts, setSocialAccounts] = useState<SocialAccountsType[]>();
	const [openEdit, setOpenEdit] = useState<boolean>(false);
	const [deleteLinkHandler, setDeleteLinkHandler] = useState<boolean>(false);
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const editAccountForm = useForm<SocialAccountsType>();
	const userData = useSelector((state: RootState) => state.user.user);
	const auth = useAuth();
	const dispatch = useDispatch<AppDispatch>();

	const handleEditClickOpen = (index: number) => {
		setOpenEdit(true);
		setActiveHandlingAccount(index);
		editAccountForm.reset(socialAccounts![index]);
	};
	const handleEditClose = () => setOpenEdit(false);

	useEffect(() => {
		if (userData) {
			const { youtube, vkontakte, telegram, whatsapp, odnoklassniki } = userData!;
			setSocialAccounts([
				{ name: 'YouTube', key: 'youtube', link: youtube!, logo: '/images/logos/youtube.png' },
				{ name: 'Вконтакте', key: 'vkontakte', link: vkontakte!, logo: '/images/logos/vk.png' },
				{ name: 'Telegram', key: 'telegram', link: telegram!, logo: '/images/logos/telegram.png' },
				{ name: 'WhatsApp', key: 'whatsapp', link: whatsapp!, logo: '/images/logos/whatsapp.png' },
				{
					name: 'Одноклассники',
					key: 'odnoklassniki',
					link: odnoklassniki!,
					logo: '/images/logos/odnoklassniki.png'
				}
			]);
		}
	}, [userData, openEdit]);

	const handleEditSubmit = async (data: SocialAccountsType) => {
		if (auth?.user && auth.user.role && auth.user?.role.name === 'super_admin') {
			const { key, link } = data;
			try {
				const response = await axios.patch(
					`${authConfig.baseApiUrl}/users/${userData!.id}/super-admin`,
					{ [key]: link },
					{ headers: { Authorization: `Bearer ${storedToken}` } }
				);
				dispatch(fetchUserData(response.data.id));
				setOpenEdit(false);
			} catch (err) {
				console.log(err, '>>> error user edit');
			}
		}
	};

	const handleDeleteLink = (index: number) => {
		if (deleteLinkHandler) {
			const { key, name, logo } = socialAccounts![index];
			handleEditSubmit({ key, name, logo, link: key === 'whatsapp' ? null : '' });
			setDeleteLinkHandler(false);
		} else {
			setDeleteLinkHandler(true);
			setActiveHandlingAccount(index);
		}
	};

	return (
		<Grid container spacing={6}>
			{/* Connected Accounts Cards */}
			{/* <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ mb: 5 }}>
              <Typography sx={{ fontWeight: 500 }}>Connected Accounts</Typography>
              <Typography variant='body2'>Display content from your connected accounts on your site</Typography>
            </Box>
            {connectedAccountsArr.map(account => {
              return (
                <Box
                  key={account.title}
                  sx={{
                    gap: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:not(:last-of-type)': { mb: 4 }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ mr: 4, display: 'flex', justifyContent: 'center' }}>
                      <img src={account.logo} alt={account.title} height='36' width='36' />
                    </Box>
                    <div>
                      <Typography sx={{ fontWeight: 600 }}>{account.title}</Typography>
                      <Typography variant='body2'>{account.subtitle}</Typography>
                    </div>
                  </Box>
                  <Switch defaultChecked={account.checked} />
                </Box>
              )
            })}
          </CardContent>
        </Card>
      </Grid> */}
			{/* Social Accounts Cards */}
			<Grid item xs={12}>
				<Card>
					<CardContent>
						<Box sx={{ mb: 5 }}>
							<Typography sx={{ fontWeight: 500 }}>Социальные сети</Typography>
							<Typography variant='body2'>Подключенные пользователем ссылки на соц. аккаунты</Typography>
						</Box>

						{socialAccounts?.map((account, index) => {
							return (
								<Box
									key={index}
									sx={{
										gap: 2,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										'&:not(:last-of-type)': { mb: 4 }
									}}
								>
									<Box sx={{ display: 'flex', alignItems: 'center' }}>
										<Box sx={{ mr: 4, minWidth: 45, display: 'flex', justifyContent: 'center' }}>
											<img src={`${account.logo}`} alt={account.name} height='30' />
										</Box>
										<div>
											{account.link ? (
												<Button target='blank' variant='outlined' href={account.link}>
													{account.name}
												</Button>
											) : (
												<Typography sx={{ fontWeight: 500 }}>{account.name}</Typography>
											)}

											{!account.link && (
												<Typography variant='body2' sx={{ color: 'text.disabled' }}>
													Не подключено
												</Typography>
											)}
										</div>
									</Box>
									<Box sx={{ display: 'flex', gap: 2 }}>
										{deleteLinkHandler && activeHandlingAccount === index && (
											<Button
												onClick={() => setDeleteLinkHandler(false)}
												variant='outlined'
												sx={{ p: 1.5, minWidth: 38 }}
												color='secondary'
											>
												<Icon icon='mdi:close' />
											</Button>
										)}
										<Button
											onClick={() =>
												account.link ? handleDeleteLink(index) : handleEditClickOpen(index)
											}
											variant='outlined'
											sx={{ p: 1.5, minWidth: 38 }}
											color={account.link ? 'error' : 'secondary'}
										>
											<Icon
												icon={
													account.link
														? deleteLinkHandler && activeHandlingAccount === index
															? 'mdi:check'
															: 'mdi:delete-outline'
														: 'mdi:link'
												}
											/>
										</Button>
									</Box>
								</Box>
							);
						})}
					</CardContent>
					<Dialog
						open={openEdit}
						onClose={handleEditClose}
						aria-labelledby='user-account-edit'
						aria-describedby='user-account-edit-description'
						sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650 } }}
					>
						<DialogTitle
							id='user-view-edit'
							sx={{
								textAlign: 'center',
								fontSize: '1.5rem !important',
								px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
								pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
							}}
						>
							Добавление акканута
						</DialogTitle>
						{socialAccounts && (
							<DialogContent
								sx={{
									pb: theme => `${theme.spacing(8)} !important`,
									px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
								}}
							>
								<DialogContentText
									variant='body2'
									id='user-view-edit-description'
									sx={{ textAlign: 'center', mb: 7 }}
								>
									Привяжите аккаунт {socialAccounts[activeHandlingAccount].name}
								</DialogContentText>
								<form>
									<Grid container spacing={6}>
										<Grid item xs={12} sm={12}>
											<FormControl fullWidth>
												<Controller
													name='link'
													control={editAccountForm.control}
													render={({ field: { value, onChange, onBlur } }) => (
														<TextField
															fullWidth
															label={
																editAccountForm.getValues('key') !== 'whatsapp'
																	? 'ссылка ' + editAccountForm.getValues('name')
																	: 'Номер телефона'
															}
															value={value}
															onChange={onChange}
															onBlur={onBlur}
														/>
													)}
												/>
											</FormControl>
										</Grid>
									</Grid>
								</form>
							</DialogContent>
						)}
						<DialogActions
							sx={{
								justifyContent: 'center',
								px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
								pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
							}}
						>
							<Button variant='outlined' color='error' onClick={handleEditClose}>
								Отмена
							</Button>
							<Button
								variant='contained'
								sx={{ mr: 2 }}
								onClick={() => handleEditSubmit(editAccountForm.getValues())}
							>
								Сохранить
							</Button>
						</DialogActions>
					</Dialog>
				</Card>
			</Grid>
		</Grid>
	);
};

export default UserViewConnection;
