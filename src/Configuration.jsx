import 'leaflet/dist/leaflet.css'
import './Configuration.css';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Box from '@mui/material/Box'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import NavigateNextIcon from '@mui/icons-material/NavigateBefore';
import FourPagesIcon from '@mui/icons-material/Window';
import PageIcon from '@mui/icons-material/InsertDriveFile';

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import PrintIcon from '@mui/icons-material/Print';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import Leaflet from 'leaflet'
import { IconButton, InputAdornment } from '@mui/material';
import Search from '@mui/icons-material/Search';

import pitucheyHotamLogo from './assets/pituchey_hotam.svg'

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
    setShowHalachot,
    printFormat,
    setPrintFormat
}) {

    const [locationName, setLocationName] = useState("בהל\"צ");

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: "זמני היום ל" + locationName + " - " + new Date().getFullYear()
    });

    const handleSearch = async (searchQuery) => {
        const newPos = await fetchLocationResultsFor(searchQuery);
        if (newPos) {
            setPos(newPos);
            setLocationName(searchQuery);
            return true;
        }
        return false;
    };

    const updateLocationName = async (newPos) => {
        const name = await fetchNameForLocation(newPos);
        setLocationName(name);
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

    const [currentStage, setStage] = useState(1);

    return (
        <Box className="Configuration-form" sx={{ height: '100%' }}>
            <Typography sx={{ m: 1 }} variant='h3'>
                זמני היום
                <img src={pitucheyHotamLogo} style={{ height: '1.5em', verticalAlign: 'middle' }}></img>
            </Typography>
            <Typography variant="caption" gutterBottom sx={{ ml: 1, mr: 1, textAlign: 'justify' }}>
            צריכים לדעת את זמני התפילות ואין לכם גישה לטלפון? כל זמני היום לכל השנה בלוח שמתאים בכיס!<br/>הלוח כולל את זמני הנץ החמה והשקיעה - מהם ניתן לחשב את שאר זמני היום הרלונטיים. כדי לחסוך במקום, רק התאריכים שבהם השעה משתנית מופיעים בלוח. ההלכות המופיעות בלוח נכתבו על פי <a href="https://youtu.be/AyQCyrcQzXs" target="_blank">ההוראות של הרב יצחק שילת (ראש ישיבת מעלה אדומים)</a>. ההלכות כפי שנוסחו כאן אושרו על ידי הרב.
            </Typography>
            <ConfigStage stageNumber={1} title="בחר מיקום" currentStage={currentStage} handleChange={setStage}>
                <Typography variant="caption" gutterBottom sx={{ textAlign: 'justify' }}>
                    בחרו את המקום עבורו תרצו לחשב את זמני היום. ניתן לחפש מקום בשורת החיפוש (לחיפוש בסיס יש להשתמש בשם המחנה, למשל 'מחנה פלס') או לגרור את הסמן במפה למיקום המבוקש.
                </Typography>
                <SearchBox handleSearch={handleSearch} />
                <Box className="Configuration-map" sx={{ mt: 1, maxHeight: 384, flex: 1 }}>
                    <SelectionMap pos={pos} setPos={(pos) => { setPos(pos); updateLocationName(pos); }} />
                </Box>

                <Typography variant="caption">
                    נ.צ. ({(+pos.lat).toFixed(6)}, {(+pos.lng).toFixed(6)}) גובה: {elevation} מ'
                </Typography>
            </ConfigStage>

            <ConfigStage stageNumber={2} title="עיצוב" currentStage={currentStage} handleChange={setStage}>
                <Typography variant="caption" gutterBottom sx={{ textAlign: 'justify' }}>
                    אם הזמנים לא מתאימים לגודל הדף, הגדילו את מספר העמודות ו/או הקטינו את גודל הגופן.
                </Typography>
                <TextField label="מספר עמודות" variant="filled" fullWidth type="number" value={columnCount} onChange={(e) => setColumnCount(e.target.value)} />
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TextField sx={{ mr: 0.5, flex: 1 }} label="גופן זמנים" variant="filled" type="number" value={timesFontSize} onChange={(e) => setTimesFontSize(e.target.value)} />
                    <TextField sx={{ ml: 0.5, flex: 1 }} label="גופן הלכות" variant="filled" type="number" value={halachaFontSize} onChange={(e) => setHalachaFontSize(e.target.value)} />
                </Box>
                <FormControlLabel sx={{ ml: 1, mt: 1 }} control={
                    <Checkbox checked={showHalachot} onChange={(e) => setShowHalachot(e.target.checked)} />
                } label="הצג הלכות" />
                <TextField sx={{ mt: 1 }} label="כיתוב תחתון" variant="filled" fullWidth multiline value={footerText} onChange={(e) => setfooterText(e.target.value)} />
            </ConfigStage>

            <ConfigStage stageNumber={3} title="הדפסה" currentStage={currentStage} handleChange={setStage} last={true}>
                <Typography variant="caption" gutterBottom sx={{ textAlign: 'justify' }}>
                מוכנים להדפסה! להדפסה בגודל כיס, לחצו על 'הדפסת A6'. האתר ידפיס דף A4 דו-צדדי, הכולל 4 לוחות בגודל כיס. להדפסה תקינה, שימו לב שבחרתם בגודל A4 בחלונית ההדפסה (ולא ב'Letter' או גדלים אחרים).<br/>אם תרצו ניתן להדפיס גם לוח יחיד, בו בכל דף יופיע לוח אחד בלבד.
                </Typography>
                <ToggleButtonGroup sx={{ alignSelf: 'center' }} fullWidth size="large" value={printFormat} onChange={(_, f) => { if(f) setPrintFormat(f) }} exclusive>
                    <ToggleButton value="a6">
                        <FourPagesIcon />
                        הדפסת A6
                    </ToggleButton>
                    <ToggleButton value="single">
                        <PageIcon />
                        לוח יחיד
                    </ToggleButton>
                </ToggleButtonGroup>
                <Button sx={{ mt: 1 }} fullWidth variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} >הדפסה</Button>
            </ConfigStage>
        </Box>
    )
}

function ConfigStage({ children, stageNumber, title, currentStage, handleChange, last }) {
    return (
        <Accordion expanded={currentStage == stageNumber} disableGutters onChange={() => { handleChange(stageNumber) }} elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Typography>
                    <Avatar sx={{ display: 'inline-flex', mr: 1, bgcolor: 'primary.main' }}>{stageNumber}</Avatar>
                    {title}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                { children }
                { !last ? ( <Button sx={{ mt: 1 }} fullWidth variant="contained" endIcon={<NavigateNextIcon />} onClick={() => {handleChange(stageNumber+1)}}>המשך</Button> ) : <></> }
            </AccordionDetails>
        </Accordion>
    )
}

function SearchBox({ handleSearch }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [noResultsFound, setNoResultsFound] = useState(false);

    return (
        <form onSubmit={async (e) => { e.preventDefault(); const results = await handleSearch(searchQuery); setNoResultsFound(!results); }}>
            <TextField error={noResultsFound} helperText={noResultsFound ? "לא נמצאו תוצאות" : undefined} label="חפש מיקום" variant="filled" fullWidth value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setNoResultsFound(false); }} InputProps={{
                endAdornment: <InputAdornment position="end">
                    <IconButton type="submit" edger="end">
                        <Search />
                    </IconButton>
                </InputAdornment>
            }} />
        </form>
    );
}

function SelectionMap({ pos, setPos }) {
    const markerRef = useRef();
    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current
            if (marker) {
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