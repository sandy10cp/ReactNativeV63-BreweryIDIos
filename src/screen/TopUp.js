import React, { Component } from 'react'
import { View, Text, StyleSheet, ToastAndroid, ScrollView, TouchableOpacity, Image, Dimensions, ImageBackground, Clipboard } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import Loader from '../LoaderAlert/Loader';
import AlertModal from '../LoaderAlert/AlertModal';
import { Checkbox, RadioButton } from 'react-native-paper';
import API from '../service';
import { colors } from '../utils';
import currencyFormat from '../function/currencyFormat';
import Header from './atom/Header';
import { url_img_poster } from '../Url';
import CustomToast from '../LoaderAlert/CustomToast';


const screenWidth = Math.round(Dimensions.get('window').width);


class TopUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nominal: '',
            rekening: [],
            pilihrekening: 0,
            image: null,
            dataImage: null,
            idbuyer: '',
            auth: '',
            idcabang: '',
            kodecabang: '',
            topuppaket: {},
            listpaket: [],
            loading: false,
            AlertShow: false,
            AlertMessage: '',
            AlertStatus: true,
            idpaket: 0,
            harga: '',
            balance: '',
            keterangan: '-',
            pilihtransaksi: 'PaymentTransfer',
            accountName: '',
            accountNumber: '',
            tipe: 2,
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
                idcabang: d.idcabang,
                kodecabang: d.kodecabang
            })
        });

        this._isMounted && this.fetchTopUpPaket()
    }

    componentWillUnmount() {
        this._isMounted = false;
    }


    fetchRekening() {
        const key = Base64.decode(this.state.auth);
        const data = { aksi: 119 };

        API.Fetch(key, data)
            .then((result) => {
                if (this._isMounted) {
                    if (result != 0) {
                        this.setState({ rekening: result })
                    } else {
                        this.setState({ rekening: [] })
                    }
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }


    async fetchTopUpPaket() {
        const { idbuyer, auth, idcabang } = this.state
        const data = { aksi: 131, idbuyer, authkey: auth, idcabang }

        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (this._isMounted) {
                    if (result.ErrorCode == '0') {
                        this.setState({ rekening: result.ListRekening, topuppaket: result, listpaket: result.ListPaket })
                    } else if (result.ErrorCode == '2.1') {
                        this.props.navigation.replace('Login')
                    }
                    else {
                        this.setState({ rekening: [], topuppaket: {}, listpaket: [] })
                    }
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }


    pilihHarga(id, harga, balance, ket) {
        this.setState({ idpaket: id, harga, balance, keterangan: ket })
    }

    writeToClipboard = async () => {
        //To copy the text to clipboard
        await Clipboard.setString(this.state.accountNumber);
        this.refs.defaultToastBottom.ShowToastFunction('Salin ke Clipboard!');
    };


    stopAlert() {
        setTimeout(() => {
            this.setState({ AlertShow: false });
        }, 4000);
    }


    topUp = () => {
        this.setState({ loading: true, });
        const data = {
            aksi: 132,
            authkey: this.state.auth,
            idbuyer: this.state.idbuyer,
            idcabang: this.state.idcabang,
            idrekening: this.state.pilihrekening,
            idpaket: this.state.idpaket,
            tipe: this.state.tipe
        };
        if (this.state.idpaket == 0) {
            setTimeout(() => {
                this.setState({ loading: false, AlertShow: true, AlertMessage: 'Error, Pilih nominal', AlertStatus: false, });
            }, 1000);
            this.stopAlert()
        } else if (this.state.tipe == 0) {
            setTimeout(() => {
                this.setState({ loading: false, AlertShow: true, AlertMessage: 'Error, Pilih pembayaran', AlertStatus: false, });
            }, 1000);
            this.stopAlert()
        }
        else if (this.state.pilihrekening == 0) {
            setTimeout(() => {
                this.setState({ loading: false, AlertShow: true, AlertMessage: 'Error, Pilih rekening', AlertStatus: false, });
            }, 1000);
            this.stopAlert()
        }
        else {
            API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        setTimeout(() => {
                            this.setState({ loading: false, AlertShow: true, AlertMessage: 'Success, menunggu konfirmasi', AlertStatus: true, });
                        }, 1000);
                        this.stopAlert()
                        this.props.navigation.navigate('TopUpTabs')
                    } else {
                        setTimeout(() => {
                            this.setState({ loading: false, AlertShow: true, AlertMessage: 'Gagal, Top up !', AlertStatus: false, });
                        }, 1000);
                    }
                })
                .catch((error) => {
                    console.log(error)
                    setTimeout(() => {
                        this.setState({ loading: false, AlertShow: true, AlertMessage: 'Error, Top up !', AlertStatus: false, });
                    }, 1000);
                    this.stopAlert()
                })
        }
    }



    renderRekening() {
        const { pilihrekening, rekening } = this.state

        return rekening.map((item, index) => {
            return (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ height: 32, width: 32, borderWidth: 1, borderRadius: 32/2, borderColor: pilihrekening == item.IDRekening ? colors.bgheader : colors.default, justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Checkbox
                            color={colors.bgheader}
                            status={pilihrekening === item.IDRekening ? 'checked' : 'unchecked'}
                            onPress={() => this.setState({ pilihrekening: item.IDRekening, accountName: item.AccountName, accountNumber: item.AccountNumber })}
                        />
                    </View>
                    <Text style={[{ marginLeft: 5, fontSize: 15 }, pilihrekening === item.IDRekening ? { color: 'black' } : { color: 'gray' }]}>{item.NamaBank}</Text>
                </View>
            )
        })

    }

    renderListPaket() {
        const { listpaket, idpaket } = this.state
        return listpaket.map((item, index) => {
            return (
                <TouchableOpacity key={index} style={[styles.contentHarga, idpaket == item.ID ? { borderColor: colors.bgheader, } : { borderColor: '#1b8df7', }]}
                    onPress={() => this.pilihHarga(item.ID, item.Harga, item.Balance, item.Keterangan)}
                >
                    <ImageBackground style={[styles.harga, { height: 120, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3, }]}
                        source={{ uri: url_img_poster + item.Gambar }}
                    >
                        {
                            item.ShowText == 1 ?
                                <Text style={{ textAlign: 'center', fontSize: 16, color: 'white', fontWeight: 'bold' }}>{item.Keterangan} dapat {currencyFormat(item.Balance)}</Text>
                                :
                                null
                        }
                    </ImageBackground>
                    <View style={[styles.contentSepcial, item.IsSpecial == 1 ? { backgroundColor: 'red' } : null]}>
                        <Text style={[{ fontSize: 13, color: 'white', fontWeight: 'bold' }, item.IsSpecial == 1 ? null : { display: 'none' }]}>{item.DeskSpecial}</Text>
                    </View>
                    <TouchableOpacity style={[styles.harga, { height: 40 }, idpaket == item.ID ? { backgroundColor: '#a11b1b', } : { backgroundColor: '#1b8df7', }]}
                        onPress={() => this.pilihHarga(item.ID, item.Harga, item.Balance, item.Keterangan)}
                    >
                        <Text style={styles.txtHarga}>{item.Nama}</Text>
                    </TouchableOpacity>
                </TouchableOpacity >
            )
        })
    }

    render() {
        const { AlertShow, AlertMessage, AlertStatus, loading, harga, keterangan, balance, topuppaket, pilihtransaksi, pilihrekening, tipe } = this.state;
        return (
            <View style={styles.container}>
                <Header title="TOP UP" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.contentNominal}>
                        <View style={{ height: 25, marginBottom: 3, }}>
                            <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 17, margin: 5 }}>Pilih Nominal</Text>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                            {
                                this.renderListPaket()
                            }
                            {/* <TouchableOpacity style={styles.harga}
                                    onPress={() => this.pilihHarga('100000')}
                                >
                                    <Text style={styles.txtHarga}>Rp 100.000</Text>
                                </TouchableOpacity> */}
                        </View>
                    </View>
                    <View style={styles.content}>
                        <View style={{ flexDirection: 'row', height: 35, }}>
                            <View style={{ width: '40%', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 17, color: 'black', fontWeight: 'bold' }}>Harga</Text>
                            </View>
                            <View style={{ width: '60%', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 17, color: 'black', fontWeight: 'bold' }}>: Rp {currencyFormat(Number(harga))}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', height: 35, }}>
                            <View style={{ width: '40%', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 17, color: 'black', fontWeight: 'bold' }}>Balance</Text>
                            </View>
                            <View style={{ width: '60%', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 17, color: 'black', fontWeight: 'bold' }}>: Rp {currencyFormat(Number(balance))}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', height: 35, }}>
                            <View style={{ width: '40%', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 17, color: 'black', fontWeight: 'bold' }}>Keterangan</Text>
                            </View>
                            <View style={{ width: '60%', justifyContent: 'center' }}>
                                <Text numberOfLines={3} style={{ fontSize: 17, color: 'black', fontWeight: 'bold' }}>: {keterangan}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.transfer}>
                        <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 17, margin: 5 }}>Pilih Pembayaran</Text>
                        <View style={{ flexDirection: 'row', marginLeft: 5, alignItems: 'center' }}>
                            <View style={{ height: 32, width: 32, borderWidth: 1, borderRadius: 7, borderColor: tipe==2 ? colors.bgheader : colors.default, justifyContent: 'flex-start', alignItems: 'center' }}>
                                <RadioButton
                                    disabled={topuppaket.PaymentTransfer == 1 ? false : true}
                                    value="transfer"
                                    color={colors.bgheader}
                                    status={pilihtransaksi == 'PaymentTransfer' ? 'checked' : 'unchecked'}
                                    onPress={() => { this.setState({ pilihtransaksi: 'PaymentTransfer', tipe: 2 }); }}
                                />
                            </View>
                            <Text style={topuppaket.PaymentTransfer == 1 ? { color: 'black', fontSize: 16, marginLeft: 5 } : { color: '#bdbdbd', fontSize: 16, marginLeft: 5 }}>Bank / OVO / GoPay - Transfer</Text>
                        </View>
                        <View style={[styles.detailTransfer, pilihtransaksi == 'PaymentTransfer' ? null : { display: 'none' }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical:5 }}>
                                {this.renderRekening()}
                                {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Checkbox
                                            color={colors.default}
                                            status={pilihrekening == 'MANDIRI' ? 'checked' : 'unchecked'}
                                            onPress={() => { this.setState({ pilihrekening: 'MANDIRI' }); }}
                                        />
                                        <Text>MANDIRI</Text>
                                    </View> */}
                            </View>
                            <View style={[styles.detailRekening, pilihrekening == 0 ? { display: 'none' } : null]}>
                                <Text style={{ fontSize: 17 }}>Account Name : {this.state.accountName}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 17 }}>Account Number : {this.state.accountNumber}</Text>
                                    <TouchableOpacity
                                        style={{ height: 25, width: 50, borderWidth: 1, borderColor: colors.bgheader, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }}
                                        onPress={() => this.writeToClipboard()} >
                                        <Text style={{ fontSize: 16, color: colors.bgheader, }}>Salin</Text>
                                        {/* <Icon name="content-copy" size={25} color={colors.bgheader} style={{ marginLeft: 10 }} /> */}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ height: 50, width: '100%', marginBottom: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity style={styles.btnTopUp}
                            onPress={this.topUp}
                        >
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>Top Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <Loader
                    loading={loading} />
                <AlertModal
                    loading={AlertShow} message={AlertMessage} status={AlertStatus} />
                <CustomToast ref="defaultToastBottom" position="bottom" />
            </View>
        )
    }
}

export default TopUp;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround,
    },
    content: {
        height: 120,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 4,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingHorizontal: 10,
    },
    transfer: {
        height: 170,
        width: '100%',
        marginVertical: 5,
        backgroundColor: 'white'
    },
    txtTransfer: {
        fontWeight: 'bold',
        fontSize: 15,
        color: colors.default,
        marginLeft: 5
    },
    contentNominal: {
        width: '100%',
        paddingHorizontal: 5,
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingVertical: 10,
    },
    contentSepcial: {
        // width: 80,
        height: 25,
        paddingHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 6,
        shadowColor: "#eee",
        shadowOffset: {
            width: 7,
            height: 7,
        },
        shadowOpacity: 0.5,
        shadowRadius: 6.27,
        elevation: 3,
    },
    header: {
        width: '100%',
        height: 50,
        marginVertical: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bgheader
    },
    txtTopUp: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white'
    },
    textInput: {
        height: 50,
        width: '80%',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
    },
    txtRp: {
        fontSize: 25,
        fontWeight: '600',
        color: '#4E4E4E',
        marginBottom: 2
    },
    nominalInput: {
        width: '90%',
        fontSize: 20,
        color: '#4E4E4E',
        paddingHorizontal: 10,
    },
    contentHarga: {
        marginVertical: 3,
        marginHorizontal: 5,
    },
    harga: {
        height: 90,
        width: screenWidth / 3 - 15,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    txtHarga: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    },
    totNominal: {
        height: 40,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    txtNominal: {
        fontWeight: 'bold',
        fontSize: 20,
        color: colors.default
    },
    upload: {
        height: 250,
        width: '100%',
        backgroundColor: 'white'
    },
    btnUpload: {
        height: 20,
        width: 90,
        backgroundColor: colors.default,
        marginLeft: 5,
        marginTop: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3
    },
    uploadImage: {
        height: 200,
        width: 200,
    },
    btnTopUp: {
        height: 45,
        width: '98%',
        backgroundColor: colors.bgheader,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    detailTransfer: {
        width: '92%',
        marginLeft: 20,
        marginTop:5,
        backgroundColor: '#F2F2F2',
        justifyContent: 'center'
    },
    detailRekening: {
        alignItems: 'flex-start',
        paddingBottom: 5,
        paddingHorizontal: 10,
        marginTop: 5,
    },
});