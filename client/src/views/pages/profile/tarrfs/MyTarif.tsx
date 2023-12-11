import { FC, useMemo } from 'react';

import { Card, CardContent, CardHeader, Typography, Grid } from '@mui/material';

import PricingPlans from 'src/views/pages/pricing/PricingPlans';

import { useSelector } from 'react-redux';
import { RootState } from 'src/store';

import { ProductTarifType } from 'src/types/apps/tarifTypes';
import { useTranslation } from 'next-i18next';

const getImageLink = (displayName: string) => {
  let link = '/images/pages/pricing-plans-';
  const dName = displayName.toLowerCase();
  if (dName === 'standart' || dName === 'standard') {
    link += '1.jpg';
  } else if (dName === 'gold') {
    link += '2.jpg';
  } else if (dName === 'vip') {
    link += '3.jpg';
  } else if (dName === 'platinum') {
    link += '4.jpg';
  } else {
    link = '';
  }

  return link;
};

const MyTarif: FC = () => {
  const { t } = useTranslation('investment');
  const { data: tariffs } = useSelector((state: RootState) => state.tarif);
  const currentInvestment = useSelector((state: RootState) => state.investment.currentInvestment);
  const balance = useSelector((state: RootState) => state.accountStatement.balance);

  const sortedTarifs = useMemo(() => {
    if (tariffs.length > 0) {
      return tariffs
        .map((item: ProductTarifType) => {
          const updateImage = { ...item, imgSrc: getImageLink(item.displayName) };

          return updateImage;
        })
        .sort(function (a, b) {
          return a.price - b.price;
        });
    } else return [];
  }, [tariffs]);

  const check = { ...currentInvestment, ...balance };

  return (
    <Grid item xs={12} id='invest'>
      <Card>
        <CardHeader title={`${t('MyTarif')}`} />
        <CardContent>
          <Typography variant='body2' sx={{ mb: 8 }}>
            {balance.invested > 0 ? `${t('MyTarifCard1')}` : `${t('MyTarifCard2')}`}
          </Typography>
          {sortedTarifs && sortedTarifs.length > 0 ? <PricingPlans data={sortedTarifs} invest={check} /> : ''}
        </CardContent>
      </Card>
    </Grid>
  );
};
export default MyTarif;
