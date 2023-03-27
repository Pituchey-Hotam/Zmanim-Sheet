import './Configuration.css';

import { useReactToPrint } from 'react-to-print';
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import PrintIcon from '@mui/icons-material/Print';

import { GoogleMap, LoadScript } from '@react-google-maps/api';

function Configuration({
            printRef,
            footerText,
            setfooterText,
            lat,
            lon,
            elevation,
            setLat,
            setLon,
            setElevation,
            timesFontSize,
            setTimesFontSize,
            halachaFontSize,
            setHalachaFontSize,
            columnCount,
            setColumnCount
        }) {
	const handlePrint = useReactToPrint({
		content: () => printRef.current,
	});

	return (
		<Box sx={{ p: 1 }}>
			<Box component="form" className="Configuration-form">
                <TextField label="מיקום" variant="filled" fullWidth />
                <Box sx={{ minHeight: 196, minWidth: 256 }}></Box>
                <Box sx={{ display:'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TextField sx={{ mr: 0.5, flex: 1 }} label="קו רוחב" variant="filled" type="number" value={lat} onChange={(e) => setLat(e.target.value)} />
                    <TextField sx={{ ml: 0.5, flex: 1 }} label="קו אורך" variant="filled" type="number" value={lon} onChange={(e) => setLon(e.target.value)} />
                </Box>
                <TextField sx={{ mt: 1 }} label="גובה (מטרים)" variant="filled" type="number" value={elevation} onChange={(e) => setElevation(e.target.value)} />
                
                <Divider sx={{ m: 2 }} />
                
                <TextField label="מספר עמודות" variant="filled" fullWidth type="number" value={columnCount} onChange={(e) => setColumnCount(e.target.value)} />
                <Box sx={{ mt: 1, display:'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TextField sx={{ mr: 0.5, flex: 1 }} label="גופן זמנים" variant="filled" type="number" value={timesFontSize} onChange={(e) => setTimesFontSize(e.target.value)} />
                    <TextField sx={{ ml: 0.5, flex: 1 }} label="גופן הלכות" variant="filled" type="number" value={halachaFontSize} onChange={(e) => setHalachaFontSize(e.target.value)} />
                </Box>
                <TextField sx={{ mt: 1 }} label="כיתוב תחתון" variant="filled" fullWidth value={footerText} onChange={(e) => setfooterText(e.target.value)} />
			    <Button sx={{ mt: 1 }} variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} >הדפסה</Button>
			</Box>
		</Box>
	)
}

export default Configuration;