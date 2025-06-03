import Navbar from './Navbar'
import Header from './Header';
function Dashboard() {
    return (
        <div className='main'>
            <Navbar/>
            <div className='header'>
            <Header/>
            </div>
        </div>
    );
}

export default Dashboard