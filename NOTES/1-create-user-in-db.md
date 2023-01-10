# Create User in DB
- <span class="monospace">next-auth</span> does not provide a user management component
- Need to set up users with salted passwords

## auth.js helper
- Returns a hashed string for the password to be stored in db
```js
import {hash} from "bcryptjs";

export const hashPassword = async (password) => await hash(password, 12);
```

## Signup API
- Uses helper from above
- Uses MongoDB connection
- Checks to see if the user email already exists (Lines 22-26)
```js
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
```

## Auth Form
- A component rendered by /pages/auth.js
- Has sign up and login mode, signup is below
    - Uses state to see if the form should be login or signup
- Keeps component lean by creating a function (Line 4) to create a user
    - Form submission calls this function which sends a POST request to the Signup API
```js
import {useRef, useState} from 'react';
import classes from './auth-form.module.css';

async function createUser(email, password) {
    const response = await fetch("/api/auth/signup", {
        method: 'POST',
        body: JSON.stringify({email, password}),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(response.message || "Something went wrong!");
    }
    return data;
}

function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);

    const emailInputRef = useRef();
    const passwordInputRef = useRef();

    function switchAuthModeHandler() {
        setIsLogin((prevState) => !prevState);
    }

    async function submitHandler(event) {

        event.preventDefault();

        const enteredEmail = emailInputRef.current.value;
        const enteredPassword = emailInputRef.current.value;

        if (isLogin) {
            // log user in
        } else {
            try {
                const result = await createUser(enteredEmail, enteredPassword);
                console.log(result);
            } catch (error) {
                console.error(error);
            }
        }
    }

    return (
        <section className={classes.auth}>
            <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
            <form onSubmit={submitHandler}>
                <div className={classes.control}>
                    <label htmlFor="email">Your Email</label>
                    <input type="email" id="email" required ref={emailInputRef}/>
                </div>
                <div className={classes.control}>
                    <label htmlFor="password">Your Password</label>
                    <input type="password" id="password" required ref={passwordInputRef}/>
                </div>
                <div className={classes.actions}>
                    <button>{isLogin ? 'Login' : 'Create Account'}</button>
                    <button
                        type="button"
                        className={classes.toggle}
                        onClick={switchAuthModeHandler}
                    >
                        {isLogin ? 'Create new account' : 'Login with existing account'}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default AuthForm;
```
