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

	const [pos, setPos] = useState({lat: 32.145774928228875, lng: 34.81859553369716});
	const [elevation, setElevation] = useState('');
	
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
					</div>
				</div>
			</ThemeProvider>
		</CacheProvider>
	);
}

export default App;
