import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Activity from './Activity';
import History from './History';
import { colors } from '../utils';
import Header from './atom/Header';

const Tab = createMaterialTopTabNavigator();

const TopTabs = () => {
    return (
        <>
            <Header title="PESANAN" />
            <Tab.Navigator
                initialRouteName="New Order"
                tabBarOptions={{
                    activeTintColor: colors.default,
                    labelStyle: { fontSize: 12, fontWeight: 'bold' },
                    style: {
                        backgroundColor: 'white',
                    },
                }}
            >
                <Tab.Screen name="New Order" component={Activity} />
                <Tab.Screen name="History" component={History} />
            </Tab.Navigator>
        </>
    );
}

export default TopTabs