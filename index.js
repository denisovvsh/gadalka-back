import express from 'express';
import mongoose from 'mongoose';
import chalk from 'chalk';

import cors from 'cors'

import * as UserController from './controllers/UserController.js'


const errorMsg = chalk.bgWhite.redBright;
const successMsg = chalk.bgGreen.white;


// mongoose.connect(process.env.MONGODB_URI)
mongoose.connect('mongodb+srv://abeke:20060903@cluster0.ipkly.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

.then(() => console.log(successMsg("DB ok")))
.catch((err) => console.log(errorMsg("DB error:", err)))

const app = express();

app.use(cors({
  origin: '*', // Укажите домен вашего фронтенда
  methods: ['GET','PATCH', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Если нужны куки или авторизация
}));


app.use(express.json());


// Users

app.post('/register', UserController.register)
app.post('/login', UserController.login)
app.get('/getUserById/:id', UserController.getUserById)
app.post('/updateDate/:id', UserController.updateUserInfo)
app.post('/resetPassword', UserController.resetPassword)
app.post('/getSubscribe', UserController.updateSubscription)

const port = process.env.PORT || 3001

app.listen(port, function(){
    console.log(successMsg("listening port:", port));
  });



