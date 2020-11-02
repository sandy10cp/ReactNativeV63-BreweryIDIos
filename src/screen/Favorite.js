import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView, ActivityIndicator, RefreshControl, ToastAndroid } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import API from '../service';
import { colors } from '../utils'
import Header from './atom/Header'
import currencyFormat from '../function/currencyFormat';
import { url_img } from '../Url';
import serverError from '../function/serverError';

const screenWidth = Math.round(Dimensions.get('window').width);


const Favorite = ({ navigation }) => {

    const [state, setState] = useState({
        activityLoad: true,
        refreshing: false,
    })

    const [buyer, setBuyer] = useState({})
    const [idcabang, setIdCabang] = useState(0)
    useEffect(() => {
        async function readItem() {
            // console.warn('user')
            await AsyncStorage.getItem('user').then((data) => {
                if (data) {
                    const d = JSON.parse(data)
                    // console.log(d)
                    setIdCabang(d.idcabang)
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


    const [favorite, setFavorite] = useState([])
    useEffect(() => {

        async function fetchFavorite() {
            // console.warn('mounting')
            const data = { aksi: 121, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
            await API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        setFavorite(result.FavouriteList)
                        setState({ ...state, activityLoad: false, refreshing: false })
                    }
                    else if (result.ErrorCode == '2.1') {
                        navigation.replace('Login')
                    }
                    else {
                        setFavorite([])
                        setState({ ...state, activityLoad: false, refreshing: false })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    serverError(navigation)
                })
        }

        fetchFavorite()

    }, [favorite])

    async function fetchFavorite() {
        const data = { aksi: 121, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
        await API.Fetch(data)
            .then((result) => {
                console.log(result)
                if (result.ErrorCode == '0') {
                    setFavorite(result.FavouriteList)
                    setState({ ...state, activityLoad: false, refreshing: false })
                }
                else if (result.ErrorCode == '2.1') {
                    navigation.replace('Login')
                }
                else {
                    setFavorite([])
                    setState({ ...state, activityLoad: false, refreshing: false })
                }
            })
            .catch((error) => {
                console.log(error)
                serverError(navigation)
            })
    }

    const detailItem = (id) => {
        navigation.navigate('DetailItem', { id, idbuyer: buyer.idbuyer, auth: buyer.auth, idcabang: buyer.idcabang })
    }


    function onRefresh() {
        fetchFavorite()
    }

    const deleteFavorite = (id) => {
        const data = { aksi: 120, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang, mode: 2, idbarang: id }
        API.Fetch(data)
            .then((result) => {
                if (result.ErrorCode == '0') {
                    fetchFavorite()
                    ToastAndroid.showWithGravityAndOffset('Delete Favorite', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                } else {
                    ToastAndroid.showWithGravityAndOffset('Gagal Delete', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                }
            })
            .catch((error) => {
                console.log(error)
                serverError(navigation)
            })
    }


    function renderFavorite() {
        return favorite.map((item, index) => {
            return (
                <View key={index} style={styles.contentItem}>
                    <TouchableOpacity style={styles.deleteIcon}
                        onPress={() => deleteFavorite(item.IDBarang)}
                    >
                        <Icon name="delete-forever" size={35} color="#c7c7c7" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => detailItem(item.IDBarang)}
                        style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ height: 200, width: '100%', }}>
                            <Image source={{ uri: url_img + item.Gambar }} style={{ height: '100%', width: '100%', resizeMode: 'stretch' }} />
                        </View>
                    </TouchableOpacity>
                    <View style={{ marginLeft: 5, marginTop: 3, }}>
                        <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '900', color: 'black' }}>{item.Nama}</Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#c90000' }}>Rp {currencyFormat(item.Harga)}</Text>
                        {/* <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textGray }}>1 {item.kodesatuan}</Text> */}
                    </View>
                </View>
            )
        })
    }

    return (
        <View style={styles.container}>
            <Header title="FAVORITE" />
            <ScrollView style={{ marginTop: 1 }} showsVerticalScrollIndicator={false}
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
                        favorite.length == 0 ?
                            <View style={styles.activityEmpty}>
                                {
                                    state.activityLoad ? <ActivityIndicator
                                        size="large"
                                        animating={state.activityLoad}
                                        color={colors.bgheader} /> :
                                        <Text style={{ fontSize: 18, color: colors.text }}>Favorite kosong</Text>
                                }
                            </View> :
                            renderFavorite()
                    }
                </View>
            </ScrollView>
        </View>
    )
}

export default Favorite

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
    },
    content: {
        height: '100%',
        marginVertical: 2,
        alignItems: 'flex-start',
        justifyContent: 'space-evenly',
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    contentItem: {
        height: 285,
        width: screenWidth / 2 - 15,
        borderRadius: 4,
        backgroundColor: '#fafafa',
        marginTop: 8,
        shadowColor: "#eee",
        shadowOffset: {
            width: 5,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 7,
        paddingBottom: 6,
        marginRight: 5,
    },
    deleteIcon: {
        position: 'absolute',
        top: 3,
        left: '81%',
        zIndex: 99999
    },
    txtNotAvailable: {
        color: 'red',
        fontSize: 12,
    },

})
