// ** React Import
import { useEffect, useState } from 'react';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Third Party Import
import { useTranslation } from 'next-i18next';

// ** Custom Components Imports
import OptionsMenu from 'src/@core/components/option-menu';
import authConfig from 'src/configs/auth';
import axios from 'axios';

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext';
import { LocaleType } from 'src/types/apps/articleTypes';
import Image from 'next/image';

interface Props {
	settings: Settings;
	saveSettings: (values: Settings) => void;
}

const renderIcon = (lang: string) => {
	switch (lang) {
		case 'ru':
			return '/images/lang/ru.svg';
		case 'en':
			return '/images/lang/gb.svg';
		default:
			return '';
	}
};

const LanguageDropdown = ({ settings, saveSettings }: Props) => {
	// ** Hook
	const { i18n } = useTranslation();

	// ** Vars
	const { layout } = settings;

	const [locales, setLocales] = useState<LocaleType[]>([]);

	const handleLangItemClick = (lang: string) => {
		i18n.changeLanguage(lang);
	};

	// ** Change html `lang` attribute when changing locale
	useEffect(() => {
		document.documentElement.setAttribute('lang', i18n.language);
		document.cookie = `lang=${i18n.language}; path=/`;
	}, [i18n.language]);

	const fetchLocales = async () => {
		const res = await axios.get(`${authConfig.baseApiUrl}/locales`);
		if (res.status === 200) {
			setLocales(res.data);
		}
	};

	useEffect(() => {
		fetchLocales();
	}, []);

	useEffect(() => {
		if (!settings.localeId && locales.length > 0) {
			const lang = locales.find(l => l.name === i18n.language);
			saveSettings({ ...settings, localeId: lang?.id ?? '', lang: i18n.language });
		}
	}, [settings.localeId, locales.length, i18n.language]);

	const options = locales?.map(lang => ({
		icon: <Image src={renderIcon(lang.name)} alt={lang.name} width={24} height={24} />,
		text: ``,
		menuItemProps: {
			sx: { py: 2 },
			selected: i18n.language === lang.name,
			onClick: () => {
				handleLangItemClick(lang.name);
				saveSettings({ ...settings, localeId: lang.id, lang: lang.name });
			}
		}
	}));

	return (
		<OptionsMenu
			icon={
				i18n.language && Boolean(renderIcon(i18n.language)) ? (
					<Image src={renderIcon(i18n.language)} alt={i18n.language} width={24} height={24} />
				) : (
					<Icon icon='mdi:translate' />
				)
			}
			menuProps={{ sx: { '& .MuiMenu-paper': { mt: 4 } } }}
			iconButtonProps={{
				size: 'small',
				color: 'inherit',
				sx: { ...(layout === 'vertical' ? { mr: 0.75 } : { mx: 0.75 }) }
			}}
			options={options}
		/>
	);
};

export default LanguageDropdown;
