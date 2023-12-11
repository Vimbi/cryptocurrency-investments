import { Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, TextField, Checkbox, FormControlLabel, Typography, Link } from '@mui/material';
import { FC, useState } from 'react';
import { useRouter } from 'next/router';

import 'moment/locale/ru';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { createInvestment, getCurrentInvestment, getInvestments, replenishInvestment } from 'src/store/apps/investment';
import { toast } from 'react-hot-toast';
import { getBalance } from 'src/store/apps/accountStatement';
import { isAxiosError } from 'axios';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';
import { styled } from '@mui/material/styles';

// ** Styled Components
const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main
}));

interface Props {
  isNewInvestment: boolean;
  open: boolean;
  handleClose: (arg0: boolean) => void;
  productId?: string;
}

const CreateInvestModal: FC<Props> = ({ isNewInvestment, open, handleClose, productId }) => {
  const { t } = useTranslation('labels');
  const [value, setValue] = useState('');
  const [isAgree, setIsAgree] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleCancel = () => {
    setValue('');
    handleClose(false);
    setIsAgree(false);
  };

  const handleOnSucces = () => {
    toast.success(`${t('success')}`, { position: 'bottom-center' });
    dispatch(getBalance());
    if (router.query.all) {
      dispatch(
        getInvestments({
          page: 1,
          limit: 50
        })
      );
    } else {
      dispatch(getCurrentInvestment());
    }
  };
  const handleOnError = (mes?: string | string[]) => {
    if (Array.isArray(mes)) {
      mes.map(e => toast.error(e ?? `${t('error')}`, { position: 'bottom-center' }));
    } else if (typeof mes === 'string') {
      toast.error(mes ?? `${t('error')}`, { position: 'bottom-center' });
    }
  };

  const handleSubmit = async () => {
    if (isNewInvestment && productId) {
      const res = await dispatch(
        createInvestment({
          data: {
            amount: value,
            productId
          }
        })
      );
      if (res.meta.requestStatus === 'fulfilled') {
        handleOnSucces();
      } else if (isAxiosError(res.payload)) {
        if (res.payload.response?.data.message) {
          const err = res.payload.response?.data.message;
          handleOnError(err);
        }
      }
    } else {
      const res = await dispatch(
        replenishInvestment({
          data: {
            amount: value
          }
        })
      );
      if (res.meta.requestStatus === 'fulfilled') {
        handleOnSucces();
      } else if (isAxiosError(res.payload)) {
        if (res.payload.response?.data.message) {
          const err = res.payload.response?.data.message;
          handleOnError(err);
        }
      }
    }
    handleCancel();
  };

  return (
    <Dialog open={open} onClose={() => handleClose(false)}>
      <DialogTitle>
        <Translations text='CreateInvestTitle' locale='investment' />
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {isNewInvestment ? (
            <Translations text='CreateInvestNew' locale='investment' />
          ) : (
            <Translations text='CreateInvestReplenish' locale='investment' />
          )}
        </DialogContentText>
        <TextField
          sx={{ mt: 4 }}
          value={value}
          onChange={e => setValue(e.target.value)}
          autoFocus
          fullWidth
          type='number'
          label={<Translations text='amount' locale='labels' />}
        />
        <DialogContentText fontWeight="bold" sx={{ mt: 3 }}>
          <Translations text='TarifChangesNotification' locale='investment' />
        </DialogContentText>
        <FormControlLabel
          label={
            <Typography variant='body2' component='span'>
              <Translations text='IAgreeWith' locale='common' />{' '}
              <LinkStyled href='/products' onClick={e => e.stopPropagation()}>
                <Translations text='ChangeTarifAgree' locale='investment' />
              </LinkStyled>
            </Typography>
          }
          control={<Checkbox checked={isAgree} onChange={() => setIsAgree(!isAgree)} />}
          sx={{ '& .MuiButtonBase-root': { pt: 0, pb: 0 }, mt: 4 }}
        />
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' color='error' onClick={handleCancel}>
          <Translations text='Cancel' locale='buttons' />
        </Button>
        <Button variant='contained' disabled={!isAgree} color='primary' onClick={handleSubmit}>
          <Translations text='Submit' locale='buttons' />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateInvestModal;
