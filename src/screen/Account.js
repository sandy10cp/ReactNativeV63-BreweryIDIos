import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ToastAndroid, Alert, TextInput, Keyboard, Modal } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAwe from 'react-native-vector-icons/MaterialIcons';
import IconWallet from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../utils';
import API from '../service';
import Shimmer from '../content/Shimmer';
import Loader from '../LoaderAlert/Loader';
import AlertModal from '../LoaderAlert/AlertModal';
import currencyFormat from '../function/currencyFormat';
import { ScrollView } from 'react-native-gesture-handler';
import { RNToasty } from 'react-native-toasty';

export default class Account extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            user: [],
            datauser: {},
            visible: false,
            idbuyer: '',
            auth: '',
            idcabang: '',
            kodecabang: '',
            phone: '',
            inputPhone: false,
            nama: '',
            inputNama: false,
            loading: false,
            AlertShow: false,
            AlertMessage: '',
            AlertStatus: true,
            activeLogout: false,
            referal: '',
            inputReferal: false,
            modalVisible: false,
            namaReferal: ''
        };

        this._isMounted = false;
    }

    async componentDidMount() {
        await this.getUser()
        this._isMounted = true;
        this._isMounted && this.fetchUser()

        this.reRenderSomething = this.props.navigation.addListener('focus', async () => {
            this.fetchUser()
        });

        Keyboard.addListener("keyboardDidHide", this._keyboardDidHide.bind(this))
        // Keyboard.addListener("keyboardDidHide", this._keyboardDidHide1.bind(this))
        // Keyboard.addListener("keyboardDidHide", this._keyboardDidHide2.bind(this))

    }

    _keyboardDidHide() {
        // alert("Phone save");
        const { inputPhone, inputNama, inputReferal } = this.state
        if (inputPhone) {
            this.editPhone()
            this.setState({ inputPhone: false })
        } else if (inputNama) {
            this.editNama()
            this.setState({ inputNama: false })
        } else if (inputReferal) {
            this.searchReferal()
            this.setState({ inputReferal: false })
        }
    };

    // _keyboardDidHide1() {
    //     // alert("Phone save");
    //     this.editNama()
    //     this.setState({ inputNama: false })
    // };

    // _keyboardDidHide2() {
    //     // alert("Phone save");
    //     this.editReferal()
    //     this.setState({ inputReferal: false })
    // };

    // componentDidUpdate(prevProps, prevState) {
    //     // only update chart if the data has changed
    //     if (prevState.datauser != this.state.datauser) {
    //         console.warn('mounting')
    //         this.fetchUser()
    //     }

    // }

    componentWillUnmount() {
        this._isMounted = false;
        this.reRenderSomething;
        Keyboard.removeListener("keyboardDidHide", this._keyboardDidHide);
        // Keyboard.removeListener("keyboardDidHide", this._keyboardDidHide1);
        // Keyboard.removeListener("keyboardDidHide", this._keyboardDidHide2);
    }

    async setLocalStorage(data) {
        await AsyncStorage.setItem('user', JSON.stringify(data))
            .then(() => {
                //console.log('It was saved successfully')
            })
            .catch(() => {
                console.log('Gagal simpan ke local')
            })
    }

    LogoutAlert = () => {
        Alert.alert(
            'Brewery ID',
            'Do you want to Logout?',
            [
                { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Yes', onPress: () => this.Logout() },
            ],
            { cancelable: false });
    }

    Logout = () => {
        const data = { aksi: 116, idbuyer: this.state.idbuyer, authkey: this.state.auth }
        API.Fetch(data)
            .then((result) => {
                if (result.ErrorCode == '0') {
                    const user = {
                        id: 0,
                        IsActive: 0,
                        IsLogin: 0,
                        authkey: '',
                        idcabang: 0,
                        kodecabang: ''
                    }
                    this.setLocalStorage(user)
                    this.props.navigation.replace('Login')
                } else {
                    console.log('Gagal')
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    stopAlert() {
        setTimeout(() => {
            this.setState({ ...state, AlertShow: false });
        }, 5500);
    }

    async getUser() {
        await AsyncStorage.getItem('user', (error, result) => {
            const d = JSON.parse(result)
            // console.log(d)
            this.setState({
                idbuyer: d.id,
                auth: d.authkey,
                idcabang: d.idcabang,
                kodecabang: d.kodecabang
            })
            // this.fetchUser(d)
        });
    }

    fetchUser() {
        const { idbuyer, auth, idcabang } = this.state
        const data = { aksi: 119, idbuyer, authkey: auth, idcabang, }
        // console.log(data)
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    this.setState({ datauser: result, visible: true, activeLogout: true })
                } else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.119.1') {
                    this.props.navigation.replace('Login')
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.2.0') {
                    this.props.navigation.replace('Login')
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.2.1') {
                    this.props.navigation.replace('Login')
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.2.2') {
                    this.props.navigation.replace('Login')
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.2.3') {
                    this.props.navigation.replace('Login')
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.2.4') {
                    this.props.navigation.replace('Login')
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                }
                else {
                    this.setState({ datauser: {}, visible: true })
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    topUp = () => {
        this.props.navigation.navigate('TopUpTabs')
    }

    editAccount = () => {
        this.props.navigation.navigate('EditAccount', { nama: this.state.datauser.Nama, phone: this.state.datauser.Phone })
    }

    editPhone = () => {
        const { idbuyer, auth, phone, datauser } = this.state
        if (phone != datauser.Phone) {
            const data = {
                aksi: 124,
                idbuyer,
                authkey: auth,
                phone: phone
            }
            API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        this.fetchUser()
                        RNToasty.Normal({ title: 'Success edit phone', duration: 0 })
                    } else if (result.ErrorCode == '2.1') {
                        this.props.navigation.replace('Login')
                    } else {
                        RNToasty.Normal({ title: result.ErrorDesc, duration: 0 })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    }

    pilihEditPhone = () => {
        this.setState({ inputPhone: !this.state.inputPhone, phone: this.state.datauser.Phone })
    }

    editReferal = () => {
        this.setState({ loading: true })
        const { idbuyer, auth, referal } = this.state
        const data = {
            aksi: 142,
            idbuyer,
            authkey: auth,
            idreferal: referal
        }
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    this.setState({ loading: false, AlertShow: true, AlertMessage: 'Success, Search referal', AlertStatus: true });
                    this.setState({ modalVisible: false, inputReferal: false, referal: '', namaReferal: '' })
                    this.stopAlert()
                    this.fetchUser()
                } else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                }
                else {
                    this.setState({ loading: false, AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: false });
                    this.stopAlert()
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    pilihEditReferal = () => {
        this.setState({ modalVisible: true, })
    }

    editNama = () => {
        const { idbuyer, auth, nama, datauser } = this.state
        if (nama != datauser.Nama) {
            const data = {
                aksi: 122,
                idbuyer,
                authkey: auth,
                nama
            }
            API.Fetch(data)
                .then((result) => {
                    if (result.ErrorCode == '0') {
                        this.fetchUser()
                        RNToasty.Normal({ title: 'Success edit nama', duration: 0 })
                    } else if (result.ErrorCode == '2.1') {
                        this.props.navigation.replace('Login')
                    } else {
                        RNToasty.Normal({ title: result.ErrorDesc, duration: 0 })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    }

    pilihEditNama = () => {
        this.setState({ inputNama: !this.state.inputNama, nama: this.state.datauser.Nama })
    }

    cashPage = () => {
        this.props.navigation.navigate('CashTabs')
    }

    stopAlert() {
        setTimeout(() => {
            this.setState({ AlertShow: false });
        }, 3500);
    }

    searchReferal = () => {
        this.setState({ loading: true })
        const { idbuyer, auth, referal } = this.state

        const data = {
            aksi: 147,
            idbuyer,
            authkey: auth,
            idreferal: referal
        }
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    this.setState({ loading: false, AlertShow: true, AlertMessage: 'Success, Search referal', AlertStatus: true });
                    this.setState({ namaReferal: result.NamaReferal })
                    this.stopAlert()
                } else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                }
                else {
                    this.setState({ loading: false, AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: false });
                    this.stopAlert()
                    this.setState({ namaReferal: '' })
                }
            })
            .catch((error) => {
                console.log(error)
            })

    }

    render() {
        const { datauser, visible, loading, AlertMessage, AlertShow, AlertStatus, modalVisible, namaReferal } = this.state
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.account}>
                        <View style={{ height: 50, width: 50, backgroundColor: 'white', borderRadius: 25 }} >
                            <Image source={require('../icon/profile.png')} style={{ height: 50, width: 50 }} />
                        </View>
                        <Shimmer autoRun={true} visible={visible} style={{ marginTop: 2, width: 90 }} />
                        <Text style={styles.txtNama}>{datauser.Nama}</Text>
                        <Text style={styles.txtNama}>{datauser.NamaLevel}</Text>
                        <Text style={[styles.txtNama, { fontStyle: 'italic' }]}>{datauser.IsReferal == 1 ? visible ? `Kode Referal : ${datauser.ID}` : null : null}</Text>
                    </View>
                    <View style={styles.contentPoint}>
                        <View style={styles.point}>
                            <IconWallet name="bitcoin" size={30} color={colors.bgheader} />
                            <Text style={styles.txtPoint}>{datauser.Point}</Text>
                            <Text style={{ color: colors.textGray, fontSize: 16, fontWeight: '600' }}>POINT</Text>
                        </View>
                        <View style={{ height: 60, width: '0.5%' }} />
                        <TouchableOpacity style={styles.point}
                            onPress={() => this.cashPage()}
                        >
                            <Icon name="money" size={30} color={colors.bgheader} />
                            <Text style={styles.txtPoint}>{datauser.SaldoCash == null ? 0 : currencyFormat(Number(datauser.SaldoCash))}</Text>
                            <Text style={{ color: colors.textGray, fontSize: 16, fontWeight: '600' }}>CASH</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.accountDetail}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.detail}>
                            <View style={{ width: 30, justifyContent: 'center', alignItems: 'center' }}>
                                <IconWallet name="wallet-outline" size={30} color={colors.bgheader} />
                            </View>
                            <View style={{ width: '88%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ width: '88%', height: 40, justifyContent: 'center' }}>
                                    <Text style={[styles.txtDetail, { fontWeight: 'bold', fontSize: 20 }]}>{datauser.Saldo == null ? 'Rp ' + 0 : 'Rp ' + currencyFormat(Number(datauser.Saldo))}</Text>
                                </View>
                                <TouchableOpacity onPress={this.topUp}>
                                    <IconWallet name="arrow-up-bold-circle-outline" size={30} color={colors.bgheader} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.detail}
                            onPress={() => this.setState({ inputNama: !this.state.inputNama, nama: datauser.Nama })}
                        >
                            <View style={{ width: 30, justifyContent: 'center', alignItems: 'center' }}>
                                <Icon name="user-o" size={30} color={colors.bgheader} />
                            </View>
                            <View style={{ width: '88%', flexDirection: 'row', justifyContent: 'space-between', }}>
                                <View style={[{ width: '88%', height: 40, justifyContent: 'center' }, this.state.inputNama ? { display: 'none' } : null]}>
                                    <Text style={styles.txtDetail}>{datauser.Nama}</Text>
                                    <Shimmer autoRun={true} visible={visible} style={{ marginLeft: 3, marginBottom: 10, width: 90 }} />
                                </View>
                                <View style={[styles.accountEdit, { width: '80%' }, this.state.inputNama ? null : { display: 'none' }]}>
                                    <TextInput
                                        placeholder="Name"
                                        placeholderTextColor="gray"
                                        style={styles.textInput}
                                        inlineImageLeft='user'
                                        inlineImagePadding={2}
                                        maxLength={25}
                                        value={this.state.nama}
                                        onChangeText={nama => this.setState({ nama })}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => this.pilihEditNama()}
                                >
                                    <IconWallet name="account-edit" size={30} color={colors.bgheader} />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.detail}
                            onPress={() => this.setState({ inputPhone: !this.state.inputPhone, phone: datauser.Phone })}
                        >
                            <View style={{ width: 30, justifyContent: 'center', alignItems: 'center' }}>
                                <Icon name="mobile" size={35} color={colors.bgheader} />
                            </View>
                            <View style={{ width: '88%', flexDirection: 'row', justifyContent: 'space-between', }}>
                                <View style={[{ width: '88%', height: 40, justifyContent: 'center' }, this.state.inputPhone ? { display: 'none' } : null]}>
                                    <Text style={styles.txtDetail}>{datauser.Phone}</Text>
                                    <Shimmer autoRun={true} visible={visible} style={{ marginBottom: 10, width: 90 }} />
                                </View>
                                <View style={[styles.accountEdit, { width: '80%' }, this.state.inputPhone ? null : { display: 'none' }]}>
                                    <TextInput
                                        placeholder="Phone Number"
                                        placeholderTextColor="gray"
                                        style={styles.textInput}
                                        inlineImageLeft='user'
                                        inlineImagePadding={2}
                                        keyboardType={'numeric'}
                                        maxLength={16}
                                        value={this.state.phone}
                                        autoFocus={this.state.inputPhone}
                                        onSubmitEditing={Keyboard.dismiss}
                                        keyboardShouldPersistTaps={() => alert('save')}
                                        onChangeText={phone => this.setState({ phone })}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => this.pilihEditPhone()}
                                >
                                    <IconWallet name="account-edit" size={30} color={colors.bgheader} />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.detail}>
                            <View style={{ width: 30, justifyContent: 'center', alignItems: 'center' }}>
                                <Icon name="envelope-o" size={25} color={colors.bgheader} />
                            </View>
                            <Shimmer autoRun={true} visible={visible} style={{ marginLeft: 5, width: 90 }} />
                            <Text style={styles.txtDetail}>{datauser.Email}</Text>
                        </View>
                        <View style={styles.detail}>
                            <View style={{ width: 30, justifyContent: 'center', alignItems: 'center' }}>
                                <IconWallet name="registered-trademark" size={30} color={colors.bgheader} />
                            </View>
                            <Shimmer autoRun={true} visible={visible} style={{ marginLeft: 5, width: 90 }} />
                            <Text style={styles.txtDetail}>{datauser.TanggalRegistrasi}</Text>
                        </View>
                        <View style={styles.detail}
                            onPress={() => this.setState({ inputReferal: !this.state.inputReferal, referal: datauser.IDReferal })}
                        >
                            <View style={{ width: 110, justifyContent: 'center' }}>
                                <Text style={[styles.txtDetail, { fontSize: 20, fontWeight: 'bold', }]}>Referal - </Text>
                            </View>
                            <View style={{ width: '68%', flexDirection: 'row', justifyContent: 'space-between', }}>
                                <View style={[{ width: '88%', height: 40, justifyContent: 'center' }, datauser.IDReferal == 0 ? { display: 'none' } : null]}>
                                    <Text style={[styles.txtDetail, { fontSize: 20, fontWeight: 'bold' }]}>{datauser.NamaReferal}</Text>
                                    <Shimmer autoRun={true} visible={visible} style={{ marginBottom: 10, width: 90 }} />
                                </View>
                                <TouchableOpacity style={[{ width: '100%', height: 35, backgroundColor: colors.bgheader, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }, datauser.IDReferal != 0 ? { display: 'none' } : null]}
                                    onPress={() => this.pilihEditReferal()}
                                >
                                    {/* <IconWallet name="account-edit" size={30} color={colors.bgheader} /> */}
                                    <Text style={{ fontSize: 18, fontWeight: '900', color: 'white' }}>Pilih Referal</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/* <View style={[styles.detail, { height: 70, paddingRight: 10, }]}>
                        <View style={{ width: 30, justifyContent: 'center', alignItems: 'center' }}>
                            <Icon name="map-marker" size={35} color={colors.bgheader} />
                        </View>
                        <Shimmer autoRun={true} visible={visible} style={{ marginLeft: 5, width: 90 }} />
                        <View style={{ width: '92%', }}>
                            <Text style={styles.txtDetail}>{datauser.alamatlengkap == null ? null : datauser.alamatlengkap + ', ' + datauser.kecamatan + ', ' + datauser.kabupaten + ', ' + datauser.provinsi}</Text>
                        </View>
                    </View> */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: '96%', marginBottom: 10, }}>
                            <TouchableOpacity
                                style={[styles.contentLogout, { width: 83 }]}
                                onPress={this.editAccount}
                            >
                                <Text style={[styles.txtLogout, { textAlign: 'center', fontSize: 13 }]}>EDIT PASSWORD</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.contentLogout, { backgroundColor: '#9e0207' }]}
                                onPress={this.state.activeLogout ? this.LogoutAlert : null}
                            >
                                <Text style={styles.txtLogout}>LOGOUT</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
                <Loader
                    loading={loading} />
                <AlertModal
                    loading={AlertShow} message={AlertMessage} status={AlertStatus} />
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                // onRequestClose={() => {
                //     Alert.alert("Modal has been closed.");
                // }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <TouchableOpacity
                                style={{ ...styles.openButton, backgroundColor: colors.bgheader }}
                                onPress={() => {
                                    this.setState({ modalVisible: !modalVisible, inputReferal: false, referal: '', namaReferal: '' })
                                }}
                            >
                                <Text style={styles.textStyle}>X</Text>
                            </TouchableOpacity>
                            <View style={styles.contentReview}>
                                <View style={{ justifyContent: 'space-around', alignItems: 'center', height: '60%', }}>
                                    <View style={{ alignItems: 'center', width: '100%', flexDirection: 'row', }}>
                                        <View>
                                            <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.default }}>Referal : </Text>
                                        </View>
                                        <View style={styles.accountEdit}>
                                            <TextInput
                                                placeholder="Input ID Referal"
                                                placeholderTextColor="gray"
                                                style={styles.textInput}
                                                inlineImageLeft='user'
                                                inlineImagePadding={2}
                                                keyboardType={'numeric'}
                                                maxLength={16}
                                                value={this.state.referal}
                                                autoFocus={modalVisible}
                                                onSubmitEditing={Keyboard.dismiss}
                                                keyboardShouldPersistTaps={() => alert('save')}
                                                onChangeText={referal => this.setState({ referal, inputReferal: true })}
                                            />
                                        </View>
                                        <TouchableOpacity style={{ height: 45, width: 70, backgroundColor: colors.bgheader, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }}
                                            onPress={() => this.searchReferal()}
                                        >
                                            <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }}>Cari</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                        {
                                            namaReferal == '' ?
                                                <Text>Search Referal</Text>
                                                :
                                                <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.default }}>Nama : <Text style={{ fontStyle: 'italic' }}>{namaReferal}</Text></Text>
                                        }
                                    </View>
                                </View>
                                <View style={[styles.contentBtn, namaReferal == '' ? { display: 'none' } : null]}>
                                    <TouchableOpacity style={{ height: 50, width: 70, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', borderRadius: 4 }}
                                        onPress={() => this.setState({ modalVisible: !modalVisible, inputReferal: false, referal: '', namaReferal: '' })}
                                    >
                                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ height: 50, width: 70, backgroundColor: colors.bgheader, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }}
                                        onPress={() => this.editReferal()}
                                    >
                                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
    },
    content: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bgheader
    },
    account: {
        flex: 1,
        width: '100%',
        height: '67%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    txtNama: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    },
    contentPoint: {
        flexDirection: 'row',
        width: '98%',
        height: '33%',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: 3,
    },
    point: {
        height: 85,
        width: '49.7%',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#eee",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 7,
    },
    accountDetail: {
        flex: 1.5,
        width: '100%',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround,
    },
    txtPoint: {
        fontWeight: 'bold',
        fontSize: 20,
        color: colors.text
    },
    detail: {
        height: 50,
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingLeft: 4,
        alignItems: 'center',
        marginVertical: 5,
        borderRadius: 3,
        shadowColor: "#eee",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 7,
    },
    txtDetail: {
        fontWeight: '900',
        fontSize: 17,
        color: colors.text,
        marginLeft: 10,
    },
    contentLogout: {
        height: 35,
        width: 70,
        backgroundColor: colors.bgheader,
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    txtLogout: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold'
    },
    accountEdit: {
        margin: 3,
        borderBottomColor: colors.bgheader,
        borderBottomWidth: 0.5,
        width: '60%'
    },
    textInput: {
        fontSize: 18,
        color: colors.default,
        backgroundColor: '#e3e3e3',
        height:40,
        paddingHorizontal:5
    },
    centeredView: {
        flex: 1,
        paddingTop:120,
        justifyContent: 'flex-start',
        alignItems: "center",
        backgroundColor: 'rgba(201, 201, 201, 0.7)',
        width: '100%'
    },
    modalView: {
        backgroundColor: "white",
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        height: '40%',
        width: '100%'
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 15
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
        // position: 'absolute',
        // top: -15,
    },
    contentReview: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '92%',
        height: '100%'
    },
    title: {
        width: '100%',
        height: 30,
        backgroundColor: '#d1d1d1',
        paddingHorizontal: 5,
        justifyContent: 'center'
    },
    contentBtn: {
        width: '100%',
        flexDirection: 'row',
        height: '40%',
        alignItems: 'center',
        justifyContent: 'space-around'
    }
});