import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LaunchScreen from './components/LaunchScreen/indexrr';
import MessageScreen from './components/MessageScreen/MassageScreen';
import PhoneBook from './components/PhoneBook/index';
import NewScreen from './components/NewScreen/index';
import ProfileScreen from './components/ProfileScreen/index';
import ExploreScreen from './components/ExploreScreen/index';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LaunchScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LaunchScreen" component={LaunchScreen} />
        <Stack.Screen name="MessageScreen" component={MessageScreen} />
        <Stack.Screen name="PhoneBook" component={PhoneBook} />
        <Stack.Screen name="ExploreScreen" component={ExploreScreen} />
        <Stack.Screen name="NewScreen" component={NewScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

