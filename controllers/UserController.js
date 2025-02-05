import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'
import User from '../models/User.js'; // Убедитесь, что путь правильный
import crypto from 'crypto';

export const register = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      email: req.body.email,
      name: req.body.name,
      password: hashedPassword,
      role: req.body.role,
      subscribe: true, // Подписка включена по умолчанию
      subscribeDate: new Date(), // Устанавливаем текущую дату подписки
    });

    const savedUser = await newUser.save();

    const token = jwt.sign({ _id: savedUser._id }, 'secret123', { expiresIn: '30d' });

    // Настройка транспортера для отправки email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'info@1matrica-sudby.ru',
        pass: 'zevv ocdh wcow uypn',
      },
    });

    // Настройка письма
    const mailOptions = {
      from: 'info@1matrica-sudby.ru',
      to: req.body.email,
      subject: 'Успешная регистрация',
      text: `Здравствуйте, ${req.body.name}!

Вы успешно зарегистрировались на нашем сайте. 

Ваша подписка активирована с ${new Date().toLocaleDateString()}.

С уважением,
Команда поддержки.`,
    };

    // Отправка письма
    await transporter.sendMail(mailOptions);

    res.json({ token, ...savedUser._doc });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Не удалось зарегистрироваться' });
  }
};



export const resetPassword = async (req, res) => {
  const { email } = req.body; // Получаем email из запроса

  try {
    // Находим пользователя по email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь с таким email не найден' });
    }

    // Генерация случайного нового пароля
    const newPassword = crypto.randomBytes(8).toString('hex'); // Генерируем случайный пароль длиной 16 символов

    // Хэшируем новый пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Обновляем пароль в базе данных
    user.password = hashedPassword;
    await user.save();

    // Настройка транспортера для отправки email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'info@1matrica-sudby.ru',
        pass: 'zevv ocdh wcow uypn',
      },
    });

    // Настройка письма
    const mailOptions = {
      from: 'info@1matrica-sudby.ru',
      to: email,
      subject: 'Восстановление пароля',
      text: `Здравствуйте!

Ваш новый пароль для входа на наш сайт: ${newPassword}

С уважением,
Команда поддержки.`,
    };

    // Отправка письма
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Новый пароль отправлен на ваш email' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при сбросе пароля' });
  }
};


export const login = async (req, res) => {
    try {
      // Поиск пользователя по email
      const user = await User.findOne({ email: req.body.email });
  
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
  
      // Проверка пароля
      const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
  
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Неверный логин или пароль' });
      }
  
      // Генерация JWT
      const token = jwt.sign({ _id: user._id }, 'secret123', { expiresIn: '30d' });
  
      // Возвращаем данные пользователя без пароля
      const { password, ...userData } = user._doc;
      res.json({ token, ...userData });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Не удалось войти в аккаунт' });
    }
  };

  export const getUserById = async (req, res) => {
    try {
      const userId = req.params.id; // Получаем id из параметров запроса
  
      // Ищем пользователя по id в базе данных
      const user = await User.findById(userId);
  
      // Если пользователь не найден
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
  
      // Возвращаем данные пользователя без пароля
      const { password, ...userData } = user._doc;
      res.json(userData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Не удалось получить данные пользователя' });
    }
  };
  



  export const updateUserInfo = async (req, res) => {
    try {
      const userId = req.params.id;
      const { date, date1, date2, tab } = req.body;
  
      // Формируем объект с обновляемыми полями
      const updates = {};
      if (date) updates.date = date;
      if (date1) updates.date1 = date1;
      if (date2) updates.date2 = date2;
      if (tab) updates.tab = tab;
      
      console.log(date1, date2);
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'Нет данных для обновления' });
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updates, // Обновляемые поля
        { new: true } // Возвращаем обновленный объект
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
  
      res.json({ message: 'Информация обновлена', user: updatedUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Не удалось обновить информацию' });
    }
  };
  

export const getTelegramId = async (req, res) => {
  const initData = req.body.initData;
  const botToken = '7661158481:AAFc3G5gOameDLtudD8X_tX6IEsyoXKBlOc'; // Укажите токен вашего бота

  if (!initData || !botToken) {
    return res.status(400).json({ error: 'initData или токен не предоставлены' });
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const signature = urlParams.get('signature');
    urlParams.delete('signature'); 

    const userParam = urlParams.get('user');
    if (!userParam) {
      return res.status(400).json({ error: 'Параметр user отсутствует!' });
    }

    const user = JSON.parse(userParam);
    let existingUser = await User.findOne({ telegramId: user.id });

    if (existingUser) {
      return res.json({ status: 'Пользователь с таким Telegram ID уже существует.', user: existingUser });
    }

    // Создаем нового пользователя, если не найден
    const newUser = new User({
      telegramId: user.id
    });

    await newUser.save();

    return res.json({ 
      status: 'Новый пользователь создан.', 
      user: newUser, 
      telegramId: newUser.telegramId 
    });

  } catch (error) {
    console.error('Ошибка при обработке данных:', error);
    return res.status(500).json({ error: 'Ошибка при обработке initData.' });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const userId = req.params.id; // Получаем ID пользователя из URL
    const { subscribe } = req.body; // Получаем новое значение подписки

    if (typeof subscribe !== 'boolean') {
      return res.status(400).json({ message: 'Некорректное значение подписки' });
    }

    const updates = {
      subscribe,
      subscribeDate: subscribe ? new Date() : null, // Обновляем дату, если подписка включена
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true } // Возвращаем обновленные данные
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ message: 'Подписка обновлена', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось обновить подписку' });
  }
};
