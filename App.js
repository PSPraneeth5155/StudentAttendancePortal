import React, { useState, useMemo } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import DashboardTab from "./tabs/DashboardTab";
import MarkAttendanceTab from "./tabs/MarkAttendanceTab";
import StudentsTab from "./tabs/StudentsTab";
import RecordsTab from "./tabs/RecordsTab";
import SettingsTab from "./tabs/SettingsTab";
import { ThemeContext } from "./services/theme";

const Tab = createBottomTabNavigator();

export default function App() {
  const [isDark, setIsDark] = useState(false);

  const theme = isDark ? DarkTheme : DefaultTheme;

  const themeContextValue = useMemo(
    () => ({
      isDark,
      toggleTheme: () => setIsDark((prev) => !prev),
    }),
    [isDark]
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <NavigationContainer theme={theme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: true,
            tabBarActiveTintColor: "#2563eb",
            tabBarInactiveTintColor: "gray",
            tabBarStyle: { paddingBottom: 4, height: 60 },
            tabBarIcon: ({ color, size }) => {
              let iconName = "home";

              if (route.name === "Dashboard") iconName = "speedometer-outline";
              if (route.name === "Mark") iconName = "checkmark-done-circle-outline";
              if (route.name === "Students") iconName = "people-outline";
              if (route.name === "Records") iconName = "list-outline";
              if (route.name === "Settings") iconName = "settings-outline";

              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardTab} />
          <Tab.Screen
            name="Mark"
            component={MarkAttendanceTab}
            options={{ title: "Mark Attendance" }}
          />
          <Tab.Screen name="Students" component={StudentsTab} />
          <Tab.Screen
            name="Records"
            component={RecordsTab}
            options={{ title: "Attendance Records" }}
          />
          <Tab.Screen name="Settings" component={SettingsTab} />
        </Tab.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}
