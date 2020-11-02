import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TextInput, Switch, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import API from '../service';
import Loader from '../LoaderAlert/Loader';
import AlertModal from '../LoaderAlert/AlertModal';
import { colors } from '../utils'
import Header from './atom/Header'

const EditAccount = ({ route, navigation }) => {

    const [state, setState] = useState({
        showPassword: true,
        showPassword2: true,
        loading: false,
        AlertShow: false,
        AlertMessage: '',
        AlertStatus: true,
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

    const toggleSwitch = () => {
        setState({ ...state, showPassword: !state.showPassword });
    }

    function stopAlert() {
        setTimeout(() => {
            setState({ ...state, AlertShow: false });
        }, 5500);
    }

    const toggleSwitch2 = () => {
        setState({ ...state, showPassword2: !state.showPassword2 });
    }

    const [pass, setPass] = useState('')
    const [pass2, setPass2] = useState('')

    const saveAccount = () => {
        setState({ ...state, loading: true, });

        if (pass != '' || pass2 != '') {
            if (pass == pass2) {
                const data = {
                    aksi: 123,
                    idbuyer: buyer.idbuyer,
                    authkey: buyer.auth,
                    password: pass
                }
                API.Fetch(data)
                    .then((result) => {
                        // console.log(result)
                        if (result.ErrorCode == '0') {
                            setTimeout(() => {
                                setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Success Ganti Password', AlertStatus: true });
                            }, 1000);
                            stopAlert()
                            navigation.goBack()
                        } else {
                            setTimeout(() => {
                                setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Gagal Ganti Password', AlertStatus: false });
                            }, 1000);
                            stopAlert()
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                        setTimeout(() => {
                            setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Error Server', AlertStatus: false });
                        }, 1000);
                        stopAlert()
                    })
            } else {
                setTimeout(() => {
                    setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Error, Password tidak cocok', AlertStatus: false });
                }, 1000);
                stopAlert()
            }
        } else {
            setTimeout(() => {
                setState({ ...state, loading: false, AlertShow: true, AlertMessage: 'Error, Input Password', AlertStatus: false });
            }, 1000);
            stopAlert()
        }

    }

    return (
        <View style={styles.container}>
            <Header title="PASSWORD" />
            <View style={styles.content}>
                <View style={styles.formLogin}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.bgheader, marginBottom: 10, }}>CHANGE PASSWORD</Text>
                    </View>
                    <View style={[styles.login, { flexDirection: 'row', alignItems: 'center' }]}>
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="gray"
                            style={[styles.textInput, { width: '88%' }]}
                            inlineImageLeft='key'
                            inlineImagePadding={2}
                            secureTextEntry={state.showPassword}
                            onChangeText={pass => setPass(pass)}
                        />
                        <TouchableOpacity
                            onPress={() => toggleSwitch()}
                        >
                            <Icon name={state.showPassword ? "eye" : "eye-slash"} size={25} color={colors.bgheader} />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.login, { flexDirection: 'row', alignItems: 'center' }]}>
                        <TextInput
                            placeholder="Confirm Password"
                            placeholderTextColor="gray"
                            style={[styles.textInput, { width: '88%' }]}
                            inlineImageLeft='key'
                            inlineImagePadding={2}
                            secureTextEntry={state.showPassword2}
                            onChangeText={pass2 => setPass2(pass2)}
                        />
                        <TouchableOpacity
                            onPress={() => toggleSwitch2()}
                        >
                            <Icon name={state.showPassword2 ? "eye" : "eye-slash"} size={25} color={colors.bgheader} />
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.contentSave}
                    onPress={() => saveAccount()}
                >
                    <Text style={styles.txtSave}>SAVE</Text>
                </TouchableOpacity>
            </View>
            <Loader
                loading={state.loading} />
            <AlertModal
                loading={state.AlertShow} message={state.AlertMessage} status={state.AlertStatus} />
        </View>
    )
}

export default EditAccount

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flex: 1
    },
    formLogin: {
        width: '94%',
        borderColor: '#ddd',
        marginBottom: 15,
    },
    login: {
        margin: 3,
        borderBottomColor: colors.bgheader,
        borderBottomWidth: 0.5,
    },
    textInput: {
        height: 40,
        fontSize:18,
        color: colors.default,
    },
    contentSave: {
        height: 40,
        width: '96%',
        backgroundColor: colors.bgheader,
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3
    },
    txtSave: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    }
})
