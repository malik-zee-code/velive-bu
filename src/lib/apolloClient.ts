// apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { nhost } from './nhost';

const httpLink = createHttpLink({
  uri: "https://kjekkrcmihqxroxgdmpt.hasura.eu-central-1.nhost.run/v1/graphql"
});

const authLink = setContext(async (_, { headers }) => {
  const session = nhost.auth.getSession();
  const accessToken = session?.accessToken;

  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
