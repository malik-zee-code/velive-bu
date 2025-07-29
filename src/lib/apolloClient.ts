// apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { nhost } from './nhost';

const httpLink = createHttpLink({
  uri: "https://kjekkrcmihqxroxgdmpt.hasura.eu-central-1.nhost.run/v1/graphql"
});

const accessToken = "2Vg2f=tDe*0-Gd1d;lh!^s#G,DSjV!m'";

const authLink = setContext(async (_, { headers }) => {
  return {
    headers: {
      ...headers,
      "x-hasura-admin-secret": `${accessToken}`,
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
