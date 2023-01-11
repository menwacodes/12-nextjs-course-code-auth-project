import NextAuth from "next-auth";
import Providers from "next-auth/providers.js";
import {passwordsEqual} from "../../../lib/auth.js";
import mongoConnect from "../../../lib/mongo-connect.js";

const nextAuthConfig = {
    session: {jwt: true},
    providers: [
        Providers.Credentials({
            async authorize(credentials, req) {
                const client = await mongoConnect();

                // is there a user
                const usersCollection = client.db().collection("users");
                const user = await usersCollection.findOne({email: credentials.email});
                if (!user) {
                    client.close()
                    throw new Error("No User Found");
                }

                // is their password correct
                const passwordGood = await passwordsEqual(credentials.password, user.password);
                if (!passwordGood) {
                    client.close()
                    throw new Error("Bad PW");
                }

                client.close();

                // User is exists and is good
                return {email: user.email};
            }
        })
    ]
};
export default NextAuth(nextAuthConfig); // returns a handler function created by next-auth