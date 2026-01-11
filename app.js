// Load environment variables from the .env file
require('dotenv').config();

const express= require("express");
const app=express();
const path=require("path");
const fs = require('fs');
const nodemailer = require('nodemailer');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Connect to MongoDB once
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathonTest2';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✓ MongoDB connected successfully'))
    .catch((err) => {
        console.error('✗ MongoDB connection error:', err.message);
        process.exit(1);
    });

//--------------------------------------------------------------------------------------------------------------------------------------


//config folder
const upload = require('./config/multerconfig');
const { getAddressFromCoordinates2, findNearestRecyclingCenter } = require('./config/recyclingConfig');
const { getAddressFromCoordinates1, findNearestGarbageCenter } = require('./config/garbageConfig');

//---------------------------------------------------------------------------------------------------------------------------------------

//for Login/signIn
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//---------------------------------------------------------------------------------------------------------------------------------------

//database models
const userModel = require('./models/user');
const adminModel = require("./models/admin");
const recycleItem = require('./models/recycleItem');
const garbage = require('./models/garbage');

const { ADMIN_PASSKEY, EMAIL_USER: emailUser, EMAIL_PASS: emailPass } = process.env;

//-----------------------------------------------------------------------------------------------------------------------------------------

// Middleware setup
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());

//-----------------------------------------------------------------------------------------------------------------------------------------

//home page
app.get("/", function(req, res) {
    res.render("homepage");
});

// Garbage upload page - requires login
app.get('/garbageImage', isLoggedInAsUser, (req, res) => {
    res.render('uploadG');
});

// Recycle upload page - requires login
app.get('/recycleImage', isLoggedInAsUser, (req, res) => {
    res.render('uploadR');
});


//create user interface
app.get("/userCreate", (req, res) => {
    res.render("userCreate");
});

//creating and adding userData in database
app.post('/userCreate', async (req, res) => {
    let { username, email, password } = req.body;

    try {
        let user = await userModel.findOne({ email });
        if (user) return res.status(500).send("User already registered");

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        let createdUser = await userModel.create({
            username,
            password: hash,
            email,
        });

        let token = jwt.sign({ email }, "secret");
        res.cookie("token", token);
        res.redirect('/userProfile');
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).send('Error creating user');
    }
});

//User login interface
app.get("/userLogin", (req, res) => {
    res.render("userLogin");
});

//checking if the user has an account and authenticating it
app.post("/userLogin", async (req, res) => {
    try {
        let loginUser = await userModel.findOne({ email: req.body.email });
        if (!loginUser) return res.status(400).send("Invalid email or password");

        const result = await bcrypt.compare(req.body.password, loginUser.password);
        if (result) {
            let token = jwt.sign({ email: loginUser.email }, "secret");
            res.cookie("token", token);
            res.redirect('/userProfile');
        } else {
            return res.status(400).send("Invalid email or password");
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send("Internal Server Error");
    }
});


//user Profile page
app.get('/userProfile', isLoggedInAsUser, async function(req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate('garbageRequests').populate('recycleRequests');
        res.render("userProfile", { user });
    } catch (error) {
        console.error('User profile error:', error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/adminCreate', (req, res) => {
    res.render('adminCreate');
});

app.post('/adminCreate', async (req, res) => {
    const { username, email, password, passkey } = req.body;

    if (passkey !== ADMIN_PASSKEY) {
        return res.status(401).send('Unauthorized - Invalid passkey');
    }

    try {
        let admin = await adminModel.findOne({ email });
        if (admin) {
            return res.status(500).send('Admin already registered');
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        let newAdmin = await adminModel.create({
            username,
            email,
            password: hash
        });

        let token = jwt.sign({ email }, "secret");
        res.cookie("adminToken", token);
        res.render("adminProfile", { admin: newAdmin });
    } catch (error) {
        console.error('Admin creation error:', error);
        res.status(500).send('Error creating admin');
    }
});

app.get("/adminLogin", (req, res) => {
    res.render('adminLogin');
});

app.post('/adminLogin', async (req, res) => {
    const { email, password, passkey } = req.body;

    if (passkey !== ADMIN_PASSKEY) {
        return res.status(401).send('Unauthorized - Invalid passkey');
    }

    try {
        const admin = await adminModel.findOne({ email });
        if (!admin) {
            return res.status(400).send('Invalid email or password');
        }

        const result = await bcrypt.compare(password, admin.password);
        if (result) {
            const token = jwt.sign({ email: admin.email }, 'secret');
            res.cookie('adminToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
            res.render('adminProfile', { admin });
        } else {
            return res.status(400).send('Invalid email or password');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/adminProfile', isLoggedInAsAdmin, async function(req, res) {
    try {
        let admin = await adminModel.findOne({ email: req.admin.email });
        res.render("adminProfile", { admin });
    } catch (error) {
        console.error('Admin profile error:', error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/admin/recycling-requests', isLoggedInAsAdmin, async (req, res) => {
  try {
      const recycleRequests = await recycleItem.find().populate('user', 'username');
      res.json(recycleRequests);
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error fetching recycling requests' });
  }
});



app.post('/admin/update-recycling-status', isLoggedInAsAdmin, async (req, res) => {
  const { requestId } = req.body;
  
  try {
      const updatedRequest = await recycleItem.findByIdAndUpdate(requestId, { status: 'completed' }, { new: true });

      if (!updatedRequest) {
          return res.status(404).json({ success: false, message: 'Request not found' });
      }

      res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error updating status' });
  }
});


//logout (clearing cookie)
app.get("/logout",(req,res)=>{
    res.cookie("token","");
    res.redirect("/");
})


// Endpoint to handle garbage image and location data
app.post('/uploadGarbageImg', isLoggedInAsUser, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const lat = parseFloat(req.body.latitude);
    const lon = parseFloat(req.body.longitude);
    const manualAddress = req.body.manualAddress;
    const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({ success: false, message: 'Invalid latitude or longitude' });
    }

    const image = req.file;
    const nearestCenter = findNearestGarbageCenter(lat, lon);

    if (!nearestCenter) {
        return res.status(500).json({ success: false, message: 'No garbage centers found' });
    }

    try {
        const address = await getAddressFromCoordinates1(lat, lon);
        const user = await userModel.findOne({ email: req.user.email });
        
        const newGarbageRequest = new garbage({
            user: user._id,
            description: `Garbage reported at ${manualAddress || address}`,
            location: `${lat}, ${lon}`
        });

        await newGarbageRequest.save();
        user.garbageRequests.push(newGarbageRequest._id);
        await user.save();

        // Send email
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: { user: emailUser, pass: emailPass },
            tls: { rejectUnauthorized: false }
        });

        const mailOptions = {
            from: emailUser,
            to: nearestCenter.email,
            cc: req.user.email,
            subject: 'Garbage Report',
            text: `Garbage reported at: ${manualAddress || address}
Location: ${address}
View on map: ${mapsLink}
Nearest center: ${nearestCenter.name}
User: ${req.user.username} (${req.user.email})`,
            attachments: [{ filename: image.originalname, path: image.path }]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            // Delete uploaded file
            fs.unlink(image.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });

            if (error) {
                console.error('Email error:', error);
                return res.status(500).json({ success: false, message: 'Request saved but email failed to send' });
            }

            console.log('Email sent:', info.response);
            res.json({ success: true, message: 'Garbage report submitted successfully', address });
        });

    } catch (error) {
        console.error('Error processing garbage request:', error);
        // Delete uploaded file on error
        if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path);
        }
        res.status(500).json({ success: false, message: 'Failed to process request' });
    }
});

//admin part getting the rquests by the users
app.get('/admin/garbage-requests', isLoggedInAsAdmin, async (req, res) => {
  try {
      const garbageRequests = await garbage.find().populate('user', 'username');
      res.json(garbageRequests);
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error fetching garbage requests' });
  }
});

//acknowldgeing part of the requests from the admin page
app.post('/admin/update-garbage-status', isLoggedInAsAdmin, async (req, res) => {
  const { requestId } = req.body;
  
  try {
      const updatedRequest = await garbage.findByIdAndUpdate(
          requestId,
          { status: 'completed' },
          { new: true }
      );
      
      if (!updatedRequest) {
          return res.status(404).json({ success: false, message: 'Request not found' });
      }
      
      res.json({ success: true, message: 'Garbage request status updated successfully' });
  } catch (error) {
      console.error("Error updating garbage request status:", error);
      res.status(500).json({ success: false, message: 'Error updating garbage request status' });
  }
});


// Endpoint to handle recycling image and location data
app.post('/uploadRecycleImg', isLoggedInAsUser, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const lat = parseFloat(req.body.latitude);
    const lon = parseFloat(req.body.longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({ success: false, message: 'Invalid latitude or longitude' });
    }

    const image = req.file;
    const nearestCenter = findNearestRecyclingCenter(lat, lon);

    if (!nearestCenter) {
        return res.status(500).json({ success: false, message: 'No recycling centers found' });
    }

    try {
        const address = await getAddressFromCoordinates2(lat, lon);
        const user = await userModel.findOne({ email: req.user.email });
        
        const newRecycleRequest = new recycleItem({
            user: user._id,
            description: `Items to be recycled reported at ${address}`,
            location: `${lat}, ${lon}`
        });

        await newRecycleRequest.save();
        user.recycleRequests.push(newRecycleRequest._id);
        await user.save();

        // Send email
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: { user: emailUser, pass: emailPass },
            tls: { rejectUnauthorized: false }
        });

        const mailOptions = {
            from: emailUser,
            to: nearestCenter.email,
            cc: req.user.email,
            subject: 'Recycling Items Report',
            text: `Items to be recycled reported at: ${address}
Latitude: ${lat}, Longitude: ${lon}
Nearest recycling center: ${nearestCenter.name}
User: ${req.user.username} (${req.user.email})`,
            attachments: [{ filename: image.originalname, path: image.path }]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            // Delete uploaded file
            fs.unlink(image.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });

            if (error) {
                console.error('Email error:', error);
                return res.status(500).json({ success: false, message: 'Request saved but email failed to send' });
            }

            console.log('Email sent:', info.response);
            res.json({ success: true, message: 'Recycling request submitted successfully', address });
        });

    } catch (error) {
        console.error('Error processing recycling request:', error);
        // Delete uploaded file on error
        if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path);
        }
        res.status(500).json({ success: false, message: 'Failed to process request' });
    }
});

app.get('/map',(req,res)=>{
  res.render('map');
})

app.get('/payment', (req, res) => {
  res.render('index');
})

app.post('/checkout', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
      line_items: [
          {
              price_data: {
                  currency: 'INR',
                  product_data: {
                      name: 'fund Amount'
                  },
                  unit_amount: 50 * 100
              },
              quantity: 1
          },
              
      ],
      mode: 'payment',
     
      
      success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cancel`
  })

  res.redirect(session.url);
})

app.get('/complete', async (req, res) => {
  const result = Promise.all([
      stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ['payment_intent.payment_method'] }),
      stripe.checkout.sessions.listLineItems(req.query.session_id)
  ])

  console.log(JSON.stringify(await result))

  res.render('paymentSuccess')
})

app.get('/cancel', (req, res) => {
  res.redirect('/')
})

app.get('/chatbot', (req, res) => {
    res.render('chatbot', { chatbotUrl: 'http://localhost:8000/chatbot' });
});

function isLoggedInAsUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
      return res.redirect("/userLogin");
  }
  
  try {
      const data = jwt.verify(token, "secret");
      userModel.findOne({email: data.email})
          .then(user => {
              if (!user) {
                  res.clearCookie("token");
                  return res.redirect("/userLogin");
              }
              req.user = user;
              next();
          })
          .catch(err => {
              console.error(err);
              res.clearCookie("token");
              return res.redirect("/userLogin");
          });
  } catch (error) {
      res.clearCookie("token");
      return res.redirect("/userLogin");
  }
}

function isLoggedInAsAdmin(req, res, next) {
    const token = req.cookies.adminToken;
    if (!token) {
        return res.redirect('/adminLogin');
    }

    try {
        const data = jwt.verify(token, 'secret');
        req.admin = data;
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.clearCookie('adminToken');
        return res.redirect('/adminLogin');
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`✓ Server running on http://localhost:${PORT}`);
});

// Export for Vercel
module.exports = app;