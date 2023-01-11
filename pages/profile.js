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
