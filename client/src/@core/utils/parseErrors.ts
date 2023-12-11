export const parseErrors = (err: Partial<string[]>) => {
	return err
		.map(item => {
			const splitStr = item?.split(':');
			if (splitStr && splitStr[0]) {
				const key = splitStr[0];
				const message = splitStr.slice().splice(1).join(' ');

				return {
					key,
					message
				};
			} else {
				return {
					key: '',
					message: ''
				};
			}
		})
		.filter(item => !!item.key);
};
