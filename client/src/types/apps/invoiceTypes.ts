export type InvoiceStatus = 'Paid' | string;

export type InvoiceLayoutProps = {
	id: string | string[] | undefined;
};

export type InvoiceClientType = {
	id?: string;
	name: string;
	address: string;
	company: string;
	country: string;
	contact: string;
	companyEmail: string;
};

export type InvoiceType = {
	id: number;
	name: string;
	type: string;
	amount: number;
	provider: string;
	isAllowed: string;
	cost: string;
};

export type InvoicePaymentType = {
	iban: string;
	totalDue: string;
	bankName: string;
	country: string;
	swiftCode: string;
};

export type SingleInvoiceType = {
	invoice: InvoiceType;
	paymentDetails: InvoicePaymentType;
};
