import Order from '../models/Order.js'; // Убедитесь, что путь правильный

export const createOrder = async (req, res) => {
  try {
    const newOrder = new Order({
      typeCargo: req.body.typeCargo,
      weight: req.body.weight,
      typeCar: req.body.typeCar,
      weightOfCar: req.body.weightOfCar,
      bodyVolume: req.body.bodyVolume,
      loadingType: req.body.loadingType,
      class: req.body.class,
      cmPrice: req.body.cmPrice,
      priceWithNDS: req.body.priceWithNDS,
      city1: req.body.city1,
      city2: req.body.city2,
      time1: req.body.time1,
      time2: req.body.time2,
      phone: req.body.phone
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось создать заказ' });
  }
};


export const updateOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
  
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          typeCargo: req.body.typeCargo,
          weight: req.body.weight,
          typeCar: req.body.typeCar,
          weightOfCar: req.body.weightOfCar,
          bodyVolume: req.body.bodyVolume,
          loadingType: req.body.loadingType,
          class: req.body.class,
          cmPrice: req.body.cmPrice,
          priceWithNDS: req.body.priceWithNDS,
          city1: req.body.city1,
          city2: req.body.city2,
          time1: req.body.time1,
          time2: req.body.time2,
          phone: req.body.phone
        },
        { new: true } // Возвращает обновленный объект
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Заказ не найден' });
      }
  
      res.json(updatedOrder);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Не удалось обновить заказ' });
    }
  };

  
  export const deleteOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
  
      const deletedOrder = await Order.findByIdAndDelete(orderId);
  
      if (!deletedOrder) {
        return res.status(404).json({ message: 'Заказ не найден' });
      }
  
      res.json({ message: 'Заказ удален', deletedOrder });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Не удалось удалить заказ' });
    }
  };
  

  export const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find(); // Получаем все заказы из базы
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Не удалось получить заказы' });
    }
  };

  
  export const getOrderById = async (req, res) => {
    try {
      const orderId = req.params.id; // Получаем ID из параметров запроса
  
      const order = await Order.findById(orderId);
  
      if (!order) {
        return res.status(404).json({ message: 'Заказ не найден' });
      }
  
      res.json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Не удалось получить заказ' });
    }
  };
  