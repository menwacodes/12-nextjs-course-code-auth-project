# Protecting Routes Server Side
- A better alternative to client-side and stops the jarring page flash
- Use server-side code to determine if the user is logged in and take action from there (page content, redirect, etc)
- Need getServerSideProps as the content needs to be built on the server when the page is hit, based on the login status
  - getStaticProps runs at build time and optionally rebuilds on a time interval
- This would replace client-side route protection, if exists

Below in the getServerSideProps function of the /pages/profile.js file,
- Get session automatically looks into the request to extract the session token cookie
- Session is null if the user is not auth and a valid session object if auth
- Permanent is set to false to make it clear that it's only one time due to user not being logged in
```js
import {getSession} from "next-auth/client.js";
import UserProfile from '../components/profile/user-profile';

function ProfilePage() {
    return <UserProfile/>;
}

export async function getServerSideProps(context) {
    // get session automatically looks into the request to extract the session token cookie
    // session is null if the user is not auth and a valid session object if auth
    // permanent is set to false to make it clear that it's only one time due to user not being logged in
    const session = await getSession({req: context.req});
    if (!session) {
        return {
            redirect: {
                destination: '/auth',
                permanent: false
            }
        }
    }
    return {
        props: {session}
    }
}

export default ProfilePage;
```