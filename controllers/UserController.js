import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/User.js'; // Убедитесь, что путь правильный

export const register = async (req, res) => {
  try {
    // Хэширование пароля
    const salt = await bcrypt.genSalt(10); // Генерация соли
    const hashedPassword = await bcrypt.hash(req.body.password, salt); // Хэширование пароля

    // Создание нового пользователя
    const newUser = new User({
      email: req.body.email,
      name: req.body.name,
      password: hashedPassword, // Используем хэшированный пароль
      role: req.body.role
    });

    // Сохранение пользователя в базе данных
    const savedUser = await newUser.save();

    // Генерация токена
    const token = jwt.sign({ _id: savedUser._id }, 'secret123', { expiresIn: '30d' });

    // Ответ клиенту
    res.json({ token, ...savedUser._doc });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось зарегистрироваться' });
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



// export const updateUserInfo = async (req, res) => {
//   try {
//     const userId = req.params.id; 
//     const { city, country, job, oblast } = req.body;

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { city, country, job, oblast }, // Обновляемые поля
//       { new: true } // Возвращаем обновленный объект
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'Пользователь не найден' });
//     }

//     res.json({ message: 'Информация обновлена', user: updatedUser });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Не удалось обновить информацию' });
//   }
// };

