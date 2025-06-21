const {Sequelize} = require('sequelize')
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.USER,
    process.env.PASSWORD,{
        host:process.env.HOST,
        dialect:"mysql",
        logging:false,
        dialectOptions:{
            // SSL options 
        }
    }
)

const connectDB = async() => {
    try {
        await sequelize.authenticate();
        console.log("Databse connected Successfully")

    // Automatically alter the tables to match model definitions (you can adjust this based on your need)

        await sequelize.sync({ alter: true })   

    } catch (error) {
        console.error("Unable to connect", error)
        process.exit(1);
    }
};

connectDB();

module.exports =  sequelize;