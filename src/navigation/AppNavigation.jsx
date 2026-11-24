import { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as SecureStore from "expo-secure-store";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CatalogStack = () =>{
        return(
            <Stack.Navigator>
                <Stack.Screen
                    name="CatalogList"
                    components={CatalogScreen}
                    opctions = {{title: 'Catalogo de Materias'}}
                />
                <Stack.Screen
                    name="Detail"
                    components={DetailScreen}
                    opctions = {{title: 'Detalle de la asignatura'}}
                />
            </Stack.Navigator>
        )
    }

    const MainTab = ({onLogout}) => {
        return(
            <Tab.Navigator>
                <Tab.Screen
                    name="Inicio"
                    components={CatalogStack}
                />
                <Tab.Screen
                    name="Perfil"
                    components={(props) => <ProfileScreen {...props} onLogout={onLogout} /> }
                />
            </Tab.Navigator>
        )
    }


const AppNavigation = () => {

    return(
        <Stack.Navigator>
            <Stack.Screen
                name="Login"
                components={LoginScreen}
            />
            <Stack.Screen
                name="Main"
                components={MainTab}
            />
        </Stack.Navigator>
    )
};

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        justifyContent
    }
})

export default AppNavigation;