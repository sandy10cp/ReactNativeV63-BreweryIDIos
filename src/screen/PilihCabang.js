import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, ToastAndroid } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import { Checkbox } from 'react-native-paper';
import API from '../service';
import { colors } from '../utils'
import Header from './atom/Header'

const PilihCabang = ({ route, navigation }) => {

    const [state, setState] = useState({
        idbuyer: route.params.id,
        activityLoad: true,
    })

    const [kodeCabang, setKodeCabang] = useState('')
    const [pilihCabang, setPilihCabang] = useState(route.params.idcabang)

    const [buyer, setBuyer] = useState({})
    useEffect(() => {
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
                    });
                }
            });
        }
        getUser()
    }, [buyer.idbuyer, buyer.auth])

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
                    kodecabang: d.kodecabang
                });
            }
        });
    }


    const [cabang, setCabang] = useState([])
    useEffect(() => {
        async function fetchCabang() {
            const { auth, idbuyer } = buyer
            const data = { aksi: 106, idbuyer, authkey: auth }
            await API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        setCabang(result.Data)
                        setState({ ...state, activityLoad: false, })
                    } else if (result.ErrorCode == '2.1') {
                        navigation.replace('Login')
                    } else {
                        setCabang([])
                        setState({ ...state, activityLoad: false, })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }
        fetchCabang()
    }, [buyer.idbuyer, buyer.auth])

    const gantiCabang = (id, kode) => {
        setPilihCabang(id)
        setKodeCabang(kode)
    }

    const saveCabang = () => {
        const user = {
            id: buyer.idbuyer,
            IsActive: buyer.IsActive,
            IsLogin: buyer.IsLogin,
            authkey: buyer.auth,
            idcabang: pilihCabang,
            kodecabang: kodeCabang
        }
        setLocalStorage(user)
        navigation.navigate('BottomTabs', { initialRoute: 'Home' })
    }

    function setLocalStorage(data) {
        AsyncStorage.setItem('user', JSON.stringify(data))
            .then(() => {
                // ToastAndroid.showWithGravityAndOffset('Cabang Save', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                getUser()
            })
            .catch(() => {
                console.log('There was an error saving the product')
            })
    }

    function renderCabang() {
        return cabang.map((item, index) => {
            return (
                <View key={index}>
                    <TouchableOpacity style={styles.itemCabang}
                        onPress={() => gantiCabang(item.ID, item.Alias)}
                    >
                        <View style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: 30, }}>
                            <Checkbox
                                color={colors.bgheader}
                                status={pilihCabang == item.ID ? 'checked' : 'unchecked'}
                                onPress={() => { gantiCabang(item.ID, item.Alias) }}
                            />
                        </View>
                        <View style={{ paddingHorizontal: 5, width: '93%', justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center', }}>
                            <Text style={{ fontSize: 18, fontWeight:'600', marginRight: 10, }}>{item.Nama}</Text>
                            <Text style={{ fontSize: 18, fontWeight: '600', }}>({item.Alias})</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        })
    }

    return (
        <View style={styles.container}>
            <Header title="PILIH CABANG" />
            <ScrollView>
                <View style={styles.contentCabang}>
                    {cabang.length == 0 ?
                        state.activityLoad ? <ActivityIndicator
                            size="large"
                            animating={state.activityLoad}
                            color={colors.bgheader} /> :
                            <Text style={{ fontSize: 18, color: colors.text }}>Data cabang kosong</Text>
                        :
                        renderCabang()
                    }
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10, display: pilihCabang == route.params.idcabang ? 'none':null }}>
                    <TouchableOpacity style={styles.btnSetCabang}
                        onPress={() => { saveCabang() }}
                    >
                        <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Save Cabang</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

export default PilihCabang

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
    },
    contentCabang: {
        width: '100%',
        justifyContent: 'center',
        marginTop: 5,
        paddingHorizontal: 10,
    },
    itemCabang: {
        width: '100%',
        height: 60,
        backgroundColor: 'white',
        marginTop: 5,
        flexDirection: 'row',
        marginBottom: 8,
        borderRadius: 3,
        paddingHorizontal: 5,
    },
    btnSetCabang: {
        height: 35,
        width: 120,
        backgroundColor: colors.bgheader,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
