import React, { useRef, useState } from 'react';
import './App.css';

import { ThemeProvider, createTheme } from '@mui/material/styles'
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box';

import ZmanimSheet from './ZmanimSheet.jsx'
import Configuration from './Configuration.jsx'

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

	const [pos, setPos] = useState({ lat: 30.022058, lng: 34.931246 });
	const [elevation, setElevation] = useState(0);

	const [footerText, setfooterText] = useState('');
	const [timesFontSize, setTimesFontSize] = useState('9');
	const [halachaFontSize, setHalachaFontSize] = useState('8');
	const [columnCount, setColumnCount] = useState('7');
	const [showHalachot, setShowHalachot] = useState(true);
	const [printFormat, setPrintFormat] = useState('a6');

	return (
		<CacheProvider value={cacheRtl}>
			<ThemeProvider theme={theme}>
				<div className="App">
					<Paper elevation={4} square className="App-config-pane" sx={{ display: 'flex', flexDirection: 'column' }}>
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
							setShowHalachot={setShowHalachot}
							printFormat={printFormat}
							setPrintFormat={setPrintFormat} />
					</Paper>
					<Box className="App-preview" ref={previewWrapperRef} sx={{ p: 1 }}>
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
							showHalachot={showHalachot}
							printFormat={printFormat} />
					</Box>
				</div>
			</ThemeProvider>
		</CacheProvider>
	);
}

export default App;
