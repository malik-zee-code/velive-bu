"use client";
// main.tsx or App.tsx
import React from 'react';

import {  NhostProvider,  } from '@nhost/react';
import { nhost } from '@/lib/nhost';
import client from '@/lib/apolloClient';
import { ApolloProvider,  } from '@apollo/client/react/context';

const LayoutClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
    </NhostProvider>
  );
};

export default LayoutClient;
