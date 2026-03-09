require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const dbConnection = require('../config/db'); 
const employeeRoute = require('../routes/employee');
const auth = require('../routes/auth')
const offerLetterRoutes = require('../routes/offerLetter');
const appointmentLetter = require('../routes/appointmentLetter');
const terminationLetter = require('../routes/terminationLetter');
const onboardingRoutes = require('../routes/onboarding');
const salaryRoutes = require('../routes/salarySlip');
const fnfRoutes = require('../routes/fnf');


const PORT = process.env.PORT || 5000;

dbConnection();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,               
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/employee', employeeRoute);

app.use('/api/auth', auth);
app.use('/api/offer-letters', offerLetterRoutes);
app.use('/api/appointment-letters', appointmentLetter);
app.use('/api/termination-letters', terminationLetter);
app.use('/api/onboarding', onboardingRoutes);
/*app.use('/api', generateRoutes); */
app.use('/api/salarySlip', salaryRoutes);
app.use('/api/fnf', fnfRoutes);

app.get('/uploads/debug-test', (req, res) => {
  res.send('Static middleware is active!');
});
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});