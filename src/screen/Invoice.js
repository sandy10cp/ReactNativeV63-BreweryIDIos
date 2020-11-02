import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import API from '../service';
import formatDate from '../function/monthName';
import currencyFormat from '../function/currencyFormat';
import { colors } from '../utils'
import Header from './atom/Header'
import serverError from '../function/serverError';

const Invoice = ({ route, navigation }) => {

    const [state, setState] = useState({
        idorder: route.params.idorder,
        activityLoad: false
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


    const [detailTransaksi, setDetailTransaksi] = useState([])
    const [reguler, setReguler] = useState([])
    const [paket, setPaket] = useState([])
    // const [detailItem, setDetailItem] = useState([])
    useEffect(() => {
        async function fetchDetailTransaksi() {
            const data = {
                aksi: 118,
                idbuyer: buyer.idbuyer,
                authkey: buyer.auth,
                idcabang: buyer.idcabang,
                idorders: state.idorder
            };
            await API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        setDetailTransaksi(result)
                        setReguler(result.OrdersItem)
                        setPaket(result.OrdersPaket)
                        setState({ ...state, activityLoad: false })
                    } else if (result.ErrorCode == '2.1') {
                        navigation.replace('Login')
                    }
                    else {
                        setDetailTransaksi({})
                        setReguler([])
                        setPaket([])
                        setState({ ...state, activityLoad: false })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    // serverError(navigation)
                })
        }
        fetchDetailTransaksi()
    }, [buyer.idbuyer, buyer.auth, state.idorder])

    return (
        <View style={styles.container}>
            <Header title="RECEIPT" />
            {
                detailTransaksi.length == 0 ?
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <ActivityIndicator
                            size="large"
                            animating={state.activityLoad}
                            color={colors.bgheader} />
                    </View>
                    :
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.headInv}>
                            <Image source={require('../icon/brewery3.png')} style={{ width: 70, height: 70, }} />
                        </View>
                        <View style={styles.noInv}>
                            <Text>{detailTransaksi.DateCreated}</Text>
                        </View>
                        <View style={styles.pengirimPenerima}>
                            <View style={styles.pengirim}>
                                <View style={{ alignItems: 'center', backgroundColor: colors.bgheader }}>
                                    <Text style={{ color: 'white' }}>PENGIRIM</Text>
                                </View>
                                <View style={styles.detailPenerima}>
                                    <View style={{ paddingHorizontal: 2, }}>
                                        <Text style={{ fontSize: 13 }}>{detailTransaksi.SellerName}</Text>
                                    </View>
                                    {/* <View style={{ paddingHorizontal: 2, }}>
                                        <Text style={{ fontSize: 13 }}>{detailTransaksi.SellerAlamat}, {detailTransaksi.SellerKota}</Text>
                                    </View> */}
                                    <View style={{ paddingHorizontal: 2, }}>
                                        <Text style={{ fontSize: 13 }}>{detailTransaksi.SellerPhone}</Text>
                                    </View>
                                    <View style={{ paddingHorizontal: 2, }}>
                                        <Text style={{ fontSize: 13 }}>{detailTransaksi.SellerEmail}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ height: '100%', width: 1, backgroundColor: colors.defaultBackGround }} />
                            <View style={styles.penerima}>
                                <View style={{ alignItems: 'center', backgroundColor: colors.bgheader }}>
                                    <Text style={{ color: 'white' }}>PENERIMA</Text>
                                </View>
                                <View style={styles.detailPengirim}>
                                    <View style={{ paddingHorizontal: 2, }}>
                                        <Text style={{ fontSize: 13 }}>{detailTransaksi.BuyerName}</Text>
                                    </View>
                                    <View style={{ paddingHorizontal: 2, }}>
                                        <Text style={{ fontSize: 13 }}>{detailTransaksi.BuyerAlamat}, {detailTransaksi.BuyerKota}</Text>
                                    </View>
                                    <View style={{ paddingHorizontal: 2, }}>
                                        <Text style={{ fontSize: 13 }}>+62 {detailTransaksi.BuyerPhone}</Text>
                                    </View>
                                    <View style={{ paddingHorizontal: 2, }}>
                                        <Text style={{ fontSize: 13 }}>{detailTransaksi.BuyerEmail}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.contentItem}>
                            <View style={[styles.detailItem, { backgroundColor: colors.bgheader, height: 30 }]}>
                                <View style={{ width: '38%' }}>
                                    <Text numberOfLines={2} style={{ color: 'white' }}>Nama</Text>
                                </View>
                                <View style={{ width: '10%', alignItems: 'center' }}>
                                    <Text style={{ color: 'white' }}>Qty</Text>
                                </View>
                                <View style={{ width: '22%', alignItems: 'flex-end' }}>
                                    <Text style={{ color: 'white' }}>Harga</Text>
                                </View>
                                <View style={{ width: '30%', alignItems: 'flex-end' }}>
                                    <Text style={{ color: 'white' }}>Total</Text>
                                </View>
                            </View>
                            <View style={{ paddingHorizontal: 5, backgroundColor: '#d9d9d9', borderBottomWidth: 0.5, borderBottomColor: 'gray', height: 25, justifyContent: 'center', display: reguler.length == 0 ? 'none' : null }}>
                                <Text style={{ fontSize: 15, color: colors.textGray, fontWeight: 'bold' }}>REGULER</Text>
                            </View>

                            {
                                detailTransaksi.OrdersItem != null ?
                                    detailTransaksi.OrdersItem.map((item, index) => {
                                        return (
                                            <View key={index} style={styles.detailItem}>
                                                <View style={{ width: '38%' }}>
                                                    <Text>{item.Nama}</Text>
                                                </View>
                                                <View style={{ width: '10%', alignItems: 'center' }}>
                                                    <Text>{item.Qty}</Text>
                                                </View>
                                                <View style={{ width: '22%', alignItems: 'flex-end' }}>
                                                    <Text>{currencyFormat(Number(item.Harga))}</Text>
                                                </View>
                                                <View style={{ width: '30%', alignItems: 'flex-end', marginLeft: 1, }}>
                                                    <Text>{currencyFormat(Number(item.Jumlah))}</Text>
                                                </View>
                                            </View>
                                        )
                                    }) : null
                            }
                            <View style={{ paddingHorizontal: 5, backgroundColor: '#d9d9d9', borderBottomWidth: 0.5, borderBottomColor: 'gray', height: 25, justifyContent: 'center', display: paket.length == 0 ? 'none' : null }}>
                                <Text style={{ fontSize: 15, color: colors.textGray, fontWeight: 'bold' }}>PAKET</Text>
                            </View>
                            {
                                detailTransaksi.OrdersPaket != null ?
                                    detailTransaksi.OrdersPaket.map((item, index) => {
                                        return (
                                            <View key={index} style={styles.detailItem}>
                                                <View style={{ width: '38%' }}>
                                                    <Text>{item.NamaPaket}</Text>
                                                </View>
                                                <View style={{ width: '10%', alignItems: 'center' }}>
                                                    <Text>{item.Qty}</Text>
                                                </View>
                                                <View style={{ width: '22%', alignItems: 'flex-end' }}>
                                                    <Text>{currencyFormat(Number(item.Harga))}</Text>
                                                </View>
                                                <View style={{ width: '30%', alignItems: 'flex-end', marginLeft: 1, }}>
                                                    <Text>{currencyFormat(Number(item.Total))}</Text>
                                                </View>
                                            </View>
                                        )
                                    }) : null
                            }

                            {/* <View style={styles.detailItem}>
                                <View style={{ width: '33%' }}>
                                    <Text numberOfLines={1}>Nama Item</Text>
                                </View>
                                <View style={{ width: '10%', alignItems: 'center' }}>
                                    <Text>2</Text>
                                </View>
                                <View style={{ width: '15%', alignItems: 'center' }}>
                                    <Text>Pack</Text>
                                </View>
                                <View style={{ width: '17%', alignItems: 'flex-end' }}>
                                    <Text>65,000</Text>
                                </View>
                                <View style={{ width: '25%', alignItems: 'flex-end', marginLeft: 1, }}>
                                    <Text>100.000.000</Text>
                                </View>
                            </View> */}

                        </View>
                        <View style={styles.catatan}>
                            <View style={{ backgroundColor: colors.bgheader, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'white' }}>CATATAN</Text>
                            </View>
                            <View style={{ paddingHorizontal: 2, }}>
                                <Text>{detailTransaksi.Note}</Text>
                            </View>
                        </View>
                        <View style={styles.total}>
                            <View style={styles.totalHead}>
                                <Text style={{ color: 'white' }}>TOTAL</Text>
                            </View>
                            <View style={{ paddingHorizontal: 2, }}>
                                <View style={styles.totalDetail}>
                                    <Text style={{ fontSize: 15 }}>Sub Total</Text>
                                    <Text style={{ fontSize: 15 }}>Rp {detailTransaksi.Jumlah == null ? 0 : currencyFormat(Number(detailTransaksi.Jumlah))}</Text>
                                </View>
                                <View style={styles.totalDetail}>
                                    <Text style={{ fontSize: 15 }}>Discount</Text>
                                    <Text style={{ fontSize: 15 }}>Rp {detailTransaksi.Diskon == null ? 0 : currencyFormat(Number(detailTransaksi.Diskon))}</Text>
                                </View>
                                <View style={styles.totalDetail}>
                                    <Text style={{ fontSize: 15 }}>Tax</Text>
                                    <Text style={{ fontSize: 15 }}>Rp {detailTransaksi.Tax == null ? 0 : currencyFormat(Number(detailTransaksi.Tax))}</Text>
                                </View>
                                <View style={styles.totalDetail}>
                                    <Text style={{ fontSize: 15 }}>Ongkos Kirim</Text>
                                    <Text style={{ fontSize: 15 }}>Rp {detailTransaksi.Ongkir == null ? 0 : currencyFormat(Number(detailTransaksi.Ongkir))}</Text>
                                </View>
                                <View style={styles.totalDetail}>
                                    <Text style={{ fontSize: 15 }}>Grand Total</Text>
                                    <Text style={{ fontSize: 15 }}>Rp {detailTransaksi.Total == null ? 0 : currencyFormat(Number(detailTransaksi.Total))}</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
            }
        </View>
    )
}

export default Invoice

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        color: colors.defaultBackGround,
    },
    headInv: {
        height: 80,
        width: '100%',
    },
    noInv: {
        height: 25,
        width: '100%',
        alignItems: 'flex-end',
        paddingHorizontal: 5,
    },
    pengirimPenerima: {
        width: '100%',
        flexDirection: 'row',
    },
    pengirim: {
        height: '100%',
        flex: 1,
        backgroundColor: 'white',
        borderColor: 'gray',
        borderWidth: 0.5,
        paddingBottom: 3,
    },
    penerima: {
        height: '100%',
        flex: 1,
        backgroundColor: 'white',
        borderColor: 'gray',
        borderWidth: 0.5,
        paddingBottom: 3,
    },
    detailPenerima: {
        paddingHorizontal: 2,
    },
    detailPengirim: {
        paddingHorizontal: 2,
        alignItems: 'flex-end'
    },
    contentItem: {
        width: '100%',
        backgroundColor: 'gray',
        marginTop: 2,
    },
    detailItem: {
        width: '100%',
        height: 40,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
        paddingHorizontal: 3,
    },
    catatan: {
        height: 55,
        width: '100%',
        marginTop: 2,
        borderColor: 'gray',
        borderWidth: 0.5
    },
    total: {
        width: '100%',
        marginTop: 2,
        borderColor: 'gray',
        borderWidth: 0.5,
        marginBottom: 10,
    },
    totalHead: {
        width: '100%',
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgheader
    },
    totalDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 25,
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5
    }
})
