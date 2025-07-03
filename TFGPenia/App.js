import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/Ionicons';
import { useContext } from 'react';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ClassificationScreen from './screens/ClassificationScreen';
import MultasHistoryScreen from './screens/MultasHistoryScreen';
import { Colors } from './constants/styles';
import AuthContextProvider, { AuthContext } from './context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Home Stack ---
function HomeStackScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.blueLight },
        headerTintColor: Colors.surface,
        headerTitleAlign: 'center',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Bienvenido' }} />
      <Stack.Screen name="Classification" component={ClassificationScreen} options={{ title: 'Clasificación' }} />
      <Stack.Screen name="Multas" component={MultasHistoryScreen} options={{ title: 'MultasHistory' }} />
    </Stack.Navigator>
  );
}

// --- Profile Stack ---
function ProfileStackScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.blueLight },
        headerTintColor: Colors.surface,
        headerTitleAlign: 'center',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Editar Perfil' }} />
    </Stack.Navigator>
  );
}

// --- Tabs ---
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Inicio: 'home-outline',
            Perfil: 'person-outline',
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.blueLight,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: { height: 60, paddingBottom: 5 },
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeStackScreen} />
      <Tab.Screen name="Perfil" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

// --- Auth Stack ---
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.blueLight },
        headerTintColor: Colors.surface,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// --- Main App ---
function Root() {
  const authCtx = useContext(AuthContext);
  const isAuthenticated = !!authCtx.user;

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthContextProvider>
      <StatusBar style="light" />
      <Root />
    </AuthContextProvider>
  );
}
