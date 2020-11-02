import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { colors } from '../utils';
import API from '../service';
import { url_img, url_img_paket } from '../Url';
import Header from './atom/Header';
import CustomToast from '../LoaderAlert/CustomToast';

const screenHeight = Math.round(Dimensions.get('window').height);

function currencyFormat(num) {
    return num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
}

export default class Cart extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            alamat: true,
            idcabang: '',
            cart: {},
            itemCart: [],
            idbuyer: '',
            auth: '',
            totalbelanja: 0,
            btnDeleteActive: false,
            checkedAll: true,
            totchek: 0,
            activityLoad: true,
            paket: [],
            checkPaket: false,
            datauser: {}
        };

        this._isMounted = false;

    }

    async componentDidMount() {
        this._isMounted = true;
        await AsyncStorage.getItem('user', (error, result) => {
            const d = JSON.parse(result)
            // console.log(d)
            this.setState({
                idbuyer: d.id,
                auth: d.authkey,
                IsActive: d.IsActive,
                IsLogin: d.IsLogin,
                idcabang: d.idcabang,
                kodecabang: d.kodecabang
            })
        });

        this._isMounted && this.fetchCart()

        this.reRenderSomething = this.props.navigation.addListener('focus', async () => {
            this.fetchCart()
        });

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.itemCart.length != this.state.itemCart.length) {
            this.fetchCart()
        }
    }


    componentWillUnmount() {
        this._isMounted = false;
        this.reRenderSomething;
    }

    async fetchUser() {
        // console.warn('mounting')
        const { auth, idbuyer, idcabang } = this.state
        const data = { aksi: 105, idbuyer, authkey: auth, idcabang: idcabang }
        await API.Fetch(data)
            .then((result) => {
                console.log(result)
                if (result.ErrorCode == '0') {
                    this.setState({ badgeShow: true, datauser: result, cabang: result.AliasCabang })
                }
                else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                }
                else {
                    this.setState({ datauser: {} })
                }

                if (result.JumlahCartItem == 0) {
                    this.setState({ badgeShow: false })
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    async fetchAlamat() {
        const key = Base64.decode(this.state.auth)
        const data = { aksi: 123, idbuyer: this.state.idbuyer }
        await API.Fetch(key, data)
            .then((result) => {
                // console.log(result)
                if (result != 0) {
                    if (this._isMounted) {
                        this.setState({ alamat: false })
                    }
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    async plus(idcart, qty) {
        let plusqty = Number(qty) + 1
        const data = { aksi: 108, qty: plusqty, idcartitem: idcart, idbuyer: this.state.idbuyer, authkey: this.state.auth }
        await API.Fetch(data)
            .then((result) => {
                if (result.ErrorCode == '0') {
                    this.fetchCart()
                }
                else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                }
                else {
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                    this.fetchCart()
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    async min(idcart, qty) {
        let minqty = Number(qty) - 1
        const data = { aksi: 108, qty: minqty, idcartitem: idcart, idbuyer: this.state.idbuyer, authkey: this.state.auth }
        if (qty != 1) {
            await API.Fetch(data)
                .then((result) => {
                    if (result.ErrorCode == '0') {
                        this.fetchCart()
                    }
                    else if (result.ErrorCode == '2.1') {
                        this.props.navigation.replace('Login')
                        this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                    }
                    else {
                        this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }

    }

    async plusPaket(idpaket, qty) {
        let plusqty = Number(qty) + 1
        const data = { aksi: 139, qty: plusqty, idcartpaket: idpaket, idbuyer: this.state.idbuyer, authkey: this.state.auth }
        await API.Fetch(data)
            .then((result) => {
                if (this._isMounted) {
                    if (result.ErrorCode == '0') {
                        this.fetchCart()
                    }
                    else if (result.ErrorCode == '2.1') {
                        this.props.navigation.replace('Login')
                        this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                    }
                    else {
                        this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                        this.fetchCart()
                    }
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    async minPaket(idpaket, qty) {
        let minqty = Number(qty) - 1
        const data = { aksi: 139, qty: minqty, idcartpaket: idpaket, idbuyer: this.state.idbuyer, authkey: this.state.auth }
        if (qty != 1) {
            await API.Fetch(data)
                .then((result) => {
                    if (this._isMounted) {
                        if (result.ErrorCode == '0') {
                            this.fetchCart()
                        }
                        else if (result.ErrorCode == '2.1') {
                            this.props.navigation.replace('Login')
                        }
                        else {
                            this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                        }
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }

    }

    checkOut = () => {
        if (this.state.alamat) {
            this.props.navigation.navigate('CekAlamat')
        } else {
            this.props.navigation.navigate('DetailOrder')
        }
        this._isMounted = false;
    }


    async fetchCart() {
        // console.warn('cart')
        const data = { aksi: 107, idbuyer: this.state.idbuyer, authkey: this.state.auth, idcabang: this.state.idcabang };
        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    if (result.CartItem.length == 0 && result.CartPaket.length == 0) {
                        this.setState({ itemCart: [], paket: [], cart: {}, activityLoad: false })
                    } else {
                        this.setState({ itemCart: result.CartItem, paket: result.CartPaket, cart: result, activityLoad: false })
                    }
                } else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                } else if (result.ErrorCode == '2.2.0') {
                    this.props.navigation.replace('Login')
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                } else if (result.ErrorCode == '2.2.1') {
                    this.props.navigation.replace('Login')
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                } else if (result.ErrorCode == '2.2.2') {
                    this.props.navigation.replace('Login')
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                } else if (result.ErrorCode == '2.2.3') {
                    this.props.navigation.replace('Login')
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                } else if (result.ErrorCode == '2.2.4') {
                    this.props.navigation.replace('Login')
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                }
                else {
                    this.setState({ itemCart: [], cart: {}, activityLoad: false })
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }


    async deleteBarang(id) {
        const data = { aksi: 109, idcartitem: id, idbuyer: this.state.idbuyer, authkey: this.state.auth }
        await API.Fetch(data)
            .then((result) => {
                if (result.ErrorCode == '0') {
                    this.fetchCart()
                    this.refs.defaultToastBottom.ShowToastFunction('Delete Item');
                }
                else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                }
                else {
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    async deletePaket(id) {
        const data = { aksi: 140, idcartpaket: id, idbuyer: this.state.idbuyer, authkey: this.state.auth }
        await API.Fetch(data)
            .then((result) => {
                if (result.ErrorCode == '0') {
                    this.fetchCart()
                    this.refs.defaultToastBottom.ShowToastFunction('Delete Item');
                }
                else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                }
                else {
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    selectItem = async (id, select) => {

        let check = '';
        if (select == 'true') {
            check = 'false';
            this.setState({ totchek: this.state.totchek - 1 })
        } else {
            check = 'true';
            this.setState({ totchek: this.state.totchek + 1 })
        }
        const key = Base64.decode(this.state.auth)
        const data = { aksi: 128, idcart: id, check }
        await API.Fetch(key, data)
            .then((result) => {
                if (result == 1) {
                    this.fetchCart()
                }
            })
            .catch((error) => {
                console.log(error)
            })

        if (this.state.totchek == 0) {
            this.setState({ checkedAll: true })
        } else {
            this.setState({ checkedAll: false })
        }

    }

    selectAllItem = async (idsupplier) => {
        const { checkedAll, idbuyer, auth } = this.state
        let check = '';
        if (checkedAll) {
            check = 'false';
            this.setState({ checkedAll: false })
        } else {
            check = 'true';
            this.setState({ checkedAll: true })
        }
        const key = Base64.decode(auth)
        const data = { aksi: 129, idsupplier, idbuyer, check }
        await API.Fetch(key, data)
            .then((result) => {
                // console.log(result)
                if (result == 1) {
                    this.fetchCart()
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    selectPaket = async (id) => {
        const { checkPaket, idbuyer, auth } = this.state
        let check = '';
        if (checkPaket) {
            check = 'false';
            this.setState({ checkPaket: false })
        } else {
            check = 'true';
            this.setState({ checkPaket: true })
        }
        const key = Base64.decode(auth)
        const data = { aksi: 1290, idbuyer, check, idpaket: id }
        await API.Fetch(key, data)
            .then((result) => {
                //console.log(result)
                if (result == 1) {
                    this.fetchPaket()
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    getUser() {
        AsyncStorage.getItem('user', (error, result) => {
            const d = JSON.parse(result)
            console.log(d.id)
            this.setState({
                idbuyer: d.id
            })
        });
    }

    hitungTotal() {
        let tot = 0;
        const { cart } = this.state
        for (let i = 0; i < cart.length; i++) {
            let detail = cart[i].detail.length
            for (let j = 0; j < detail; j++) {
                if (cart[i].detail[j].checked == 'true') {
                    tot += Number(cart[i].detail[j].total)
                }
            }
        }
        const { paket } = this.state
        if (paket.length != 0) {
            for (let i = 0; i < paket.length; i++) {
                if (paket[i].checked == 'true') {
                    tot += Number(paket[i].total)
                }
            }
        }
        this.setState({ totalbelanja: currencyFormat(tot) })
    }

    renderPaket() {
        const { paket } = this.state
        return paket.map((item, index) => {
            return (
                <View key={index}>
                    <View style={[styles.cartItem, { width: '100%' }]}>
                        <View style={{ width: '15%', backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={{ uri: url_img_paket + item.Gambar }} style={{ height: 45, width: 45 }} />
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'flex-start', width: '50%', paddingLeft: 2, }}>
                            <Text style={{ color: colors.text }} numberOfLines={2}>{item.NamaPaket}</Text>
                            <Text style={{ color: 'red' }}>Rp {currencyFormat(item.Harga)}</Text>
                        </View>
                        <View style={[styles.contentQty, { paddingRight: 15 }]}>
                            <TouchableOpacity style={styles.btnMin}
                                onPress={() => this.minPaket(item.ID, item.Qty)}
                            >
                                <Text style={styles.txtBtnQty}>-</Text>
                            </TouchableOpacity>
                            <View style={{ width: 45, alignItems: 'center' }}>
                                <Text style={{ color: colors.text, fontSize: 18, }}>{item.Qty}</Text>
                            </View>
                            <TouchableOpacity style={styles.btnPlus}
                                onPress={() => this.plusPaket(item.ID, item.Qty)}
                            >
                                <Text style={styles.txtBtnQty}>+</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.btnDelete}
                                onPress={() => this.deletePaket(item.ID)}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>X</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )
        })
    }

    renderBarang() {
        const { itemCart } = this.state
        return itemCart.map((item, index) => {
            return (
                <View key={item.ID}>
                    <View style={styles.cartItem}>
                        <View style={{ width: '15%', backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={{ uri: url_img + item.Gambar }} style={{ height: 45, width: 45 }} />
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'flex-start', width: '55%', paddingLeft: 2, }}>
                            <Text style={{ color: colors.text }} numberOfLines={2}>{item.NamaBarang}</Text>
                            <Text style={{ color: 'red' }}>Rp {currencyFormat(item.Harga)}</Text>
                        </View>
                        <View style={styles.contentQty}>
                            <TouchableOpacity style={styles.btnMin}
                                onPress={() => this.min(item.ID, item.Qty)}
                            >
                                <Text style={styles.txtBtnQty}>-</Text>
                            </TouchableOpacity>
                            <View style={{ width: 45, alignItems: 'center' }}>
                                <Text style={{ color: colors.text, fontSize: 18, }}>{item.Qty}</Text>
                            </View>
                            <TouchableOpacity style={styles.btnPlus}
                                onPress={() => this.plus(item.ID, item.Qty)}
                            >
                                <Text style={styles.txtBtnQty}>+</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.btnDelete}
                                onPress={() => this.deleteBarang(item.ID)}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>X</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            )
        })
    }



    render() {
        const { itemCart, cart, paket, activityLoad } = this.state
        return (
            <View style={styles.container}>
                <Header title="KERANJANG" />
                {
                    itemCart.length == 0 && paket.length == 0 ?
                        <View style={styles.contentEmptyCart}>
                            {
                                activityLoad ?
                                    <ActivityIndicator
                                        size="large"
                                        animating={activityLoad}
                                        color={colors.bgheader} />
                                    :
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textGray }}>Keranjang kosong</Text>
                            }
                        </View>
                        :
                        <>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={{ height: 30, width: '100%', paddingLeft: 5, backgroundColor: 'white', justifyContent: 'center', borderBottomWidth: 0.5, borderBottomColor: 'gray', display: itemCart.length == 0 ? 'none' : null }}>
                                    <Text style={{ fontSize: 17, fontWeight: '900', color: 'black' }}>REGULER</Text>
                                </View>
                                <View style={styles.content}>
                                    {this.renderBarang()}
                                </View>
                                <View style={{ height: 30, width: '100%', paddingLeft: 5, backgroundColor: 'white', justifyContent: 'center', borderBottomWidth: 0.5, borderBottomColor: 'gray', display: paket.length == 0 ? 'none' : null }}>
                                    <Text style={{ fontSize: 17, fontWeight: '900', color: 'black', }}>PAKET</Text>
                                </View>
                                <View style={styles.contentPaket}>
                                    {this.renderPaket()}
                                </View>

                            </ScrollView>
                            <View style={styles.contentTotal}>
                                <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 10, color: colors.text }}>Total Belanja : </Text>
                                <Text style={{ fontWeight: 'bold', fontSize: 20, marginRight: 10, color: colors.text }}>Rp. {currencyFormat(Number(cart.Total))}</Text>
                            </View>
                            <View style={styles.contentCheckOut}>
                                {
                                    cart.Total == 0 ?
                                        <View style={[styles.btnCheckOut, { backgroundColor: '#a8a8a8' }]}
                                        >
                                            <Text style={styles.txtBtnCheckOut}>CHECK OUT</Text>
                                        </View>
                                        :
                                        <TouchableOpacity style={styles.btnCheckOut}
                                            onPress={this.checkOut}
                                        >
                                            <Text style={styles.txtBtnCheckOut}>CHECK OUT</Text>
                                        </TouchableOpacity>
                                }
                            </View>
                        </>

                }
                <CustomToast ref="defaultToastBottom" position="bottom" />
            </View>
        );
    }
}

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
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingTop: 5,
        backgroundColor: colors.bgheader
    },
    txtHeader: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 5,
        marginLeft: '15%',
    },
    txtEdit: {
        fontSize: 17,
        color: 'white'
    },
    content: {
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    contentPaket: {
        width: '100%',
        justifyContent: 'flex-start',
    },
    contentEmptyCart: {
        height: '78%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    cartItem: {
        height: 65,
        width: '94%',
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
        paddingHorizontal: 10,

    },
    txtNamaToko: {
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 5,
        color: colors.default
    },
    contentQty: {
        flexDirection: 'row',
        justifyContent: "center",
        width: '40%',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingLeft: 2,
    },

    contentQtyPaket: {
        flexDirection: 'row',
        justifyContent: "center",
        width: '36%',
        alignItems: 'center',
        marginLeft: 1,
    },
    txtBtnQty: {
        color: 'white',
        fontSize: 20,
    },
    btnPlus: {
        height: 30,
        width: 30,
        backgroundColor: colors.bgheader,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        marginRight: 3
    },
    btnMin: {
        height: 30,
        width: 30,
        backgroundColor: colors.bgheader,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
    },
    btnDelete: {
        height: 30,
        width: 30,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        borderRadius: 15,
    },
    contentTotal: {
        height: 30,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contentCheckOut: {
        height: screenHeight / 10,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnCheckOut: {
        height: 40,
        width: '95%',
        backgroundColor: colors.bgheader,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    txtBtnCheckOut: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white'
    }
})

