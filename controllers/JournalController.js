import Journal from "../models/Journal.js";
import mongoose from "mongoose";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import dotenv from 'dotenv';
dotenv.config();
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

async function getSignedUrlForKey(key) {
  const getObjectParams = {
    Bucket: bucketName,
    Key: key
  };
  const command = new GetObjectCommand(getObjectParams);
  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return url;
  } catch (err) {
    console.error('Ошибка при генерации подписанной ссылки:', err);
    return null;
  }
}

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accesskey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY


const s3 = new S3Client({
  credentials: {
    accessKeyId: accesskey,
    secretAccessKey: secretAccessKey
  },
  region: bucketRegion
})
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')



// Функция для создания нового FAQ
export const createJournal = async (req, res) => {
  try {
    const { title, par, text, img, type, subType, brand } = req.body;

    // Создаем новый FAQ и сохраняем его в базе данных
    const newFaq = new Journal({
      title,
      par, // Дополнительный вопрос (если есть)
      text,
      img,
      brand,
      subType,
      type
    });

    await newFaq.save();

    res.status(201).json({ message: "FAQ успешно создан!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Произошла ошибка при создании FAQ" });
  }
};

// Функция для получения последнего FAQ
export const getLatestJournal = async (req, res) => {
  try {
    // Находим самую свежую запись, отсортированную по дате создания
    const latestFaq = await Journal.find();

    if (!latestFaq) {
      return res.status(404).json({ message: "FAQ не найден." });
    }

    res.status(200).json(latestFaq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Произошла ошибка при получении FAQ" });
  }
};

// Функция для обновления последнего FAQ
export const updateJournal = async (req, res) => {
  try {
    const { id, title, par, text, type, subType, brand } = req.body;

    // Проверяем, является ли ID валидным ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Некорректный формат ID' });
    }

    if (!title || !text) {
      return res.status(400).json({ error: 'Необходимо указать title и text' });
    }

    // Находим и обновляем или создаём новую запись
    const updatedFaq = await Journal.findOneAndUpdate(
      { _id: id },
      { title, par, text, type, subType, brand },
      { new: true, upsert: true } // upsert создаёт запись, если её нет
    );

    res.status(200).json({ message: 'Журнал успешно обновлен!', updatedFaq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Произошла ошибка при обновлении журнала' });
  }
};



export const deleteJournal = async (req, res) => {
    try {
      const { id } = req.body;
  
      // Ищем и удаляем запись по id
      const deletedFaq = await Journal.findByIdAndDelete(id);
  
      if (!deletedFaq) {
        return res.status(404).json({ message: "FAQ не найден для удаления." });
      }
  
      res.status(200).json({ message: "FAQ успешно удален!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Произошла ошибка при удалении FAQ" });
    }
  };

export const getJournalById =  async(req, res) => {
    try {
      const id = req.params.id;
      const latestFaq = await Journal.findOne({_id: id});
  
      if (!latestFaq) {
        return res.status(404).json({ message: "FAQ не найден." });
      }
  
      if(latestFaq.img && latestFaq.img.length >= 1){
        const img = await getSignedUrlForKey(latestFaq.img);
        latestFaq.img = img
      }
  
      res.status(200).json(latestFaq);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Произошла ошибка при получении FAQ" });   
  }
  }


  export const getJournals =  async(req, res) => {
    try {
      // Находим самую свежую запись, отсортированную по дате создания
      const id = req.params.id;
      const latestFaq = await Journal.find();
  
      if (!latestFaq) {
        return res.status(404).json({ message: "FAQ не найден." });
      }
  
      for(let i = 0; i < latestFaq.length; i++){
        if(latestFaq[i].img && latestFaq[i].img.length >= 1){
          const img = await getSignedUrlForKey(latestFaq[i].img);
          latestFaq[i].img = img
        }
      }
  
      res.status(200).json(latestFaq);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Произошла ошибка при получении FAQ" });   
  }
  }


  export const uploadArticlePhoto = async (req, res) => {
    const articleId = req.params.id;
  
    try {
      // Проверяем, является ли ID валидным ObjectId
      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        return res.status(400).json({ error: 'Некорректный формат ID' });
      }
  
      // Находим запись в базе
      const oldUser = await Journal.findOne({ _id: articleId });
  
      // Если запись существует, проверяем и удаляем старое изображение
      if (oldUser) {
        const oldImage = oldUser.img;
        if (oldImage && oldImage.length >= 1) {
          const commandDelete = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: oldImage,
          });
          await s3.send(commandDelete);
        }
      }
  
      // Загружаем новое изображение
      const buffer = await sharp(req.file.buffer).toBuffer();
      const imageName = randomImageName();
  
      const params = {
        Bucket: bucketName,
        Key: imageName,
        Body: buffer,
        ContentType: req.file.mimetype,
      };
  
      const command = new PutObjectCommand(params);
      await s3.send(command);
  
      // Обновляем запись или создаем новую
      const post = await Journal.findOneAndUpdate(
        { _id: articleId },
        { img: imageName },
        { new: true, upsert: true } // upsert создаёт запись, если её нет
      );
  
      res.json(post);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: 'Ошибка при обновлении изображения' });
    }
  }