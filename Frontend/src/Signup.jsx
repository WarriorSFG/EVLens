import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import BackendURL from './URL';

function Signup() {
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // for redirection

    const handleSignup = async (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value;
        const password = form.password.value;

        try {
            const res = await fetch(`${BackendURL}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password }),
            });

            const text = await res.text();
            setMessage(text);

            if (text.toLowerCase().includes('success')) {
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            }
        } catch (err) {
            console.error(err);
            setMessage('Something went wrong. Please try again.');
        }
    };

    return (
    <div className='main'>
        <div className='img'>
            <img src="/Background.png" alt="Background" className='background' />
        </div>
        <div className='form'>
            <h1 className='h1'>Signup</h1>
            <form onSubmit={handleSignup}>
                <input type="text" name="name" placeholder="Name" autoComplete="off" className='input-field' /><hr className='hr' />
                <input type="password" name="password" placeholder="Password" autoComplete="off" className='input-field' /><hr className='hr' />
                <button type="submit" className="submit">SIGNUP</button>
            </form>

            {message && <p className='p'>{message}</p>}
        </div>
    </div>);
}

export default Signup
