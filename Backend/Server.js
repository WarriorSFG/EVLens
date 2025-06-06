const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const bcryptjs = require('bcryptjs')
require('dotenv').config()
const cors = require('cors')

const port = process.env.PORT
const URL = process.env.MONGOURL
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.use(cors({
  origin: 'https://evlens.vercel.app',
  credentials: true,
}));

const templatePath = path.join(__dirname, "/templates")
const publicPath = path.join(__dirname, "/public")

app.set('view engine', 'hbs')
app.set('views', templatePath)
app.use(express.static(publicPath))

// Routes for rendering pages
app.get('/api/login', (req, res) => {
    res.render('login')
})

app.get('/api/signup', (req, res) => {
    res.render('signup')
})

// Connect to MongoDB
mongoose.connect(URL)
const db = mongoose.connection
db.once('open', () => {
    console.log("MongoDB connect successful");
})
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
})

// User Schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

const User = mongoose.model("User", UserSchema)

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'Token required' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'Token required' });

    jwt.verify(token, process.env.KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
}

// Signup route
app.post('/api/signup', async (req, res) => {
    try {
        const existingUser = await User.findOne({ name: req.body.name })
if (existingUser) {
    return res.status(400).json({ error: 'Username not available' });
}

        const hashedPassword = await hashPassword(req.body.password)
        const token = jwt.sign({ name: req.body.name }, process.env.KEY)

        const data = {
            name: req.body.name,
            password: hashedPassword,
        }
        await User.create(data);
        res.status(201).json({ message: 'Successfully created account.' });
    }
    catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({message: `${err} :Server side error.`});
    }
})

// Login route
app.post('/api/login', async (req, res) => {
    try {
        const existingUser = await User.findOne({ name: req.body.name });

        if (!existingUser || !(await compare(req.body.password, existingUser.password))) {
           return res.status(401).json({ error: 'Incorrect Username or Password' });
        }

        const token = jwt.sign({ name: existingUser.name }, process.env.KEY);
        return res.json({ status: 'Success', token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send('Server side error.');
    }
});

async function hashPassword(password) {
    return await bcryptjs.hash(password, 10)
}

async function compare(userPass, hashPass) {
    return await bcryptjs.compare(userPass, hashPass)
}

const ActivitySchema = new mongoose.Schema({
    user: String,
    action: String, //"Added", "Updated", "Deleted"
    stationName: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Activity = mongoose.model("Activity", ActivitySchema);




// Station Schema
const StationSchema = new mongoose.Schema({
    Name: String,
    Latitude: Number,
    Longitude: Number,
    Status: String,
    PowerOutput: Number,
    ConnectorType: String,
    AddedBy: String
});

const Station = mongoose.model("Station", StationSchema);

// Add Station route
app.post('/api/AddStation', verifyToken, async (req, res) => {
    const { Name, Latitude, Longitude, Status, PowerOutput, ConnectorType } = req.body;
    if (!Name || !Latitude || !Longitude || !Status || !PowerOutput || !ConnectorType) {
        return res.status(400).json({ error: "Incomplete form submitted, all fields are required." });
    }

    try {
        const existingName = await Station.findOne({ Name });
        if (existingName) {
            return res.status(409).json({ error: 'Name already exists' });
        }

        const newStation = new Station({
            Name,
            Latitude,
            Longitude,
            Status,
            PowerOutput,
            ConnectorType,
            AddedBy: req.user.name,
        });

        await newStation.save();
        await Activity.create({
            user: req.user.name,
            action: 'Added',
            stationName: Name
        });

        res.json({ Data: "Successfully Added" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Station
app.post('/api/DeleteStation', verifyToken, async (req, res) => {
    const { Name } = req.body;

    if (!Name) {
        return res.status(400).json({ error: "Missing Name for deletion" });
    }

    try {
        const existingName = await Station.findOne({ Name, AddedBy: req.user.name });

        if (existingName) {
            await existingName.deleteOne();
        await Activity.create({
            user: req.user.name,
            action: 'Deleted',
            stationName: Name
        });
            return res.json({ Data: 'Successfully Deleted the Station' });
        } else {
            return res.status(404).json({ error: `No record found with the name ${Name} for this user` });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get stations
app.get('/api/GetStations', verifyToken, async (req, res) => {
    try {
        const stations = await Station.find({ AddedBy: req.user.name });
        res.json(stations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Update station
app.post('/api/UpdateStation', verifyToken, async (req, res) => {
    const { Name, Latitude, Longitude, Status, PowerOutput, ConnectorType } = req.body;

    if (!Name || !Latitude || !Longitude || !Status || !PowerOutput || !ConnectorType) {
        return res.status(400).json({ error: "Incomplete form submitted, all fields are required." });
    }

    try {
        const existingStation = await Station.findOne({ Name, AddedBy: req.user.name });

        if (existingStation) {
            existingStation.Latitude = Latitude;
            existingStation.Longitude = Longitude;
            existingStation.Status = Status;
            existingStation.PowerOutput = PowerOutput;
            existingStation.ConnectorType = ConnectorType;

            await existingStation.save();
            
        await Activity.create({
            user: req.user.name,
            action: 'Updated',
            stationName: Name
        });
            return res.json({ Data: "Successfully Updated" });
        } else {
            return res.status(404).json({ error: "Station not found." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/GetActivity', verifyToken, async (req, res) => {
  try {
    const activity = await Activity.find({ user: req.user.name }).sort({ timestamp: -1 }).limit(10);
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => {
    console.log(`server started, listening to port ${port}`)
})
