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

import leafletIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import leafletIcon from 'leaflet/dist/images/marker-icon.png'
import leafletShadow from 'leaflet/dist/images/marker-shadow.png'
delete Leaflet.Icon.Default.prototype._getIconUrl;
Leaflet.Icon.Default.mergeOptions({
    iconRetinaUrl: leafletIconRetina,
    iconUrl: leafletIcon,
    shadowUrl: leafletShadow
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

    const [locationName, setLocationName] = useState("מחנה גלילות");

	const handlePrint = useReactToPrint({
		content: () => printRef.current,
        documentTitle: "זמני היום ל" + locationName + " - " + new Date().getFullYear()
	});

    const [searchQuery, setSearchQuery] = useState("");
    const handleSearch = async () => {
        const newPos = await fetchLocationResultsFor(searchQuery);
        if (newPos) {
            setPos(newPos);
            setLocationName(searchQuery);
        }
    };

    const updateLocationName = async (newPos) => {
        const ele = await fetchNameForLocation(newPos);
        setLocationName(ele);
    }
    // useEffect(() => { updateLocationName(pos) }, []);

    useEffect(() => {
        async function updateElevation() {
            const ele = await fetchElevationFor(pos);
            setElevation(ele);
        }
        updateElevation();
    }, [pos, setElevation]);

    useEffect(() => {
        setfooterText("זמנים ל" + locationName + ", " + new Date().getFullYear() + ". יש לקחת בחשבון סטייה של עד כשתי דקות.")
    }, [locationName, setfooterText]);

	return (
		<Box sx={{ flex: 1 }}>
			<Box className="Configuration-form" sx={{ height: '100%' }}>
                <form onSubmit={ (e) => { handleSearch(); e.preventDefault(); } }>
                    <TextField label="חפש מיקום" variant="filled" fullWidth value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{
                        endAdornment: <InputAdornment position="end">
                            <IconButton type="submit" edger="end">
                                <Search />
                            </IconButton>
                        </InputAdornment>
                    }} />
                </form>

                <Box className="Configuration-map" sx={{ mt: 1, maxHeight: 256, flex: 1 }}>
                    <SelectionMap pos={pos} setPos={(pos) => { setPos(pos); updateLocationName(pos); }} />
                </Box>
                
                <Box sx={{ mt: 1, display:'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TextField sx={{ mr: 0.5, flex: 1 }} label="קו רוחב" variant="filled" type="number" value={(+pos.lat).toFixed(6)} onChange={(e) => { const newPos = { lat: parseFloat(e.target.value), lng: pos.lng }; setPos(newPos); updateLocationName(newPos); }}/>
                    <TextField sx={{ ml: 0.5, flex: 1 }} label="קו אורך" variant="filled" type="number" value={(+pos.lng).toFixed(6)} onChange={(e) => { const newPos = { lat: pos.lat, lng: parseFloat(e.target.value) }; setPos(newPos); updateLocationName(newPos); }} />
                </Box>
                <TextField sx={{ mt: 1 }} label="גובה (מטרים)" variant="filled" type="number" value={elevation} onChange={(e) => setElevation(parseFloat(e.target.value))} />
                
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
    const markerRef = useRef();
    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current
            if(marker) {
                setPos(marker.getLatLng())
            }
        }
    }), [markerRef, setPos]);

    return (
        <MapContainer style={{ height: '100%' }} center={pos} zoom={13} scrollWheelZoom={false} >
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
    const resp = await fetch("https://api.open-meteo.com/v1/elevation?latitude=" + pos.lat + "&longitude=" + pos.lng)
    if (resp.ok) {
        const results = await resp.json()
        return results.elevation[0]
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

async function fetchNameForLocation(pos) {
    const resp = await fetch("https://nominatim.openstreetmap.org/reverse?format=json&accept-language=he&zoom=15&lat=" + pos.lat + "&lon=" + pos.lng);
    if (resp.ok) {
        const results = await resp.json()
        if (results.address) return results.address.city || results.address.town || results.address.municipality || results.address.village
    }
    return null;
}

export default Configuration;