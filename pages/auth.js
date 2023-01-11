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