import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import IconAwe from 'react-native-vector-icons/MaterialIcons';
import API from '../service';
import { colors } from '../utils';
import Loader from '../LoaderAlert/Loader';
import AlertModal from '../LoaderAlert/AlertModal';
import { Picker, Icon} from "native-base";

import currencyFormat from '../function/currencyFormat'

const CashAction = () => {

    const [state, setState] = useState({
        activityLoad: true,
        refreshing: false,
        loading: false,
        AlertShow: false,
        AlertMessage: '',
        AlertStatus: true,
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

    const [pilihTransaksi, setTransaksi] = useState(0)
    const [pilihTransfer, setPilihTransfer] = useState('BCA')
    const [nomorrek, setNoRek] = useState('')
    const [namarek, setNamaRek] = useState('')
    const [nominaltransfer, setNominal] = useState('')

    const [dataCash, setDataCash] = useState({})
    useEffect(() => {
        async function fethcCash() {
            // console.warn('test')
            const data = { aksi: 141, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
            await API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        setDataCash(result)
                    } else {
                        setDataCash({})
                    }
                })
                .catch((error) => {
                    console.log(error)
                    setDataCash({})
                })
        }
        fethcCash()
    }, [dataCash.length, buyer.idbuyer, buyer.auth])

    async function fethcCash() {
        // console.warn('test')
        const data = { aksi: 141, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    setDataCash(result)
                } else {
                    setDataCash({})
                }
            })
            .catch((error) => {
                console.log(error)
                setDataCash({})
            })
    }

    const [listCashOut, setCashOut] = useState([])
    useEffect(() => {
        async function fetchCashOut() {
            const data = { aksi: 144, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
            await API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        setCashOut(result.Data)
                        setState({ ...state, activityLoad: false, refreshing: false })
                    } else {
                        setCashOut([])
                        setState({ ...state, activityLoad: false, refreshing: false })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    setCashOut([])
                })
        }
        fetchCashOut()
    }, [listCashOut.length, buyer.idbuyer, buyer.auth])

    async function fetchCashOut() {
        const data = { aksi: 144, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    setCashOut(result.Data)
                    setState({ ...state, activityLoad: false, refreshing: false })
                } else {
                    setCashOut([])
                    setState({ ...state, activityLoad: false, refreshing: false })
                }
            })
            .catch((error) => {
                console.log(error)
                setCashOut([])
            })
    }

    function stopAlert() {
        setTimeout(() => {
            setState({ ...state, AlertShow: false });
        }, 4500);
    }

    const transferAlert = () => {
        if (pilihTransaksi == 0) {
            setState({ ...state, loading: true, });
            setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Pilih transaksi', AlertStatus: false, });
            stopAlert()
        } else {
            Alert.alert(
                'Transfer Cash',
                'Apakah anda yakin untuk transfer cash?',
                [
                    { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    { text: 'Yes', onPress: () => transferCash() },
                ],
                { cancelable: false });
        }
    }

    const transferCash = async () => {
        setState({ ...state, loading: true });
        if (pilihTransaksi == 1) {
            if (nominaltransfer == '') {
                setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Input nominal transfer', AlertStatus: false, });
                stopAlert()
            } else if (nominaltransfer < dataCash.MinimalCashToSaldo) {
                setState({ ...state, loading: false, AlertShow: true, AlertMessage: `Cash Out Min. Rp ${currencyFormat(dataCash.MinimalCashToSaldo)}`, AlertStatus: false, });
                stopAlert()
            } else if (nominaltransfer > Number(dataCash.SaldoCash)) {
                setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Cash tidak cukup', AlertStatus: false, });
                stopAlert()
            } else {
                const data = {
                    aksi: 143,
                    idbuyer: buyer.idbuyer,
                    authkey: buyer.auth,
                    jumlah: nominaltransfer,
                    tipe: pilihTransaksi,
                };
                await API.Fetch(data)
                    .then((result) => {
                        console.log(result)
                        if (result.ErrorCode == '0') {
                            setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Success, Transfer Cash', AlertStatus: true, });
                            stopAlert()
                        } else {
                            setState({ ...state, loading: false, AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: false, });
                            stopAlert()
                        }
                        setNominal('')
                        setTransaksi(0)
                        fethcCash()
                    })
                    .catch((error) => {
                        console.log(error)
                        setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Error, Transfer', AlertStatus: false, });
                        stopAlert()
                    })
            }
        } else if (pilihTransaksi == 2) {
            if (nominaltransfer == '') {
                setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Input nominal transfer', AlertStatus: false, });
                stopAlert()
            } else if (nominaltransfer < dataCash.MinimalCashOut) {
                setState({ ...state, loading: false, AlertShow: true, AlertMessage: `Cash Out Min. Rp ${currencyFormat(dataCash.MinimalCashOut)}`, AlertStatus: false, });
                stopAlert()
            } else if (nominaltransfer > Number(dataCash.SaldoCash)) {
                setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Cash tidak cukup', AlertStatus: false, });
                stopAlert()
            } else {
                const data = {
                    aksi: 143,
                    idbuyer: buyer.idbuyer,
                    authkey: buyer.auth,
                    jumlah: nominaltransfer,
                    nomerrekening: nomorrek,
                    namapemilik: namarek,
                    namabank: pilihTransfer,
                    tipe: pilihTransaksi,
                };
                await API.Fetch(data)
                    .then((result) => {
                        // console.log(result)
                        if (result.ErrorCode == '0') {
                            setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Success, Transfer Cash', AlertStatus: true, });
                            stopAlert()
                        } else {
                            setState({ ...state, loading: false, AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: false, });
                            stopAlert()
                        }
                        setNominal('')
                        setNoRek('')
                        setNamaRek('')
                        setPilihTransfer('BCA')
                        setTransaksi(0)
                        fethcCash()
                        fetchCashOut()
                    })
                    .catch((error) => {
                        console.log(error)
                        setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Error, Transfer', AlertStatus: false, });
                        stopAlert()
                    })
            }
        } else {
            setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Pilih transaksi', AlertStatus: false, });
            stopAlert()
        }

    }

    function renderCashOut() {
        return listCashOut.map((item, index) => {
            return (
                <View key={item.ID} style={styles.itemTransfer}>
                    <View style={{ width: '70%', paddingVertical: 5 }}>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: colors.default }}>{item.NomerCashOut}</Text>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: colors.default }}>Created - {item.TanggalRequest}</Text>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: colors.default }}>Transfer {item.NamaBank} - {item.NamaPemilik} - {item.NomerRekening}</Text>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#1a78b8', fontStyle: 'italic' }}>{item.NamaStatus}</Text>
                    </View>
                    <View style={{ width: '30%', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.default }}>{item.Jumlah == null ? 0 : 'Rp ' + currencyFormat(item.Jumlah)}</Text>
                    </View>
                </View>
            )
        })
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.contentTransfer}>
                    <View style={styles.balance}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20 }}>BALANCE CASH Rp {dataCash.SaldoCash == null ? 0 : currencyFormat(Number(dataCash.SaldoCash))}</Text>
                    </View>
                    <View style={styles.transfer}>
                        <View style={{ marginBottom: 5, }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 17, color: colors.default, }}>PILIH TRANSAKSI</Text>
                        </View>
                        <TouchableOpacity style={[styles.pilihTransfer, dataCash.AllowCashToSaldo == 1 ? pilihTransaksi == 1 ? { backgroundColor: colors.bgheader } : null : { backgroundColor: '#757575' }]}
                            onPress={() => dataCash.AllowCashToSaldo == 1 ? setTransaksi(1) : null}
                        >
                            <Text style={[{ fontSize: 17, fontWeight: 'bold', color: colors.default }, dataCash.AllowCashToSaldo == 1 ? pilihTransaksi == 1 ? { color: 'white' } : null :{color:'white'}]}>Cash To Saldo Brewery</Text>
                        </TouchableOpacity>
                        <View style={[styles.transferOut, { marginBottom: 10 }, pilihTransaksi == 1 ? null : { display: 'none' }]}>
                            <View style={styles.catatanContent}>
                                <TextInput
                                    placeholder="Nominal Transfer"
                                    placeholderTextColor="gray"
                                    style={[styles.textInput, { height: 50 }]}
                                    multiline={false}
                                    numberOfLines={1}
                                    maxLength={30}
                                    keyboardType={'numeric'}
                                    onChangeText={text => setNominal(text)}
                                    value={nominaltransfer}
                                />
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.pilihTransfer, dataCash.AllowCashOut == 1 ? pilihTransaksi == 2 ? { backgroundColor: colors.bgheader } : null : { backgroundColor: '#757575' }]}
                            onPress={() => dataCash.AllowCashOut == 1 ? setTransaksi(2) : null}
                        >
                            <Text style={[{ fontSize: 17, fontWeight: 'bold', color: colors.default }, dataCash.AllowCashOut == 1 ? pilihTransaksi == 2 ? { color: 'white' } : null : { color: 'white' }]}>Cash Out</Text>
                        </TouchableOpacity>
                        <View style={[styles.transferOut, pilihTransaksi == 2 ? null : { display: 'none' }]}>
                            <View style={styles.catatanContent}>
                                <TextInput
                                    placeholder="Nominal Transfer"
                                    placeholderTextColor="gray"
                                    style={[styles.textInput, { height: 50 }]}
                                    multiline={false}
                                    numberOfLines={1}
                                    maxLength={30}
                                    keyboardType={'numeric'}
                                    onChangeText={text => setNominal(text)}
                                    value={nominaltransfer}
                                />
                            </View>
                            <View style={styles.catatanContent}>
                                <Picker
                                    note
                                    mode="dropdown"
                                    iosHeader="Select Bank"
                                    iosIcon={<IconAwe name="arrow-drop-down-circle" style={{ color: "#007aff", fontSize: 25 }} />}
                                    style={{ width: '98%' }}
                                    selectedValue={pilihTransfer}
                                    textStyle={{ color:colors.default }}
                                    onValueChange={(itemValue, itemIndex) =>
                                        setPilihTransfer(itemValue)
                                    }
                                >
                                    <Picker.Item label="BCA" value="BCA" />
                                    <Picker.Item label="MANDIRI" value="MANDIRI" />
                                    <Picker.Item label="BNI" value="BNI" />
                                    <Picker.Item label="CIMB NIAGA" value="CIMB NIAGA" />
                                    <Picker.Item label="BRI" value="BRI" />
                                    <Picker.Item label="OVO" value="OVO" />
                                    <Picker.Item label="GoPay" value="GoPay" />
                                    <Picker.Item label="BANK LAIN" value="BANK LAIN" />
                                </Picker>
                            </View>
                            <View style={styles.catatanContent}>
                                <TextInput
                                    placeholder={pilihTransfer == 'OVO' || pilihTransfer == 'GoPay' ? 'Nomor Account' : "Nomor Rekening"}
                                    placeholderTextColor="gray"
                                    style={[styles.textInput, { height: 50 }]}
                                    multiline={false}
                                    numberOfLines={1}
                                    maxLength={30}
                                    keyboardType={'numeric'}
                                    onChangeText={text => setNoRek(text)}
                                    value={nomorrek}
                                />
                            </View>
                            <View style={styles.catatanContent}>
                                <TextInput
                                    placeholder={pilihTransfer == 'OVO' || pilihTransfer == 'GoPay' ? 'Nama Account' : "Nama Pemilik"}
                                    placeholderTextColor="gray"
                                    style={[styles.textInput, { height: 50 }]}
                                    multiline={false}
                                    numberOfLines={1}
                                    maxLength={40}
                                    onChangeText={text => setNamaRek(text)}
                                    value={namarek}
                                />
                            </View>
                        </View>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                            <Text style={{ fontSize: 16, fontStyle: 'italic' }}>* Cash to Saldo Brewery Min. Rp {dataCash.MinimalCashToSaldo == null ? 0 : currencyFormat(dataCash.MinimalCashToSaldo)}</Text>
                            <Text style={{ fontSize: 16, fontStyle: 'italic' }}>* Cash Out Min. Rp {dataCash.MinimalCashOut == null ? 0 : currencyFormat(dataCash.MinimalCashOut)}</Text>
                        </View>
                    </View>
                    <View style={{ height: 50, width: '100%', marginVertical: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity style={styles.btnTransfer}
                            onPress={() => transferAlert()}
                        >
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>Transfer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.listTranfer}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 10, }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20 }}>LIST TRANSFER</Text>
                    </View>
                    <View style={styles.contentListTransfer}>
                        {
                            listCashOut.length == 0 ?
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
                                renderCashOut()
                        }

                        {/* <View style={styles.itemTransfer}>
                            <View style={{ width: '70%', paddingVertical: 5 }}>
                                <Text style={{ fontSize: 18, fontWeight: '900', color: colors.default }}>No. #10001</Text>
                                <Text style={{ fontSize: 18, fontWeight: '900', color: colors.default }}>Tanggal 10/08/2020</Text>
                                <Text style={{ fontSize: 18, fontWeight: '900', color: colors.default }}>Bank Mandiri</Text>
                                <Text style={{ fontSize: 18, fontWeight: '900', color: '#1a78b8', fontStyle: 'italic' }}>Proses</Text>
                            </View>
                            <View style={{ width: '30%', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.default }}>Rp 1.000.000</Text>
                            </View>
                        </View> */}
                    </View>
                </View>
            </ScrollView>
            <Loader
                loading={state.loading} />
            <AlertModal
                loading={state.AlertShow} message={state.AlertMessage} status={state.AlertStatus} />
        </View>
    )
}

export default CashAction

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: colors.defaultBackGround
    },
    contentTransfer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: colors.defaultBackGround
    },
    balance: {
        height: 30,
        width: '96%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    transfer: {
        width: '96%',
    },
    pilihTransfer: {
        width: '100%',
        height: 50,
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
    },
    transferOut: {
        alignItems: 'center'
    },
    catatanContent: {
        width: '96%',
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderBottomWidth: 0.5,
        borderBottomColor: colors.bgheader,
    },
    textInput: {
        height: 60,
        fontSize: 20,
    },
    listTranfer: {
        width: '100%',
        height: '100%',
        alignItems: 'center'
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
        flexDirection: 'row'
    },
    btnTransfer: {
        height: 40,
        width: '96%',
        backgroundColor: colors.bgheader,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
})