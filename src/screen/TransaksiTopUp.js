import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconCom from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-community/async-storage';
import formatDate from '../function/monthName';
import API from '../service';
import { colors } from '../utils';
import currencyFormat from '../function/currencyFormat';

const TransaksiTopUp = ({ navigation }) => {

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

    const [transaksiTopUp, setTransaksiTopUp] = useState([])
    useEffect(() => {
        async function fetchDetailTransaksi() {
            // console.warn('mounting')
            const data = { aksi: 133, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
            await API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        setTransaksiTopUp(result.UnFinishTopUp)
                        setState({ ...state, activityLoad: false, refreshing: false })
                    } else {
                        setTransaksiTopUp([])
                        setState({ ...state, activityLoad: false, refreshing: false })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    setState({ ...state, activityLoad: false, refreshing: false })
                })
        }
        fetchDetailTransaksi()
    }, [transaksiTopUp.length, buyer.idbuyer, buyer.auth, buyer.idcabang])

    async function fetchDetailTransaksi() {
        // console.warn('mounting')
        const data = { aksi: 133, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    setTransaksiTopUp(result.UnFinishTopUp)
                    setState({ ...state, activityLoad: false, refreshing: false })
                } else {
                    setTransaksiTopUp([])
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
            fetchDetailTransaksi()
        });
        return () => {
            reRenderSomething
        }
    }, [transaksiTopUp])


    function onRefresh() {
        fetchDetailTransaksi()
    }

    const uploadBukti = (id) => {
        const { idbuyer, auth, idcabang } = buyer
        navigation.navigate('TopUpUploadBukti', { idtopup: id, idbuyer, auth, idcabang });
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        //refresh control used for the Pull to Refresh
                        refreshing={state.refreshing}
                        onRefresh={onRefresh.bind(this)}
                    />
                }
            >

                <View style={styles.content}>
                    {
                        state.activityLoad ?
                            <ActivityIndicator
                                size="large"
                                animating={state.activityLoad}
                                color={colors.bgheader} />
                            :
                            transaksiTopUp.length == 0 ?
                                <View style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 18, color: colors.text }}>Transaksi kosong</Text>
                                </View>
                                :
                                transaksiTopUp.map((item, index) => {
                                    return (
                                        <View key={index} style={styles.topup}>
                                            <View style={styles.detailTopUp}>
                                                <Text style={{ fontSize: 15, color: colors.textGray, fontWeight: 'bold' }}>{item.NomerTopUp}</Text>
                                                <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>Balance Rp {currencyFormat(Number(item.Saldo))}</Text>
                                                <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>{item.DateCreated}</Text>
                                                <Text style={{ fontSize: 15, color: 'black' }}>{item.JenisBayar}</Text>
                                                <Text style={{ fontSize: 15, color: item.Status == 0 ? '#f5a207' : '#009980' }}>{item.NamaStatus}</Text>
                                                <View style={{ flexDirection: 'row' }}>
                                                    {
                                                        item.Status == 0 ?
                                                            <TouchableOpacity
                                                                onPress={() => uploadBukti(item.ID)}
                                                            >
                                                                <View style={styles.uploadBtn}>
                                                                    <Text style={{ color: 'white', fontSize: 14 }}>Upload bukti</Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                            :
                                                            null
                                                    }

                                                </View>
                                            </View>
                                            <View style={styles.totalTopUp}>
                                                <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>Rp {currencyFormat(Number(item.Harga))}</Text>
                                                {/* <Icon name="chat-bubble" size={25} color="#c9c9c9" style={{ marginRight: 10 }} /> */}
                                            </View>
                                        </View>
                                    )
                                })
                    }

                </View>
            </ScrollView>
        </View>
    )
}

export default TransaksiTopUp

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor:colors.defaultBackGround
    },
    header: {
        height: 45,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: colors.bgheader
    },
    txtHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 5,
    },
    btnTopUp: {
        height: '100%',
        width: 70,
        backgroundColor: colors.bgheader,
        justifyContent: 'center',
        alignItems: 'center'
    },
    txtTopUp: {
        fontSize: 17,
        color: 'white'
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
    uploadBtn: {
        width: 90,
        height: 25,
        backgroundColor: colors.bgheader,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    }
});
