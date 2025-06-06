import './Header.css';
import { jwtDecode } from 'jwt-decode';
import { LogOut } from 'lucide-react';

function Header() {
    const currentPath = window.location.pathname;
    let username = null;

    try {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            username = decoded.name;
        }
    } catch (error) {
        console.error(`${error} : Invalid token`);
    }

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/'; 
    };

    return (
        <div className='Header'>
            <div className='directory'>
                Pages{currentPath}<p className='current'>{currentPath}</p>
            </div>
            <div className='profile'>
                {username ? `Logged in as ${username}` : 'NOT LOGGED IN'}
                <button onClick={handleLogout} className='button'>
                    <LogOut style={{ marginRight: '6px' }} />Logout
                </button>

            </div>
        </div>
    );
}

export default Header;
