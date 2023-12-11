declare module '@mui/material/styles' {
	interface Palette {
		customColors: {
			dark: string;
			main: string;
			light: string;
			bodyBg: string;
			darkBg: string;
			lightBg: string;
			trackBg: string;
			avatarBg: string;
			tableHeaderBg: string;
			primaryGradient: string;
		};
    black: {
      light: string;
      main: string;
      contrastText: string;
    };
	}
	interface PaletteOptions {
		customColors?: {
			dark?: string;
			main?: string;
			light?: string;
			bodyBg?: string;
			darkBg?: string;
			lightBg?: string;
			trackBg?: string;
			avatarBg?: string;
			tableHeaderBg?: string;
			primaryGradient?: string;
		};
    black?: {
      light?: string;
      main?: string;
      contrastText?: string;
    };
	}
}

export {};
