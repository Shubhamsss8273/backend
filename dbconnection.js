const mongoose = require('mongoose');
const mongoURL = process.env.MONGO_URL;

const connectToDb = async () => {

    try {
        const dbOptions = {
            dbName: process.env.DB_NAME
        }

        await mongoose.connect(mongoURL, dbOptions);
        console.log('connected to db');
    } catch (error) {
        console.log(error);
    }

}
module.exports = connectToDb;