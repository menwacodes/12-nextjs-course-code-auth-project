# Protecting Routes Client Side
- Likely going to want [server-side protection](4-protecting-routes-server-side.md) so start there
- Start on the page that needs to be protected or restricted
- Use next-auth either on that page or on a component that page renders
- <span class="computer-text">getSession()</span> sends a new request and gets the latest session data
    - Returns a Promise of a session
    - It is more dynamic than useSession() which seems not to change its values
    - Use it for loading state
- Utilize useEffect to get the session when the component is rendered

Below, want to redirect away from the /profile route if the user isn't logged in
- The loading state is used to conditionally show a Loading message
- <span class="monospace">useEffect()</span> calls <span class="monospace">getSession()</span> to determine if a session exists
  - If not, redirect
  - If so, clear the loading state
- Because useEffect is used, easier to use .then() / .catch() then wrap the inner stuff in an async function
```js
import {useEffect, useState} from "react";
import ProfileForm from './profile-form';
import classes from './user-profile.module.css';

import {getSession} from "next-auth/client.js";

function UserProfile() {
    // Redirect away if NOT auth
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
            getSession()
                .then(session => {
                    if (!session) {
                        window.location.href = "/auth";
                    } else {
                        setIsLoading(false);
                    }
                });
        }, []
    );

    if (isLoading) return <p className={classes.profile}>Loading...</p>;

    return (
        <section className={classes.profile}>
            <h1>Your User Profile</h1>
            <ProfileForm/>
        </section>
    );
}

export default UserProfile;
```