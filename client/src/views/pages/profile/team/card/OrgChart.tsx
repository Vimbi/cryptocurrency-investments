import React, { FC, useLayoutEffect, useRef } from 'react';
import { OrgChart } from 'd3-org-chart';
import { useSettings } from 'src/@core/hooks/useSettings';
import { useTranslation } from 'next-i18next';
import moment from 'moment';

type WholeTeamType = {
	createdAt: string;
	firstName: string;
	id: string;
	investmentsAmount: number;
	lastName: string;
	parentId: string;
	referralCode: string;
	surname: string;
};

interface IOrgChart {
	data: WholeTeamType[];
}

const OrgChartReferrals: FC<IOrgChart> = ({ data }) => {
	const { t } = useTranslation('labels');
	const {
		settings: { mode }
	} = useSettings();
	const isDark = mode === 'dark';
	const d3Container = useRef(null);

	useLayoutEffect(() => {
		if (data && d3Container.current)
			new OrgChart()
				.container(d3Container.current)
				.data(data)
				.nodeWidth(() => 200)
				.nodeHeight(() => 150)
				.nodeButtonWidth(() => 40)
				.nodeButtonHeight(() => 25)
				.nodeContent(d => {
					const data = d.data as WholeTeamType;

					return `<div style='height:100%; border-radius:0.5rem; border:1px solid ${
						isDark ? '#fff' : '#16642F'
					}' >
								<div style='font-size:1rem; padding:.75rem .5rem'>
									<p style='margin:0; font-weight:700'>${data.firstName ?? ''} ${data.lastName ?? ''} ${data.surname ?? ''}</p>
								</div>
								<div style='padding:0 .5rem;'><p style='font-weight:700; font-size:1rem; margin:0'>${t(
									'contributionAmount'
								)}: <span style='font-weight:400'>${data.investmentsAmount ?? 0}</span></p></div>
								<div style='padding:0 .5rem;'>
									<p>${t('registerDate')}: <span>${moment(data.createdAt).format('DD.MM.YYYY')}</span></p>
								</div>
							</div>`;
				})
				.buttonContent((d: { node: any; state: any }) => {
					const { node } = d;

					return `<div style='width:100%; border-radius:9999px; overflow:hidden; height:100%; background-color: ${
						isDark ? '#fff' : '#16642F'
					}'>
					<p style='color:${
						isDark ? '#16642F' : '#fff'
					};font-size:1rem;margin:0;width:100%;height:100%;display:flex;justify-content:center;align-items:center'>${
						node.data._directSubordinates
					}</p>
					</div>`;
				})
				.render();
	}, [d3Container.current, data]);

	return (
		<div>
			<div ref={d3Container}></div>
		</div>
	);
};

export default OrgChartReferrals;
