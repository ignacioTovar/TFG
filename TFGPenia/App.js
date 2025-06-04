import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/Ionicons';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ClassificationScreen from './screens/ClassificationScreen';
import { Colors } from './constants/styles';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack
function HomeStackScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.blueLight },
        headerTintColor: Colors.surface,
        headerTitleAlign: 'center', // Centrar el título
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Bienvenido',
        }}
      />
      <Stack.Screen
        name="Classification"
        component={ClassificationScreen}
        options={{
          title: 'Clasificación',
        }}
      />
    </Stack.Navigator>
  );
}

// Profile Stack
function ProfileStackScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.blueLight },
        headerTintColor: Colors.surface,
        headerTitleAlign: 'center', // Centrar el título
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Editar Perfil',
        }}
      />
    </Stack.Navigator>
  );
}

// Tab Navigation
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // No mostrar el encabezado en el tab
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

// Authentication Stack
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

export default function App() {
  const isAuthenticated = true; // lógica real: estado de auth

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        {isAuthenticated ? <AppTabs /> : <AuthStack />}
      </NavigationContainer>
    </>
  );
}
