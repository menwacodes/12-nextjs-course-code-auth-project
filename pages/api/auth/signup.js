import {hashPassword} from "../../../lib/auth.js";
import mongoConnect from "../../../lib/mongo-connect.js";


async function handler(req, res) {
    if (req.method !== "POST") return;

    const data = req.body;

    const {email, password} = data;

    // validate sent data
    if (!email || !email.includes("@") || !password || password.trim().length < 6) {
        res.status(422).json({message: "Invalid Input"});
        return;
    }

    const client = await mongoConnect();
    const db = client.db();

    // See if user already exists
    const existingUser = await db.collection("users").findOne({email: email});
    if (existingUser) {
        client.close();
        return res.status(422).json({message: "Cannot sign up with that user name"});
    }

    const hashedPassword = await hashPassword(password);

    // create user
    const result = await db.collection("users").insertOne({
        email: email,
        password: hashedPassword
    });

    client.close();
    return res.status(201).json({message: "Created user!"});
}

export default handler;