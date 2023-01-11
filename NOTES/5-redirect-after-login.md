# Redirect After Login
- Once the user logs in, shouldn't be on auth-form page any longer
- To maintain SPA state, do not use <span class="monospace">window.location.href="/"</span>, instead utilize useRouter
- The promise useRouter().replace(URL) returns can be ignored
- Could use [server-side](4-protecting-routes-server-side.md) protection, below uses [client-side](3-protecting-routes-client-side.md)

## /components/auth/auth-form.js
- Lines 4, 23, and 49-51
```js
import {useRef, useState} from 'react';
import classes from './auth-form.module.css';
import {signIn} from "next-auth/client.js";
import {useRouter} from 'next/router.js'

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
        throw new Error(data.message || "Something went wrong!");
    }
    return data;
}

function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const router = useRouter();

    const emailInputRef = useRef();
    const passwordInputRef = useRef();

    function switchAuthModeHandler() {
        setIsLogin((prevState) => !prevState);
    }

    async function submitHandler(event) {

        event.preventDefault();

        const enteredEmail = emailInputRef.current.value;
        const enteredPassword = passwordInputRef.current.value;

        if (isLogin) {
            // log user in
            const signInOptions = {
                redirect: false,
                email: enteredEmail,
                password: enteredPassword
            };
            const result = await signIn('credentials', signInOptions);

            // if login succeeds, redirect
            if (!result.error) {
                router.replace("/profile")
            }

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

## /pages/auth.js
- If there is a session, the user is authenticated and shouldn't be on the auth page
- Line 12 looks for the session to return this info, Line 14 is executed if there is an active session
```js
import {getSession} from "next-auth/client.js";
import {useRouter} from "next/router.js";
import {useEffect, useState} from "react";
import AuthForm from '../components/auth/auth-form';

function AuthPage() {
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
            getSession().then(session => {
                if (session) { 
                    router.replace("/");
                } else {
                    setIsLoading(false);
                }
            });
        }, []
    );

    if (isLoading) return <p>Loading...</p>

    return <AuthForm/>;
}

export default AuthPage;
```