import React, { useRef, useState } from 'react';
import './App.css';

import { ThemeProvider, createTheme } from '@mui/material/styles'
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

import Paper from '@mui/material/Paper'
import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box } from '@mui/material';
import { QuestionMark } from '@mui/icons-material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import ZmanimSheet from './ZmanimSheet.js'
import Configuration from './Configuration.js'

const cacheRtl = createCache({
	key: 'muirtl',
	stylisPlugins: [prefixer, rtlPlugin],
});

const theme = createTheme({
	direction: 'rtl',
	palette: {
		mode: 'light',
		primary: {
			main: '#b71c1c',
			contrastText: "#ffffff"
		},
		secondary: {
			main: '#f50057',
		},
	},
});

function App() {
	const printRef = useRef();
	const previewWrapperRef = useRef();

	const [pos, setPos] = useState({ lat: 32.145774928228875, lng: 34.81859553369716 });
	const [elevation, setElevation] = useState(0);

	const [footerText, setfooterText] = useState('');
	const [timesFontSize, setTimesFontSize] = useState('9');
	const [halachaFontSize, setHalachaFontSize] = useState('8');
	const [columnCount, setColumnCount] = useState('7');
	const [showHalachot, setShowHalachot] = useState(true);

	return (
		<CacheProvider value={cacheRtl}>
			<ThemeProvider theme={theme}>
				<div className="App">
					<Paper elevation={4} square className="App-config-pane">
						<Configuration
							printRef={printRef}
							pos={pos}
							setPos={setPos}
							elevation={elevation}
							setElevation={setElevation}
							footerText={footerText}
							setfooterText={setfooterText}
							timesFontSize={timesFontSize}
							setTimesFontSize={setTimesFontSize}
							halachaFontSize={halachaFontSize}
							setHalachaFontSize={setHalachaFontSize}
							columnCount={columnCount}
							setColumnCount={setColumnCount}
							showHalachot={showHalachot}
							setShowHalachot={setShowHalachot} />
					</Paper>
					<div className="App-preview" ref={previewWrapperRef}>
						<ZmanimSheet
							printRef={printRef}
							wrapperRef={previewWrapperRef}
							lat={pos.lat}
							lng={pos.lng}
							elevation={elevation}
							footerText={footerText}
							timesFontSize={timesFontSize}
							halachaFontSize={halachaFontSize}
							columnCount={columnCount}
							showHalachot={showHalachot} />
						<Box sx={{position: 'absolute', right: 1, bottom: 1}}><AboutButton/></Box>
					</div>
				</div>
			</ThemeProvider>
		</CacheProvider>
	);
}

function AboutButton() {
	const [open, setOpen] = React.useState(false);
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

	const handleClickOpen = () => { setOpen(true); };
	const handleClose = () => {	setOpen(false);	};

	return (
		<>
			<Paper sx={{m: 1, backgroundColor: "primary.main"}}>
				<IconButton size="large" onClick={handleClickOpen}>
					<QuestionMark sx={{ color: 'primary.contrastText' }} />
				</IconButton>
			</Paper>
			<Dialog
				fullScreen={fullScreen}
				open={open}
				onClose={handleClose}>
				<DialogTitle>
					{"אודות"}
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						<p>
							האתר נועד ליצירת לוחות זמני היום שנתיים. הלוחות כוללים את זמני הנץ החמה והשקיעה - מהם ניתן לחשב את שאר הזמנים היום הרלונטיים. הלוח מיועד להדפסה על נייר בגודל A6 (4 לוחות בכל דף A4) כך שיתאים בכיס. מומלץ גם לניילן את הלוח.
						</p>
						<p>
							ההלכות המופיעות בלוח נכתבו על פי ההוראות של הרב יצחק שילת (ראש ישיבת ברכת משה במעלה אדומים), בשיעורי הכנה לצבא שהרב מעביר בישיבה. ההלכות כפי שנוסחו כאן אושרו על ידי הרב.
						</p>
						<p>
							יש לקחת בחשבון סטייה של עד כשתי דקות מהזמנים הרשומים בלוח. הלוח מחושב עבור השנה הלועזית הנוכחית. חישוב הזמנים נעשה על ידי ספריית <a href="https://github.com/BehindTheMath/KosherZmanim" target="_blank">KosherJava</a>.
						</p>
						אתר זה הוא פרי מיזם פיתוחי חותם - פיתוחים טכנולוגים למען עולם התורה.<br/>
						<img className="App-logo" src="pituchei_hotam.jpeg" width="131" height="101" alt="Pituchei Hotam" style={{ align: "center" }} />
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button autoFocus onClick={handleClose}>סגור</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default App;
