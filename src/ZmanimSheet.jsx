import './ZmanimSheet.css';
import React, { useMemo, useEffect, useRef } from 'react';

import Paper from '@mui/material/Paper'
import * as KosherZmanim from "kosher-zmanim";
import { DateTime } from "luxon";

const applyScaling = (scaledWrapper, scaledContent) => {
    scaledContent.style.transform = 'scale(1)';
    let { width: childWidth } = scaledContent.getBoundingClientRect();

    let wrapperStyles = getComputedStyle(scaledWrapper);
    let wrapperWidth = scaledWrapper.clientWidth - (parseFloat(wrapperStyles.paddingLeft) + parseFloat(wrapperStyles.paddingRight));
    let scale = Math.min(wrapperWidth / childWidth, 1.6);
    scaledContent.style.transform = `scale(${scale})`;
};

function ZmanimSheet({printRef, wrapperRef, lat, lng, elevation, footerText, timesFontSize, halachaFontSize, columnCount, showHalachot, printFormat}) {
    const { sunrises, sunsets } = useMemo(() => calculateYearZmanim(lat, lng, elevation), [lat, lng, elevation]);
    
    const scaledContentRef = useRef();
    useEffect(() => {
        const listener = () => { applyScaling(wrapperRef.current, scaledContentRef.current) };
        if(wrapperRef.current && scaledContentRef.current) { 
            window.addEventListener("resize", listener);
            listener();
        }
        return () => { window.removeEventListener("resize", listener) }
    }, [wrapperRef, scaledContentRef])

    const sunriseHalachot = useMemo(() => { return (
        <>
            <Halacha fontSize={halachaFontSize} columnCount={columnCount} title="עלות השחר">72/90 דק' לפני הנץ (לחומרא)</Halacha>
            <Halacha fontSize={halachaFontSize} columnCount={columnCount} title="תפילה וק&quot;ש" note="אם מתפללים מעלות השחר, לא מברכים על ציצית ותפילין. לאשכנזים - גם לא מברכים ברכת יוצר אור (מברכים רק משיכיר).">משיכיר 45 דק' לפני הנץ</Halacha>
        </>
    )}, [halachaFontSize, columnCount])

    const sunsetHalachot = useMemo(() => { return (
        <>
            <Halacha fontSize={halachaFontSize} columnCount={columnCount} title="מנחה">באופן קבוע ב - 12:25 / 13:25<br/>(שעון חורף / קיץ)<br/>סוף זמן: שקיעה</Halacha>
            <Halacha fontSize={halachaFontSize} columnCount={columnCount} title="ק&quot;ש של ערבית">24 דק' אחרי שקיעה</Halacha>
            <Halacha fontSize={halachaFontSize} columnCount={columnCount} title="תוספת שבת">יש לנהוג על פי הרשום בלוחות. בשעת הדחק מספיקות דקות ספורות.</Halacha>
        </>
    )}, [halachaFontSize, columnCount])

    const sunriseSheet = ( <SheetPage columnCount={columnCount} footerText={footerText} timesFontSize={timesFontSize} title="הנץ" entries={sunrises} halachot={showHalachot ? sunriseHalachot : []} /> );
    const sunsetSheet = ( <SheetPage columnCount={columnCount} footerText={footerText} timesFontSize={timesFontSize} title="שקיעה" entries={sunsets} halachot={showHalachot ? sunsetHalachot : []} /> );

    return (
        <>
            <div className="ZmanimSheet-preview" ref={scaledContentRef}>
                <Paper elevation={2} className="ZmanimSheet-page-box">
                    {sunriseSheet}
                </Paper>
                <Paper elevation={2} className="ZmanimSheet-page-box">
                    {sunsetSheet}
                </Paper>
            </div>

            <div className="ZmanimSheet-hide">
                <div className={`ZmanimSheet-print ${printFormat=='a6'? 'ZmanimSheet-print-a6' : ''}`} ref={printRef}>
                    { printFormat == 'a6' ? 
                        <>
                            <div className="ZmanimSheet-print-page">
                                {...[1,2,3,4].map(()=>{return sunriseSheet})}
                            </div>
                            <div className="ZmanimSheet-print-page">
                                {...[1,2,3,4].map(()=>{return sunsetSheet})}
                            </div>
                        </> :
                        [sunriseSheet, sunsetSheet]
                    }
                </div>
            </div>
        </>
    )
}

const SheetPage = React.forwardRef((props, ref) => {
    const {title, entries, halachot, footerText, timesFontSize, columnCount} = props;

    const overflowRef = useRef();
    useEffect(() => {
        if(overflowRef.current && overflowRef.current.scrollWidth > overflowRef.current.clientWidth) {
            overflowRef.current.style['border-left'] = "4px solid red";
        }
        else {
            overflowRef.current.style['border-left'] = "";
        }
    })

    const rows = useMemo(() => {
        const rows = [];
        
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
        return rows;

    }, [title, entries, halachot, columnCount]);
    
    return (
        <div className="ZmanimSheet-page" ref={(r)=>{overflowRef.current = r; if(ref) ref(r)}} style={{ 'fontSize': +timesFontSize }}>
            <div className="ZmanimSheet-times">
                {rows}
            </div>
            <div className="ZmanimSheet-footer" style={{ 'fontSize': timesFontSize-2 }}>{ footerText }</div>
        </div>
    )
});

function Halacha({title, note, fontSize, columnCount, children}) {
    return (
        <div className="ZmanimSheet-row ZmanimSheet-halacha" style={{ width: (100/columnCount)+'%' }} >
            <p className="ZmanimSheet-halacha-title">{title}</p>
            <p style={{ 'fontSize': +fontSize }}>{children}</p>
            { note !== undefined ? <p className="ZmanimSheet-halacha-note" style={{ 'fontSize': fontSize-2 }}>{note}</p> : "" }
        </div>
    )
}

function calculateYearZmanim(lat, lng, elevation) {
    const zmanimCalendar = new KosherZmanim.ZmanimCalendar()
    try {
        zmanimCalendar.setGeoLocation(new KosherZmanim.GeoLocation("", lat, lng, elevation))
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