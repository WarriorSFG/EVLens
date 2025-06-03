import './Navbar.css'
import { LayoutDashboard, MapPin, Eye, MapIcon} from 'lucide-react'

function Navbar() {
    const currentPath = window.location.pathname

    return (
        <div className="Navbar">
           <div className="logo">
                <Eye size={"2em"} color='#33DA9B'/>EV<p class='lens'>Lens</p>
            </div> 
            <hr/>
            <ul className="ul">
                <li className={currentPath === '/dashboard' ? 'li selected' : 'li'}>
                    <a href="/dashboard" className={currentPath === '/dashboard' ? 'a selected' : 'a'}>
                        <LayoutDashboard style={{ marginRight: '8px' }} />
                        Dashboard
                    </a>
                </li>
                <li className={currentPath === '/stations' ? 'li selected' : 'li'}>
                    <a href="/stations" className={currentPath === '/stations' ? 'a selected' : 'a'}>
                        <MapPin style={{ marginRight: '8px' }} />
                        Stations
                    </a>
                </li>
                <li className={currentPath === '/map' ? 'li selected' : 'li'}>
                    <a href="/map" className={currentPath === '/map' ? 'a selected' : 'a'}>
                        <MapIcon style={{ marginRight: '8px' }} />
                        Map
                    </a>
                </li>
            </ul>
        </div>
    );
}

export default Navbar