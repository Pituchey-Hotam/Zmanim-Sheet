import './ZmanimSheet.css';
import React, { useMemo } from 'react';

import Paper from '@mui/material/Paper'
import * as KosherZmanim from "kosher-zmanim";
import { DateTime } from "luxon";

function ZmanimSheet({sunrisePageRef, lat, lon, elevation, footerText, timesFontSize, halachaFontSize, columnCount}) {
    
    const { sunrises, sunsets } = useMemo(() => calculateYearZmanim(lat, lon, elevation), [lat, lon, elevation]);

    return (
        <div className="ZmanimSheet">
            <SheetPage ref={sunrisePageRef} columnCount={columnCount} footerText={footerText} timesFontSize={timesFontSize} title="הנץ" entries={sunrises} halachot={
                <>
                    <Halacha fontSize={halachaFontSize} columnCount={columnCount} title="עלות השחר" content="72/90 דק' לפני הנץ (לחומרא)" />
                    <Halacha fontSize={halachaFontSize} columnCount={columnCount} title="תפילה וק&quot;ש" content="משיכיר 45 דק' לפני הנץ" note="אם מתפללים מעלות השחר, לא מברכים על ציצית ותפילין. לאשכנזים - גם לא מברכים ברכת יוצר אור (מברכים רק משיכיר)." />
                </>
            }/>
            <SheetPage columnCount={columnCount} footerText={footerText} timesFontSize={timesFontSize} title="שקיעה" entries={sunsets} halachot={
                <>
                    <Halacha fontSize={halachaFontSize} columnCount={columnCount} title="מנחה" content="באופן קבוע ב - 12:25 / 13:25 (שעון חורף / קיץ) סוף זמן: שקיעה" />
                    <Halacha fontSize={halachaFontSize} columnCount={columnCount} title="ק&quot;ש של ערבית" content="24 דק' אחרי שקיעה" />
                    <Halacha fontSize={halachaFontSize} columnCount={columnCount} title="תוספת שבת" content="יש לנהוג על פי הרשום בלוחות. בשעת הדחק מספיק קדות ספורות." />
                </>
            }/>
        </div>
    )
}

const SheetPage = React.forwardRef((props, ref) => {
    const {title, entries, halachot, footerText, timesFontSize, columnCount} = props;
    const rows = []
    
    rows.push(
        <div className="ZmanimSheet-row ZmanimSheet-title" style={{ width: (100/columnCount)+'%' }}><p>{title}</p></div>
    )
    
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        const time = <div className="ZmanimSheet-row">
            <p>{entry.date.day}</p>
            <p>{entry.time.setZone('Asia/Jerusalem').toFormat('H:mm')}</p>
        </div>
    
        var row = undefined;
        
        if(i === 0 || entry.time.month !== entries[i-1].time.month){
            row = 
                <div>
                    <div className="ZmanimSheet-row ZmanimSheet-header">
                        <p>{ entry.time.setLocale('he-IL').toFormat('MM - MMMM') }</p>
                    </div>
                    {time}
                </div>
        }
        else {
            row = time
        }
        
        rows.push(React.cloneElement(row, {style: { width: (100/columnCount)+'%' }}));    
    }
    
    rows.push(halachot)
    
    return (
        <Paper elevation={2} className="ZmanimSheet-page-box">
            <div className="ZmanimSheet-page" ref={ref} style={{ 'font-size': +timesFontSize }}>
                <div className="ZmanimSheet-times">
                    {rows}
                </div>
                <div className="ZmanimSheet-footer" style={{ 'font-size': timesFontSize-2 }}>{ footerText }</div>
            </div>
        </Paper>
    )
});

function Halacha({title, content, note, fontSize, columnCount}) {
    return (
        <div className="ZmanimSheet-row ZmanimSheet-halacha" style={{ width: (100/columnCount)+'%' }} >
            <p className="ZmanimSheet-halacha-title">{title}</p>
            <p style={{ 'font-size': +fontSize }}>{content}</p>
            { note !== undefined ? <p className="ZmanimSheet-halacha-note" style={{ 'font-size': fontSize-2 }}>{note}</p> : "" }
        </div>
    )
}

function calculateYearZmanim(lat, lon, elevation) {
    const zmanimCalendar = new KosherZmanim.ZmanimCalendar()
    try {
        zmanimCalendar.setGeoLocation(new KosherZmanim.GeoLocation("", lat, lon, elevation))
    }
    catch (e) {
        return { sunrises: [], sunsets: [] }
    }

    var currentDate = DateTime.now().startOf('year')
    const year = currentDate.year;

    const sunrises = []
    const sunsets = []

    while(currentDate.year === year) {
        zmanimCalendar.setDate(currentDate);
        const sunrise = roundToMinute(zmanimCalendar.getSunrise())
        const sunset = roundToMinute(zmanimCalendar.getSunset())

        sunrises.push({
            date: currentDate,
            time: sunrise,
        })
        sunsets.push({
            date: currentDate,
            time: sunset
        })

        currentDate = currentDate.plus({ days: 1 });
    }

    return {
        sunrises: dropConsecutiveDuplicates(sunrises),
        sunsets: dropConsecutiveDuplicates(sunsets)
    };
}

function dropConsecutiveDuplicates(entries) {
    const deduplicatedEntries = [entries[0]]
    var lastUniqueTime = entries[0].time;
    for (const entry of entries) {
        if (entry.time.minute !== lastUniqueTime.minute || entry.time.hour !== lastUniqueTime.hour) {
            deduplicatedEntries.push(entry)
            lastUniqueTime = entry.time;
        }
    }
    return deduplicatedEntries;
}

function roundToMinute(time) {
    return time.startOf('minute')
        .plus({ 'minutes': (time.second < 30 ? 0 : 1) })
}

export default ZmanimSheet;