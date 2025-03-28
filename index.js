import express from 'express';
import mongoose from 'mongoose';
import chalk from 'chalk';

import cors from 'cors'

import * as UserController from './controllers/UserController.js'
import axios from 'axios';

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

const YOOKASSA_SHOP_ID = "1029598";
const YOOKASSA_SECRET_KEY = "live_0rbNRw-8ksp8r4nxr1_GBE796Xg7lW7H1rsCIG3NcL4";

app.post("/api/start-payment", async (req, res) => {
  try {
      const { first_amount, subscription_amount, currency, description, return_url, email } = req.body;

      // 1️⃣ Создаем первый платеж (фиксированная сумма)
      const initialPayment = await axios.post("https://api.yookassa.ru/v3/payments", {
          amount: {
              value: first_amount.toFixed(2),
              currency: currency || "RUB",
          },
          capture: true, 
          confirmation: {
              type: "redirect",
              return_url: return_url || "https://ya.ru",
          },
          save_payment_method: true, // 💳 Сохраняем карту для подписки
          description: description || "Первый платеж",
          receipt: {
              customer: { email: email || "user@example.com" },
              items: [
                  {
                      description: description || "Оплата услуги",
                      quantity: "1.00",
                      amount: { value: first_amount.toFixed(2), currency: "RUB" },
                      vat_code: 1,
                      payment_mode: "full_prepayment",
                      payment_subject: "service"
                  }
              ]
          }
      }, {
          auth: {
              username: YOOKASSA_SHOP_ID,
              password: YOOKASSA_SECRET_KEY,
          },
          headers: {
              "Content-Type": "application/json",
              "Idempotence-Key": new Date().toISOString()
          }
      });

      const paymentId = initialPayment.data.id; // ID платежа
      const confirmationUrl = initialPayment.data.confirmation.confirmation_url; // Ссылка на оплату

      // 2️⃣ Ждем успешной оплаты (отловить через Webhook или вручную)
      setTimeout(async () => {
          try {
              // Проверяем статус платежа
              const checkPayment = await axios.get(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
                  auth: {
                      username: YOOKASSA_SHOP_ID,
                      password: YOOKASSA_SECRET_KEY,
                  }
              });

              if (checkPayment.data.status === "succeeded") {
                  const paymentMethodId = checkPayment.data.payment_method.id; // Сохраненный способ оплаты

                  // 3️⃣ Через 7 дней запускаем автосписание
                  setTimeout(async () => {
                      try {
                          const subscriptionPayment = await axios.post("https://api.yookassa.ru/v3/payments", {
                              amount: {
                                  value: subscription_amount.toFixed(2),
                                  currency: "RUB",
                              },
                              capture: true,
                              payment_method_id: paymentMethodId, // 💳 Используем сохраненный способ оплаты
                              description: "Автосписание за подписку",
                              receipt: {
                                  customer: { email: email || "user@example.com" },
                                  items: [
                                      {
                                          description: "Подписка на сервис",
                                          quantity: "1.00",
                                          amount: { value: subscription_amount.toFixed(2), currency: "RUB" },
                                          vat_code: 1,
                                          payment_mode: "full_prepayment",
                                          payment_subject: "service"
                                      }
                                  ]
                              }
                          }, {
                              auth: {
                                  username: YOOKASSA_SHOP_ID,
                                  password: YOOKASSA_SECRET_KEY,
                              },
                              headers: {
                                  "Content-Type": "application/json",
                                  "Idempotence-Key": new Date().toISOString()
                              }
                          });

                          console.log("Автосписание успешно:", subscriptionPayment.data);
                      } catch (error) {
                          console.error("Ошибка при автосписании:", error.response?.data || error.message);
                      }
                  }, 7 * 24 * 60 * 60 * 1000); // Через 7 дней (неделя)
              }
          } catch (error) {
              console.error("Ошибка при проверке платежа:", error.response?.data || error.message);
          }
      }, 60 * 1000); // Проверка платежа через 60 секунд

      res.json({ confirmation_url: confirmationUrl, payment_id: paymentId });

  } catch (error) {
      console.error("Ошибка при создании платежа:", error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data || "Ошибка при создании платежа" });
  }
});



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



