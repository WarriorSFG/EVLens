import { useRef, useEffect} from "react";
import Header from './Header';
import Navbar from './Navbar';
import './Map.css';
import leaflet from 'leaflet';

function Map() {
    const mapRef = useRef(null);
    const lat = 19.0748;
    const long = 72.8856;

    useEffect(() => {
    if (mapRef.current && mapRef.current._leaflet_id) return;

    const mapInstance = leaflet.map('map').setView([lat, long], 13);

    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapInstance);

    leaflet.marker([lat, long]).addTo(mapInstance)
        .bindPopup('Your location');

    mapRef.current = mapInstance;

    const token = localStorage.getItem('token');

    fetch('/api/GetStations', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (!Array.isArray(data)) return;

        const markers = [];

        data.forEach(station => {
            const marker = leaflet.marker([station.Latitude, station.Longitude])
                .addTo(mapInstance)
                .bindPopup(`<b>${station.Name}</b><br>Status: ${station.Status}<br>Power: ${station.PowerOutput}kW<br>Connector: ${station.ConnectorType}`);
            markers.push(marker);
        });

        if (markers.length > 0) {
            const randomIndex = Math.floor(Math.random() * markers.length);
            markers[randomIndex].openPopup();
            mapInstance.setView(markers[randomIndex].getLatLng(), 13); 
        }
    })
    .catch(err => console.error("Error fetching stations:", err));
}, []);

    return (
        <div className='main'>
            <Navbar />
            <div className='content'>
                <Header />
                <div className='stationview'>
                    <div className="leftmappanel">
                        <div className='map'>
                            <div id="map"></div>
                        </div>
                    </div>
                    <div className='edit'></div>
                </div>
            </div>
        </div>
    );
}

export default Map;
