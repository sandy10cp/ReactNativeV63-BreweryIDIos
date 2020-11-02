import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TouchableHighlight, TextInput, RefreshControl, Alert, Button, ToastAndroid } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons';
import Loader from '../LoaderAlert/Loader';
import AlertModal from '../LoaderAlert/AlertModal';
import { colors } from '../utils'
import AsyncStorage from '@react-native-community/async-storage';
import API from '../service';
import currencyFormat from '../function/currencyFormat';
import CustomToast from '../LoaderAlert/CustomToast';

export class Activity extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            auth: '',
            idbuyer: '',
            idcabang: '',
            transaksi: [],
            activityLoad: true,
            refreshing: false,
            idsupplier: '',
            idorders: '',
            modalVisible: false,
            loading: false,
            AlertShow: false,
            AlertMessage: '',
            AlertStatus: true,
            star: [1, 2, 3, 4, 5],
            rating: 0,
            keterangan: '',
        };
        this._isMounted = false;

    }


    async componentDidMount() {
        this._isMounted = true;
        await this.getUser()

        this._isMounted && this.fetchTransaksi()

        this.reRenderSomething = this.props.navigation.addListener('focus', async () => {
            await this.getUser()
            this.fetchTransaksi()
        });

    }

    componentDidUpdate(prevProps, prevState) {
        // only update chart if the data has changed
        if (prevState.idcabang !== this.state.idcabang) {
            this.setState({ activityLoad: true, transaksi: [] })
            this.fetchTransaksi()
        }

    }

    stopAlert() {
        setTimeout(() => {
            this.setState({ AlertShow: false });
        }, 2500);
    }

    detailTransaksi(id) {
        // navigation.navigate('DetailTransaksi', { notran: id });
        this.props.navigation.navigate('Invoice', { idorder: id });
    }

    terimaBarang = (idorders) => {
        //navigation.navigate('TerimaBarang', { idsupplier, notransaksi });
        this.setState({ idorders, modalVisible: true })
    }

    uploadBukti = (idorders) => {
        const { idbuyer, auth, idcabang } = this.state
        this.props.navigation.navigate('UploadBukti', { idorders, idbuyer, auth, idcabang });
        // alert('Upload bukti')
    }

    kirimPesan = (idorders) => {
        const { idbuyer, auth, idcabang } = this.state
        // this.props.navigation.navigate('Message', { idorders: idorders, idbuyer, authkey: auth, idcabang });
    }

    history = () => {
        // this.props.navigation.navigate('History');
        alert('test')
    }

    getUser = async () => {
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
    }

    onRefresh() {
        this.fetchTransaksi()
    }

    handleRating = (rate) => {
        this.setState({ rating: rate })
    }

    saveReview = () => {
        this.setState({ loading: true, });
        const { idbuyer, auth, idcabang, keterangan, idorders } = this.state
        const data = {
            aksi: 128,
            idbuyer,
            authkey: auth,
            idcabang,
            idorders,
            catatan: keterangan,
        }
        API.Fetch(data)
            .then((result) => {
                // console.log(result);
                if (result.ErrorCode == '0') {
                    this.setState({ modalVisible: false, rating: 0 })
                    setTimeout(() => {
                        this.setState({ loading: false, AlertShow: true, AlertMessage: 'Review berhasil', AlertStatus: true });
                    }, 1000);

                    this.fetchTransaksi()
                } else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                } else {
                    this.setState({ modalVisible: false, rating: 0 })
                    setTimeout(() => {
                        this.setState({ loading: false, AlertShow: true, AlertMessage: 'Gagal', AlertStatus: false });
                    }, 1000);
                }
                this.stopAlert()
            })
            .catch((error) => {
                console.log(error)
                this.setState({ modalVisible: false, rating: 0 })
                setTimeout(() => {
                    this.setState({ loading: false, AlertShow: true, AlertMessage: 'Error Server', AlertStatus: false });
                }, 1000);
                this.stopAlert()
            })
    }

    async fetchTransaksi() {
        // console.warn('mounting')
        const { idbuyer, auth, idcabang } = this.state
        const data = { aksi: 115, idbuyer, authkey: auth, idcabang };
        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    this.setState({ transaksi: result.Activity, activityLoad: false, refreshing: false })
                } else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
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
                    this.setState({ transaksi: [], activityLoad: false, refreshing: false })
                }

            })
            .catch((error) => {
                console.log(error)
            })
    }

    renderStar() {
        return this.state.star.map((item, index) => {
            return (
                <TouchableOpacity key={index}
                    onPress={() => this.handleRating(item)}
                >
                    {
                        this.state.rating >= item ?
                            <Icon name="star" size={30} color="yellow" />
                            :
                            <Icon name="star" size={30} color="gray" />
                    }
                </TouchableOpacity>
            )
        })
    }


    renderTransaksi() {
        const { transaksi } = this.state
        return transaksi.map((item, index) => {
            return (

                <View key={index} style={styles.detail}>
                    <TouchableOpacity style={styles.infoOrder}
                        onPress={() => this.detailTransaksi(item.IDOrders)}
                    >
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: 'gray' }}>{item.OrdersNumber}</Text>
                            <Text style={{ color: '#1a78b8', marginLeft: 5, }}>({item.OrdersStatusDesc})</Text>
                        </View>
                        <Text style={{ color: 'black', fontWeight: 'bold' }}>{item.DateCreated}</Text>
                        <Text style={{ color: 'gray' }}>{item.JumlahItem} Item</Text>
                        <Text style={{ color: colors.default, marginRight: 5, }}>{item.PaymentTypeDesc}</Text>
                        <View style={{ alignItems: 'flex-start' }}>
                            <Text style={{ color: item.PaymentStatus == 1 ? '#009980' : '#f5a207', marginRight: 5, }}>{item.PaymentStatusDesc}</Text>
                            <TouchableOpacity
                                onPress={() => this.uploadBukti(item.IDOrders)}
                            >
                                <View style={[styles.uploadBtn, item.PaymentStatus == 3 ? null : { display: 'none' }]}>
                                    <Text style={{ color: 'white', fontSize: 14 }}>Upload bukti</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.infoTot}>
                        <Text style={styles.txtTotal}>Rp {currencyFormat(item.Total)}</Text>
                        {
                            item.OrdersStatus == 3 ?
                                <TouchableOpacity style={styles.btnTerima}
                                    onPress={() => this.terimaBarang(item.IDOrders)}
                                >
                                    <Text style={{ color: 'white', fontWeight: '800' }}>Terima</Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity
                                    onPress={() => this.kirimPesan(item.IDOrders)}
                                >
                                    <Icon name="chat-bubble" size={25} color="#c9c9c9" style={{ marginRight: 10 }} />
                                </TouchableOpacity>
                        }
                    </View>
                </View>
            )
        })
    }



    render() {
        const { transaksi, activityLoad, refreshing, modalVisible, loading, AlertShow, AlertMessage, AlertStatus } = this.state
        return (
            <View style={styles.container}>
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            //refresh control used for the Pull to Refresh
                            refreshing={refreshing}
                            onRefresh={this.onRefresh.bind(this)}
                        />
                    }
                >
                    <View style={styles.contentDetail}>
                        {
                            transaksi.length == 0 ?
                                <View style={styles.activityEmpty}>
                                    {
                                        activityLoad ? <ActivityIndicator
                                            size="large"
                                            animating={activityLoad}
                                            color={colors.bgheader} /> :
                                            <Text style={{ fontSize: 18, color: colors.text }}>Transaksi kosong</Text>
                                    }
                                </View> :
                                this.renderTransaksi()
                        }
                    </View>
                </ScrollView>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <TouchableHighlight
                                style={{ ...styles.openButton, backgroundColor: colors.bgheader }}
                                onPress={() => {
                                    this.setState({ modalVisible: !modalVisible, rating: 0 })
                                }}
                            >
                                <Text style={styles.textStyle}>X</Text>
                            </TouchableHighlight>

                            <View style={styles.contentReview}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.default }}>REVIEW</Text>
                                <View style={styles.contentText}>
                                    <TextInput
                                        style={[styles.textInput, { height: 80 }]}
                                        placeholder="Catatan"
                                        placeholderTextColor='gray'
                                        multiline={true}
                                        numberOfLines={5}
                                        onChangeText={(ket) => this.setState({ keterangan: ket })}
                                    />
                                </View>
                                <View style={styles.contentBtnSubmit}>
                                    <TouchableOpacity style={styles.btnSubmit}
                                        onPress={() => this.saveReview()}
                                    >
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>SUBMIT</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Loader
                    loading={loading} />
                <AlertModal
                    loading={AlertShow} message={AlertMessage} status={AlertStatus} />
                <CustomToast ref="defaultToastBottom" position="bottom" />
            </View>
        )
    }
}

export default Activity

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
    },
    header: {
        height: 45,
        width: '100%',
        backgroundColor: colors.bgheader,
        flexDirection: 'row'
    },
    activityTxtContent: {
        height: '100%',
        width: '70%',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    txtHeader: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 5,
        marginLeft: 20,
    },
    historyContent: {
        height: '100%',
        width: '100%',
    },
    btnHistory: {
        height: '100%',
        width: '100%',
        backgroundColor: '#013769',
    },
    txtHistory: {
        fontSize: 16,
        color: 'white'
    },
    content: {
        height: '100%',
        width: '100%',
        paddingVertical: 5,
    },
    contentDetail: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingBottom: 10,
    },
    detail: {
        width: '98%',
        backgroundColor: 'white',
        borderRadius: 5,
        marginVertical: 5,
        shadowColor: "#eee",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 7,
        flexDirection: 'row',
        paddingVertical: 7,
    },
    infoOrder: {
        flex: 2,
        height: '100%',
        justifyContent: 'space-evenly',
        paddingLeft: 10,
    },
    infoTot: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingVertical: 7,
        paddingRight: 8,
    },
    txtTotal: {
        fontWeight: 'bold',
        fontSize: 15,
        color: colors.default
    },
    btnTerima: {
        height: 25,
        width: 65,
        backgroundColor: colors.bgheader,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4
    },
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: "center",
        backgroundColor: 'rgba(201, 201, 201, 0.8)'
    },
    modalView: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        height: '60%',
        width: '100%'
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: -20,
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 15
    },
    contentReview: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    contenStar: {
        flexDirection: 'row',
        width: '97%',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    textInput: {
        color: colors.default,
        fontSize: 17,
        borderBottomColor: colors.default,
        borderBottomWidth: 1,
        width: '100%',
        height: 50,
        paddingHorizontal: 10,
    },
    contentText: {
        width: '97%',
        height: 80,
        marginTop: 10
    },
    contentBtnSubmit: {
        height: 50,
        width: '97%',
        marginTop: 5,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 10,
    },
    btnSubmit: {
        height: 40,
        width: 80,
        backgroundColor: colors.bgheader,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3
    },
    uploadBtn: {
        width: 90,
        height: 25,
        backgroundColor: colors.bgheader,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    }
})
