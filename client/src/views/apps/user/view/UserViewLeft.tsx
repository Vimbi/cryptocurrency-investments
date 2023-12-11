// ** React Imports
import { useEffect, useState } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import ButtonGroup from '@mui/material/ButtonGroup';

// ** Custom Components
import Icon from 'src/@core/components/icon';
import CustomChip from 'src/@core/components/mui/chip';
import CustomAvatar from 'src/@core/components/mui/avatar';

// ** Types
import { ThemeColor } from 'src/@core/layouts/types';
import { RoleType, UsersType } from 'src/types/apps/userTypes';
import { AppDispatch, RootState } from 'src/store';

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials';
import authConfig from 'src/configs/auth';
import axios, { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { useAuth } from 'src/hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { fetchUserData } from 'src/store/apps/user';
import UserEditModal from './UserEditModal';
import Translations from 'src/layouts/components/Translations';

interface ColorsType {
	[key: string]: ThemeColor;
}

const roleColors: ColorsType = {
	super_admin: 'error',
	user: 'info',
	admin: 'warning',
	maintainer: 'success',
	subscriber: 'primary'
};

const UserViewLeft = () => {
	// ** States
	const [openEdit, setOpenEdit] = useState<boolean>(false);
	const userData = useSelector((state: RootState) => state.user.user);
	const auth = useAuth();
	const router = useRouter();
	const editUserForm = useForm<UsersType>();
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const userRole = auth.user?.role;
	const dispatch = useDispatch<AppDispatch>();
	const [roleArray, setRoleArray] = useState<Array<RoleType>>([]);
	const [statusesArray, setStatusesArray] = useState<{ name: string; id: string; displayName: string }[]>([]);
	const [imageDeleteSubmit, setImageDeleteSubmit] = useState<boolean>(false);
	const [errors, setErrors] = useState<{ [key in keyof UsersType]: string }[]>([]);

	// Handle Edit dialog
	const handleEditClickOpen = () => setOpenEdit(true);
	const handleEditClose = () => setOpenEdit(false);
	const fetchData = async () => {
		try {
			const responseRoles = await axios.get(`${authConfig.baseApiUrl}/roles`, {
				headers: { Authorization: `Bearer ${storedToken}` }
			});
			setRoleArray(responseRoles.data.entities);
			const responseUserStatuses = await axios.get(`${authConfig.baseApiUrl}/user-statuses`, {
				headers: { Authorization: `Bearer ${storedToken}` }
			});
			setStatusesArray(responseUserStatuses.data.entities);
		} catch (err) {
			console.log(err);
		}
	};
	useEffect(() => {
		if (userData) {
			const { firstName, lastName, email, phone, publicEmail, description, region, role } = userData;
			editUserForm.reset({ firstName, lastName, email, phone, publicEmail, description, region, role });
		}
		fetchData();
	}, [userData]);

	const handleEditSubmit = async (data: UsersType) => {
		if (userRole && userRole.name === 'super_admin') {
			const changedValues: any = {};
			Object.keys(data).forEach((key: keyof UsersType | string) => {
				if (
					userData?.hasOwnProperty(key) &&
					data[key as keyof UsersType] !== userData[key as keyof UsersType]!
				) {
					changedValues[key] = data[key as keyof UsersType];
				}
				if (data[key as keyof UsersType] === '') {
					changedValues[key] = null;
				}
			});
			try {
				const response = await axios.patch(
					`${authConfig.baseApiUrl}/users/${userData!.id}/super-admin`,
					{ ...changedValues, roleId: data.roleId, statusId: data.statusId },
					{ headers: { Authorization: `Bearer ${storedToken}` } }
				);
				dispatch(fetchUserData(response.data.id));
				setOpenEdit(false);
			} catch (err) {
				if (isAxiosError(err)) {
					if (err.response?.status === 400) {
						const parseArr = err.response.data.message.map((e: string) => e.split(':'));
						parseArr.map((e: string[]) => ({ [e[0]]: e[1] }));
						setErrors(parseArr.map((e: string[]) => ({ [e[0]]: e[1] })));
					}
				}
			}
		}
	};

	const handleImageDelete = async () => {
		if (imageDeleteSubmit) {
			try {
				await axios.delete(`${authConfig.baseApiUrl}/users/${userData!.id}/photo-delete`, {
					headers: { Authorization: `Bearer ${storedToken}` }
				});
				dispatch(fetchUserData(userData!.id!));
				setImageDeleteSubmit(false);
			} catch (err) {
				console.log(err, '>>> error image delete');
			}
		} else {
			setImageDeleteSubmit(true);
		}
	};

	useEffect(() => {
		setErrors([]);
	}, [openEdit]);

	if (userData) {
		return (
			<Grid container spacing={6}>
				<Grid item xs={12}>
					<Grid container alignItems='center' spacing={2}>
						<Grid item height={48}>
							<Button
								onClick={() => router.push('/apps/user')}
								variant='contained'
								color='primary'
								startIcon={<Icon icon='mdi:backburger' />}
							>
								<Translations text='Back' locale='buttons' />
							</Button>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={12}>
					<Card>
						<CardContent sx={{ pt: 15, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
							{userData.photo ? (
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										position: 'relative',
										'&:hover .image-buttons': {
											visibility: 'visible',
											opacity: 1
										},
										'&:hover .avatar-overlay': {
											opacity: 0.5
										}
									}}
								>
									<CustomAvatar
										className='avatar-overlay'
										src={userData.photo.path}
										variant='rounded'
										alt={userData.firstName}
										sx={{
											width: 120,
											height: 120,
											fontWeight: 600,
											mb: 4,
											transition: 'opacity .2s ease-in-out'
										}}
									/>
									<ButtonGroup
										sx={{
											visibility: 'hidden',
											opacity: 0,
											position: 'absolute',
											m: '0 auto',
											transition: 'opacity .2s ease-in-out'
										}}
										size='small'
										className='image-buttons'
										variant='contained'
									>
										{/* <Button sx={{ m: 0 }}>
                      <Icon icon='mdi:image-edit-outline' />
                    </Button> */}
										{imageDeleteSubmit && (
											<Button sx={{ m: 0 }} onClick={() => setImageDeleteSubmit(false)}>
												<Icon icon='mdi:arrow-left' />
											</Button>
										)}
										<Button
											sx={{ m: 0 }}
											color={imageDeleteSubmit ? 'error' : 'primary'}
											onClick={handleImageDelete}
										>
											<Icon icon={imageDeleteSubmit ? 'mdi:delete' : 'mdi:delete-outline'} />
										</Button>
									</ButtonGroup>
								</Box>
							) : (
								<CustomAvatar
									skin='light'
									variant='rounded'
									color={userData.avatarColor as ThemeColor}
									sx={{ width: 120, height: 120, fontWeight: 600, mb: 4, fontSize: '3rem' }}
								>
									{userData.firstName &&
										userData.lastName &&
										getInitials(`${userData.firstName} ${userData.lastName}`)}
								</CustomAvatar>
							)}
							<Typography variant='h6'>{userData.firstName + ' ' + userData.lastName}</Typography>
							<Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
								{`${userData.publicEmail || ''}`}
							</Typography>
							{userData.roleId && (
								<CustomChip
									skin='light'
									size='small'
									label={roleArray.find(r => r.id === userData.roleId)?.displayName}
									color={roleColors[`${roleArray.find(r => r.id === userData.roleId)?.name}`]}
									sx={{ textTransform: 'capitalize' }}
								/>
							)}
						</CardContent>
						<CardContent>
							<Divider sx={{ my: theme => `${theme.spacing(4)} !important` }} />
							<Box sx={{ pb: 1 }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Box sx={{ width: '50%', display: 'flex', mb: 2 }}>
										<Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>
											<Translations text='name' locale='labels' />:
										</Typography>
										<Typography variant='body2'>{userData.firstName}</Typography>
									</Box>
									<Box sx={{ width: '50%', display: 'flex', mb: 2 }}>
										<Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>
											<Translations text='surname' locale='labels' />:
										</Typography>
										<Typography variant='body2'>{userData.lastName}</Typography>
									</Box>
								</Box>
								<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
									<Box sx={{ width: '100%', display: 'flex', mb: 2 }}>
										<Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>
											E-mail:
										</Typography>
										<Typography variant='body2'>{userData.email ? userData.email : '-'}</Typography>
									</Box>
									<Box sx={{ width: '100%', display: 'flex', mb: 2 }}>
										<Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>
											<Translations text='phone' locale='labels' />:
										</Typography>
										<Typography variant='body2'>{userData.phone ? userData.phone : '-'}</Typography>
									</Box>
								</Box>
								<Box sx={{ display: 'flex', mb: 2 }}>
									<Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>
										<Translations text='registerDate' locale='labels' />:
									</Typography>
									<Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
										{new Date(userData.createdAt ? userData.createdAt : 0).toLocaleDateString(
											'ru-RU',
											{
												year: 'numeric',
												month: 'long',
												day: 'numeric'
											}
										)}
									</Typography>
								</Box>
							</Box>
						</CardContent>

						<CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
							<Button variant='contained' sx={{ mr: 2 }} onClick={handleEditClickOpen}>
								<Translations text='Edit' locale='buttons' />
							</Button>
						</CardActions>
					</Card>
				</Grid>
				<UserEditModal
					errors={errors}
					openEdit={openEdit}
					roleArray={roleArray}
					statusesArray={statusesArray}
					user={userData}
					isSuperAdmin={userRole && userRole.name !== 'super_admin'}
					handleEditClose={handleEditClose}
					handleEditSubmit={handleEditSubmit}
				/>
			</Grid>
		);
	} else {
		return null;
	}
};

export default UserViewLeft;
