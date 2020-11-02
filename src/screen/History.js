import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, RefreshControl, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import currencyFormat from '../function/currencyFormat';
import AsyncStorage from '@react-native-community/async-storage';
import { colors } from '../utils';
import API from '../service';

const History = ({ route, navigation }) => {
    const [state, setState] = useState({
        activityLoad: true,
        refreshing: false,
    })

    const [buyer, setBuyer] = useState({})
    useEffect(() => {
        async function readItem() {
            // console.warn('user')
            await AsyncStorage.getItem('user').then((data) => {
                if (data) {
                    const d = JSON.parse(data)
                    // console.log(d)
                    setBuyer({
                        idbuyer: d.id,
                        auth: d.authkey,
                        idcabang: d.idcabang
                    });
                }
            });
        }

        readItem()

    }, [buyer])

    const [history, setHistory] = useState([])
    useEffect(() => {
        function fetchHistory() {
            const data = { aksi: 130, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang }
            API.Fetch(data)
                .then((result) => {
                    if (result.ErrorCode == '0') {
                        setState({
                            ...state,
                            activityLoad: false,
                            refreshing: false
                        })
                        setHistory(result.History)
                    } else if (result.ErrorCode == '2.1') {
                        navigation.replace('Login')
                    } else {
                        setState({
                            ...state,
                            activityLoad: false,
                            refreshing: false
                        })
                        setHistory([])
                    }
                })
                .catch((error) => {
                    console.log(error)
                    setState({
                        ...state,
                        activityLoad: false,
                        refreshing: false
                    })
                })
        }
        fetchHistory()
    }, [buyer.idcabang]);

    useEffect(() => {
        const reRenderSomething = navigation.addListener('focus', async () => {
            fetchHistory()
        });
        return () => {
            reRenderSomething
        }
    }, [history, buyer.idbuyer, buyer.idcabang,])

    function fetchHistory() {
        // console.warn('mounting')
        const data = { aksi: 130, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang }
        API.Fetch(data)
            .then((result) => {
                if (result.ErrorCode == '0') {
                    setState({
                        ...state,
                        activityLoad: false,
                        refreshing: false
                    })
                    setHistory(result.History)
                } else if (result.ErrorCode == '2.1') {
                    navigation.replace('Login')
                } else {
                    setState({
                        ...state,
                        activityLoad: false,
                        refreshing: false
                    })
                    setHistory([])
                }
            })
            .catch((error) => {
                console.log(error)
                setState({
                    ...state,
                    activityLoad: false,
                    refreshing: false
                })
            })
    }

    function onRefresh() {
        fetchHistory()
    }

    const detailTransaksi = (id) => {
        navigation.navigate('Invoice', { idorder: id });
    }

    function renderHistory() {
        return history.map((item, index) => {
            return (
                <View key={index} style={styles.detail}>
                    <TouchableOpacity style={styles.infoOrder}
                        onPress={() => detailTransaksi(item.IDOrders)}
                    >
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: 'gray' }}>{item.OrdersNumber}</Text>
                            <Text style={{ color: '#1a78b8', marginLeft: 5, }}>({item.OrdersStatusDesc})</Text>
                        </View>
                        <Text style={{ color: 'black', fontWeight: 'bold' }}>{item.DateCreated}</Text>
                        <Text style={{ color: 'gray' }}>{item.JumlahItem} Item</Text>
                        <Text style={{ color: colors.default, marginRight: 5, }}>{item.PaymentTypeDesc}</Text>
                    </TouchableOpacity>

                    <View style={styles.infoTot}>
                        <Text style={styles.txtTotal}>Rp {currencyFormat(item.Total)}</Text>
                    </View>
                </View>
            )
        })
    }

    return (
        <View style={styles.container}>
            <View style={styles.contentItem}>
                {history.length == 0 ?
                    <View style={styles.activityEmpty}>
                        {
                            state.activityLoad ? <ActivityIndicator
                                size="large"
                                animating={state.activityLoad}
                                color={colors.bgheader} /> :
                                <Text style={{ fontSize: 18, color: colors.text }}>History kosong</Text>
                        }
                    </View>
                    :
                    <ScrollView showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                //refresh control used for the Pull to Refresh
                                refreshing={state.refreshing}
                                onRefresh={onRefresh.bind(this)}
                            />
                        }
                    >
                        <View style={styles.contentDetail}>
                            {
                                renderHistory()
                            }
                        </View>
                    </ScrollView>
                }
            </View>
        </View>
    )
}

export default History;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
    },
    contentDetail: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingBottom: 10,
    },
    detail: {
        height: 110,
        width: '98%',
        backgroundColor: 'white',
        borderRadius: 5,
        marginVertical: 5,
        shadowColor: "#eee",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 7,
        flexDirection: 'row',
        paddingVertical: 4,
    },
    infoOrder: {
        flex: 2,
        height: '100%',
        justifyContent: 'space-evenly',
        paddingLeft: 10,
    },
    infoTot: {
        flex: 1,
        height: '100%',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingVertical: 7,
        paddingRight: 8,
    },
    txtTotal: {
        fontWeight: 'bold',
        fontSize: 15,
        color: colors.default
    },
    contentItem: {
        height: '100%',
        width: '100%',
        justifyContent: 'flex-start',
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    activityEmpty: {
        justifyContent: 'center',
        alignItems: 'center'
    }
})