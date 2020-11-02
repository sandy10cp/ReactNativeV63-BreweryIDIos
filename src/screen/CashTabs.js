import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import CashAction from './CashAction';
import CashHistory from './CashHistory';
import CashChild from './CashChild';
import { colors } from '../utils';
import Header from './atom/Header';

const Tab = createMaterialTopTabNavigator();

const CashTabs = () => {

    return (
        <>
            <Header title="CASH" />
            <Tab.Navigator
                initialRouteName="Cash"
                tabBarOptions={{
                    activeTintColor: colors.default,
                    labelStyle: { fontSize: 12, fontWeight: 'bold' },
                    style: {
                        backgroundColor: 'white',
                    },
                }}
            >
                <Tab.Screen name="Cash" component={CashAction} />
                <Tab.Screen name="History" component={CashHistory} />
                <Tab.Screen name="Downline" component={CashChild} />
            </Tab.Navigator>
        </>
    );
}

export default CashTabs