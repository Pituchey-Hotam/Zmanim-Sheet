import 'leaflet/dist/leaflet.css'
import './Configuration.css';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import PrintIcon from '@mui/icons-material/Print';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import Leaflet from 'leaflet'
import { IconButton, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
Leaflet.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function Configuration({
            printRef,
            footerText,
            setfooterText,
            pos,
            setPos,
            elevation,
            setElevation,
            timesFontSize,
            setTimesFontSize,
            halachaFontSize,
            setHalachaFontSize,
            columnCount,
            setColumnCount,
            showHalachot,
            setShowHalachot
        }) {

	const handlePrint = useReactToPrint({
		content: () => printRef.current,
	});

    const [searchQuery, setSearchQuery] = useState("");
    const handleSearch = async () => {
        const newPos = await fetchLocationResultsFor(searchQuery);
        if (newPos) setPos(newPos);
    }

    /* useEffect(() => {
        const ele = fetchElevationFor(pos)
        setElevation(ele)
    }, [pos, setElevation]) */

	return (
		<Box sx={{ p: 1 }}>
			<Box component="form" className="Configuration-form">
                <TextField label="חפש מיקום" variant="filled" fullWidth value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{
                    endAdornment: <InputAdornment position="end">
                        <IconButton edger="end" onClick={ handleSearch }>
                            <Search />
                        </IconButton>
                    </InputAdornment>
                }} />

                <Box sx={{ mt: 1, height: 256 }}>
                    <SelectionMap pos={pos} setPos={setPos} />
                </Box>
                
                <Box sx={{ mt: 1, display:'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TextField sx={{ mr: 0.5, flex: 1 }} label="קו רוחב" variant="filled" type="number" value={(+pos.lat).toFixed(6)} onChange={(e) => setPos({ lat: parseFloat(e.target.value), lng: pos.lng })} />
                    <TextField sx={{ ml: 0.5, flex: 1 }} label="קו אורך" variant="filled" type="number" value={(+pos.lng).toFixed(6)} onChange={(e) => setPos({ lat: pos.lat, lng: parseFloat(e.target.value) })} />
                </Box>
                <TextField sx={{ mt: 1 }} label="גובה (מטרים)" variant="filled" type="number" value={elevation} onChange={(e) => setElevation(e.target.value)} />
                
                <Divider sx={{ m: 2 }} />
                
                <TextField label="מספר עמודות" variant="filled" fullWidth type="number" value={columnCount} onChange={(e) => setColumnCount(e.target.value)} />
                <Box sx={{ mt: 1, display:'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TextField sx={{ mr: 0.5, flex: 1 }} label="גופן זמנים" variant="filled" type="number" value={timesFontSize} onChange={(e) => setTimesFontSize(e.target.value)} />
                    <TextField sx={{ ml: 0.5, flex: 1 }} label="גופן הלכות" variant="filled" type="number" value={halachaFontSize} onChange={(e) => setHalachaFontSize(e.target.value)} />
                </Box>
                <FormControlLabel sx={{ ml: 1, mt: 1 }} control={
                    <Checkbox checked={showHalachot} onChange={(e) => setShowHalachot(e.target.checked)} />
                } label="הצג הלכות" />
                <TextField sx={{ mt: 1 }} label="כיתוב תחתון" variant="filled" fullWidth value={footerText} onChange={(e) => setfooterText(e.target.value)} />
			    <Button sx={{ mt: 1 }} variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} >הדפסה</Button>
			</Box>
		</Box>
	)
}

function SelectionMap({pos, setPos}) {
    const [map, setMap] = useState(null);
    const markerRef = useRef();
    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current
            if(marker) {
                setPos(marker.getLatLng())
            }
        }
    }));

    return (
        <MapContainer style={{ height: '100%' }} center={pos} zoom={13} scrollWheelZoom={false} whenCreated={setMap}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker 
                ref={markerRef}
                draggable={true}
                eventHandlers={eventHandlers}
                position={pos}>
            </Marker>

            <CenterUpdater center={pos} />
        </MapContainer>
    )
}

function CenterUpdater({ center }) {
    const map = useMap();

    useEffect(() => {
        if (map) map.flyTo(center);
    }, [map, center])
}

async function fetchElevationFor(pos) {
    const resp = await fetch("https://api.opentopodata.org/v1/aster30m?locations=" + pos.lat + "," + pos.lng)
    if (resp.ok) {
        return resp.json().results[0].elevation
    }
    else return 0
}

async function fetchLocationResultsFor(query) {
    const resp = await fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(query));
    if (resp.ok) {
        const results = await resp.json()
        if (results.length > 0) return { lat: results[0].lat, lng: results[0].lon }
    }
    return null;
}

export default Configuration;