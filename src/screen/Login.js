import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView, Switch, Image, Modal, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAwe from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../utils';
import Loader from '../LoaderAlert/Loader';
import AlertModal from '../LoaderAlert/AlertModal';
import API from '../service';
import { url_tc } from '../Url/index'
// import { clockRunning } from 'react-native-reanimated';
import { Picker } from "native-base";

class Login extends PureComponent {
    constructor(props) {
        super(props);
        this.toggleSwitch = this.toggleSwitch.bind(this);
        this.state = {
            email: '',
            pass: '',
            loading: false,
            AlertShow: false,
            AlertMessage: '',
            AlertStatus: true,
            auth: '',
            pilihCabang: '100,JOGJA',
            alias: 'JOGJA',
            idcabang: '100',
            cabang: [],
            showPassword: true,
            modalVisible: false,
            tc: {},
            language:'Java'
        };
    }

    componentDidMount() {
        this.fetchCabang()
        this.fetchTc()
    }

    componentWillUnmount() {
        this.setState({ cabang: [], email: '', pass: '', pilihCabang: '', alias: '' })
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

    stopAlert() {
        setTimeout(() => {
            this.setState({ AlertShow: false });
        }, 3500);
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

    async fetchCabang() {
        const data = { aksi: 101 };
        await API.FetchLogin(data)
            .then((result) => {
                if (result.ErrorCode == '0') {
                    this.setState({ cabang: result.Data })
                } else {
                    this.setState({ cabang: [] })
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    toggleSwitch() {
        this.setState({ showPassword: !this.state.showPassword });
    }

    gantiCabang = (id) => {
        const cabang = id.split(",", 2)
        this.setState({ pilihCabang: id, alias: cabang[1], idcabang: cabang[0] })
    }

    registrasi = () => {
        this.props.navigation.navigate('Registrasi', { formRegis: true })
    }

    forgotPassword = () => {
        this.props.navigation.navigate('ForgotPassword')
    }

    Login = () => {
        this.setState({ loading: true, });
        const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const { email, pass } = this.state
        const data = { aksi: 100, email: email, password: pass }
        if (email == '' || pass == '') {
            setTimeout(() => {
                this.setState({ loading: false, AlertShow: true, AlertMessage: 'Error, Input All', AlertStatus: false });
            }, 1500);
            this.stopAlert()
        } else if (reg.test(email) === false) {
            setTimeout(() => {
                this.setState({ loading: false, AlertShow: true, AlertMessage: 'Error, Format Email', AlertStatus: false });
            }, 1500);
            this.stopAlert()
        } else {
            API.FetchLogin(data)
                .then((result) => {
                    console.log(result)
                    if (result.ErrorCode == '0') {
                        setTimeout(() => {
                            this.setState({
                                loading: false, AlertShow: true, AlertMessage: 'Success', AlertStatus: true
                            });
                        }, 1500);
                        this.stopAlert()
                        const user = {
                            id: result.IDBuyer,
                            IsActive: result.IsActive,
                            IsLogin: result.IsLogin,
                            authkey: result.AuthKey,
                            idcabang: this.state.idcabang,
                            kodecabang: this.state.alias
                        }
                        this.setLocalStorage(user)
                        if (result.IsActive == '0') {
                            this.props.navigation.replace('Registrasi', { formRegis: false })
                        } else {
                            setTimeout(() => {
                                this.props.navigation.replace('BottomTabs', { initialRoute: 'Home' })
                            }, 2000);
                        }

                    } else {
                        setTimeout(() => {
                            this.setState({
                                loading: false, AlertShow: true, AlertMessage: result.ErrorDesc, AlertStatus: false
                            });
                        }, 1000);
                        this.stopAlert()
                    }
                })
                .catch((error) => {
                    console.log(error)
                    setTimeout(() => {
                        this.setState({
                            loading: false, AlertShow: true, AlertMessage: 'Server Error', AlertStatus: false
                        });
                    }, 1500);
                    this.stopAlert()
                })
        }

    }

    renderCabang() {
        const { cabang } = this.state
        return cabang.map((item, index) => {
            return (
                <Picker.Item key={index} label={item.Nama + ' (' + item.Alias + ')'} value={item.ID + ',' + item.Alias} />
            )
        })
    }


    render() {
        let { AlertShow, AlertMessage, AlertStatus, loading, pilihCabang, modalVisible } = this.state
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : null}
                style={styles.container}>
                <View style={[styles.circle, { height: 100, width: 100, borderRadius: 50, top: -50, left: -30 }]} />
                <View>
                    <Image source={require('../icon/brewery2.png')} style={{ width: 130, height: 130 }} />
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 5, marginTop: 5 }}>
                    <Text style={styles.txtMemberLogin}>LOGIN</Text>
                </View>
                <View style={styles.formLogin}>
                <ScrollView>
                        <View style={styles.login}>
                            <TextInput
                                placeholder="Email"
                                placeholderTextColor="gray"
                                style={styles.textInput}
                                keyboardType="email-address"
                                inlineImageLeft='user'
                                value={this.state.email}
                                onChangeText={(email) => this.setState({ email })}
                            />
                        </View>
                        <View style={[styles.login, { flexDirection: 'row', alignItems: 'center' }]}>
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="gray"
                                style={[styles.textInput, { width: '88%' }]}
                                inlineImageLeft='key'
                                secureTextEntry={this.state.showPassword}
                                value={this.state.pass}
                                onChangeText={(pass) => this.setState({ pass })}
                            />
                            <TouchableOpacity
                                onPress={() => this.toggleSwitch()}
                            >
                                <Icon name={this.state.showPassword ? "eye" : "eye-slash"} size={30} color={colors.bgheader} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.login}>
                            <Picker
                                note
                                mode="dropdown"
                                iosHeader="Select Kota"
                                iosIcon={<IconAwe name="arrow-drop-down-circle" style={{ color: "#007aff", fontSize: 25 }} />}
                                style={{ width: '96%' }}
                                selectedValue={pilihCabang}
                                textStyle={{ color: colors.default, fontSize: 17 }}
                                onValueChange={(itemValue, itemIndex) =>
                                    this.gantiCabang(itemValue)
                                }>
                                {
                                    this.renderCabang()
                                }
                            </Picker>
                        </View>
                    </ScrollView>
                </View>
                <TouchableOpacity style={styles.button}
                    onPress={this.Login}
                >
                    <Text style={styles.txtLogin}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.registrasi} >
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.default, marginTop: 7 }}>Daftar disini</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.forgotPassword} >
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.default, marginTop: 10 }}>Lupa password ?</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 20 }}
                    onPress={() => this.setState({ modalVisible: true })}
                >
                    <Text style={{ color: colors.bgheader, fontSize: 16, textDecorationLine: 'underline' }}>TERMS AND CONDITION</Text>
                </TouchableOpacity>
                <Loader
                    loading={loading} />
                <AlertModal
                    loading={AlertShow} message={AlertMessage} status={AlertStatus} />
                <View style={[styles.circle, { top: '95%', left: '90%' }]} />
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


export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
    },
    circle: {
        height: 90,
        width: 90,
        backgroundColor: colors.bgheader,
        position: 'absolute',
        top: -30,
        left: -25,
        borderRadius: 45
    },
    formLogin: {
        width: '94%',
        borderRadius: 3,
        borderColor: '#ddd',
        marginBottom: 10,
    },
    txtMemberLogin: {
        fontWeight: 'bold',
        fontSize: 30,
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
        color: colors.bgheader,
    },
    login: {
        margin: 3,
        borderBottomColor: colors.bgheader,
        borderBottomWidth: 1,
    },
    button: {
        width: '94%',
        height: 45,
        marginTop: 3,
        marginBottom: 6,
        justifyContent: 'center',
        backgroundColor: colors.bgheader,
        alignItems: 'center',
        borderRadius: 2,
    },
    textInput: {
        height:40,
        fontSize: 18,
        color: colors.default,
    },
    txtLogin: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 20,
        textTransform: 'uppercase'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: "center",
        backgroundColor: 'rgba(201, 201, 201, 0.7)',
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

});