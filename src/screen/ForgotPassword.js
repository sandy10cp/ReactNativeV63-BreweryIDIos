import React, { useState } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, TouchableOpacity, TextInput } from 'react-native'
import { colors } from '../utils';
import Loader from '../LoaderAlert/Loader';
import AlertModal from '../LoaderAlert/AlertModal';
import API from '../service';
import AsyncStorage from '@react-native-community/async-storage';

const ForgotPassword = ({ navigation }) => {

    const [state, setState] = useState({
        email: '',
        otp: '',
        pass: '',
        confpass: '',
        loading: false,
        AlertShow: false,
        AlertMessage: '',
        AlertStatus: true,
    })

    const [formPassword, setFormPassword] = useState(false)

    async function setLocalStorage(data) {
        await AsyncStorage.setItem('user', JSON.stringify(data))
            .then(() => {
                //console.log('It was saved successfully')
            })
            .catch(() => {
                console.log('Gagal simpan ke local')
            })
    }

    const backLogin = () => {
        navigation.navigate('Login')
    }

    const verifyNumber = () => {
        setState({ ...state, loading: true, });
        const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const { email } = state
        if (email == '') {
            setTimeout(() => {
                setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Error, Input Email', AlertStatus: false });
            }, 1000);
            stopAlert()
        }
        else if (reg.test(email) === false) {
            setTimeout(() => {
                setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Error, Email not valid', AlertStatus: false });
            }, 1000);
            stopAlert()
        } else {
            const data = { aksi: 102, email }
            API.FetchLogin(data)
                .then((result) => {
                    console.log(result)
                    if (result.ErrorCode == '0') {
                        setTimeout(() => {
                            setState({ ...state, loading: false, AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: true });
                        }, 1000);
                        stopAlert()
                        navigation.goBack()
                    } else {
                        setTimeout(() => {
                            setState({ ...state, loading: false, AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: false });
                        }, 1000);
                        stopAlert()
                    }

                })
                .catch((error) => {
                    console.log(error)
                    setState({ ...state, loading: false })
                })
        }
    }

    function stopAlert() {
        setTimeout(() => {
            setState({ ...state, AlertShow: false });
        }, 5500);
    }

    const forgotPass = () => {
        setState({ ...state, loading: true, });
        const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if (state.email == '' && state.pass == '' && state.confpass == '') {
            setTimeout(() => {
                setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Error, Input All', AlertStatus: false });
            }, 1000);
            stopAlert()
        }
        else if (state.pass != state.confpass) {
            setTimeout(() => {
                setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Error, Not match', AlertStatus: false });
            }, 1000);
            stopAlert()
        }
        else if (reg.test(state.email) === false) {
            setTimeout(() => {
                setState({ ...state, formRegis: false, loading: false, AlertShow: true, AlertMessage: 'Error, Email not valid', AlertStatus: false });
            }, 1000);
            stopAlert()
        } else {
            const data = { email: state.email, pass: state.pass, otp: state.otp }
            API.FetchForgot(data)
                .then((result) => {
                    console.log(result)
                    if (result[0].hasil == 1) {
                        setTimeout(() => {
                            setState({
                                ...state, loading: false, AlertShow: true, AlertMessage: 'Success', AlertStatus: true
                            });
                        }, 1500);
                        stopAlert()
                        const user = {
                            email: result[0].email,
                            phone: result[0].phone,
                            id: result[0].id,
                            authkey: Base64.encode(result[0].authkey)
                        }
                        setLocalStorage(user)
                        setTimeout(() => {
                            navigation.replace('BottomTabs', { initialRoute: 'Home' })
                        }, 2000);

                    }
                    if (result[0].hasil == 0) {
                        setTimeout(() => {
                            setState({
                                ...state, loading: false, AlertShow: true, AlertMessage: 'OTP Salah', AlertStatus: false
                            });
                        }, 1500);
                        stopAlert()
                    }
                })
                .catch((error) => {
                    console.log(error)
                    setState({ ...state, loading: false, });
                })
        }

    }

    return (
        <KeyboardAvoidingView style={styles.container}>
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 5, }}>
                <Text style={styles.txtRest}>CHANGE PASSWORD</Text>
            </View>
            <View style={styles.formLogin}>
                <View style={styles.login}>
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor={colors.default}
                        style={styles.textInput}
                        inlineImageLeft='user'
                        value={state.email}
                        onChangeText={(email) => setState({ ...state, email })}
                    />
                </View>
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={() => verifyNumber()}
            >
                <Text style={styles.txtForgotPassword}>Verify Email</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => backLogin()} >
                <Text style={{ fontSize: 17, fontWeight: 'bold', color: colors.default, marginTop: 10 }}>Login disini ?</Text>
            </TouchableOpacity>
            <Loader
                loading={state.loading} />
            <AlertModal
                loading={state.AlertShow} message={state.AlertMessage} status={state.AlertStatus} />
        </KeyboardAvoidingView>
    )
}

export default ForgotPassword

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
    },
    txtRest: {
        fontWeight: 'bold',
        fontSize: 25,
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
        color: colors.bgheader,
    },
    formLogin: {
        width: '94%',
        borderRadius: 3,
        borderColor: '#ddd',
        marginBottom: 10,
    },
    login: {
        margin: 3,
        borderBottomColor: colors.bgheader,
        borderBottomWidth: 1,
    },
    textInput: {
        height:40,
        fontSize: 18,
        color: colors.default,
    },
    txtForgotPassword: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 20,
        textTransform: 'uppercase'
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
});
