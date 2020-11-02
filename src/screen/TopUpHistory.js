import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../utils';
import AsyncStorage from '@react-native-community/async-storage';
import API from '../service';
import currencyFormat from '../function/currencyFormat';

const TopUpHistory = ({ navigation }) => {

    const [state, setState] = useState({
        activityLoad: true,
        refreshing: false,
    })

    const [buyer, setBuyer] = useState({})
    useEffect(() => {
        async function readItem() {
            await AsyncStorage.getItem('user').then((data) => {
                if (data) {
                    const d = JSON.parse(data)
                    setBuyer({
                        idbuyer: d.id,
                        auth: d.authkey,
                        idcabang: d.idcabang
                    });
                }
            });
        }
        readItem()
    }, [buyer.idbuyer, buyer.auth])

    const [history, setHistory] = useState([])
    useEffect(() => {
        async function fetchHistoryTopUp() {
            // console.warn('mounting')
            const data = { aksi: 135, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
            await API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        setHistory(result.FinishTopUp)
                        setState({ ...state, activityLoad: false, refreshing: false })
                    } else {
                        setHistory([])
                        setState({ ...state, activityLoad: false, refreshing: false })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    setState({ ...state, activityLoad: false, refreshing: false })
                })
        }
        fetchHistoryTopUp()

    }, [history.length, buyer.idbuyer, buyer.auth])

    async function fetchHistoryTopUp() {
        // console.warn('mounting')
        const data = { aksi: 135, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    setHistory(result.FinishTopUp)
                    setState({ ...state, activityLoad: false, refreshing: false })
                } else {
                    setHistory([])
                    setState({ ...state, activityLoad: false, refreshing: false })
                }
            })
            .catch((error) => {
                console.log(error)
                setState({ ...state, activityLoad: false, refreshing: false })
            })
    }

    useEffect(() => {
        const reRenderSomething = navigation.addListener('focus', async () => {
            fetchHistoryTopUp()
        });
        return () => {
            reRenderSomething
        }
    }, [history])


    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}
            // refreshControl={
            //     <RefreshControl
            //         //refresh control used for the Pull to Refresh
            //         refreshing={state.refreshing}
            //         onRefresh={onRefresh.bind(this)}
            //     />
            // }
            >
                <View style={styles.content}>
                    {
                        state.activityLoad ?
                            <ActivityIndicator
                                size="large"
                                animating={state.activityLoad}
                                color={colors.bgheader} />
                            :
                            history.length == 0 ?
                                <View style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 18, color: colors.text }}>History kosong</Text>
                                </View>
                                :
                                history.map((item, index) => {
                                    return (
                                        <View key={index} style={styles.topup}>
                                            <View style={styles.detailTopUp}>
                                                <Text style={{ fontSize: 15, color: colors.textGray, fontWeight: 'bold' }}>{item.NomerTopUp}</Text>
                                                <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>Balance Rp {currencyFormat(Number(item.Saldo))}</Text>
                                                <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>Created - {item.DateCreated}</Text>
                                                <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>Confirmed - {item.DateConfirmed}</Text>
                                                <Text style={{ fontSize: 15, color: 'black' }}>{item.JenisBayar}</Text>
                                                <Text style={{ fontSize: 15, color: 'black' }}>Verified By - {item.VerifiedBy}</Text>
                                                <Text style={{ fontSize: 15, color: '#009980' }}>{item.NamaStatus}</Text>
                                            </View>
                                            <View style={styles.totalTopUp}>
                                                <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>Rp {currencyFormat(Number(item.Harga))}</Text>
                                                {/* <Icon name="chat-bubble" size={25} color="#c9c9c9" style={{ marginRight: 10 }} /> */}
                                            </View>
                                        </View>
                                    )
                                })
                    }

                    {/* <View style={styles.topup}>
                        <View style={styles.detailTopUp}>
                            <Text style={{ fontSize: 15, color: colors.textGray, fontWeight: 'bold' }}>No. Transaksi TOPUP-</Text>
                            <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>Tanggal 29-05-2020</Text>
                            <Text style={{ fontSize: 15, color: 'black' }}>Transfer ke BANK BNI</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: 15, color: 'black', marginRight: 5 }}>Status Confirmed</Text>
                                <Icon name="check-circle" size={20} color="#04b52a" style={{ marginRight: 10 }} />
                            </View>
                        </View>
                        <View style={styles.totalTopUp}>
                            <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>Rp 100.000</Text>
                            <Icon name="chat-bubble" size={25} color="#c9c9c9" style={{ marginRight: 10 }} />
                        </View>
                    </View> */}
                </View>
            </ScrollView>
        </View>
    )
}

export default TopUpHistory

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor:colors.defaultBackGround
    },
    content: {
        width: '100%',
        paddingHorizontal: 5,
        paddingVertical: 5,
        marginVertical: 5,
    },
    topup: {
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
        shadowColor: "#eee",
        shadowOffset: {
            width: 5,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 7,
        marginBottom: 10,
    },
    detailTopUp: {
        width: '70%',
        justifyContent: 'space-evenly',
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    totalTopUp: {
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 7,
        paddingRight: 8,
    },
})
