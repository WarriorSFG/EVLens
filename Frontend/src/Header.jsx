import './Header.css';
import { jwtDecode } from 'jwt-decode';

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

    return (
        <div className='Header'>
            <div className='directory'>
                Pages{currentPath}<p className='current'>{currentPath}</p>
            </div>
            <div className='profile'>
                {username ? `Logged in as ${username}` : 'NOT LOGGED IN'}
            </div>
        </div>
    );
}

export default Header;
