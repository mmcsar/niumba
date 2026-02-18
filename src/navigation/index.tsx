// Niumba - Navigation Configuration (Complete with all features)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

// Light theme for navigation
const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#2A2A33',
    border: '#E0E0E0',
    primary: '#006AFF',
  },
};

// Main Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import MapScreen from '../screens/MapScreen';
import ContactFormScreen from '../screens/ContactFormScreen';
import AdvancedSearchScreen from '../screens/AdvancedSearchScreen';

// New Feature Screens
import MortgageCalculatorScreen from '../screens/MortgageCalculatorScreen';
import ComparePropertiesScreen from '../screens/ComparePropertiesScreen';
import ChatScreen from '../screens/ChatScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import NearbySearchScreen from '../screens/NearbySearchScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import PriceHistoryScreen from '../screens/PriceHistoryScreen';
import AlertsScreen from '../screens/AlertsScreen';
import VirtualTourScreen from '../screens/VirtualTourScreen';
import AdminAgentsScreen from '../screens/admin/AdminAgentsScreen';
import AdminAppointmentsScreen from '../screens/admin/AdminAppointmentsScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import SupportScreen from '../screens/SupportScreen';
import FAQScreen from '../screens/FAQScreen';
import ReportProblemScreen from '../screens/ReportProblemScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminPropertiesScreen from '../screens/admin/AdminPropertiesScreen';
import AddPropertyScreen from '../screens/admin/AddPropertyScreen';
import EditPropertyScreen from '../screens/admin/EditPropertyScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminInquiriesScreen from '../screens/admin/AdminInquiriesScreen';
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import AdminNotificationSettingsScreen from '../screens/admin/AdminNotificationSettingsScreen';
import AdminActivityLogScreen from '../screens/admin/AdminActivityLogScreen';
import EditorDashboard from '../screens/editor/EditorDashboard';

// Types
export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  PropertyDetail: { propertyId: string };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Map: { initialRegion?: { latitude: number; longitude: number } };
  ContactForm: { propertyId: string; propertyTitle: string; ownerId: string; ownerName: string };
  AdvancedSearch: { initialFilters?: any };
  // New Features
  MortgageCalculator: { propertyPrice?: number };
  CompareProperties: { propertyIds?: string[] };
  Chat: { recipientId: string; recipientName: string; recipientAvatar?: string; propertyId?: string; propertyTitle?: string };
  Conversations: undefined;
  NearbySearch: undefined;
  Reviews: { propertyId: string; propertyTitle: string };
  PriceHistory: { propertyId: string; propertyTitle: string; currentPrice: number };
  Alerts: undefined;
  VirtualTour: { propertyId: string; propertyTitle: string; tourRooms?: any[] };
  BookAppointment: { propertyId: string; propertyTitle: string; ownerName: string; ownerId: string };
  VideoCall: { appointmentId: string };
  Notifications: undefined;
  NotificationSettings: undefined;
  Support: undefined;
  EditProfile: undefined;
  FAQ: undefined;
  ReportProblem: undefined;
  Feedback: undefined;
  PrivacyPolicy: undefined;
  // Admin
  AdminDashboard: undefined;
  AdminProperties: { filter?: string };
  AdminAddProperty: undefined;
  AdminEditProperty: { propertyId: string };
  AdminUsers: undefined;
  AdminInquiries: undefined;
  AdminAnalytics: undefined;
  AdminSettings: undefined;
  AdminNotifications: undefined;
  AdminNotificationSettings: undefined;
  AdminAgents: undefined;
  AdminAppointments: undefined;
  AdminActivityLog: undefined;
  EditorDashboard: undefined;
  MyActivities: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: { filters?: any; query?: string; viewMode?: string; from?: string; section?: string; city?: string };
  Saved: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Icon Component
interface TabIconProps {
  focused: boolean;
  name: keyof typeof Ionicons.glyphMap;
  outlineName: keyof typeof Ionicons.glyphMap;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, name, outlineName }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
    <Ionicons
      name={focused ? name : outlineName}
      size={24}
      color={focused ? COLORS.white : COLORS.textSecondary}
    />
  </View>
);

// Bottom Tab Navigator
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="home" outlineName="home-outline" />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={SearchScreen as any}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="search" outlineName="search-outline" />
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="heart" outlineName="heart-outline" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="person" outlineName="person-outline" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
const Navigation: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer theme={LightTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialRouteName="MainTabs"
      >
        {/* Main App */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="PropertyDetail"
          component={PropertyDetailScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen 
          name="ContactForm" 
          component={ContactFormScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen 
          name="AdvancedSearch" 
          component={AdvancedSearchScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />

        {/* New Feature Screens */}
        <Stack.Screen 
          name="MortgageCalculator" 
          component={MortgageCalculatorScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen 
          name="CompareProperties" 
          component={ComparePropertiesScreen}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
        />
        <Stack.Screen 
          name="Conversations" 
          component={ConversationsScreen}
        />
        <Stack.Screen 
          name="NearbySearch" 
          component={NearbySearchScreen}
        />
        <Stack.Screen 
          name="Reviews" 
          component={ReviewsScreen}
        />
        <Stack.Screen 
          name="PriceHistory" 
          component={PriceHistoryScreen}
        />
        <Stack.Screen 
          name="Alerts" 
          component={AlertsScreen}
        />
        <Stack.Screen 
          name="VirtualTour" 
          component={VirtualTourScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen 
          name="BookAppointment" 
          component={BookAppointmentScreen}
        />
        <Stack.Screen 
          name="VideoCall" 
          component={VideoCallScreen}
        />
        <Stack.Screen 
          name="Notifications" 
          component={NotificationsScreen}
        />
        <Stack.Screen 
          name="NotificationSettings" 
          component={NotificationSettingsScreen}
        />
        <Stack.Screen 
          name="Support" 
          component={SupportScreen}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen}
        />
        <Stack.Screen 
          name="FAQ" 
          component={FAQScreen}
        />
        <Stack.Screen 
          name="ReportProblem" 
          component={ReportProblemScreen}
        />
        <Stack.Screen 
          name="Feedback"
          component={FeedbackScreen}
        />
        <Stack.Screen 
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
        />

        {/* Auth Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen}
          options={{ animation: 'slide_from_right' }}
        />

        {/* Admin Screens */}
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboard}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="AdminProperties" component={AdminPropertiesScreen as any} />
        <Stack.Screen 
          name="AdminAddProperty" 
          component={AddPropertyScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen 
          name="AdminEditProperty" 
          component={EditPropertyScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
        <Stack.Screen name="AdminInquiries" component={AdminInquiriesScreen} />
        <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
        <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
        <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
        <Stack.Screen name="AdminNotificationSettings" component={AdminNotificationSettingsScreen} />
        <Stack.Screen name="AdminAgents" component={AdminAgentsScreen} />
        <Stack.Screen name="AdminAppointments" component={AdminAppointmentsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: COLORS.white,
    borderRadius: 35,
    paddingHorizontal: 10,
    paddingBottom: 0,
    borderTopWidth: 0,
    ...SHADOWS.large,
  },
  tabIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconActive: {
    backgroundColor: COLORS.primary,
  },
});

export default Navigation;
