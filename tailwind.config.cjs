const {theme} = require(`antd`)

const token = {...theme.defaultAlgorithm({...theme.defaultSeed, colorPrimary: `#54a31c`}), colorPrimaryBg: `#e8f3da`}

module.exports = {
	content: [`./pages/**/*.{js,ts,jsx,tsx}`, `./components/**/*.{js,ts,jsx,tsx}`, `./app/**/*.{js,jsx,ts,tsx}`],
	theme: {
		colors: {
			transparent: `transparent`,
			current: `currentColor`,
			white: `white`,
			black: `black`,

			// Brand colors
			primary: token.colorPrimary,
			primaryHover: token.colorPrimaryHover,
			primaryActive: token.colorPrimaryActive,
			primaryText: token.colorPrimaryText,
			primaryTextHover: token.colorPrimaryTextHover,
			primaryTextActive: token.colorPrimaryTextActive,
			primaryBg: token.colorPrimaryBg,
			primaryBgHover: token.colorPrimaryBgHover,
			primaryBorder: token.colorPrimaryBorder,
			primaryBorderHover: token.colorPrimaryBorderHover,

			// Success colors
			success: token.colorSuccess,
			successHover: token.colorSuccessHover,
			successActive: token.colorSuccessActive,
			successText: token.colorSuccessText,
			successTextHover: token.colorSuccessTextHover,
			successTextActive: token.colorSuccessTextActive,
			successBg: token.colorSuccessBg,
			successBgHover: token.colorSuccessBgHover,
			successBorder: token.colorSuccessBorder,
			successBorderHover: token.colorSuccessBorderHover,

			// Warning colors
			warning: token.colorWarning,
			warningHover: token.colorWarningHover,
			warningActive: token.colorWarningActive,
			warningText: token.colorWarningText,
			warningTextHover: token.colorWarningTextHover,
			warningTextActive: token.colorWarningTextActive,
			warningBg: token.colorWarningBg,
			warningBgHover: token.colorWarningBgHover,
			warningBorder: token.colorWarningBorder,
			warningBorderHover: token.colorWarningBorderHover,

			// Error colors
			error: token.colorError,
			errorHover: token.colorErrorHover,
			errorActive: token.colorErrorActive,
			errorText: token.colorErrorText,
			errorTextHover: token.colorErrorTextHover,
			errorTextActive: token.colorErrorTextActive,
			errorBg: token.colorErrorBg,
			errorBgHover: token.colorErrorBgHover,
			errorBorder: token.colorErrorBorder,
			errorBorderHover: token.colorErrorBorderHover,

			// Info colors
			info: token.colorInfo,
			infoHover: token.colorInfoHover,
			infoActive: token.colorInfoActive,
			infoText: token.colorInfoText,
			infoTextHover: token.colorInfoTextHover,
			infoTextActive: token.colorInfoTextActive,
			infoBg: token.colorInfoBg,
			infoBgHover: token.colorInfoBgHover,
			infoBorder: token.colorInfoBorder,
			infoBorderHover: token.colorInfoBorderHover,

			// Neutral colors
			text: token.colorText,
			textSecondary: token.colorTextSecondary,
			textTertiary: token.colorTextTertiary,
			textQuaternary: token.colorTextQuaternary,
			border: token.colorBorder,
			borderSecondary: token.colorBorderSecondary,
			fill: token.colorFill,
			fillSecondary: token.colorFillSecondary,
			fillTertiary: token.colorFillTertiary,
			fillQuaternary: token.colorFillQuaternary,
			bgContainer: token.colorBgContainer,
			bgElevated: token.colorBgElevated,
			bgLayout: token.colorBgLayout,
			bgSpotlight: token.colorBgSpotlight,
			bgMask: token.colorBgMask,
		},
		fontFamily: {
			mono: [`monospace`],
		},
		fontSize: {
			xs: `0.65rem`,
			sm: `0.75rem`,
			base: `0.875rem`,
			lg: `1rem`,
			xl: `1.25rem`,
			"2xl": `1.5rem`,
			"3xl": `1.875rem`,
			"4xl": `2.25rem`,
			"5xl": `3rem`,
			"6xl": `3.75rem`,
			"7xl": `4.5rem`,
			"8xl": `6rem`,
			"9xl": `8rem`,
		},
	},
}
