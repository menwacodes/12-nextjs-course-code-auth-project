import Link from 'next/link';
import {useSession, signOut, getSession} from 'next-auth/client.js';

import classes from './main-navigation.module.css';

function MainNavigation() {
    const [sessionObject, loading] = useSession();
    if (sessionObject) {
        console.log(sessionObject.user.email);
    }

    const logoutHandler = () => {
        signOut();
    };


    return (
        <header className={classes.header}>
            <Link href="/">
                <a>
                    <div className={classes.logo}>Next Auth</div>
                </a>
            </Link>
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
                    {sessionObject && (
                        <li>
                            <button>Get Role</button>
                        </li>
                    )}
                </ul>
            </nav>
        </header>
    );
}



export default MainNavigation;