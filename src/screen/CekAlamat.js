import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Modal, Dimensions } from 'react-native'
import { Checkbox } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAwe from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import API from '../service';
import { colors } from '../utils'
import Header from './atom/Header'
import { Picker } from "native-base";

const screenWidth = Dimensions.get('window').width;

const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
}

const CekAlamat = ({ navigation }) => {
    const [state, setState] = useState({
        checked: false,
        activityLoad: true,
        formAlamat: false,
        mode: 0,
        loading: false,
        error: null,
        isMapReady: false,
        regionChangeProgress: false,
        simpanActive: true
    })

    const [modalVisible, setModal] = useState(false)
    const [pilihAlamat, setPilihAlamat] = useState('')
    const [pilihKota, setPilihKota] = useState('')
    const [alamatLengkap, setAlamatLengkap] = useState('')
    const [kodePos, setKodePos] = useState('00000')


    const [buyer, setBuyer] = useState({})
    useEffect(() => {
        async function getUser() {
            await AsyncStorage.getItem('user').then((data) => {
                if (data) {
                    const d = JSON.parse(data)
                    // console.log(d)
                    setBuyer({
                        idbuyer: d.id,
                        auth: d.authkey,
                        IsActive: d.IsActive,
                        IsLogin: d.IsLogin,
                        idcabang: d.idcabang
                    });
                }
            });
        }
        getUser()
    }, [buyer.idbuyer, buyer.auth])

    const [alamat, setAlamat] = useState([])
    const [kota, setKota] = useState([])
    useEffect(() => {
        async function fetchAlamat() {
            const data = { aksi: 110, idbuyer: buyer.idbuyer, authkey: buyer.auth, idcabang: buyer.idcabang };
            await API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        setAlamat(result.Alamat)
                        setKota(result.Kota)
                        setState({ ...state, activityLoad: false })
                    }
                    else if (result.ErrorCode == '2.1') {
                        navigation.replace('Login')
                    }
                    else {
                        setAlamat([])
                        setKota([])
                        setState({ ...state, activityLoad: false, formAlamat: false })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }
        if(kota.length == 0){
            fetchAlamat()
        }

    }, [kota, buyer.auth, buyer.idbuyer, buyer.idcabang])

    const tambahAlamat = () => {
        setState({ ...state, formAlamat: !state.formAlamat})
        // setModal(true)
    }

    const simpanAlamat = async () => {
        let data = ''
        if (pilihAlamat != '') {
            data = {
                aksi: 111,
                idbuyer: buyer.idbuyer,
                authkey: buyer.auth,
                idcabang: buyer.idcabang,
                idalamat: pilihAlamat,
                mode: 1
            };

            await API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    navigation.navigate('DetailOrder')
                    setState({ ...state, formAlamat: false })
                }
                else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                }
            })
            .catch((error) => {
                console.log(error)
            })

        } else if (pilihKota != '') {
            if(alamatLengkap == ''){
                alert('Masukkan alamat lengkap')
            }else{
                data = {
                    aksi: 111,
                    idbuyer: buyer.idbuyer,
                    authkey: buyer.auth,
                    idcabang: buyer.idcabang,
                    mode: 2,
                    idkota: pilihKota,
                    kodepos: kodePos,
                    alamat: alamatLengkap,
                    latitude: region.latitude.toString(),
                    longitude: region.longitude.toString()
                };

                await API.Fetch(data)
                .then((result) => {
                    // console.log(result)
                    if (result.ErrorCode == '0') {
                        navigation.navigate('DetailOrder')
                        setState({ ...state, formAlamat: false })
                    }
                    else if (result.ErrorCode == '2.1') {
                        this.props.navigation.replace('Login')
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
            }
        }else if(pilihKota == '' || alamatLengkap == ''){
            alert('Pilih kota, input alamat lengkap')
        }
        // alert(JSON.stringify(data))

    }

    const [region, setRegion] = useState(initialRegion)
    useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                const region = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001
                };
                setRegion(region)
                setState({
                    ...state,
                    loading: false,
                    error: null,
                });
            },
            (error) => {
                // alert('Aktifkan GPS anda');
                setState({
                    ...state,
                    error: error.message,
                    loading: false
                })
                // navigation.goBack(null)
            },
            { enableHighAccuracy: false, timeout: 200000, maximumAge: 5000 },
        );
    }, [])

    const fetchAddress = () => {
        fetch("https://maps.googleapis.com/maps/api/geocode/json?address=" + region.latitude + "," + region.longitude + "&key=" + "AIzaSyDh8kv8cxgUu9x94SVPYdkhqwwSb6uUx0U")
            .then((response) => response.json())
            .then((responseJson) => {
                // const userLocation = responseJson.results[0].formatted_address;
                console.log(responseJson)
                // this.setState({
                //     userLocation: userLocation,
                //     regionChangeProgress: false
                // });
            });
    }

    const onMapReady = () => {
        setState({ isMapReady: true, marginTop: 0 });
    }

    // let mapRef = useRef(null);

    // useEffect(() => {
    //     mapRef.fitToElements(true)
    // }, [])

    // Update state on region change
    const onRegionChange = region => {
        setRegion(region)
        setState({
            ...state,
            regionChangeProgress: true
        });
        // fetchAddress()

    }

    const gantiAlamat = (id) => {
        if (id == pilihAlamat) {
            setPilihAlamat('')
        } else {
            setPilihAlamat(id)
            setState({ ...state, formAlamat: false, mode: 1 })
        }
        setAlamatLengkap('')
        setKodePos('')
    }

    const gantiKota = (id) => {
        setPilihKota(id)
        setState({ ...state, mode: 2 })
    }

    function renderAlamat() {
        // console.log(kota)
        return alamat.map((item, index) => {
            return (
                <View key={index}>
                    <TouchableOpacity style={[styles.alamat, item.BisaKirim == 0 ? { backgroundColor: '#d1d1d1' } : pilihAlamat == item.IDAlamat ?  {backgroundColor:colors.bgheader}:null]}
                        onPress={() => gantiAlamat(item.IDAlamat)}
                    >
                        <View style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: 30, }}>
                            <Checkbox
                                disabled={item.BisaKirim == 0 ? true : false}
                                color="white"
                                status={pilihAlamat == item.IDAlamat ? 'checked' : 'unchecked'}
                                onPress={() => { gantiAlamat(item.IDAlamat) }}
                            />
                        </View>
                        <View style={{ paddingHorizontal: 5, paddingVertical: 3, width: '93%', justifyContent: 'center' }}>
                            <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: '400', color: pilihAlamat == item.IDAlamat ? 'white':'black'  }}>{item.Alamat + ', ' + item.Kota + ', ' + item.Propinsi}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        })
    }

    function renderKota() {
        return kota.map((item, index) => {
            return (
                <Picker.Item key={index} label={item.Nama} value={item.IDKota} />
            )
        })
    }

    return (
        <View style={styles.container}>
            <Header title="PILIH ALAMAT" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.contentTambahAlamat, state.formAlamat ? pilihAlamat == '' ? null : { display: 'none' } : { display: 'none' }]}>
                    <View style={styles.formAlamat}>
                        <View style={styles.dropdownAlamat}>
                            <Picker
                                note
                                mode="dropdown"
                                placeholder="Pilih Kota"
                                placeholderStyle={{ color: colors.default, fontSize:17 }}
                                iosHeader="Select Kota"
                                iosIcon={<IconAwe name="arrow-drop-down-circle" style={{ color: "#007aff", fontSize: 25 }} />}
                                style={{ width: screenWidth - 65,}}
                                selectedValue={pilihKota}
                                textStyle={{ color: colors.default, fontSize:17 }}
                                onValueChange={(itemValue, itemIndex) =>
                                    gantiKota(itemValue)
                                }>
                                {
                                    renderKota()
                                }
                            </Picker>
                        </View>
                        <View style={styles.dropdownAlamat}>
                            <TextInput
                                style={[styles.textInput, { height: 50 }]}
                                placeholder="Alamat lengkap"
                                placeholderTextColor='gray'
                                multiline={true}
                                numberOfLines={4}
                                value={alamatLengkap}
                                onChangeText={alamat_lengkap => setAlamatLengkap(alamat_lengkap)}
                            />
                        </View>
                    </View>
                    <View style={{ height: 50, width: '96%', justifyContent: 'center', paddingHorizontal: 5, backgroundColor: 'white', marginTop: 3 }}>
                        <Text style={{ fontSize: 15, color:'red' }}>Note : Customer Service kami akan menghubungi pembeli untuk memastikan lokasi pengiriman.</Text>
                    </View>
                </View>
                {/* <View style={[styles.contentMap, state.formAlamat ? pilihAlamat == '' ? null : { display: 'none' } : { display: 'none' }]}>
                    
                </View> */}
                {/* <Text>{region.latitude}-{region.longitude}</Text> */}
                <View style={[styles.addAlamat, state.formAlamat ? { display: 'none' } : pilihAlamat == '' ? null : { display: 'none' }]}>
                    <TouchableOpacity style={styles.btnAddAlamat}
                        onPress={() => tambahAlamat()}
                    >
                        <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>TAMBAH ALAMAT</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ alignItems: 'center', width: '100%', marginBottom: 10, }}>
                    <TouchableOpacity style={[styles.btnSimpanAlamat, pilihAlamat != '' ? null : state.formAlamat ? null : { display: 'none' }]}
                        onPress={() => simpanAlamat()}
                    >
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>SIMPAN ALAMAT</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.content, /*alamat.length == 0 ? { display: 'none' } : state.formAlamat ? { display: 'none' } : null*/]}>
                    {renderAlamat()}

                    {/* <View style={styles.alamat}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: 30, }}>
                        <Checkbox
                            color={colors.default}
                            status={state.checked ? 'checked' : 'unchecked'}
                            onPress={() => { setState({ ...state, checked: !state.checked }); }}
                        />
                    </View>
                    <View style={{ paddingHorizontal: 5, paddingVertical: 3, width: '93%', justifyContent: 'center' }}>
                        <Text>Yogyakarta</Text>
                    </View>
                </View> */}
                </View>

            </ScrollView>
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
                                setModal(false)
                            }}
                        >
                            <Text style={styles.textStyle}>X</Text>
                        </TouchableOpacity>
                        <View style={styles.contentReview}>
                                
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default CekAlamat

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
    },
    content: {
        width: '100%',
        paddingHorizontal: 5,
        paddingVertical: 5,
        marginVertical: 3,
    },
    alamat: {
        height: 60,
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
        shadowColor: "#eee",
        shadowOffset: {
            width: 5,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 7,
        marginBottom: 8,
    },
    addAlamat: {
        height: 40,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    btnAddAlamat: {
        height: 35,
        width: 160,
        backgroundColor: colors.bgheader,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentTambahAlamat: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 5,
        paddingVertical: 10,
    },
    formAlamat: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '96%',
        backgroundColor: 'white',
        paddingHorizontal: 5,
        paddingVertical: 5,
        shadowColor: "#eee",
        shadowOffset: {
            width: 5,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 7,
    },
    btnSimpanAlamat: {
        height: 35,
        width: 170,
        backgroundColor: colors.bgheader,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    dropdownAlamat: {
        height: 40,
        width: '96%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: colors.textGray,
        borderBottomWidth: 1,
        marginBottom: 5,
    },
    textInput: {
        backgroundColor: 'white',
        color: 'black',
        fontSize: 17,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        width: '100%',
        height: 30,
        paddingHorizontal: 10,
    },
    contentMap: {
        flex: 1,
        height: 400,
        backgroundColor: 'gray',
        justifyContent: 'center',
        width: '100%',
        alignItems: 'center',
    },
    selectPicker: {
        fontSize: 20,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
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
})

