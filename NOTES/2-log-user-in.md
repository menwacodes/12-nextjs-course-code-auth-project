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
- authorize(credentials, req) is a method which NextJS (maybe next-auth) calls when it receives an incoming login
  request
    - credentials: The submitted credentials
    - The function body expects your own authorization logic, check if the credentials are valid, and tell the user if
      that's not the case
- Use the helper auth file to compare the incoming password to the one on the found user
- Returning an object lets NextAuth know that authorization succeeded
    - The object is encoded into a JWT, so we can pass some info back
- The <span class="monospace">session</span> key in the config tells NextAuth how
  the [session](https://next-auth.js.org/configuration/options#session) should be managed

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
```

### /root/lib/auth.js

```js
import {hash, compare} from "bcryptjs";

export const hashPassword = async (password) => await hash(password, 12);

export const passwordsEqual = async (plainTextPw, hashedPw) => await compare(plainTextPw, hashedPw);
```

## Front End

- Don't need to configure own HTTP request

### /root/components/auth/auth-form.js

- The redirect option prevents the default NextAuth behaviour of redirection with bad credentials
- The signIn promise always resolves, bad data is within the resolution
    - {"error": "Bad PW","status": 200,"ok": true,"url": null}
- If success error is null:
    - {"error": null,"status": 200,"ok": true,"url": "http://localhost:3000/auth"}
    - Creates an http-only cookie with {next-auth.session-token: JWT}
    - May make sense to use React.Context to guide visibility but need a permanent solution
- In the form below, Lines 39-45 do the magic of logging in, handling invalid login with feedback not included

```js
import {useRef, useState} from 'react';
import classes from './auth-form.module.css';
import {signIn} from "next-auth/client.js";

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
            console.log(result)

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

### Manage Front-end Session

- Answer the question: Is a user authenticated or not
- Change options in header based on a user being authenticated
- NextAuth automatically uses the http-only cookie token when a protected route is accessed and can be used to change
  what's visible on the screen
- Next provides the answer to whether the user using the page is authenticated
    - <span class="computer-text">useSession()</span> hook which can be used in any functional React component
    - Returns an array with two elements: sessionObject & loading (name these whatever)
    - sessionObject describes the active session
    - loading boolean whether Next is still figuring out if the user is logged in
- sessionObject
    - {expires, user: {email, image, name}}
    - the session is prolonged automatically if the user is active

Below, the return values from <span class="computer-text">useSession()</span> are used to show / hide nav items

```js
import Link from 'next/link';
import {useSession} from 'next-auth/client.js'

import classes from './main-navigation.module.css';

function MainNavigation() {
    const [sessionObject, loading] = useSession()

    return (
        <header className={classes.header}>
            <Link href='/'>
                <a>
                    <div className={classes.logo}>Next Auth</div>
                </a>
            </Link>
            <nav>
                <ul>
                    <li>
                        {!sessionObject && !loading(<Link href="/auth">Login</Link>)}
                    </li>
                    <li>
                        {sessionObject && (<Link href="/profile">Profile</Link>)}
                    </li>
                    {sessionObject && (<li>
                        <button>Logout</button>
                    </li>)}
                </ul>
            </nav>
        </header>
    );
}

export default MainNavigation;
```

## Logout

- 'next-auth/client' provides a <span class="computer-text">signOut()</span> function to log users out
- signOut returns a promise but doesn't need to be handled to sign the user out
- using MainNavigation from directly above:

```js
import {useSession, signOut} from 'next-auth/client.js'

function MainNavigation() {
  const [sessionObject, loading] = useSession();

  const logoutHandler = () => {
    signOut()
  }
  return (
          // more stuff 
          <nav>
            <ul>
              <li>
                {!sessionObject && !loading && (<Link href="/auth">Login</Link>)}
              </li>
              <li>
                {sessionObject && (<Link href="/profile">Profile</Link>)}
              </li>
              {sessionObject && (
                      <li>
                        <button onClick={logoutHandler}>Logout</button>
                      </li>)
              }
            </ul>
          </nav>
  )
}
```