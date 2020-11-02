import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import API from '../service';
import { colors } from '../utils';
import currencyFormat from '../function/currencyFormat';

const CashHistory = ({ navigation }) => {

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
        async function fetchHistory() {
            const data = { aksi: 145, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
            await API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        setHistory(result.Data)
                        setState({ ...state, activityLoad: false, refreshing: false })
                    } else {
                        setHistory([])
                        setState({ ...state, activityLoad: false, refreshing: false })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    setHistory([])
                })
        }
        fetchHistory()
    }, [history.length, buyer.idbuyer, buyer.auth])

    async function fetchHistory() {
        const data = { aksi: 145, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    setHistory(result.Data)
                    setState({ ...state, activityLoad: false, refreshing: false })
                } else {
                    setHistory([])
                    setState({ ...state, activityLoad: false, refreshing: false })
                }
            })
            .catch((error) => {
                console.log(error)
                setHistory([])
            })
    }

    useEffect(() => {
        const reRenderSomething = navigation.addListener('focus', async () => {
            fetchHistory()
        });
        return () => {
            reRenderSomething
        }
    }, [history])

    function renderHistory() {
        return history.map((item, index) => {
            return (
                <View key={item.ID} style={styles.itemTransfer}>
                    <View style={{ width: '67%', paddingVertical: 5 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.default }}>{item.ID} -
                            <Text style={{ fontSize: 18, fontWeight: '600', color: item.NamaTipe == 'IN' ? 'green' : 'red' }}> {item.NamaTipe}</Text>
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.default }}>{item.WaktuConfirm}</Text>
                        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.default }}>{item.Deskripsi}</Text>
                        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1a78b8', fontStyle: 'italic' }}>{item.NamaStatus}</Text>
                    </View>
                    <View style={{ width: '33%', justifyContent: 'center', alignItems: 'center', }}>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: item.NamaTipe == 'IN' ? 'green' : 'red' }}>{item.Jumlah == null ? 0 : 'Rp ' + currencyFormat(item.Jumlah)}</Text>
                    </View>
                </View>
            )
        })
    }


    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.listTranfer}>
                    <View style={styles.contentListTransfer}>
                        {
                            history.length == 0 ?
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    {
                                        state.activityLoad ? <ActivityIndicator
                                            size="large"
                                            animating={state.activityLoad}
                                            color={colors.bgheader} /> :
                                            <View style={{ alignItems: 'center', width: '100%' }}>
                                                <Text style={{ fontSize: 18, color: colors.text }}>Transaksi kosong</Text>
                                            </View>
                                    }
                                </View> :
                                renderHistory()
                        }
                        {/* <View style={styles.itemTransfer}>
                            <Text>ID#1001</Text>
                            <Text>ID#1001</Text>
                        </View> */}
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default CashHistory

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: colors.defaultBackGround
    },
    listTranfer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    contentListTransfer: {
        width: '96%',
        alignContent: 'center'
    },
    itemTransfer: {
        width: '100%',
        backgroundColor: 'white',
        justifyContent: 'center',
        borderRadius: 4,
        paddingHorizontal: 10,
        marginBottom: 10,
        shadowColor: "#eee",
        shadowOffset: {
            width: 5,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 7,
        paddingVertical: 5,
        flexDirection: 'row'
    },
})