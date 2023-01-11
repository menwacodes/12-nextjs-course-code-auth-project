# next-auth Session Provider Context
- useSession can be use in multiple places (getServerSideProps, useSession hook in main navigation)
  - Want to have a higher level check
- The next-auth \<Provider /> component goes into /pages/_app.js and wraps around other components
- Provider wants a session prop which comes from pageProps && Each component runs through _app.js
  - Thus, the props in getServerSideProps in the /pages/profile.js page are exposed in the pageProps
  - The session is set to the loaded session from profile and next-auth can skip the check done by useSession as it's available from getServerSideProps

## /pages/app.js
```js
import {Provider} from "next-auth/client.js";
import Layout from '../components/layout/layout';
import '../styles/globals.css';

function MyApp({Component, pageProps}) {
    return (
        <Provider session={pageProps.session}>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </Provider>
    );
}

export default MyApp;
```