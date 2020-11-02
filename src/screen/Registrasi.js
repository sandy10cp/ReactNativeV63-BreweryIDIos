import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView, Picker, Modal } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { RadioButton, Checkbox } from 'react-native-paper';
import Loader from '../LoaderAlert/Loader';
import AlertModal from '../LoaderAlert/AlertModal';
import { colors } from '../utils';
import API from '../service';
import { url_tc, url_regis2 } from '../Url/index'


class Registrasi extends PureComponent {
    constructor(props) {
        super(props);
        this.toggleSwitch = this.toggleSwitch.bind(this);
        this.toggleSwitch2 = this.toggleSwitch2.bind(this);
        this.state = {
            phone: '',
            nama: '',
            phone_custom: true,
            otp: '',
            email: '',
            pass: '',
            pass2: '',
            code_phone: '',
            txt_color: 'black',
            loading: false,
            AlertShow: false,
            AlertMessage: '',
            AlertStatus: true,
            formRegis: this.props.route.params.formRegis,
            timer: 30,
            one: '',
            two: '',
            three: '',
            four: '',
            five: '',
            six: '',
            oneFocus: false,
            twoFocus: false,
            threeFocus: false,
            fourFocus: false,
            fiveFocus: false,
            sixFocus: false,
            idbuyer: '',
            auth: '',
            idcabang: '',
            kodecabang: '',
            showPassword: true,
            showPassword2: true,
            sendOtp: 3,
            syarat: false,
            modalVisible: false,
            tc: {},
            image: null,
            dataImage: null,
            fileName: '-',
            tipeGambah: '',
        };
    }

    async componentDidMount() {
        await this.getUser()
        // this.refs.one.focus();
        this.interval = setInterval(
            () => this.setState((prevState) => ({ timer: prevState.timer - 1 })),
            1000
        );
        this.fetchTc()
    }

    componentDidUpdate() {
        if (this.state.timer === 0) {
            clearInterval(this.interval);
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    fetchTc() {
        fetch(url_tc, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        })
            .then((resp) => resp.json())
            .then((data) => {
                // console.log(data)
                this.setState({ tc: data })
            })
            .catch((error) => {
                console.log(error)
            });
    }


    getUser() {
        AsyncStorage.getItem('user', (error, result) => {
            const d = JSON.parse(result)
            // console.log(d)
            if (d != null) {

                this.setState({
                    idbuyer: d.id,
                    auth: d.authkey,
                    idcabang: d.idcabang,
                    kodecabang: d.kodecabang
                })
            }
        });
    }

    stopAlert() {
        setTimeout(() => {
            this.setState({ AlertShow: false });
        }, 5500);
    }

    verifyNumber = () => {
        this.setState({ loading: true, });
        const { one, two, three, four, five, six } = this.state
        if (one == '' || two == '' || three == '' || four == '' || five == '' || six == '') {
            setTimeout(() => {
                this.setState({ loading: false, AlertShow: true, AlertMessage: 'Error, Input All', AlertStatus: false });
            }, 1500);
            this.stopAlert()
        } else {
            const data = { aksi: 101, idbuyer: this.state.idbuyer, authkey: this.state.auth, otp: one + two + three + four + five + six }
            API.FetchRegis(data)
                .then((result) => {
                    console.log(result)
                    if (result.ErrorCode == '0') {
                        setTimeout(() => {
                            this.setState({ formRegis: false, loading: false, AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: true });
                        }, 1000);
                        this.stopAlert()
                        const user = {
                            id: result.IDBuyer,
                            IsActive: result.IsActive,
                            IsLogin: result.IsLogin,
                            authkey: result.AuthKey,
                            idcabang: 100,
                            kodecabang: 'YGY'
                        }
                        this.setLocalStorage(user)
                        this.props.navigation.replace('BottomTabs', { initialRoute: 'Home' })
                    } else if (result.ErrorCode == '1.109') {
                        setTimeout(() => {
                            this.setState({ formRegis: false, loading: false, AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: false });
                        }, 1000);
                        this.stopAlert()
                    } else {
                        setTimeout(() => {
                            this.setState({ formRegis: false, loading: false, AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: false });
                        }, 1000);
                        this.stopAlert()
                    }
                })
                .catch((error) => {
                    console.log(error)
                    this.setState({ loading: false })
                })
        }

    }

    setLocalStorage(data) {
        AsyncStorage.setItem('user', JSON.stringify(data))
            .then(() => {
                //console.log('It was saved successfully')
                this.getUser()
            })
            .catch(() => {
                console.log('There was an error saving the product')
            })
    }

    Registrasi() {
        this.setState({ loading: true, });
        let { phone, email, pass, nama, pass2, syarat, sendOtp } = this.state
        if (phone == '' || email == '' || pass == '' || nama == '' || pass2 == '') {
            setTimeout(() => {
                this.setState({ loading: false, AlertShow: true, AlertMessage: 'Gagal, Input All', AlertStatus: false });
            }, 1000);
            this.stopAlert()
        } else if (pass != pass2) {
            setTimeout(() => {
                this.setState({ loading: false, AlertShow: true, AlertMessage: 'Gagal, Password not match', AlertStatus: false });
            }, 1000);
            this.stopAlert()
        } else if (syarat == false) {
            setTimeout(() => {
                this.setState({ loading: false, AlertShow: true, AlertMessage: 'Gagal, Please Check Terms And Condition', AlertStatus: false });
            }, 1000);
            this.stopAlert()
        }
        else {
            const data = { aksi: 100, phone, email, password: pass, password2: pass2, nama, modeotp: sendOtp }
            API.FetchRegis(data)
                .then((result) => {
                    console.log(result);
                    if (result.ErrorCode == '0') {
                        setTimeout(() => {
                            this.setState({
                                loading: false,
                                AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: true
                            });
                        }, 1500);
                        this.stopAlert()
                        const user = {
                            id: result.IDBuyer,
                            IsActive: result.IsActive,
                            IsLogin: result.IsLogin,
                            authkey: result.AuthKey,
                            idcabang: 100,
                            kodecabang: 'YGY'
                        }
                        this.setLocalStorage(user)
                        this.setState({ formRegis: false, idbuyer: result.IDBuyer, authkey: result.AuthKey })
                    } else {
                        setTimeout(() => {
                            this.setState({
                                loading: false,
                                AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: false
                            });
                        }, 2000);
                        this.stopAlert()
                    }
                })
                .catch((error) => {
                    console.log(error)
                    setTimeout(() => {
                        this.setState({
                            loading: false,
                            AlertShow: true, AlertMessage: 'Error Connection Server', AlertStatus: false
                        });
                    }, 1500);
                    this.stopAlert()
                })
            // const formData = new FormData();
            // // const data = { aksi: 100, phone, email, password: pass, password2: pass2, nama, modeotp: this.state.sendOtp }
            // formData.append('file', {
            //     uri: this.state.image.uri,
            //     type: this.state.tipeGambah, // or photo.type
            //     name: this.state.fileName,
            // });
            // API.FetchRegis(url_regis2, {
            //     method: 'POST',
            //     headers: {
            //         'Accept': "text/plain",
            //         'Content-Type': 'multipart/form-data',
            //         'phone': phone,
            //         'email': email,
            //         'password': pass,
            //         'password2': pass2,
            //         'nama': nama,
            //         'modeotp': sendOtp,
            //     },
            //     body: formData
            // })
            //     .then((response) => response.json())
            //     .then((result) => {
            //         console.log(result);
            //         if (result.ErrorCode == '0') {
            //             setTimeout(() => {
            //                 this.setState({
            //                     loading: false,
            //                     AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: true
            //                 });
            //             }, 1500);
            //             this.stopAlert()
            //             const user = {
            //                 id: result.IDBuyer,
            //                 IsActive: result.IsActive,
            //                 IsLogin: result.IsLogin,
            //                 authkey: result.AuthKey,
            //                 idcabang: 100,
            //                 kodecabang: 'YGY'
            //             }
            //             this.setLocalStorage(user)
            //             this.setState({ formRegis: false, idbuyer: result.IDBuyer, authkey: result.AuthKey })
            //         } else {
            //             setTimeout(() => {
            //                 this.setState({
            //                     loading: false,
            //                     AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: false
            //                 });
            //             }, 2000);
            //             this.stopAlert()
            //         }

            //     })
            //     .catch((error) => {
            //         console.log(error)
            //         setTimeout(() => {
            //             this.setState({
            //                 loading: false,
            //                 AlertShow: true, AlertMessage: 'Error Connection Server', AlertStatus: false
            //             });
            //         }, 1500);
            //         this.stopAlert()
            //     });

        }
    }

    toggleSwitch() {
        this.setState({ showPassword: !this.state.showPassword });
    }

    toggleSwitch2() {
        this.setState({ showPassword2: !this.state.showPassword2 });
    }

    goToLogin() {
        this.props.navigation.navigate('Login');
    }

    cancelRegis() {
        const data = { aksi: 102, idbuyer: this.state.idbuyer, authkey: this.state.auth }
        API.FetchRegis(data)
            .then((result) => {
                // console.log(result)
                const user = {
                    id: 0,
                    IsActive: 0,
                    IsLogin: 0,
                    authkey: '',
                    idcabang: 0,
                    kodecabang: ''
                }
                this.setLocalStorage(user)
                this.props.navigation.replace('Login');
            })
            .catch((error) => {
                console.log(error)
            })
        // alert(JSON.stringify(data))
    }

    resendOtp() {
        this.setState({ one: '', two: '', three: '', four: '', oneFocus: true, fourFocus: false })
        this.refs.one.focus()
    }

    handleChangeTextOne = (text) => {
        this.setState({ one: text }, () => { if (this.state.one) this.refs.two.focus(); });
    }

    handleChangeTextTwo = (text) => {
        this.setState({ two: text }, () => { if (this.state.two) this.refs.three.focus(); });
    }

    handleChangeTextThree = (text) => {
        this.setState({ three: text }, () => { if (this.state.three) this.refs.four.focus() });
    }

    handleChangeTextFour = (text) => {
        this.setState({ four: text }, () => { if (this.state.four) this.refs.five.focus() });
    }

    handleChangeTextFive = (text) => {
        this.setState({ five: text }, () => { if (this.state.five) this.refs.six.focus() });
    }

    handleChangeTextSix = (text) => {
        this.setState({ six: text });
    }

    backspace = (id) => {
        if (id === 'two') {
            if (this.state.two) { this.setState({ two: '' }); } else if (this.state.one) { this.setState({ one: '' }); this.refs.one.focus(); }
        } else if (id === 'three') {
            if (this.state.three) { this.setState({ three: '' }); } else if (this.state.two) { this.setState({ two: '' }); this.refs.two.focus(); }
        } else if (id === 'four') {
            if (this.state.four) { this.setState({ four: '' }); } else if (this.state.three) { this.setState({ three: '' }); this.refs.three.focus(); }
        } else if (id === 'five') {
            if (this.state.five) { this.setState({ five: '' }); } else if (this.state.four) { this.setState({ four: '' }); this.refs.four.focus(); }
        } else if (id === 'six') {
            if (this.state.six) { this.setState({ six: '' }); } else if (this.state.five) { this.setState({ five: '' }); this.refs.five.focus(); }
        }
    }

    render() {
        let { AlertShow, AlertMessage, AlertStatus, loading, formRegis, sendOtp, syarat, modalVisible } = this.state
        const { oneFocus, twoFocus, threeFocus, fourFocus, fiveFocus, sixFocus } = this.state;
        const oneStyle = {
            borderBottomColor: oneFocus ? 'red' : 'black',
            borderBottomWidth: oneFocus ? 2 : 1,
        };
        const twoStyle = {
            borderBottomColor: twoFocus ? 'red' : 'black',
            borderBottomWidth: twoFocus ? 2 : 1,
        };
        const threeStyle = {
            borderBottomColor: threeFocus ? 'red' : 'black',
            borderBottomWidth: threeFocus ? 2 : 1,
        };
        const fourStyle = {
            borderBottomColor: fourFocus ? 'red' : 'black',
            borderBottomWidth: fourFocus ? 2 : 1,
        };
        const fiveStyle = {
            borderBottomColor: fiveFocus ? 'red' : 'black',
            borderBottomWidth: fiveFocus ? 2 : 1,
        };
        const sixStyle = {
            borderBottomColor: sixFocus ? 'red' : 'black',
            borderBottomWidth: sixFocus ? 2 : 1,
        };
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : null}
                style={styles.container}>
                <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 5, }}>
                    <Text style={styles.txtMemberLogin}>{formRegis ? 'REGISTRASI' : 'VERIFY NUMBER'}</Text>
                </View>
                <View style={[styles.formLogin, formRegis ? { display: 'none' } : null]}>
                    <View style={styles.inputcontainer}>
                        <TextInput
                            ref='one'
                            style={[styles.textInputOtp, { ...oneStyle }]}
                            autoCorrect={false}
                            autoCapitalize='none'
                            keyboardType='number-pad'
                            caretHidden
                            onFocus={() => this.setState({ oneFocus: true })}
                            onBlur={() => this.setState({ oneFocus: false })}
                            maxLength={1}
                            onChangeText={(text) => { this.handleChangeTextOne(text); }}
                            value={this.state.one}
                        />
                        <TextInput
                            ref='two'
                            onKeyPress={({ nativeEvent }) => (
                                nativeEvent.key === 'Backspace' ? this.backspace('two') : null
                            )}
                            style={[styles.textInputOtp, { ...twoStyle }]}
                            autoCorrect={false}
                            autoCapitalize='none'
                            maxLength={1}
                            onFocus={() => this.setState({ twoFocus: true })}
                            onBlur={() => this.setState({ twoFocus: false })}
                            caretHidden
                            keyboardType='number-pad'
                            onChangeText={(text) => { this.handleChangeTextTwo(text); }}
                            value={this.state.two}
                        />
                        <TextInput
                            ref='three'
                            onKeyPress={({ nativeEvent }) => (
                                nativeEvent.key === 'Backspace' ? this.backspace('three') : null
                            )}
                            style={[styles.textInputOtp, { ...threeStyle }]}
                            autoCorrect={false}
                            autoCapitalize='none'
                            onFocus={() => this.setState({ threeFocus: true })}
                            onBlur={() => this.setState({ threeFocus: false })}
                            maxLength={1}
                            caretHidden
                            keyboardType='number-pad'
                            onChangeText={(text) => { this.handleChangeTextThree(text); }}
                            value={this.state.three}
                        />
                        <TextInput
                            ref='four'
                            onKeyPress={({ nativeEvent }) => (
                                nativeEvent.key === 'Backspace' ? this.backspace('four') : null
                            )}
                            style={[styles.textInputOtp, { ...fourStyle }]}
                            autoCorrect={false}
                            autoCapitalize='none'
                            onFocus={() => this.setState({ fourFocus: true })}
                            onBlur={() => this.setState({ fourFocus: false })}
                            maxLength={1}
                            caretHidden
                            keyboardType='number-pad'
                            onChangeText={(text) => { this.handleChangeTextFour(text); }}
                            value={this.state.four}
                        />
                        <TextInput
                            ref='five'
                            onKeyPress={({ nativeEvent }) => (
                                nativeEvent.key === 'Backspace' ? this.backspace('five') : null
                            )}
                            style={[styles.textInputOtp, { ...fiveStyle }]}
                            autoCorrect={false}
                            autoCapitalize='none'
                            onFocus={() => this.setState({ fiveFocus: true })}
                            onBlur={() => this.setState({ fiveFocus: false })}
                            maxLength={1}
                            caretHidden
                            keyboardType='number-pad'
                            onChangeText={(text) => { this.handleChangeTextFive(text); }}
                            value={this.state.five}
                        />
                        <TextInput
                            ref='six'
                            onKeyPress={({ nativeEvent }) => (
                                nativeEvent.key === 'Backspace' ? this.backspace('six') : null
                            )}
                            style={[styles.textInputOtp, { ...sixStyle }]}
                            autoCorrect={false}
                            autoCapitalize='none'
                            onFocus={() => this.setState({ sixFocus: true })}
                            onBlur={() => this.setState({ sixFocus: false })}
                            maxLength={1}
                            caretHidden
                            keyboardType='number-pad'
                            onChangeText={(text) => { this.handleChangeTextSix(text); }}
                            value={this.state.six}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.button, formRegis ? { display: 'none' } : this.state.six == '' ? { display: 'none' } : null]}
                    onPress={() => this.verifyNumber()}
                >
                    <Text style={styles.txtLogin}>CONTINUE</Text>
                </TouchableOpacity>

                <View style={[styles.formLogin, formRegis ? null : { display: 'none' }]}>
                    <ScrollView>
                        <View style={styles.login}>
                            <TextInput
                                placeholder="Phone Number"
                                placeholderTextColor="gray"
                                style={styles.textInput}
                                editable={this.state.phone_custom}
                                inlineImageLeft='user'
                                inlineImagePadding={2}
                                keyboardType={'numeric'}
                                autoFocus={true}
                                onChangeText={phone => this.setState({ phone })}
                                value={this.state.phone}
                            />
                        </View>
                        <View style={styles.login}>
                            <TextInput
                                placeholder="Email Address"
                                placeholderTextColor="gray"
                                style={styles.textInput}
                                inlineImageLeft='user'
                                inlineImagePadding={2}
                                onChangeText={email => this.setState({ email })}
                            />
                        </View>
                        <View style={styles.login}>
                            <TextInput
                                placeholder="Name"
                                placeholderTextColor="gray"
                                style={styles.textInput}
                                inlineImageLeft='user'
                                inlineImagePadding={2}
                                onChangeText={nama => this.setState({ nama })}
                            />
                        </View>
                        <View style={[styles.login, { flexDirection: 'row', alignItems: 'center' }]}>
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="gray"
                                style={[styles.textInput, { width: '88%' }]}
                                inlineImageLeft='key'
                                inlineImagePadding={2}
                                secureTextEntry={this.state.showPassword}
                                onChangeText={pass => this.setState({ pass })}
                            />
                            <TouchableOpacity
                                onPress={() => this.toggleSwitch()}
                            >
                                <Icon name={this.state.showPassword ? "eye" : "eye-slash"} size={30} color={colors.bgheader} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.login, { flexDirection: 'row', alignItems: 'center' }]}>
                            <TextInput
                                placeholder="Confirm Password"
                                placeholderTextColor="gray"
                                style={[styles.textInput, { width: '88%' }]}
                                inlineImageLeft='key'
                                inlineImagePadding={2}
                                secureTextEntry={this.state.showPassword2}
                                onChangeText={pass2 => this.setState({ pass2 })}
                            />
                            <TouchableOpacity
                                onPress={() => this.toggleSwitch2()}
                            >
                                <Icon name={this.state.showPassword2 ? "eye" : "eye-slash"} size={30} color={colors.bgheader} />
                            </TouchableOpacity>

                        </View>
                        <View style={{ flexDirection: 'row', marginLeft: 0, alignItems: 'center', marginVertical:5 }}>
                            <View style={{ height: 32, width: 32, borderWidth: 0.5, borderRadius: 7, borderColor: sendOtp != 2 ? colors.default : colors.bgheader, justifyContent: 'flex-start', alignItems: 'center' }}>
                                <RadioButton
                                    value="1"
                                    color={colors.bgheader}
                                    status={sendOtp == 2 ? 'checked' : 'unchecked'}
                                    onPress={() => { this.setState({ sendOtp: 2 }); }}
                                />
                            </View>
                            <Text style={{ color: sendOtp != 2 ? colors.default : colors.bgheader, fontSize: 16, marginLeft:5 }}>Send OTP To WhatsApp</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginLeft: 0, alignItems: 'center', marginVertical:5 }}>
                            <View style={{height:32, width:32, borderWidth:0.5, borderRadius:7, borderColor: sendOtp != 3 ? colors.default : colors.bgheader, justifyContent:'flex-start', alignItems:'center'}}>
                                <RadioButton
                                    value="1"
                                    color={colors.bgheader}
                                    status={sendOtp == 3 ? 'checked' : 'unchecked'}
                                    onPress={() => { this.setState({ sendOtp: 3 }); }}
                                />
                            </View>
                            <Text style={{ color: sendOtp != 3 ? colors.default : colors.bgheader, fontSize: 16, marginLeft:5 }}>Send OTP To Email</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginLeft: 0, alignItems: 'flex-start', marginTop:5 }}>
                            <View style={{ height: 32, width: 32, borderWidth: 0.5, borderRadius: 7, borderColor: syarat? colors.bgheader:colors.default, justifyContent: 'flex-start', alignItems: 'center' }}>
                                <Checkbox
                                    color={colors.bgheader}
                                    status={syarat ? 'checked' : 'unchecked'}
                                    onPress={() => this.setState({ syarat: syarat ? false : true })}
                                />
                            </View>
                            <View style={{ width: '100%', height: 55, marginLeft:5 }}>
                                <Text style={{ color: colors.default, fontSize: 16 }}>Dengan mendaftar saya menyetujui </Text>
                                <TouchableOpacity
                                    onPress={() => this.setState({ modalVisible: true })}
                                >
                                    <Text style={{ color: colors.bgheader, fontSize: 16, textDecorationLine: 'underline' }}>Syarat Dan Ketentuan</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <TouchableOpacity
                                style={[styles.button, { marginVertical: 10, }, formRegis ? null : { display: 'none' }]}
                                onPress={() => this.Registrasi()}
                            >
                                <Text style={styles.txtLogin}>NEXT</Text>
                            </TouchableOpacity>
                            <View style={{ alignItems: 'center', width: '100%' }}>
                                <TouchableOpacity style={{ marginVertical: 10, marginBottom: 20 }, formRegis ? null : { display: 'none' }}
                                    onPress={() => this.goToLogin()}
                                >
                                    <Text style={{ fontWeight: 'bold', fontSize: 17, color: colors.default }}>Sudah registrasi ?</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>

                <TouchableOpacity style={formRegis ? { display: 'none' } : null}
                    onPress={() => this.cancelRegis()}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 15, color: colors.default, marginTop: 15, }}>Cancel Registrasi</Text>
                </TouchableOpacity>
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
                                    this.setState({ modalVisible: !modalVisible })
                                }}
                            >
                                <Text style={styles.textStyle}>X</Text>
                            </TouchableOpacity>
                            <View style={styles.contentReview}>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.title}>
                                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>1. TERMS AND CONDITION</Text>
                                    </View>
                                    <View>
                                        <Text>{this.state.tc.TC}</Text>
                                    </View>
                                    <View style={[styles.title, { marginTop: 10 }]}>
                                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>2. PRIVACY POLICY</Text>
                                    </View>
                                    <View>
                                        <Text>{this.state.tc.PP}</Text>
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        );
    }
}


export default Registrasi;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
    },
    formLogin: {
        width: '94%',
        borderColor: '#ddd',
        marginBottom: 15,
    },
    txtMemberLogin: {
        fontWeight: 'bold',
        fontSize: 30,
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
        color: colors.bgheader,
    },
    inputcontainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: '20%',
        marginBottom: '2%',
        marginTop: 10,
    },
    login: {
        margin: 3,
        borderBottomColor: colors.bgheader,
        borderBottomWidth: 0.5,
    },
    button: {
        width: '94%',
        height: 45,
        marginBottom: 6,
        justifyContent: 'center',
        backgroundColor: colors.bgheader,
        alignItems: 'center',
        borderRadius: 2,
    },
    textInput: {
        fontSize: 18,
        height:40,
        color: colors.default,
    },
    textInputOtp: {
        fontSize: 27,
        textAlign: 'center',
        paddingVertical: 0,
        paddingHorizontal: 0,
        marginHorizontal: 5,
        width: '17%',
    },
    txtLogin: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 17,
        textTransform: 'uppercase'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: "center",
        backgroundColor: 'rgba(201, 201, 201, 0.1)',
        width: '100%'
    },
    modalView: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
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
        height: '95%',
        width: '100%'
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 15
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
        // top: -10,
    },
    contentReview: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    title: {
        width: '100%',
        height: 30,
        backgroundColor: '#d1d1d1',
        paddingHorizontal: 5,
        justifyContent: 'center'
    },
    contentImg: {
        paddingHorizontal: 10,
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center'
    },
    btnUpload: {
        width: 110,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgheader,
        borderRadius: 3
    }

});