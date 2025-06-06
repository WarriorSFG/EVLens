import { useRef, useState, useEffect } from "react"
import Header from './Header';
import Navbar from './Navbar';
import './Map.css';
import leaflet from 'leaflet';
import BackendURL from "./URL";

function Map() {
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const lat = 19.0748;
    const long = 72.8856;

    useEffect(() => {

        if (mapRef.current && mapRef.current._leaflet_id) return;
        const chargingIcon = leaflet.divIcon({
            html: `<div class="charging-marker"><span>⚡</span></div>`,
            className: '',
            iconSize: [30, 30],
        });

        const mapInstance = leaflet.map('map').setView([lat, long], 13);

        leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; EVLens'
        }).addTo(mapInstance);

        leaflet.marker([lat, long], { icon: chargingIcon }).addTo(mapInstance)
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
                    const marker = leaflet.marker([station.Latitude, station.Longitude], { icon: chargingIcon })
                        .addTo(mapInstance)
                        .bindPopup(`<b>${station.Name}</b><br>Status: ${station.Status}<br>Power: ${station.PowerOutput}kW<br>Connector: ${station.ConnectorType}`);
                    marker.stationId = station._id || station.Name; 
                    markers.push(marker);
                });

                markersRef.current = markers;

                if (markers.length > 0) {
                    const randomIndex = Math.floor(Math.random() * markers.length);
                    markers[randomIndex].openPopup();
                    mapInstance.setView(markers[randomIndex].getLatLng(), 13);
                }
            })
            .catch(err => console.error("Error fetching stations:", err));

    }, []);

    const [stations, setStations] = useState([]);

    const handleRowClick = (station) => {
        const marker = markersRef.current.find(m => m.stationId === (station._id || station.Name));
        if (marker && mapRef.current) {
            marker.openPopup();
            mapRef.current.setView(marker.getLatLng(), 13);
        }
    };



    const FetchStations = async () => {
        try {
            const res = await fetch(`${BackendURL}/api/GetStations`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!res.ok) {
                throw new Error("Unauthorized or failed to fetch");
            }

            const data = await res.json();
            setStations(data);
        } catch (err) {
            console.error("Failed to fetch stations:", err);
        }
    };


    useEffect(() => {
        FetchStations();
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
                    <div className='edit'>
                        <div className="table-wrapper-map">
                            <table className="station-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stations.map((station, index) => (
                                        <tr key={index} className="clickable-row" onClick={() => handleRowClick(station)} style={{ cursor: "pointer" }}>
                                            <td>{station.Name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Map;
