import React, { Component } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, ToastAndroid, Clipboard } from 'react-native'
import { RadioButton, Checkbox } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Loader from '../LoaderAlert/Loader';
import AlertModal from '../LoaderAlert/AlertModal';
import { colors } from '../utils';
import Header from './atom/Header';
import AsyncStorage from '@react-native-community/async-storage';
import API from '../service';
import currencyFormat from '../function/currencyFormat';
import CustomToast from '../LoaderAlert/CustomToast';


export default class Payment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pilihtransaksi: '',
            tipe: 0,
            pilihrekening: 0,
            loading: false,
            AlertShow: false,
            AlertMessage: '',
            AlertStatus: true,
            idbuyer: '',
            auth: '',
            idcabang: '',
            transaksi: [],
            rekening: [],
            detail: 0,
            jatutemp: '',
            alamat: '',
            image: null,
            dataImage: null,
            keterangan: '-',
            datauser: {},
            accountName: '',
            accountNumber: ''
        };

        this._isMounted = false;
    }

    async componentDidMount() {
        this._isMounted = true;
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
        // this._isMounted && this.setJatuTempo();
        // this._isMounted && this.fetchAlamat();
        // this._isMounted && this.fetchUser();
        this._isMounted && this.fetchTransaksi();
        // this._isMounted && this.fetchRekening();

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    writeToClipboard = async () => {
        //To copy the text to clipboard
        await Clipboard.setString(this.state.accountNumber);

        this.refs.defaultToastBottom.ShowToastFunction('Salin ke Clipboard!');
    };

    async fetchUser() {
        const { auth, idbuyer } = this.state;
        const key = Base64.decode(auth)
        const data = { aksi: 126, idbuyer }
        await API.Fetch(key, data)
            .then((result) => {
                if (result != 0) {
                    this.setState({ datauser: result })
                } else {
                    this.setState({ datauser: {} })
                }
                this.cekApakahSaldoCukup()
            })
            .catch((error) => {
                console.log(error)
            })
    }

    cekApakahSaldoCukup() {
        const { datauser } = this.state
        // console.log(currencyFormat(Number(datauser.saldo)) - Number(this.props.route.params.totalbayar))
        if (currencyFormat(Number(datauser.saldo)) >= Number(this.props.route.params.totalbayar)) {
            this.setState({ pilihtransaksi: 4 })
        } else {
            this.setState({ pilihtransaksi: 1 })
        }
    }

    setJatuTempo() {
        let date = new Date();
        date.setDate(date.getDate() + 14);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let temp = year + '-' + month + '-' + day
        this.setState({ jatutemp: temp })
    }

    fetchTransaksi() {
        const { auth, idbuyer, idcabang } = this.state;
        const data = { aksi: 113, idbuyer, authkey: auth, idcabang }
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    this.setState({ transaksi: result, rekening: result.ListRekening })
                }
                else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                }
                else {
                    this.setState({ transaksi: {}, rekening: [] })
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

    fetchRekening() {
        const { auth } = this.state;
        const key = Base64.decode(auth)
        const data = { aksi: 119 }

        API.Fetch(key, data)
            .then((result) => {
                this.setState({
                    rekening: result
                })
            })
            .catch((error) => {
                console.log(error)
            })

    }

    uploadAndPayment = () => {
        const formData = new FormData();

        if (this.state.pilihtransaksi != 1) {
            const result = '0';
            this.payment(result);
            //console.log(this.state.keterangan)
        }
        else if (this.state.image == null) {
            alert('Upload bukti transaksi')
        } else {
            this.setState({ loading: true, });
            formData.append('id', this.state.idbuyer);
            formData.append('file', {
                uri: this.state.image.uri,
                type: 'image/jpeg', // or photo.type
                name: 'testPhotoName.jpg'
            });

            API.UploadImage(formData)
                .then((result) => {

                    this.payment(result);

                })
                .catch((error) => {
                    console.log(error)
                })
        }

    }


    stopAlert() {
        setTimeout(() => {
            this.setState({ AlertShow: false });
        }, 2000);
    }

    payment = () => {
        this.setState({ loading: true, });
        const { pilihtransaksi, pilihrekening, idbuyer, auth, idcabang, tipe, keterangan } = this.state;
        const data = {
            aksi: 114,
            idbuyer,
            authkey: auth,
            idcabang: idcabang,
            tipe: tipe,
            keterangan: keterangan,
            idrekening: pilihrekening
        }
        if (pilihtransaksi != '' || pilihrekening != 0) {
            API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        setTimeout(() => {
                            this.setState({ loading: false, AlertShow: true, AlertMessage: 'Success, Order', AlertStatus: true });
                            this.props.navigation.replace('BottomTabs', { initialRoute: 'Pesanan' })
                        }, 1500);
                    }
                    else if (result.ErrorCode == '2.1') {
                        this.props.navigation.replace('Login')
                    }
                    else {
                        this.setState({ loading: false, });
                        Alert.alert(
                            result.ErrorDesc,
                            ' ',
                            [
                                { text: 'OK', onPress: () => this.props.navigation.navigate('Cart') },
                            ],
                            { cancelable: false });
                        return true;
                        // setTimeout(() => {
                        //     this.setState({ loading: false, AlertShow: true, AlertMessage: ErrorDesc, AlertStatus: false });
                        // }, 1500);
                        // this.stopAlert()
                        // this.props.navigation.replace('Cart')
                    }

                })
                .catch((error) => {
                    console.log(error)
                    setTimeout(() => {
                        this.setState({ loading: false, AlertShow: true, AlertMessage: 'Error, Order', AlertStatus: false });
                    }, 1500);
                })
        } else {
            setTimeout(() => {
                this.setState({ loading: false, AlertShow: true, AlertMessage: 'Pilih transaksi', AlertStatus: false });
            }, 1000);
        }

        this.stopAlert()
    }

    pilihRekening(id, name, number) {
        this.setState({ pilihrekening: id, accountName: name, accountNumber: number })
    }

    testDuitku = () => {
        this.props.navigation.navigate('TestDuitku')
    }

    renderTransaksi() {
        const { pilihtransaksi, transaksi, detail, datauser } = this.state
        return transaksi.map((item, index) => {
            return (
                <View key={index}>
                    <View style={{ flexDirection: 'row', marginLeft: 10, alignItems: 'center' }}>
                        <RadioButton
                            disabled={item.idtransaksi == 4 && currencyFormat(Number(datauser.saldo)) < Number(this.props.route.params.totalbayar) ?
                                true : null
                            }
                            value="transfer"
                            color={colors.default}
                            status={pilihtransaksi == item.idtransaksi ? 'checked' : 'unchecked'}
                            onPress={() => { this.setState({ pilihtransaksi: item.idtransaksi, detail: item.idtransaksi }); }}
                        />
                        <Text style={pilihtransaksi === item.idtransaksi ? { color: colors.default } : { color: 'gray' }}>{item.idtransaksi == 4 && currencyFormat(Number(datauser.saldo)) < Number(this.props.route.params.totalbayar) ? item.tipetransaksi + ' (Saldo tidak cukup)' : item.tipetransaksi}</Text>
                    </View>
                </View>
            )
        })
    }

    renderRekening() {
        const { pilihrekening, rekening } = this.state
        return rekening.map((item, index) => {
            return (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical:5 }}>
                    <View style={{ height: 32, width: 32, borderWidth: 1, borderRadius: 7, borderColor: pilihrekening==item.IDRekening ? colors.bgheader : colors.default, justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Checkbox
                            color={colors.bgheader}
                            status={pilihrekening == item.IDRekening ? 'checked' : 'unchecked'}
                            onPress={() => { this.pilihRekening(item.IDRekening, item.AccountName, item.AccountNumber) }}
                        />
                    </View>
                    <TouchableOpacity onPress={() => { this.pilihRekening(item.IDRekening, item.AccountName, item.AccountNumber) }} >
                        <Text style={{ fontSize: 17 , marginLeft:5}}>{item.NamaBank}</Text>
                    </TouchableOpacity>
                </View>
            )
        })
    }


    render() {
        const { transaksi, pilihtransaksi, pilihrekening, AlertShow, AlertMessage, AlertStatus, loading, alamat, jatutemp } = this.state;
        return (
            <View style={styles.container}>
                <Header title="PAYMENT" />
                <ScrollView style={{ width: '100%' }}>
                    <View style={styles.content}>
                        <View style={styles.categoryPayment}>
                            <Text style={styles.txtCategory}>PILIH PEMBAYARAN</Text>
                            {/* <View style={{ flexDirection: 'row', marginLeft: 10, alignItems: 'center' }}>
                                <RadioButton
                                    disabled={true}
                                    value="transfer"
                                    color={colors.bgheader}
                                    status={pilihtransaksi == 'PaymentCC' ? 'checked' : 'unchecked'}
                                    onPress={() => { this.setState({ pilihtransaksi: 'PaymentCC', tipe: 3 }); }}
                                />
                                <Text style={transaksi.PaymentCC == 1 ? { color: colors.default, fontSize: 16 } : { color: '#bdbdbd', fontSize: 16 }}>Payment CC</Text>
                            </View> */}
                            <TouchableOpacity style={[styles.paymentType, transaksi.PaymentCOD == 1 ? null : { backgroundColor: '#d1d1d1' }]}
                                onPress={() => { transaksi.PaymentCOD == 1 ? this.setState({ pilihtransaksi: 'PaymentCOD', tipe: 5 }) : null }}
                            >
                                <RadioButton
                                    disabled={transaksi.PaymentCOD == 1 ? false : true}
                                    value="transfer"
                                    color={colors.bgheader}
                                    status={pilihtransaksi == 'PaymentCOD' ? 'checked' : 'unchecked'}
                                    onPress={() => { this.setState({ pilihtransaksi: 'PaymentCOD', tipe: 5 }); }}
                                />
                                <Text style={transaksi.PaymentCOD == 1 ? { color: colors.default, fontSize: 17 } : { color: '#757575', fontSize: 16 }}>COD (Cash On Delevery)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.paymentType, transaksi.PaymentTransfer == 1 ? pilihtransaksi == 'PaymentTransfer' ? {backgroundColor:colors.bgheader}:null : { backgroundColor: '#d1d1d1' }]}
                                onPress={() => { transaksi.PaymentTransfer == 1 ? this.setState({ pilihtransaksi: 'PaymentTransfer', tipe: 2 }) : null }}
                            >
                                <RadioButton
                                    disabled={transaksi.PaymentTransfer == 1 ? false : true}
                                    value="transfer"
                                    color="white"
                                    status={pilihtransaksi == 'PaymentTransfer' ? 'checked' : 'unchecked'}
                                    onPress={() => { this.setState({ pilihtransaksi: 'PaymentTransfer', tipe: 2 }); }}
                                />
                                <Text style={transaksi.PaymentTransfer == 1 ? pilihtransaksi == 'PaymentTransfer' ? { color: 'white', fontSize: 17 } :{ color: colors.default, fontSize: 17 } : { color: '#757575', fontSize: 16 }}>Bank / OVO / GoPay - Transfer</Text>
                            </TouchableOpacity>
                            <View style={[styles.detailTransfer, pilihtransaksi == 'PaymentTransfer' ? null : { display: 'none' }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                                    {this.renderRekening()}
                                </View>
                                <View style={[styles.detailRekening, pilihrekening == 0 ? { display: 'none' } : null]}>
                                    <Text style={{ fontSize: 18 }}>Account Name : {this.state.accountName}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 17 }}>Account Number : {this.state.accountNumber}</Text>
                                        <TouchableOpacity
                                            style={{ height: 25, width: 50, borderWidth: 1, borderColor: colors.bgheader, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }}
                                            onPress={() => this.writeToClipboard()} >
                                            <Text style={{ fontSize: 16, color: colors.bgheader, }}>Salin</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={[styles.paymentType, transaksi.PaymentTempo == 1 ? pilihtransaksi == 'PaymentTempo' ?{backgroundColor:colors.bgheader}:null : { backgroundColor: '#d1d1d1' }]}
                                onPress={() => { transaksi.PaymentTempo == 1 ? this.setState({ pilihtransaksi: 'PaymentTempo', tipe: 4 }) : null }}
                            >
                                <RadioButton
                                    disabled={transaksi.PaymentTempo == 1 ? false : true}
                                    value="transfer"
                                    color="white"
                                    status={pilihtransaksi == 'PaymentTempo' ? 'checked' : 'unchecked'}
                                    onPress={() => { this.setState({ pilihtransaksi: 'PaymentTempo', tipe: 4 }); }}
                                />
                                <Text style={transaksi.PaymentTempo == 1 ? pilihtransaksi == 'PaymentTempo' ? { color: 'white', fontSize: 17 }: { color: colors.default, fontSize: 17 } : { color: '#757575', fontSize: 16 }}>Tempo</Text>
                            </TouchableOpacity>
                            <View style={[styles.paymentType, { backgroundColor: '#d1d1d1' }]}
                                onPress={() => { this.setState({ pilihtransaksi: 'PaymentDuitku', tipe: 6 }); }}
                            >
                                <RadioButton
                                    disabled={true}
                                    value="transfer"
                                    color="white"
                                    status={pilihtransaksi == 'PaymentDuitku' ? 'checked' : 'unchecked'}
                                    onPress={() => { this.setState({ pilihtransaksi: 'PaymentDuitku', tipe: 6 }); }}
                                />
                                <Text style={transaksi.PaymentBalance == 1 ? { color: '#757575', fontSize: 17 } : { color: '#757575', fontSize: 16 }}>Credit Card</Text>
                            </View>
                            <TouchableOpacity style={[styles.paymentType, transaksi.PaymentBalance == 1 ? pilihtransaksi == 'PaymentBalance' ? {backgroundColor:colors.bgheader}:null : { backgroundColor: '#d1d1d1' }]}
                                onPress={() => { transaksi.PaymentBalance == 1 ? this.setState({ pilihtransaksi: 'PaymentBalance', tipe: 7 }) : null }}
                            >
                                <RadioButton
                                    disabled={transaksi.PaymentBalance == 1 ? false : true}
                                    value="transfer"
                                    color="white"
                                    status={pilihtransaksi == 'PaymentBalance' ? 'checked' : 'unchecked'}
                                    onPress={() => { this.setState({ pilihtransaksi: 'PaymentBalance', tipe: 7 }); }}
                                />
                                <View>
                                    <Text style={transaksi.PaymentBalance == 1 ? pilihtransaksi == 'PaymentBalance' ? { color: 'white', fontSize: 17 } : { color: colors.default, fontSize: 17 } : { color: '#757575', fontSize: 16 }}>Saldo Brewery</Text>
                                    <Text style={transaksi.PaymentBalance == 1 ? { color: colors.bgheader, fontSize: 17 } : { color: 'red', fontSize: 16 }}>Saldo anda sebesar Rp {currencyFormat(Number(transaksi.SaldoBrewery))}</Text>
                                </View>
                            </TouchableOpacity>
                            {/* <View style={[styles.detailTransfer, pilihtransaksi == '2' ? { height: 60 } : { display: 'none' }]}>
                                <Text style={{ color: colors.text, marginLeft: 5, fontSize: 15, fontWeight: 'bold' }}>Tanggal jatuh tempo : {jatutemp}</Text>
                            </View>
                            <View style={[styles.detailTransfer, pilihtransaksi == '3' ? { height: 60 } : { display: 'none' }]}>
                                <Text style={{ color: colors.text, marginLeft: 5, fontSize: 15, fontWeight: 'bold' }}>PEMBAYARAN SAAT BARANG DI TERIMA</Text>
                            </View>
                            <View style={[styles.detailTransfer, pilihtransaksi == '4' ? { height: 60 } : { display: 'none' }]}>
                                <Text style={{ color: colors.text, marginLeft: 5, fontSize: 15, fontWeight: 'bold' }}>IKIWAE SALDO Rp {currencyFormat(Number(this.state.datauser.saldo))}</Text>
                            </View> */}
                        </View>
                        {/* <View style={styles.contentAlamat}>
                            <Text style={styles.txtAlamat}>Alamat Lengkap : </Text>
                            <View style={styles.detailAlamat}>
                                <Text>{alamat.alamatlengkap == undefined ? '' : alamat.alamatlengkap + ', ' + alamat.kecamatan + ', ' + alamat.kabupaten + ', ' + alamat.provinsi}</Text>
                            </View>
                        </View> */}
                        {/* <View style={styles.contentKeterangan}>
                            <Text style={styles.txtAlamat}>Catatan : </Text>
                            <View style={{ paddingHorizontal: 10, }}>
                                <TextInput
                                    placeholder="Keterangan"
                                    style={styles.textInputKet}
                                    multiline={true}
                                    numberOfLines={4}
                                    onChangeText={text => this.setState({ keterangan: text })}
                                    value={this.state.keterangan}
                                />
                            </View>
                        </View> */}
                    </View>
                    <Loader
                        loading={loading} />
                    <AlertModal
                        loading={AlertShow} message={AlertMessage} status={AlertStatus} />
                </ScrollView>
                {/* <View>
                    <TouchableOpacity style={[styles.btnPayment, { width: 70 }]}
                        onPress={() => this.testDuitku()}
                    >
                        <Text style={{ color: 'white' }}>DUITKU</Text>
                    </TouchableOpacity>
                </View> */}
                <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <View style={styles.contentTotPayment}>
                        <Text style={styles.txtTotPayment}>Total Bayar : </Text>
                        <View style={styles.contentTot}>
                            <Text style={styles.txtNominalPayment}>{currencyFormat(Number(this.props.route.params.totalbayar))},-</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.contentPayment}>
                    <TouchableOpacity style={styles.btnPayment}
                        onPress={this.payment}
                    >
                        <Text style={styles.txtBtnPayment}>PAYMENT</Text>
                    </TouchableOpacity>
                </View>
                <CustomToast ref="defaultToastBottom" position="bottom" />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
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
        paddingVertical: 5,
    },
    categoryPayment: {
        width: '100%',
        backgroundColor: colors.defaultBackGround,
        paddingBottom: 3,
        justifyContent: 'space-evenly',
    },
    txtCategory: {
        fontSize: 17,
        fontWeight: 'bold',
        color: colors.default,
        marginLeft: 10,
        marginTop: 10,
    },
    paymentType: {
        flexDirection: 'row',
        marginLeft: 10,
        alignItems: 'center',
        backgroundColor: 'white',
        width: '96%',
        height: 55,
        borderRadius: 5,
        shadowColor: "#eee",
        shadowOffset: {
            width: 5,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 7,
        marginVertical: 5
    },
    detailTransfer: {
        width: '92%',
        backgroundColor: '#F2F2F2',
        justifyContent: 'center',
        marginLeft: 20,
    },
    detailRekening: {
        alignItems: 'flex-start',
        paddingBottom: 5,
        paddingHorizontal: 5,
        marginTop: 5,
    },
    contentAlamat: {
        width: '100%',
        backgroundColor: 'white',
        marginTop: 3,
        paddingBottom: 3,
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
    },
    contentKeterangan: {
        height: 85,
        width: '100%',
        backgroundColor: 'white',
        marginTop: 3,
    },
    textInputKet: {
        height: 60,
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5
    },
    contentTotPayment: {
        height: 65,
        width: '100%',
        backgroundColor: 'white',
        marginTop: 2,
        borderRadius: 3,
        paddingLeft: 10,
    },
    txtTotPayment: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.default,
    },
    txtNominalPayment: {
        fontSize: 25,
        fontWeight: 'bold',
        color: colors.default,
    },
    contentPayment: {
        height: 50,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentTot: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: 5,
    },
    btnPayment: {
        height: 40,
        width: '95%',
        backgroundColor: colors.bgheader,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    txtBtnPayment: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white'
    },
    uploadImage: {
        height: 200,
        width: 200,
    },
    uploadBtn: {
        width: 60,
        height: 20,
        backgroundColor: colors.default,
        borderRadius: 3,
        marginTop: 5,
        marginLeft: 5,
    },
    textInput: {
        height: 40,
        width: 70,
        borderBottomWidth: 1,
        borderBottomColor: 'gray'
    }

});
