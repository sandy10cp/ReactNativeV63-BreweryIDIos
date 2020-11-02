import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TransaksiTopUp from './TransaksiTopUp';
import TopUpHistory from './TopUpHistory';
import { colors } from '../utils';
import Header from './atom/Header';

const Tab = createMaterialTopTabNavigator();

const TopUpTabs = ({ navigation }) => {

    const [tophere, setTopHere] = useState(true)
    useEffect(() => {
        setTimeout(() => {
            setTopHere(false)
        }, 5000);
    }, [])


    const topUp = () => {
        navigation.navigate('TopUp');
    }

    return (
        <>
            <Header title="LIST TOP UP" />
            <View style={styles.topHere}>
                <Image source={require('../icon/TopUpHere.png')} style={{ height: 50, width: 95, display: tophere ? 'flex' : 'none' }} />
            </View>
            <View style={styles.contentBtnTopUp}>
                <TouchableOpacity
                    onPress={() => topUp()}
                >
                    <Image source={require('../icon/top-up.png')} style={{ height: 60, width: 60 }} />
                </TouchableOpacity>
            </View>
            <Tab.Navigator
                initialRouteName="New TopUp"
                tabBarOptions={{
                    activeTintColor: colors.default,
                    labelStyle: { fontSize: 12, fontWeight: 'bold' },
                    style: {
                        backgroundColor: 'white',
                    },
                }}
            >
                <Tab.Screen name="New TopUp" component={TransaksiTopUp} />
                <Tab.Screen name="History" component={TopUpHistory} />
            </Tab.Navigator>
        </>
    );
}

export default TopUpTabs

const styles = StyleSheet.create({
    contentBtnTopUp: {
        height: 60,
        width: 65,
        position: 'absolute',
        bottom: 27,
        right: 13,
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    topHere: {
        height: 60,
        width: 100,
        position: 'absolute',
        bottom: 75,
        right: 13,
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'flex-end'
    }
})