// ** Third Party Import
import { useTranslation } from 'next-i18next';

interface Props {
	text: string;
	locale?: string;
}

const Translations = ({ text, locale }: Props) => {
	// ** Hook
	const { t } = useTranslation(locale);

	return <>{`${t(text)}`}</>;
};

export default Translations;
