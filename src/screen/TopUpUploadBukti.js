import React, { Component } from 'react'
import { Text, View, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Clipboard, ToastAndroid, Dimensions } from 'react-native'
import Header from './atom/Header'
import { Picker } from "native-base";
// import ImagePicker from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import Loader from '../LoaderAlert/Loader';
import AlertModal from '../LoaderAlert/AlertModal';
import { colors } from '../utils';
import API from '../service';
import currencyFormat from '../function/currencyFormat';
import Icon from 'react-native-vector-icons/MaterialIcons';

const options = {
    title: 'Select image',
    takePhotoButtonTitle: 'Take a image',
    chooseFromLibraryButtonTitle: 'choose from gallery',
    quality: 1,
    allowsEditing: true,
};

const screenWidth = Math.round(Dimensions.get('window').width);

export class TopUpUploadBukti extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            AlertShow: false,
            AlertMessage: '',
            AlertStatus: true,
            idbuyer: props.route.params.idbuyer,
            auth: props.route.params.auth,
            idcabang: props.route.params.idcabang,
            idtopup: props.route.params.idtopup,
            image: null,
            dataImage: null,
            fileName: '',
            tipeGambah: '',
            infotransfer: {},
            catatan: '',
            nomorrek: '',
            namarek: '',
            pilihBank: 'BCA'
        };

    }

    componentDidMount() {
        this.fetchInfoTransfer()
    }

    selectImage = () => {
        // ImagePicker.launchImageLibrary(options, (response) => {
        //     //console.log(response.fileSize)
        //     if (response.didCancel) {
        //         alert('Cancelled image');
        //         this.setState({
        //             image: null,
        //             dataImage: null,
        //         });
        //     } else if (response.error) {
        //         alert('ImagePicker Error: ', response.error);
        //     } else {
        //         const source = { uri: response.uri, };
        //         const fileName = response.fileName
        //         this.setState({
        //             image: source,
        //             dataImage: response.data,
        //             fileName,
        //             tipeGambah: response.type
        //         });
        //     }
        // });

        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true
          }).then(image => {
            // console.log(image);
            const source = { uri: image.sourceURL, };
            this.setState({
                image: source,
                dataImage: image.data,
                fileName:image.filename
            });
          });
    }

    stopAlert() {
        setTimeout(() => {
            this.setState({ AlertShow: false });
        }, 2500);
    }

    uploadBuktiTransfer = () => {

        const url = 'https://app.brewery-id.com/buyer/kirimbuktitopup.asp';
        const formData = new FormData();

        if (this.state.image == null) {
            alert('Upload bukti transaksi')
        } else {
            this.setState({ loading: true, });
            formData.append('file', {
                uri: this.state.image.uri.replace("file://",""),
                // type: this.state.tipeGambah, // or photo.type
                name: this.state.fileName || 'bukti.jpg',
                id: this.state.idbuyer,
                catatan: this.state.catatan,
            });

            // alert(JSON.stringify(formData))

            fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': "text/plain",
                    'Content-Type': 'multipart/form-data',
                    'idbuyer': this.state.idbuyer,
                    'authkey': this.state.auth,
                    'idcabang': this.state.idcabang,
                    'idtopup': this.state.idtopup,
                    'catatan': this.state.catatan,
                    'bank': this.state.pilihBank,
                    'namarek': this.state.namarek,
                    'nomorrek': this.state.nomorrek
                },
                body: formData
            })
                .then((response) => response.json())
                .then((result) => {
                    console.log(result)
                    if (result.ErrorCode == '0') {
                        setTimeout(() => {
                            this.setState({ loading: false, AlertShow: true, AlertMessage: 'Berhasil', AlertStatus: true });
                        }, 1000);
                        this.stopAlert()
                        this.props.navigation.navigate('TopUpTabs')
                    } else {
                        setTimeout(() => {
                            this.setState({ loading: false, AlertShow: true, AlertMessage: 'Gagal Upload', AlertStatus: true });
                        }, 1000);
                        this.stopAlert()
                    }
                })
                .catch((error) => {
                    console.log(error)
                    setTimeout(() => {
                        this.setState({ loading: false, AlertShow: true, AlertMessage: 'Error', AlertStatus: false });
                    }, 1000);
                    this.stopAlert()
                });

        }

    }

    fetchInfoTransfer() {
        const { idbuyer, auth, idcabang, idtopup } = this.state
        const data = { aksi: 134, idbuyer, authkey: auth, idcabang, idtopup }
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    this.setState({ infotransfer: result, pilihBank: result.NamaBank })
                }
                else if (result.ErrorCode == '2.1') {
                    this.props.navigation.navigate('Login')
                }
                else {
                    this.setState({ infotransfer: {} })
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    writeToClipboard = async () => {
        //To copy the text to clipboard
        await Clipboard.setString(this.state.infotransfer.Norek);
        ToastAndroid.showWithGravityAndOffset('Salin ke Clipboard!', ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
    };


    render() {
        const { AlertShow, AlertMessage, AlertStatus, loading, infotransfer, pilihBank } = this.state;
        return (
            <View style={styles.containter}>
                <Header title="BUKTI TRANSFER" />
                <ScrollView>
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                        <View style={styles.infoTransfer}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', width: '96%' }}>
                                <Text style={{ fontSize: 22, fontWeight: 'bold' }}>REKENING TUJUAN</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '45%' }}>
                                    <Text style={{ fontSize: 18, fontWeight: '600' }}>Bank/OVO/GoPay</Text>
                                </View>
                                <View style={{ width: '55%' }}>
                                    <Text style={{ fontSize: 18, fontWeight: '600' }}>{infotransfer.NamaBank == null ? ': -' : ': ' + infotransfer.NamaBank}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '45%' }}>
                                    <Text style={{ fontSize: 18, fontWeight: '600' }}>Nama Pemilik</Text>
                                </View>
                                <View style={{ width: '55%' }}>
                                    <Text style={{ fontSize: 18, fontWeight: '600' }}>{infotransfer.NamaPemilik == null ? ': -' : ': ' + infotransfer.NamaPemilik}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '45%' }}>
                                    <Text style={{ fontSize: 18, fontWeight: '600' }}>No. Rekening</Text>
                                </View>
                                <View style={{ width: '55%', flexDirection: 'row' }}>
                                    <Text style={{ fontSize: 18, fontWeight: '600' }}>{infotransfer.Norek == null ? ': -' : ': ' + infotransfer.Norek}</Text>
                                    <TouchableOpacity
                                        style={{ height: 23, width: 47, borderWidth: 1, borderColor: colors.bgheader, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}
                                        onPress={() => this.writeToClipboard()} >
                                        <Text style={{ fontSize: 18, color: colors.bgheader, }}>Salin</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '45%' }}>
                                    <Text style={{ fontSize: 18, fontWeight: '600' }}>Jumlah Transfer</Text>
                                </View>
                                <View style={{ width: '55%' }}>
                                    <Text style={{ fontSize: 18, fontWeight: '600' }}>{infotransfer.Jumlah == null ? ': -' : ': Rp ' + currencyFormat(Number(infotransfer.Jumlah))}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center', width: '98%', backgroundColor: 'white', marginTop: 10, }}>
                            <Text style={{ fontSize: 22, fontWeight: 'bold' }}>REKENING PENGIRIM</Text>
                        </View>
                        <View style={styles.catatanContent}>
                            {
                                infotransfer.IsBank ?
                                    <Picker
                                        note
                                        mode="dropdown"
                                        selectedValue={pilihBank}
                                        iosIcon={<Icon name="arrow-drop-down-circle" style={{ color: "#007aff", fontSize: 25 }} />}
                                        style={{ width: screenWidth-40, height: 40, }}
                                        textStyle={{ color: colors.default, fontSize: 17 }}
                                        onValueChange={(itemValue, itemIndex) =>
                                            this.setState({ pilihBank: itemValue })
                                        }
                                    >
                                        <Picker.Item label="BCA" value="BCA" />
                                        <Picker.Item label="MANDIRI" value="MANDIRI" />
                                        <Picker.Item label="BNI" value="BNI" />
                                        <Picker.Item label="CIMB NIAGA" value="CIMB NIAGA" />
                                        <Picker.Item label="BRI" value="BRI" />
                                        <Picker.Item label="BANK LAIN" value="BANK LAIN" />
                                    </Picker>
                                    :
                                    <View style={{ height: 40 }}>
                                        <Text style={{ color: 'black', fontSize: 20 }}>{this.state.pilihBank}</Text>
                                    </View>

                            }

                        </View>
                        <View style={styles.catatanContent}>
                            <TextInput
                                placeholder={infotransfer.IsBank ? "Nomor Rekening" : "Phone Number"}
                                placeholderTextColor={colors.textGray}
                                style={[styles.textInputKet, { height: 50 }]}
                                multiline={false}
                                numberOfLines={1}
                                maxLength={30}
                                onChangeText={text => this.setState({ nomorrek: text })}
                                value={this.state.nomorrek}
                            />
                        </View>
                        <View style={styles.catatanContent}>
                            <TextInput
                                placeholder={infotransfer.IsBank ? "Nama Pemilik" : "Nama"}
                                placeholderTextColor={colors.textGray}
                                style={[styles.textInputKet, { height: 50 }]}
                                multiline={false}
                                numberOfLines={1}
                                maxLength={40}
                                onChangeText={text => this.setState({ namarek: text })}
                                value={this.state.namarek}
                            />
                        </View>
                        <View style={styles.catatanContent}>
                            <TextInput
                                placeholder="Catatan"
                                placeholderTextColor={colors.textGray}
                                style={styles.textInputKet}
                                multiline={true}
                                numberOfLines={3}
                                maxLength={150}
                                onChangeText={text => this.setState({ catatan: text })}
                                value={this.state.catatan}
                            />
                        </View>
                        <TouchableOpacity style={{ alignItems: 'center', paddingBottom: 5, marginTop: 10, width: '96%' }}
                            onPress={this.selectImage}
                        >
                            <Image source={this.state.image != null ? this.state.image : require('../icon/not-available.png')} style={styles.uploadImage} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.uploadBtn}
                            onPress={this.state.image == null ? this.selectImage : this.uploadBuktiTransfer}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{this.state.image == null ? 'SELECT' : 'UPLOAD'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <Loader
                    loading={loading} />
                <AlertModal
                    loading={AlertShow} message={AlertMessage} status={AlertStatus} />
            </View>
        )
    }
}

export default TopUpUploadBukti

const styles = StyleSheet.create({
    containter: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
    },
    infoTransfer: {
        width: '98%',
        justifyContent: 'space-evenly',
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginTop: 5,
        borderWidth: 0.5,
        borderColor: colors.bgheader,
        backgroundColor: 'white'
    },
    uploadImage: {
        height: 300,
        width: '70%',
    },
    uploadBtn: {
        width: '98%',
        height: 40,
        backgroundColor: colors.bgheader,
        borderRadius: 3,
        marginTop: 5,
        marginLeft: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    catatanContent: {
        width: '98%',
        paddingHorizontal: 5,
        backgroundColor: 'white',
        borderBottomWidth: 0.5,
        borderBottomColor: colors.bgheader,
    },
    textInputKet: {
        height: 60,
        fontSize: 20
    },
})
