import React, { useState, useEffect, useRef } from 'react';
import { BackHandler, Alert } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import BadgeActivity from '../content/BadgeActivity';
import AsyncStorage from '@react-native-community/async-storage';
import IconFavorit from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
// import OneSignal from 'react-native-onesignal';

// Import Halaman
import Home from './Home';
import Account from './Account';
import About from './About';
import ActivityTabs from './ActivityTabs';
import Favorite from './Favorite';

// Import fungsi
import API from '../service';
import { colors } from '../utils';

const Tab = createMaterialBottomTabNavigator();

function inputPersist() {
    const [value, setValue] = useState({
        idbuyer: '',
        auth: '',
        idcabang: ''
    });

    function readItem() {
        AsyncStorage.getItem('user').then((data) => {
            if (data) {
                const d = JSON.parse(data)
                setValue({
                    ...value,
                    idbuyer: d.id,
                    auth: d.authkey,
                    IsActive: d.IsActive,
                    IsLogin: d.IsLogin,
                    idcabang: d.idcabang,
                    kodecabang: d.kodecabang
                });
            }
        });
    }

    useEffect(readItem, []);

    return ({
        idbuyer: value.idbuyer,
        auth: value.auth,
        idcabang: value.idcabang
    });
}

const BottomTabs = ({ route, navigation }) => {
    const [value, onChangeInitial] = useState({
        initial: route.params.initialRoute,
        qtyactivity: ''
    });


    const [buyer, setBuyer] = useState({})
    useEffect(() => {
        async function getUser() {
            // console.warn('user')
            await AsyncStorage.getItem('user').then((data) => {
                if (data) {
                    const d = JSON.parse(data)
                    // console.log(d)
                    setBuyer({
                        idbuyer: d.id,
                        auth: d.authkey,
                        IsActive: d.IsActive,
                        IsLogin: d.IsLogin,
                        idcabang: d.idcabang,
                    });
                }
            });
        }
        getUser()
    }, [qtyactivity, buyer.idcabang])

    async function getUser() {
        await AsyncStorage.getItem('user').then((data) => {
            if (data) {
                const d = JSON.parse(data)
                // console.log(d)
                setBuyer({
                    idbuyer: d.id,
                    auth: d.authkey,
                    IsActive: d.IsActive,
                    IsLogin: d.IsLogin,
                    idcabang: d.idcabang,
                });
            }
        });
    }

    useEffect(() => {
        const reRenderSomething = navigation.addListener('focus', async () => {
            fetchOrder()
        });
        return () => {
            reRenderSomething
        }
    }, [qtyactivity])


    const [qtyactivity, setQtyActivity] = useState(0)
    useEffect(() => {
        async function fetchOrder() {
            // console.warn('qty')
            const data = { aksi: 105, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang }
            await API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    setQtyActivity(result.JumlahActivity);
                })
                .catch((error) => {
                    console.log(error)
                })
        }

        fetchOrder()

    }, [qtyactivity, buyer.idcabang])


    useEffect(() => {
        check()
    });


    // const name = inputPersist();

    const isFocused = useIsFocused();

    const check = () => {
        isFocused ? getUser() : null;
        // isFocused ? fetchOrder() : null;
    }

    function fetchOrder() {
        // console.warn('mounting qtyactivity')
        const data = { aksi: 105, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang }
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
                setQtyActivity(result.JumlahActivity);
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const handleBackButtonClick = () => {
        Alert.alert(
            'Exit BreweryID',
            'Do you want to exit?',
            [
                { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Yes', onPress: () => BackHandler.exitApp() },
            ],
            { cancelable: false });
        return true;
    }

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    }, []);


    // useEffect(() => {
    //     OneSignal.addEventListener('received', onReceived.bind(this));
    //     return () => {
    //         OneSignal.removeEventListener('received', onReceived());
    //     }
    // }, [qtyactivity])

    // function onReceived(notification) {
    //     // console.log("Notification received: ", notification);
    //     fetchOrder()
    // }

    return (
        <Tab.Navigator
            initialRouteName={value.initial}
            activeColor={colors.bgheader}
            barStyle={{ backgroundColor: 'white' }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: 'home',
                    inactiveColor: "#1e1e1e",

                }}
            />
            <Tab.Screen
                name="Pesanan"
                component={ActivityTabs}
                options={{
                    tabBarIcon: ({ focused }) =>
                        qtyactivity == 0 ?
                            <Icon name="calendar" size={22} color={focused ? colors.bgheader : 'gray'} /> :
                            <BadgeActivity qty={qtyactivity} active={focused} icon="calendar" />,
                    activeTintColor: '#935C00',
                    inactiveTintColor: '#1e1e1e',
                }}
            />
            <Tab.Screen
                name="Account"
                component={Account}
                options={{
                    tabBarIcon: 'account',
                }}
            />
            <Tab.Screen
                name="Favorite"
                component={Favorite}
                options={{
                    tabBarIcon: ({ focused }) =>
                        <IconFavorit name="favorite" size={25} color={focused ? colors.bgheader : 'gray'} />,
                }}
            />
            <Tab.Screen
                name="About"
                component={About}
                options={{
                    tabBarIcon: ({ focused }) =>
                        <IconFavorit name="info" size={25} color={focused ? colors.bgheader : 'gray'} />,
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabs;