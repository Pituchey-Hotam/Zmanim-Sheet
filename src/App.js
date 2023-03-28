import React, { useRef, useState } from 'react';
import './App.css';

import { ThemeProvider, createTheme } from '@mui/material/styles'
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

import Paper from '@mui/material/Paper'

import ZmanimSheet from './ZmanimSheet.js'
import Configuration from './Configuration.js'

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const theme = createTheme({
	direction: 'rtl'
});

function App() {
	const printRef = useRef();
	const previewWrapperRef = useRef();

	const [lat, setLat] = useState('31.76832');
	const [lon, setLon] = useState('35.21371');
	const [elevation, setElevation] = useState('779.46');
	
	const [footerText, setfooterText] = useState('');
	const [timesFontSize, setTimesFontSize] = useState('9');
	const [halachaFontSize, setHalachaFontSize] = useState('8');
	const [columnCount, setColumnCount] = useState('7');

	return (
		<CacheProvider value={cacheRtl}>
			<ThemeProvider theme={theme}>
				<div className="App">
					<Paper elevation={4} square className="App-config-pane">
						<Configuration
							printRef={printRef}
							lat={lat}
							setLat={setLat}
							lon={lon}
							setLon={setLon}
							elevation={elevation}
							setElevation={setElevation}
							footerText={footerText}
							setfooterText={setfooterText}
							timesFontSize={timesFontSize}
							setTimesFontSize={setTimesFontSize}
							halachaFontSize={halachaFontSize}
							setHalachaFontSize={setHalachaFontSize}
							columnCount={columnCount}
							setColumnCount={setColumnCount} />
					</Paper>
					<div className="App-preview" ref={previewWrapperRef}>
						<ZmanimSheet
							printRef={printRef}
							wrapperRef={previewWrapperRef}
							lon={lon}
							lat={lat}
							elevation={elevation}
							footerText={footerText}
							timesFontSize={timesFontSize}
							halachaFontSize={halachaFontSize}
							columnCount={columnCount} />
					</div>
				</div>
			</ThemeProvider>
		</CacheProvider>
	);
}

export default App;
