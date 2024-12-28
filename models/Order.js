import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    typeCargo: String,    
    weight: String,    
    typeCar: String,    
    typeCar: String,    
    weightOfCar: String,
    bodyVolume: String,
    loadingType: String,
    class: String,
    cmPrice: String,
    priceWithNDS: String,
    city1: String,
    city2: String,
    time1: String,
    time2: String,
    phone: String
})

export default mongoose.model('Order', OrderSchema);