import { Alert } from 'react-native';
import React, { useEffect, useState } from 'react';

import NFCManager from 'react-native-nfc-manager';
import { ConnectConfig, KeyPair } from 'near-api-js';
import * as nearAPI from 'near-api-js';
import { Scanner } from './src/components';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/components/HomeScreen/HomeScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  const [hasNFC, setHasNFC] = useState(false);
  useEffect(() => {
    checkNFC();
  }, []);

  const checkNFC = async () => {
    const supported = await NFCManager.isSupported();
    if (supported) {
      await NFCManager.start();
      console.log('supported', supported);

      setHasNFC(true);
    } else {
      setHasNFC(false);
    }
  };

  const getTicketOwner = async () => {
    const walletID = 'ppalena.testnet';
    const privateKeyPair =
      '2xuJs2QBUkvBuxpzU9PFURXkGUduz1bMNR9G5o25fFjyP1P9K2rTThgyJCNRTATLytGRRC7Hee95X8iXcJjHsWuc';
    const keyStore = new nearAPI.keyStores.InMemoryKeyStore();

    // // creates a public / private key pair using the provided private key
    const keyPair = KeyPair.fromString(privateKeyPair);

    // // // adds the keyPair you created to keyStore
    await keyStore.setKey('testnet', walletID, keyPair);

    const config: ConnectConfig = {
      networkId: 'testnet',
      keyStore,
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
      headers: {},
    };

    // connect to NEAR
    const near = await nearAPI.connect(config);
    const account = await near.account('ppalena.testnet');
    const contract = new nearAPI.Contract(account, 'minter_test.testnet', {
      viewMethods: ['nft_tokens'],
      changeMethods: ['buy_ticket'],
    });

    try {
      const response = await contract.nft_tokens();
      if (response) {
        console.log(response);
      }
    } catch (e: any) {
      Alert.alert(e.type);
    }
  };
  
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen options={{headerShown: false}} name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

export default App;
