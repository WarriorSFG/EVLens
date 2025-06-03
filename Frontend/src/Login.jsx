import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
function Login() {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value;
        const password = form.password.value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password }),
            });

            const data = await res.json(); // Parse as JSON instead of text

            if (data.status === 'Success' && data.token) {
                localStorage.setItem('token', data.token); // Store token
                setMessage('Login successful! Redirecting...');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } else {
                setMessage(data.error || 'Login failed.');
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
            <h1 className='h1'>Login</h1>
            <form onSubmit={handleLogin}>
                <input type="text" name="name" placeholder="Name" autoComplete="off" className='input-field' /><hr className='hr' />
                <input type="password" name="password" placeholder="Password" autoComplete="off" className='input-field' /><hr className='hr' />
                <button type="submit" className="submit">LOGIN</button>
            </form>

            {message && <p>{message}</p>}

            <h3 className='p'>Don't have an account?</h3>
            <a href="/signup" className='a'>Create account!</a>
        </div>
    </div>
);
}

export default Login    
