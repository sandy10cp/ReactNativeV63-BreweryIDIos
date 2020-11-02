import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, Image, Linking } from 'react-native'
import { colors } from '../utils'
import AsyncStorage from '@react-native-community/async-storage';
import API from '../service';
import { url_img_avatar } from '../Url/index'
import { TouchableOpacity } from 'react-native-gesture-handler';

const CashChild = ({ navigation }) => {

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

    const [child, setChild] = useState([])

    useEffect(() => {
        async function fethChild() {
            const data = { aksi: 146, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
            await API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        setChild(result.Data)
                        setState({ ...state, activityLoad: false, refreshing: false })
                    } else {
                        setChild([])
                        setState({ ...state, activityLoad: false, refreshing: false })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    setChild([])
                })
        }
        fethChild()
    }, [child.length, buyer.idbuyer, buyer.auth])

    async function fethChild() {
        const data = { aksi: 146, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    setChild(result.Data)
                    setState({ ...state, activityLoad: false, refreshing: false })
                } else {
                    setChild([])
                    setState({ ...state, activityLoad: false, refreshing: false })
                }
            })
            .catch((error) => {
                console.log(error)
                setChild([])
            })
    }

    const whatsApp = (phone) => {
        const waurl = `whatsapp://send?text=&phone=${phone}`;

        Linking.openURL(waurl).then((data) => {
            // console.log('WhatsApA Opened');
        }).catch(() => {
            alert('Pastikan anda telah menginstall aplikasi WhatsApp');
        });
    }

    useEffect(() => {
        const reRenderSomething = navigation.addListener('focus', async () => {
            fethChild()
        });
        return () => {
            reRenderSomething
        }
    }, [child])

    function renderChild() {
        return child.map((item, index) => {
            return (
                <View key={index} style={styles.itemChild}>
                    <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={{ uri: url_img_avatar + item.avatar }} style={{ width: 73, height: 73, resizeMode: 'stretch', borderRadius:73/2 }} />
                    </View>
                    <View style={{ width: '80%', paddingHorizontal: 5, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: colors.default }}>{item.Nama}</Text>
                        <TouchableOpacity
                            onPress={() => whatsApp(item.Phone)}
                        >
                            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.bgheader, textDecorationLine: 'underline' }}>{item.Phone}</Text>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.default, }}>{item.Email}</Text>
                    </View>
                </View>
            )
        })
    }
    return (
        <View style={styles.container}>
            <View style={{ justifyContent: 'center', alignItems: 'center', height: 40, }}>
                <Text style={{ fontWeight: 'bold', fontSize: 22, }}>LIST DOWNLINE</Text>
            </View>
            <ScrollView>
                <View style={styles.listChild}>
                    <View style={styles.contentChild}>
                        {
                            child.length == 0 ?
                                <View style={{ justifyContent: 'center' }}>
                                    {
                                        state.activityLoad ? <ActivityIndicator
                                            size="large"
                                            animating={state.activityLoad}
                                            color={colors.bgheader} /> :
                                            <View style={{ justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 18, color: colors.text }}>Downline kosong</Text>
                                            </View>
                                    }
                                </View> :
                                renderChild()
                        }
                        {/* <View style={styles.itemChild}>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: colors.default }}>Nama</Text>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: colors.default }}>Phone</Text>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: colors.default }}>Email</Text>
                        </View> */}
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default CashChild

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: colors.defaultBackGround
    },
    listChild: {
        width: '100%',
        height: '100%',
        alignItems: 'center'
    },
    contentChild: {
        width: '96%',
        alignItems: 'center',
        paddingVertical: 5,
        justifyContent: 'center'
    },
    itemChild: {
        width: '100%',
        height: 90,
        backgroundColor: 'white',
        justifyContent: 'center',
        borderRadius: 4,
        paddingHorizontal: 5,
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
})