import {distanceInKmBetweenEarthCoordinates} from "../utils/Util.Cesium";
import {pipe, timer} from "rxjs"
import {map, switchMap, take} from 'rxjs/operators'
import {viewer_Input$} from "./stores";
import {onMount$, onDestroy$} from 'svelte-rx'

const createMarker = ( {lat, long, name, name2, htmlLayer}) =>{

    var ch = htmlLayer.add();
    ch.position = window.Cesium.Cartesian3.fromDegrees(long, lat);
    ch.offsetLeft = 0;
    ch.offsetTop = -5;
    // ch.element.style.width = '60px';
    // ch.element.style.height = '60px';
    // ch.element.style.background = 'red';

    ch.element.innerHTML =
        `<div class="location">
            <div style="background: url('./assets/update/Caption_Box.png')no-repeat center center fixed; 
                        -webkit-background-size: cover;
                        -moz-background-size: cover;
                        -o-background-size: cover;
                        background-size: cover;">
                <div>${name}</div>
                <div>${name2}</div>
            </div>
        </div>`
    return{
        position: window.Cesium.Cartesian3.fromDegrees(long, lat),
        billboard: {
            image: "./assets/update/Map_Pin.png",
            //a,b,c,d a:camera distance 1km unit, b:scale1, c:distance2, d:scale2
            scaleByDistance: new window.Cesium.NearFarScalar(100, 0.1,  8000 * 1000, 0.05),
            verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
            //1 unit = 10 pixels
            // pixelOffset: new window.Cesium.Cartesian2(0, -60),
            // pixelOffsetScaleByDistance: new window.Cesium.NearFarScalar(1000, 1.0, 2000, 0.0),
            translucencyByDistance: new window.Cesium.NearFarScalar(500, 0,  2000, 2),
        },
        // label: {
        //     text: name,
        //     font: "10px sans-serif",
        //     showBackground: true,
        //     horizontalOrigin: window.Cesium.HorizontalOrigin.LEFT,
        //     pixelOffset: new window.Cesium.Cartesian2(13, -20),
        //     translucencyByDistance: new window.Cesium.NearFarScalar(500, 0,  2000, 2),
        //     pixelOffsetScaleByDistance: new window.Cesium.NearFarScalar(500, 2, 8000, 1),
        //     scaleByDistance: new window.Cesium.NearFarScalar(100, 2,  8000 * 1000, 0.5),
        // },
    }
}

export const getLocationsInRange = (dist, lat, long, list) =>{
    // console.log(dist, lat, long, list)
    return list
        .map(l => ({...l,dist: distanceInKmBetweenEarthCoordinates(lat,long,l.lat,l.long)}))
        .sort((a,b) => a.dist - b.dist)
        .filter((l) => l.dist < dist)
}


const delaySeconds = (s) => pipe(switchMap(_=> timer(s * 1000)))

const createMarkerFromLoc = v => (list) => {

    var htmlLayer = new HtmlBillboardCollection(v.scene);
    console.log(htmlLayer)

    return list.map(l => {
        let marker = createMarker({...l, htmlLayer:htmlLayer})
        let markerEntity = v.entities.add(marker)
        return {...l, marker: markerEntity}
    })
}

export const addMarkerPerLoc = (list) =>
    pipe(
        delaySeconds(3),
        switchMap(_=>viewer_Input$),
        take(1),
        map(d => createMarkerFromLoc(d._viewer)(list))
    )

const locations = [
    {
        "index": 0,
        "name": "Eiffel Tower",
        "name2": "place holder",
        "lat": 48.8584,
        "long": 2.2945,
        "url": "0-0.jpg",
        "hide": 0
    },
    {
        "index": 1,
        "name": "Statue of Liberty",
        "name2": "place holder",
        "lat": 40.6892,
        "long": -74.0445,
        "url": "1-0.jpg",
        "hide": 0
    },
    {
        "index": 2,
        "name": "Mauna Kea",
        "name2": "place holder",
        "lat": 19.8206,
        "long": -155.4681,
        "url": "2-0.jpg",
        "hide": 0
    },
    {
        "index": 3,
        "name": "Pyramids of Giza",
        "name2": "place holder",
        "lat": 29.9792,
        "long": 31.1342,
        "url": "3-0.jpg",
        "hide": 0
    },
    {
        "index": 4,
        "name": "Taj Mahal",
        "name2": "place holder",
        "lat": 27.1751,
        "long": 78.0421,
        "url": "4-0.jpg",
        "hide": 0
    },
    {
        "index": 5,
        "name": "Buckingham Palace",
        "name2": "place holder",
        "lat": 51.5014,
        "long": -0.1419,
        "url": "5-0.jpg",
        "hide": 0
    },
    {
        "index": 6,
        "name": "Niagra Falls",
        "name2": "place holder",
        "lat": 43.0962,
        "long": -79.0377,
        "url": "6-0.jpg",
        "hide": 0
    },
    {
        "index": 7,
        "name": "Central Park",
        "name2": "place holder",
        "lat": 40.7829,
        "long": -73.9654,
        "url": "7-0.jpg",
        "hide": 0
    },
    {
        "index": 8,
        "name": "Mt Everest",
        "name2": "place holder",
        "lat": 27.9881,
        "long": 86.925,
        "url": "8-0.jpg",
        "hide": 0
    },
    {
        "index": 9,
        "name": "Capital Building, Denver",
        "name2": "place holder",
        "lat": 39.7393,
        "long": -104.9848,
        "url": "9-0.jpg",
        "hide": 0
    },
    {
        "index": 10,
        "name": "Denver Museum of Nature and Science",
        "name2": "place holder",
        "lat": 39.7475,
        "long": -104.9428,
        "url": "10-0.jpg",
        "hide": 0
    },
    {
        "index": 11,
        "name": "Empower Field at Mile High",
        "name2": "place holder",
        "lat": 39.7439,
        "long": -105.0201,
        "url": "11-0.jpg",
        "hide": 0
    },
    {
        "index": 12,
        "name": "Mt Evans",
        "name2": "place holder",
        "lat": 39.5883,
        "long": -105.6438,
        "url": "12-0.jpg",
        "hide": 0
    },
    {
        "index": 13,
        "name": "Colosseum, Rome",
        "name2": "place holder",
        "lat": 41.8902,
        "long": 12.4922,
        "url": "13-0.jpg",
        "hide": 0
    },
    {
        "index": 14,
        "name": "Mt Kilimanjaro",
        "name2": "place holder",
        "lat": -3.0674,
        "long": 37.3556,
        "url": "14-0.jpg",
        "hide": 0
    },
    {
        "index": 15,
        "name": "Zocalo, Mexico City",
        "name2": "place holder",
        "lat": 19.432,
        "long": -99.1334,
        "url": "15-0.jpg",
        "hide": 0
    },
    {
        "index": 16,
        "name": "Mount Vesuvius",
        "name2": "place holder",
        "lat": 40.8224,
        "long": 14.4289,
        "url": "16-0.jpg",
        "hide": 0
    },
    {
        "index": 17,
        "name": "Syndney Opera House",
        "name2": "place holder",
        "lat": -33.8568,
        "long": 151.2153,
        "url": "17-0.jpg",
        "hide": 0
    },
    {
        "index": 18,
        "name": "Disney World Magic Kingdom",
        "name2": "place holder",
        "lat": 28.4177,
        "long": -81.5812,
        "url": "18-0.jpg",
        "hide": 0
    },
    {
        "index": 19,
        "name": "Launchpad 39A, Cape Canaveral",
        "name2": "place holder",
        "lat": 28.608389,
        "long": -80.604333,
        "url": "19-0.jpg",
        "hide": 0
    },
    {
        "index": 20,
        "name": "Area 51",
        "name2": "place holder",
        "lat": 36.6438,
        "long": -116.396,
        "url": "20-0.jpg",
        "hide": 0
    },
    {
        "index": 21,
        "name": "Barringer Meteor Crater",
        "name2": "place holder",
        "lat": 35.0278,
        "long": -111.0222,
        "url": "21-0.jpg",
        "hide": 0
    },
    {
        "index": 22,
        "name": "Mt Chimborazo",
        "name2": "place holder",
        "lat": -1.4693,
        "long": -78.8169,
        "url": "22-0.jpg",
        "hide": 0
    },
    {
        "index": 23,
        "name": "Machu Picchu",
        "name2": "place holder",
        "lat": -13.1631,
        "long": -72.545,
        "url": "23-0.jpg",
        "hide": 0
    },
    {
        "index": 24,
        "name": "Uluru / Ayers Rock",
        "name2": "place holder",
        "lat": -25.3444,
        "long": 131.0369,
        "url": "24-0.jpg",
        "hide": 0
    },
    {
        "index": 25,
        "name": "The Grand Canyon",
        "name2": "place holder",
        "lat": 36.107,
        "long": -112.113,
        "url": "25-0.jpg",
        "hide": 0
    },
    {
        "index": 26,
        "name": "Rano Raraku, Easter Island",
        "name2": "place holder",
        "lat": -27.1239,
        "long": -109.2861,
        "url": "26-0.jpg",
        "hide": 0
    },
    {
        "index": 27,
        "name": "Golden Gate Bridge",
        "name2": "place holder",
        "lat": 37.8199,
        "long": -122.4783,
        "url": "27-0.jpg",
        "hide": 0
    },
    {
        "index": 28,
        "name": "Mt Fuji",
        "name2": "place holder",
        "lat": 35.3606,
        "long": 138.7274,
        "url": "28-0.jpg",
        "hide": 0
    },
    {
        "index": 29,
        "name": "Panama Canal",
        "name2": "place holder",
        "lat": 9.1223,
        "long": -79.7312,
        "url": "29-0.jpg",
        "hide": 0
    },
    {
        "index": 30,
        "name": "Forbidden City",
        "name2": "place holder",
        "lat": 39.915556,
        "long": 116.390556,
        "url": "30-0.png",
        "hide": 0
    },
    {
        "index": 31,
        "name": "The Nest Olympic Stadium",
        "name2": "place holder",
        "lat": 39.9929,
        "long": 116.3965,
        "url": "19-0.jpg",
        "hide": 1
    },
    {
        "index": 32,
        "name": "St. Basil’s Cathedral",
        "name2": "place holder",
        "lat": 55.7525,
        "long": 37.623056,
        "url": "20-0.jpg",
        "hide": 0
    },
    {
        "index": 33,
        "name": "Angkor Wat, Cambodia",
        "name2": "place holder",
        "lat": 13.412315,
        "long": 103.867007,
        "url": "21-0.jpg",
        "hide": 0
    },
    {
        "index": 34,
        "name": "The World Islands",
        "name2": "place holder",
        "lat": 25.22581,
        "long": 55.178828,
        "url": "22-0.jpg",
        "hide": 0
    },
    {
        "index": 35,
        "name": "Hagia Sophia",
        "name2": "place holder",
        "lat": 41.008569,
        "long": 28.980143,
        "url": "23-0.jpg",
        "hide": 0
    },
    {
        "index": 36,
        "name": "Prague castle",
        "name2": "place holder",
        "lat": 50.0911,
        "long": 14.4016,
        "url": "24-0.jpg",
        "hide": 1
    },
    {
        "index": 37,
        "name": "Lake Louise Ski Resort",
        "name2": "place holder",
        "lat": 51.4419,
        "long": -116.1622,
        "url": "25-0.jpg",
        "hide": 0
    },
    {
        "index": 38,
        "name": "Astronomical Observatory Cerro Tololo",
        "name2": "place holder",
        "lat": -30.169722,
        "long": -70.806389,
        "url": "26-0.jpg",
        "hide": 0
    },
    {
        "index": 39,
        "name": "Kronborg Castle",
        "name2": "place holder",
        "lat": 56.039038,
        "long": 12.621729,
        "url": "27-0.jpg",
        "hide": 0
    },
    {
        "index": 40,
        "name": "Vostok Station",
        "name2": "place holder",
        "lat": -78.4645,
        "long": 106.8339,
        "url": "28-0.jpg",
        "hide": 0
    },
    {
        "index": 41,
        "name": "McMurdo Station",
        "name2": "place holder",
        "lat": -77.8419,
        "long": 166.6863,
        "url": "29-0.jpg",
        "hide": 1
    }
]
export default locations