import { FC, useEffect } from 'react';

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	TextField,
	Select,
	FormHelperText
} from '@mui/material';

import { Controller, useForm } from 'react-hook-form';

import { RoleType, UsersType } from 'src/types/apps/userTypes';
import Translations from 'src/layouts/components/Translations';

interface IUserEditModalProps {
	openEdit: boolean;
	roleArray: RoleType[];
	statusesArray: { id: string; name: string; displayName: string }[];
	isSuperAdmin: boolean | undefined;
	errors: { [key in keyof UsersType]: string }[];
	user: UsersType;
	handleEditClose: () => void;
	handleEditSubmit: (data: UsersType) => void;
}

const UserEditModal: FC<IUserEditModalProps> = ({
	errors,
	openEdit,
	roleArray,
	statusesArray,
	isSuperAdmin,
	user,
	handleEditClose,
	handleEditSubmit
}) => {
	const editUserForm = useForm<UsersType>();

	useEffect(() => {
		if (user) {
			const { firstName, lastName, email, phone, publicEmail, description, region, roleId, statusId } = user;
			editUserForm.reset({
				firstName,
				lastName,
				email,
				phone,
				publicEmail,
				description,
				region,
				roleId,
				statusId
			});
		}
	}, [user]);

	return (
		<Dialog
			open={openEdit}
			onClose={handleEditClose}
			aria-labelledby='user-view-edit'
			aria-describedby='user-view-edit-description'
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
				Редактирование пользователя
			</DialogTitle>
			<DialogContent
				sx={{
					pb: theme => `${theme.spacing(8)} !important`,
					px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
				}}
			>
				<DialogContentText variant='body2' id='user-view-edit-description' sx={{ textAlign: 'center', mb: 7 }}>
					Отредактируйте информацию о пользователе.
				</DialogContentText>
				<form>
					<Grid container spacing={6}>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<Controller
									name='firstName'
									control={editUserForm.control}
									render={({ field: { value, onChange, onBlur } }) => (
										<TextField
											required
											fullWidth
											label={<Translations text='name' locale='labels' />}
											value={value}
											onChange={onChange}
											onBlur={onBlur}
										/>
									)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<Controller
									name='lastName'
									control={editUserForm.control}
									render={({ field: { value, onChange, onBlur } }) => (
										<TextField
											fullWidth
											label={<Translations text='surname' locale='labels' />}
											value={value}
											onChange={onChange}
											onBlur={onBlur}
										/>
									)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<Controller
									name='email'
									control={editUserForm.control}
									render={({ field: { value, onChange, onBlur } }) => (
										<TextField
											disabled={isSuperAdmin}
											error={errors.some(item => 'email' in item)}
											fullWidth
											label='E-mail'
											value={value}
											onChange={onChange}
											onBlur={onBlur}
										/>
									)}
								/>
								<FormHelperText error>{errors.find(item => 'email' in item)?.email}</FormHelperText>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<Controller
									name='phone'
									control={editUserForm.control}
									render={({ field: { value, onChange, onBlur } }) => (
										<TextField
											error={errors.some(item => 'phone' in item)}
											fullWidth
											label={<Translations text='phone' locale='labels' />}
											value={value}
											onChange={onChange}
											onBlur={onBlur}
										/>
									)}
								/>
								<FormHelperText error>{errors.find(item => 'phone' in item)?.phone}</FormHelperText>
							</FormControl>
						</Grid>
						{/* <Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel id='user-view-country-label'>Регион</InputLabel>
								<Controller
									name='region'
									control={editUserForm.control}
									render={({ field }) => (
										<Select
											{...field}
											label='Регион'
											value={field.value?.id}
											id='user-view-country'
											labelId='user-view-country-label'
											onChange={e => field.onChange({ id: e.target.value })}
										>
											{regionArray.map(region => (
												<MenuItem key={region.id} value={region.id}>
													{region.publicName}
												</MenuItem>
											))}
										</Select>
									)}
								/>
							</FormControl>
						</Grid> */}
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel id='user-view-role-label'>
									<Translations text='role' locale='labels' />
								</InputLabel>
								<Controller
									name='roleId'
									control={editUserForm.control}
									render={({ field }) => (
										<Select
											{...field}
											label={<Translations text='role' locale='labels' />}
											value={field.value}
											id='user-view-role'
											labelId='user-view-role-label'
											onChange={e => field.onChange(e.target.value)}
										>
											{roleArray.map(role => (
												<MenuItem key={role.id} value={role.id}>
													{role.displayName}
												</MenuItem>
											))}
										</Select>
									)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel id='user-view-status-label'>
									<Translations text='status' locale='labels' />
								</InputLabel>
								<Controller
									name='statusId'
									control={editUserForm.control}
									render={({ field }) => (
										<Select
											{...field}
											label={<Translations text='status' locale='labels' />}
											value={field.value}
											id='user-view-status'
											labelId='user-view-status-label'
											onChange={e => field.onChange(e.target.value)}
										>
											{statusesArray.map(stat => (
												<MenuItem key={stat.id} value={stat.id}>
													{stat.displayName}
												</MenuItem>
											))}
										</Select>
									)}
								/>
							</FormControl>
						</Grid>
						{/* <Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel id='user-view-company-label'>Компания</InputLabel>
								<Controller
									name='company'
									control={editUserForm.control}
									render={({ field }) => (
										<Select
											{...field}
											label='Компания'
											id='user-view-company'
											labelId='user-view-company-label'
										></Select>
									)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel id='user-view-face-label'>Юр. Лицо</InputLabel>
								<Controller
									name='face'
									control={editUserForm.control}
									render={({ field }) => (
										<Select
											{...field}
											label='Юр. Лицо'
											id='user-view-face'
											labelId='user-view-face-label'
										></Select>
									)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel id='user-view-point-label'>Торговая точка</InputLabel>
								<Controller
									name='point'
									control={editUserForm.control}
									render={({ field }) => (
										<Select
											{...field}
											label='Торговая точка'
											id='user-view-point'
											labelId='user-view-point-label'
										></Select>
									)}
								/>
							</FormControl>
						</Grid> */}
						{/* <Grid item xs={12} sm={12}>
							<FormControl fullWidth>
								<Controller
									name='description'
									control={editUserForm.control}
									render={({ field: { value, onChange, onBlur } }) => (
										<TextField
											multiline
											rows={3}
											fullWidth
											label='bio (о пользователе)'
											value={value}
											onChange={onChange}
											onBlur={onBlur}
										/>
									)}
								/>
							</FormControl>
						</Grid> */}
					</Grid>
				</form>
			</DialogContent>
			<DialogActions
				sx={{
					justifyContent: 'center',
					px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
					pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
				}}
			>
				<Button variant='outlined' color='error' onClick={handleEditClose}>
					<Translations text='Cancel' locale='buttons' />
				</Button>
				<Button variant='contained' sx={{ mr: 2 }} onClick={() => handleEditSubmit(editUserForm.getValues())}>
					<Translations text='Save' locale='buttons' />
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default UserEditModal;
