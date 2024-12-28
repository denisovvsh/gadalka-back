import express from 'express';
import mongoose from 'mongoose';
import chalk from 'chalk';

import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();
import cors from 'cors'

import * as JournalController from './controllers/JournalController.js'
import * as UserController from './controllers/UserController.js'
import * as OrderController from './controllers/OrderController.js'







const errorMsg = chalk.bgWhite.redBright;
const successMsg = chalk.bgGreen.white;


// mongoose.connect(process.env.MONGODB_URI)
mongoose.connect('mongodb+srv://jogjoyinfo:20060903@cluster0.3s2e0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

.then(() => console.log(successMsg("DB ok")))
.catch((err) => console.log(errorMsg("DB error:", err)))

const app = express();

app.use(cors({
  origin: '*', // Укажите домен вашего фронтенда
  methods: ['GET','PATCH', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Если нужны куки или авторизация
}));


app.use(express.json());

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })



// Jornals

// app.post('/createJournal', JournalController.createJournal)
// app.get('/getJournal', JournalController.getLatestJournal)
// app.get('/getJournals', JournalController.getJournals)
// app.get('/getJournalById/:id', JournalController.getJournalById)
// app.post('/updateJournal', JournalController.updateJournal)
// app.post('/deleteJournal', JournalController.deleteJournal)
// app.post('/uploadArticlePhoto/:id', upload.single('image'), JournalController.uploadArticlePhoto);


// Users

app.post('/register', UserController.register)
app.post('/login', UserController.login)


// Orders

// app.get('/getOrder/:id', OrderController.getOrderById)
// app.get('/getOrders', OrderController.getAllOrders)

// app.post('/createOrder', OrderController.createOrder)
// app.post('/updateOrder/:id', OrderController.updateOrder)
// app.post('/deleteOrder/:id', OrderController.deleteOrder)



const port = process.env.PORT || 3001

app.listen(port, function(){
    console.log(successMsg("listening port:", port));
  });



