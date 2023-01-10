import {bgMagentaBright, bgRed, black, yellowBright} from "ansi-colors";
import {MongoClient} from 'mongodb';


const DB = process.env.DB_CONN
    .replace("<USERNAME>", process.env.DB_UN)
    .replace("<PASSWORD>", process.env.DB_PW)
    .replace("<DB_NAME>", process.env.DB_N);


const connect = async () => {
    try {
        const client = await MongoClient.connect(DB);
        console.log(bgMagentaBright(black("Mongo Connection Open")));
        return client;

    } catch (error) {
        console.error(error);
        console.log(bgRed(yellowBright(`Mongo Connection Error: ${error.message}`)));
    }
};

module.exports = connect;