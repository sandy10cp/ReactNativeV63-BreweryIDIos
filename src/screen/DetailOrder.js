import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Picker } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../utils';
import AsyncStorage from '@react-native-community/async-storage';
import API from '../service';
import Header from './atom/Header';

function currencyFormat(num) {
    return num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
}

export default class DetailOrder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            order: {},
            itemOrder: [],
            paket: [],
            idbuyer: '',
            auth: '',
            idcabang: '',
            totalorder: 0,
            totPersen: 0,
            totBayar: 0,
            alamat: {},
            nama: '',
            phone: '',
            keterangan: '',
            datauser: {},
            waktukirim: 'Pukul 09:00 - 11:00'
        };
    }

    order = () => {
        const { nama, phone, keterangan, idbuyer, auth, idcabang } = this.state
        const data = { aksi: 126, idbuyer, authkey: auth, idcabang, nama, phone, catatan: keterangan }
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
            })
            .catch((error) => {
                console.log(error)
            })
        this.props.navigation.navigate('Payment', { totalbayar: this.state.order.Total })
    }

    async componentDidMount() {
        await AsyncStorage.getItem('user').then((data) => {
            if (data) {
                const d = JSON.parse(data)
                this.setState({
                    idbuyer: d.id,
                    auth: d.authkey,
                    idcabang: d.idcabang
                });
            }
        });

        this.fetchOrder()
        this.fetchUser()
        // this.fetchOrderPaket()
        // this.fetchAlamat()

    }

    pilihAlamat = () => {
        this.props.navigation.push('PilihAlamat', { idalamat: this.state.alamat.idalamat })
    }

    async fetchOrder() {
        const data = {
            aksi: 112,
            idbuyer: this.state.idbuyer,
            authkey: this.state.auth,
            idcabang: this.state.idcabang
        };
        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    this.setState({ order: result, itemOrder: result.CartItem, paket: result.CartPaket })
                }
                else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                }
                else {
                    this.setState({ order: {}, itemOrder: [], paket: [] })
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    async fetchOrderPaket() {
        const key = Base64.decode(this.state.auth)
        const data = { aksi: 1210, idbuyer: this.state.idbuyer }
        await API.Fetch(key, data)
            .then((result) => {
                if (result == 0) {
                    this.setState({ paket: [] })
                } else {
                    this.setState({ paket: result })
                }
                this.hitungTotal()
            })
            .catch((error) => {
                console.log(error)
            })
    }

    hitungTotal() {
        let tot = 0;
        const { order, paket } = this.state
        for (let i = 0; i < order.length; i++) {
            tot += Number(order[i].total)
        }
        if (paket.length != 0) {
            for (let i = 0; i < paket.length; i++) {
                tot += Number(paket[i].total)
            }
        }
        // let persen = Number(tot) * 0.1;
        let bayar = Number(tot) // + Number(persen);
        this.setState({
            totalorder: currencyFormat(tot),
            // totPersen: currencyFormat(persen),
            totBayar: currencyFormat(bayar)
        });
    }

    async fetchAlamat() {
        const key = Base64.decode(this.state.auth)
        const data = { aksi: 123, idbuyer: this.state.idbuyer }
        await API.Fetch(key, data)
            .then((result) => {
                if (result == 0) {
                    this.setState({ alamat: '' })
                } else {
                    this.setState({ alamat: result })
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    fetchUser() {
        const { idbuyer, auth, idcabang } = this.state
        const data = { aksi: 119, idbuyer, authkey: auth, idcabang, }
        // console.log(data)
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    this.setState({ datauser: result, visible: true })
                    this.setState({ nama: result.Nama, phone: result.Phone })
                } else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.119.1') {
                    this.props.navigation.replace('Login')
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
                } else {
                    this.setState({ datauser: {}, visible: true })
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    renderDetailPaket(i) {
        const { paket } = this.state
        const detailpaket = paket[i].paketdetail
        return detailpaket.map((item, index) => {
            return (
                <View key={index} style={styles.itemDetail}>
                    <View style={{ width: '60%', paddingLeft: 10, }}>
                        <Text numberOfLines={1} style={styles.txtItemNama}>{item.namabarang}</Text>
                    </View>
                    <View style={{ width: '7%', alignItems: 'center', }}>
                        <Text style={styles.txtItemQty}>{item.qtybarang}</Text>
                    </View>
                    <View style={{ width: '30%', alignItems: 'flex-end' }}>
                        <Text style={styles.txtItemTot}>-</Text>
                    </View>
                </View>
            )
        })
    }

    renderPaket() {
        const { paket } = this.state
        return paket.map((item, index) => {
            return (
                <View key={index} style={styles.itemDetail}>
                    <View style={{ width: '60%', }}>
                        <Text numberOfLines={1} style={styles.txtItemNama}>{item.NamaPaket} </Text>
                    </View>
                    <View style={{ width: '7%', alignItems: 'center' }}>
                        <Text style={styles.txtItemQty}>{item.Qty}</Text>
                    </View>
                    <View style={{ width: '30%', alignItems: 'flex-end' }}>
                        <Text style={styles.txtItemTot}>Rp {currencyFormat(Number(item.Total))}</Text>
                    </View>
                </View>
            )
        })
    }

    renderOrder() {
        const { itemOrder } = this.state
        return itemOrder.map((item, index) => {
            return (
                <View key={index} style={styles.itemDetail}>
                    <View style={{ width: '60%', }}>
                        <Text numberOfLines={1} style={styles.txtItemNama}>{item.NamaBarang} </Text>
                    </View>
                    <View style={{ width: '7%', alignItems: 'center' }}>
                        <Text style={styles.txtItemQty}>{item.Qty}</Text>
                    </View>
                    <View style={{ width: '30%', alignItems: 'flex-end' }}>
                        <Text style={styles.txtItemTot}>Rp {currencyFormat(Number(item.Jumlah))}</Text>
                    </View>
                </View>
            )
        })
    }

    render() {
        const { order, paket, itemOrder } = this.state
        return (
            <View style={styles.container}>
                <Header title="DETAIL ORDER" />
                <ScrollView>
                    <View style={styles.contentAlamat}>
                        <View style={styles.alamat}>
                            <View style={{ backgroundColor: colors.bgheader, width: '100%', }}>
                                <Text style={[styles.txtAlamat, { color: 'white', fontWeight: 'bold', fontSize: 17 }]}>ALAMAT</Text>
                            </View>
                            <View style={styles.detailAlamat}>
                                <Text>{order.Alamat == undefined ? '' : order.Alamat + ', ' + order.Kota + ', ' + order.Propinsi}</Text>
                            </View>
                        </View>
                        <View style={{ width: '100%', alignItems: 'flex-start', paddingBottom: 5, }}>
                            <View style={{ backgroundColor: colors.bgheader, width: '100%', }}>
                                <Text style={[styles.txtAlamat, { fontSize: 17, fontWeight: 'bold', color: 'white', marginLeft: 10 }]}>CONTACT PERSON</Text>
                            </View>
                            <View style={styles.contactPerson}>
                                <TextInput
                                    placeholder="Nama"
                                    style={styles.textInputKupon}
                                    maxLength={25}
                                    onChangeText={text => this.setState({ nama: text })}
                                    value={this.state.nama}
                                />
                            </View>
                            <View style={styles.contactPerson}>
                                <TextInput
                                    placeholder="Phone"
                                    keyboardType='numeric'
                                    style={styles.textInputKupon}
                                    maxLength={16}
                                    onChangeText={text => this.setState({ phone: text })}
                                    value={this.state.phone}
                                />
                            </View>
                            <View style={styles.contactPerson}>
                                <TextInput
                                    placeholder="Catatan"
                                    style={styles.textInputKet}
                                    multiline={true}
                                    numberOfLines={3}
                                    maxLength={150}
                                    onChangeText={text => this.setState({ keterangan: text })}
                                    value={this.state.keterangan}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.content}>
                        {/* <View style={styles.contentKupon}>
                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.default, marginLeft: 10 }}>Masukkan kupon</Text>
                            <View style={styles.inputKupon}>
                                <View style={styles.iconkupon}>
                                    <Image source={require('../icon/coupon.png')} style={{ width: 40, height: 30 }} />
                                </View>
                                <View style={{ width: '55%', marginHorizontal: 5, }}>
                                    <TextInput
                                        placeholder="Kupon promo"
                                        style={styles.textInputKupon}
                                        onChangeText={text => this.setState({ kupon: text })}
                                        value={this.state.kupon}
                                    />
                                </View>
                                <View style={{ width: '25%', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                    <TouchableOpacity>
                                        <Text style={{ color: colors.default, fontWeight: '800' }}>Pilih kupon</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View> */}
                        <View style={styles.items}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={{ backgroundColor: colors.bgheader, width: '100%', borderBottomColor: 'gray', borderBottomWidth: 0.5, display: itemOrder.length == 0 ? 'none' : null }}>
                                    <Text style={{ fontSize: 17, fontWeight: 'bold', color: 'white', marginLeft: 10 }}>REGULER</Text>
                                </View>
                                {this.renderOrder()}
                                {/* <View style={styles.itemDetail}>
                                    <Text style={styles.txtItemNama}>Item barang</Text>
                                    <Text style={styles.txtItemQty}>2</Text>
                                    <Text style={styles.txtItemTot}>Rp. 50.000</Text>
                                </View> */}
                                <View style={{ backgroundColor: colors.bgheader, width: '100%', borderBottomColor: 'gray', borderBottomWidth: 0.5, display: paket.length == 0 ? 'none' : null }}>
                                    <Text style={{ fontSize: 17, fontWeight: 'bold', color: 'white', marginLeft: 10 }}>PAKET</Text>
                                </View>
                                {this.renderPaket()}
                            </ScrollView>
                        </View>
                        <View style={styles.totalItem}>
                            <View style={styles.total}>
                                <Text style={styles.txtTotal}>Sub Total</Text>
                                <Text style={styles.txtTotalItem}>Rp {currencyFormat(Number(order.JumlahReguler) + Number(order.JumlahPaket))}</Text>
                            </View>
                            {/* <View style={styles.total}>
                                <Text style={styles.txtTotal}>Potongan kupon</Text>
                                <Text style={styles.txtTotalItem}>-</Text>
                            </View> */}
                            <View style={styles.total}>
                                <Text style={styles.txtTotal}>Ongkos kirim</Text>
                                <Text style={styles.txtTotalItem}>Rp {currencyFormat(Number(order.Ongkir))}</Text>
                            </View>
                            {/* <View style={styles.total}>
                                <Text style={styles.txtTotal}>PPN 10%</Text>
                                <Text style={styles.txtTotalItem}>Rp. {totPersen}</Text>
                            </View> */}
                            <View style={styles.total}>
                                <Text style={styles.txtTotal}>Total Bayar</Text>
                                <Text style={styles.txtTotalItem}>Rp {currencyFormat(Number(order.Total))}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.contentOrder}>
                    <TouchableOpacity style={styles.btnCompleteOrder}
                        onPress={this.order}
                    >
                        <Text style={styles.txtBtnComplete}>ORDER</Text>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: colors.defaultBackGround
    },
    header: {
        height: 50,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgheader,
    },
    txtHeader: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 5,
    },
    contactPerson: {
        width: '100%',
        marginHorizontal: 5,
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
    },
    content: {
        width: '100%',
        paddingVertical: 2,
    },
    items: {
        width: '100%',
        backgroundColor: 'white',
        marginBottom: 5,
    },
    itemDetail: {
        height: 50,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: 'gray',
    },
    txtItemNama: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text
    },
    txtItemQty: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text
    },
    txtItemTot: {
        marginRight: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text
    },
    contentKupon: {
        height: 70,
        width: '100%',
        marginVertical: 5,
        backgroundColor: 'white',
    },
    iconkupon: {
        width: 50,
        alignItems: 'center',
        marginLeft: 5,
    },
    inputKupon: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInputKupon: {
        height: 50,
        fontSize: 15
    },
    textInputKet: {
        height: 60,
    },
    totalItem: {
        width: '100%',
        backgroundColor: 'white',
        justifyContent: 'center',
    },
    total: {
        height: 38,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: 'gray',
    },
    txtTotal: {
        fontWeight: 'bold',
        fontSize: 15,
        color: colors.text,
        marginLeft: 10,
    },
    txtTotalItem: {
        fontWeight: 'bold',
        fontSize: 15,
        color: colors.text,
        marginRight: 10,
    },
    contentAlamat: {
        width: '100%',
        alignItems: 'flex-start',
        backgroundColor: 'white',
        marginTop: 5,
        paddingVertical: 5,
    },
    alamat: {
        height: 78,
        width: '100%',
        backgroundColor: 'white',
    },
    txtAlamat: {
        fontWeight: 'bold',
        fontSize: 15,
        color: colors.default,
        marginLeft: 10
    },
    detailAlamat: {
        height: 50,
        width: '95%',
        backgroundColor: '#F2F2F2',
        marginLeft: 10,
        marginTop: 2,
        borderRadius: 3,
        paddingHorizontal: 5,
    },
    btnTambaAlamat: {
        backgroundColor: '#F2F2F2',
        width: 90,
        marginRight: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderRadius: 5,
    },
    contentOrder: {
        height: 50,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnCompleteOrder: {
        height: 40,
        width: '95%',
        backgroundColor: colors.bgheader,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    txtBtnComplete: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white'
    }
});
