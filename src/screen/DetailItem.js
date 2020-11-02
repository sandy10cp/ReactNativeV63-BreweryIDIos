import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ToastAndroid, ScrollView, TextInput, Dimensions, BackHandler, Alert } from 'react-native';
import { colors } from '../utils';
import API from '../service';
import { url_img } from '../Url';
import currencyFormat from '../function/currencyFormat';
import serverError from '../function/serverError';
import Header from './atom/Header';
import CustomToast from '../LoaderAlert/CustomToast';
import {RNToasty} from 'react-native-toasty';

const screenWidth = Math.round(Dimensions.get('window').width);

const DetailItem = ({ route, navigation }) => {
    const [state, setState] = useState({
        qty: '1',
        iditem: route.params.id,
        idcabang: route.params.idcabang,
        data: {},
        idbuyer: route.params.idbuyer,
        auth: route.params.auth,
        desc: true,
        review: false,
        btnActive: true,

    })

    const [user, setUser] = useState({})

    useEffect(() => {

        fetchItem()
        // fetchUser()
    }, []);

    useEffect(() => {
        return () => {
            state
        };
    }, []);


    async function fetchUser() {
        const key = Base64.decode(state.auth)
        const data = { aksi: 126, idbuyer: state.idbuyer }
        await API.Fetch(key, data)
            .then((result) => {
                if (result != 0) {
                    setUser(result)
                } else {
                    setUser({})
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    async function fetchItem() {
        const data = { aksi: 103, idbarang: state.iditem, authkey: state.auth, idbuyer: state.idbuyer, idcabang: state.idcabang };
        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    setState({
                        ...state,
                        data: result
                    })
                } else if (result.ErrorCode == '2.1') {
                    navigation.navigate('Login');
                }
                else {
                    setState({
                        ...state,
                        data: {}
                    })
                }

            })
            .catch((error) => {
                console.log(error)
                serverError(navigation)
            })
    }

    const plus = () => {
        const qtyn = Number(state.qty) + 1;
        setState({
            ...state,
            qty: qtyn
        })
    }

    const min = () => {
        if (state.qty > '1') {
            const qtyn = Number(state.qty) - 1;
            setState({
                ...state,
                qty: qtyn
            })
        }
    }

    const addCart = () => {
        setState({ ...state, btnActive: false })
        if (Number(state.data.Stok) < Number(state.qty)) {
            alert(`Stok barang tinggal ${state.data.Stok}`)
            setState({ ...state, btnActive: true })
        } else {
            const data = {
                aksi: 104,
                idbuyer: state.idbuyer,
                authkey: state.auth,
                idbarang: state.data.IDBarang,
                qty: state.qty,
                idcabang: state.idcabang
            }
            API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        RNToasty.Normal({title:'Add Cart', duration:0})
                        setState({ ...state, btnActive: true })
                        navigation.goBack()
                    } else {
                        alert(result.ErrorDesc)
                        setState({ ...state, btnActive: true })
                    }
                })
                .catch((error) => {
                    setState({ ...state, btnActive: true })
                    console.log(error)
                    serverError(navigation)
                })
        }

    }

    return (
        <View style={styles.container}>
            <Header title="DETAIL ITEM" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.item}>
                        <View style={{ justifyContent: 'center', alignItems: 'flex-start', }}>
                            <Image
                                source={{ uri: url_img + state.data.Gambar }}
                                style={{ height: 400, width: screenWidth, resizeMode: 'stretch' }}
                            />
                        </View>
                        <View style={{ marginLeft: 5, }}>
                            <Text style={styles.txtItem}>{state.data.Nama}</Text>
                            <Text style={[styles.txtItem, { color: 'red' }]}>Rp {state.data.Harga == null ? 0 : currencyFormat(Number(state.data.Harga))}</Text>
                            <Text style={[styles.txtItem, { color: colors.textGray }]}>Stock {state.data.Stok} {state.data.Satuan}</Text>
                        </View>
                    </View>
                    <View style={styles.contentQty}>
                        <TouchableOpacity style={styles.btnMin}
                            onPress={min}>
                            <Text style={styles.txtBtnQty}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                            textAlign={'center'}
                            style={styles.textInputQty}
                            value={state.qty.toString()}
                            keyboardType='numeric'
                            onChangeText={(value) => {
                                setState({ ...state, qty: value })
                            }}
                        />
                        <TouchableOpacity style={styles.btnPlus}
                            onPress={state.data.Stok <= state.qty ? null : plus}
                        >
                            <Text style={styles.txtBtnQty}>+</Text>
                        </TouchableOpacity>
                        <View style={styles.contentBtn}>
                            <TouchableOpacity style={[styles.btnAdd, state.data.Harga == null ? { display: 'none' } : null]}
                                onPress={state.btnActive ? addCart : null}
                            >
                                <Text style={styles.txtAdd}>ADD CART</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.contentDesc}>
                    <View style={styles.detailDesc}>
                        <View>
                            <Text style={{ fontSize: 17, fontWeight: 'bold', marginTop: 10 }}>Deskripsi</Text>
                        </View>
                        <View style={{ paddingHorizontal: 10, backgroundColor: '#d1d1d1', borderRadius: 3, paddingVertical: 5, width: '98%' }}>
                            <Text style={{ fontSize: 17, fontWeight: '600' }}>{state.data.Deskripsi}</Text>
                        </View>
                    </View>

                </View>
            </ScrollView>
            {/* <CustomToast ref="defaultToastBottom" position="bottom" /> */}
        </View>
    )
}

export default DetailItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround,
    },
    header: {
        height: 50,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgheader
    },
    txtHeader: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 5,
    },
    content: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 5,
        justifyContent: 'center',
    },
    item: {
        width: '100%',
        backgroundColor: 'white',
        paddingBottom: 5,
    },
    txtItem: {
        fontWeight: '600',
        fontSize: 18,
        color: 'black'
    },
    rate: {
        flexDirection: 'row',
        width: '90%',
        marginTop: 5,
        justifyContent: 'flex-end',
        paddingRight: 5,
        alignItems: 'center'
    },
    contentQty: {
        width: '100%',
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingBottom: 10,
        paddingRight: 10,

    },
    txtBtnQty: {
        color: 'white',
        fontSize: 20,
    },
    textInputQty: {
        height: 50,
        width: 60,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        fontSize: 25,
        backgroundColor: 'white',

    },
    btnPlus: {
        height: 30,
        width: 30,
        marginRight: 5,
        backgroundColor: colors.bgheader,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
    },
    btnMin: {
        height: 30,
        width: 30,
        backgroundColor: colors.bgheader,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
    },
    contentBtn: {
        width: '60%',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginRight: 5,
    },
    btnAdd: {
        height: 30,
        width: 130,
        backgroundColor: colors.bgheader,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    txtAdd: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    },
    contentDesc: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 5,
        marginBottom: 10,
        paddingBottom: 10,
    },
    itemDesc: {
        height: 30,
        width: '100%',
        paddingLeft: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: 'gray',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    detailDesc: {
        paddingHorizontal: 10,
        paddingTop: 5,
    }
})
