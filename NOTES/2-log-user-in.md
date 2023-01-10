# Log User In
- Uses <span class="monospace">next-auth</span> package
- Manages both token creation and storage
- Needs to have a "catch all" filename, use \[...nextauth].js
  - Behind the scenes, next-auth exposes multiple routes for login, logout, etc
  - Allows next-auth to [automatically handle all routes](https://next-auth.js.org/getting-started/rest-api)
  - These routes are expected in /pages/api/auth/
    - Cannot overwrite one of the existing paths

## Back End
### /api/auth/[...nextauth].js
- Setting a credentials key in the Providers.Credentials option will have next-auth automatically create a login form
- authorize(credentials, req) is a method which NextJS (maybe next-auth) calls when it receives an incoming login request
  - credentials: The submitted credentials
  - The function body expects your own authorization logic, check if the credentials are valid, and tell the user if that's not the case
- Use the helper auth file to compare the incoming password to the one on the found user
- Returning an object lets NextAuth know that authorization succeeded
  - The object is encoded into a JWT, so we can pass some info back
- The <span class="monospace">session</span> key in the config tells NextAuth how the [session](https://next-auth.js.org/configuration/options#session) should be managed
```js
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
                const usersCollection = client.db.collection("users");
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
```

### /root/lib/auth.js
```js
import {hash, compare} from "bcryptjs";

export const hashPassword = async (password) => await hash(password, 12);

export const passwordsEqual = async (plainTextPw, hashedPw) => await compare(plainTextPw, hashedPw);
```

## Front End
