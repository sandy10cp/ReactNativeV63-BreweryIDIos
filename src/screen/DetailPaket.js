import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ToastAndroid, ScrollView, TextInput, Dimensions, BackHandler, Alert } from 'react-native';
import { colors } from '../utils';
import Icon from 'react-native-vector-icons/FontAwesome';
import API from '../service';
import { url_img_paket } from '../Url';
import currencyFormat from '../function/currencyFormat';
import serverError from '../function/serverError';
import Header from './atom/Header';
import { RNToasty } from 'react-native-toasty';

const screenWidth = Math.round(Dimensions.get('window').width);

const DetailPaket = ({ route, navigation }) => {
    const [state, setState] = useState({
        qty: '1',
        idpaket: route.params.idpaket,
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
        const data = { aksi: 137, idpaket: state.idpaket, authkey: state.auth, idbuyer: state.idbuyer, idcabang: state.idcabang };
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
                } else if (result.ErrorCode == '2.2.0') {
                    navigation.navigate('Login');
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.2.1') {
                    navigation.navigate('Login');
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.2.2') {
                    navigation.navigate('Login');
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.2.3') {
                    navigation.navigate('Login');
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.2.4') {
                    navigation.navigate('Login');
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
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

        const data = {
            aksi: 138,
            idbuyer: state.idbuyer,
            authkey: state.auth,
            idpaket: state.data.IDPaket,
            qty: state.qty,
            idcabang: state.idcabang
        }
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    RNToasty.Normal({ title: 'Add Cart', duration: 0 })
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
            })

    }

    return (
        <View style={styles.container}>
            <Header title="DETAIL PAKET" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.item}>
                        <View style={{ justifyContent: 'center', alignItems: 'flex-start', }}>
                            <Image
                                source={{ uri: url_img_paket + state.data.Gambar }}
                                style={{ height: 250, width: screenWidth, resizeMode: 'stretch' }}
                            />
                        </View>
                        <View style={{ paddingHorizontal: 10, }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 10 }}>
                                <View style={{ width: '65%', paddingRight: 10, }}>
                                    <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>{state.data.Nama}</Text>
                                </View>
                                <View style={{ width: '35%' }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'right' }}>Rp {state.data.Harga == null ? 0 : currencyFormat(Number(state.data.Harga))}</Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: 17, fontWeight: '900', color: 'black', }}>Stok {state.data.Stok}</Text>
                            {/* <Text style={{ fontSize: 17, fontWeight: '900', color: '#c90000', textDecorationLine: 'line-through', }}>Rp {state.data.HargaCoret == null ? 0 : currencyFormat(Number(state.data.HargaCoret))}</Text> */}
                        </View>
                    </View>
                </View>
                <View style={styles.contentDesc}>
                    <View style={styles.detailDesc}>
                        <View>
                            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Item</Text>
                        </View>
                        <View style={{ paddingHorizontal: 10, backgroundColor: '#d1d1d1', borderRadius: 3, paddingVertical: 5, width: '98%' }}>
                            <Text style={{ fontSize: 17, fontWeight: '600' }}>{state.data.Isi}</Text>
                        </View>
                        <View>
                            <Text style={{ fontSize: 17, fontWeight: 'bold', marginTop: 10 }}>Deskripsi</Text>
                        </View>
                        <View style={{ paddingHorizontal: 10, backgroundColor: '#d1d1d1', borderRadius: 3, paddingVertical: 5, width: '98%' }}>
                            <Text style={{ fontSize: 17, fontWeight: '600' }}>{state.data.Keterangan}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.contentQty}>
                    <View style={styles.contentBntPlusMin}>
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
                    </View>
                    <View style={styles.contentBtn}>
                        <TouchableOpacity style={[styles.btnAdd, state.data.Harga == null ? { display: 'none' } : null]}
                            onPress={state.btnActive ? addCart : null}
                        >
                            <Text style={styles.txtAdd}>ADD CART</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default DetailPaket;

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
        marginBottom: 5,
        borderRadius: 5,
        marginBottom: 5,
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
    contentQty: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingBottom: 10,
        paddingHorizontal: 10,
        marginBottom: 10

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
        width: '50%',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginRight: 5,
        backgroundColor: 'white',
        paddingRight: 10,
    },
    contentBntPlusMin: {
        width: '50%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginRight: 5,
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingLeft: 5,
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
        marginBottom: 5,
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
