import React, { PureComponent } from 'react';
import { Dimensions, View, TextInput, StyleSheet, Text, ScrollView, Image, TouchableOpacity, KeyboardAvoidingView, RefreshControl, ActivityIndicator, Animated, ToastAndroid, TouchableHighlight, Linking, Modal, Keyboard, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconFavorit from 'react-native-vector-icons/MaterialIcons';
import IconWallet from 'react-native-vector-icons/MaterialCommunityIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-community/async-storage';
import BadgeChart from '../content/BadgeChart';
import OneSignal from 'react-native-onesignal';
import { colors } from '../utils';
import API from '../service';
import Shimmer from '../content/Shimmer';
import { url_img, url_img_paket } from '../Url';
import currencyFormat from '../function/currencyFormat';
import serverError from '../function/serverError';
import Iconku from './atom/Iconku';
import BackgroundSlide from '../content/BackgroundSlide';
import versiApk from '../function/version';
import CustomToast from '../LoaderAlert/CustomToast';

const screenWidth = Math.round(Dimensions.get('window').width);

const HEADER_MIN_HEIGHT = 5;
const HEADER_MAX_HEIGHT = 250;


export default class Home extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            auth: '',
            idcabang: '',
            jumlahcart: 0,
            data: [],
            qty: 1,
            idbuyer: '',
            kategori: [],
            carts: [],
            badgeShow: false,
            categoryBorderActive: colors.default,
            active: 0,
            refreshing: false,
            catActive: [{ border: { backgroundColor: colors.bgheader }, text: { color: 'white', fontWeight: 'bold' } }],
            catInactive: [{ border: { borderColor: 'gray', borderWidth: 0.5 }, text: { color: 'gray' } }],
            visible: false,
            itemToRender: 20,
            activity: false,
            playerid: '',
            datauser: {},
            datapaket: [],
            search: '',
            kodecabang: 'YGY',
            datacabang: [],
            IsFavourite: 0,
            activeInfo: false,
            info: '',
            AllCat: -1,
            activeSearch: false,
            modalVisible: false,
            searchItem: '',
            images: [],
            versiApp: versiApk,
            chatMe: true,
            phoneCabang:''

        };
        this._isMounted = false;

        OneSignal.setLogLevel(4, 0);

        OneSignal.inFocusDisplaying(2);

        // Replace 'YOUR_ONESIGNAL_APP_ID' with your OneSignal App ID.
        OneSignal.init("37dae5e1-aee8-4016-a371-191eeeab7d68", { kOSSettingsKeyAutoPrompt: false, kOSSettingsKeyInAppLaunchURL: false, kOSSettingsKeyInFocusDisplayOption: 2 });

        // The promptForPushNotifications function code will show the iOS push notification prompt. We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step below)
        OneSignal.promptForPushNotificationsWithUserResponse(this.myiOSPromptCallback);


        // Animated scrollView
        this.scrollYAnimatedValue = new Animated.Value(0);

        this.array = [];
    }


    async componentDidMount() {
        this._isMounted = true;
        await this.getUser()
        OneSignal.addEventListener('received', this.onReceived);
        OneSignal.addEventListener('opened', this.onOpened.bind(this));
        OneSignal.addEventListener('ids', this.onIds);

        this._isMounted && await this.fetchUser()
        // this._isMounted && this.fetchDataBarang()
        // this._isMounted && this.fetchInfo()
        this._isMounted && this.fetchDataPaket()
        this._isMounted && this.fetchRenderKategori()
        this._isMounted && this.fetchImages()
        this._isMounted && await this.fetchVersi()
        // this._isMounted && this.fetchCabang()
        this.reRenderSomething = this.props.navigation.addListener('focus', async () => {
            await this.getUser()
            this.fetchUser()
        });

        Keyboard.addListener("keyboardDidHide", this._keyboardDidHide.bind(this))

        setTimeout(() => {
            this.setState({ chatMe: false })
        }, 5000);

    }

    async fetchVersi() {
        const url = 'https://app.brewery-id.com/buyer/getver2.asp'
        await fetch(url, {
            method: 'GET',
        })
            .then((resp) => resp.json())
            .then((data) => {
                // console.log(data)
                if (data.versi != 0) {
                    this.cekVersiApk(data.version, data.url)
                }
            })
            .catch((error) => {
                console.log(error)
            });
    }

    cekVersiApk(newVersi, url) {
        if (this.state.versiApp != newVersi) {
            Alert.alert(
                'Update New BreweryID App',
                'Do you want to Update ?',
                [
                    { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    { text: 'Yes', onPress: () => this.updateApp(url) },
                ],
                { cancelable: false });
            return true;
        }
    }

    updateApp(url) {
        const download = url
        Linking.openURL(download)
    }

    componentDidUpdate(prevProps, prevState) {
        // only update chart if the data has changed
        if (prevState.idcabang !== this.state.idcabang) {
            this.setState({ active: 0, });
            this.fetchUser()
            this.fetchRenderKategori()
            this.fetchDataPaket()
            // this.fetchInfo()
        }
        if (prevState.datauser.JumlahActivity !== this.state.datauser.JumlahActivity) {
            this.fetchUser()
        }

    }


    componentWillUnmount() {
        OneSignal.removeEventListener('received', this.onReceived);
        OneSignal.removeEventListener('opened', this.onOpened);
        OneSignal.removeEventListener('ids', this.onIds);

        // BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);

        this._isMounted = false;
        this.reRenderSomething;

        this.setState({})

        Keyboard.removeListener("keyboardDidHide", this._keyboardDidHide);
    }

    _keyboardDidHide() {
        // alert("Phone save");
        this.search()
    };

    myiOSPromptCallback(permission){
        //permission
    }

    onReceived(notification) {
        // console.log("Notification received: ", notification);
    }

    onOpened(openResult) {
        // console.log('Message: ', openResult.notification.payload.body);
        // console.log('Data: ', openResult.notification.payload.additionalData);
        // console.log('isActive: ', openResult.notification.isAppInFocus);
        // console.log('openResult: ', openResult);

        setTimeout(() => {
            this.props.navigation.navigate('BottomTabs', { initialRoute: 'Activity' })
        }, 1000);
    }

    onIds = (device) => {
        console.log(device.userId); // Get user id from one signal
        this.createPlayerId(device.userId)
    }

    async createPlayerId(id) {
        const { idbuyer, auth, idcabang } = this.state
        const data = { aksi: 125, idbuyer, authkey: auth, idcabang, playerid: id }

        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
            })
            .catch((error) => {
                console.log(error)
            })

    }

    addFavorite = (id, isItemFavorite) => {
        let favorit = this.state.data.find((fav) => fav.ID === id);
        favorit.IsFavourite = favorit.IsFavourite == 1 ? 0 : 1;

        // console.log('1', favorit)

        let datacek = this.state.data;
        for (let i = 0; i < datacek.length; i++) {
            if (datacek[i].ID === id) {
                datacek.splice(i, 1, favorit);
            };
        };

        // console.log('2', favorit)
        // console.log(favorit.IsFavourite)

        let mode = 0;
        let pesan = '';
        if (favorit.IsFavourite == 0) {
            mode = 2
            pesan = 'Delete Favourite';
            this.refs.defaultToastBottom.ShowToastFunction(pesan);
        } else {
            mode = 1
            pesan = 'Add Favourite';
            this.refs.defaultToastBottom.ShowToastFunction(pesan);
        }
        const { auth, idbuyer, idcabang } = this.state
        const data = { aksi: 120, idbuyer, authkey: auth, idcabang, mode, idbarang: id }
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    this.fetchUser()
                } else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                }
                else {
                    this.refs.defaultToastBottom.ShowToastFunction('Gagal add');
                }
            })
            .catch((error) => {
                console.log(error)
                serverError(this.props.navigation)
            })
    }


    detailItem = (id) => {
        this.props.navigation.navigate('DetailItem', { id, idbuyer: this.state.idbuyer, auth: this.state.auth, idcabang: this.state.idcabang })
    }

    detailPaket = (id) => {
        this.props.navigation.navigate('DetailPaket', { idpaket: id, idbuyer: this.state.idbuyer, auth: this.state.auth, idcabang: this.state.idcabang })
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
        // this.getJumlahCart()
    }

    cart = () => {
        this.props.navigation.navigate('Cart')
        // alert('cart')
    }

    whatsapp = () => {
        const waurl = `whatsapp://send?text=&phone=${this.state.phoneCabang}`;

        Linking.openURL(waurl).then((data) => {
            // console.log('WhatsApp Opened');
        }).catch(() => {
            alert(`Pastikan anda telah menginstall aplikasi WhatsApp`);
        });
    }

    topup = () => {
        this.props.navigation.navigate('TopUpTabs')
    }

    pilihCabang = () => {
        this.props.navigation.navigate('PilihCabang', { id: this.state.idbuyer, idcabang: this.state.idcabang })
        // alert('cabang')
    }

    async fetchUser() {
        // console.warn('mounting')
        const { auth, idbuyer, idcabang } = this.state
        const data = { aksi: 105, idbuyer, authkey: auth, idcabang: idcabang }
        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    this.setState({ badgeShow: true, datauser: result, cabang: result.AliasCabang, phoneCabang:result.PhoneCabang })
                    if (result.IsTutup == 1) {
                        this.setState({ activeInfo: true, info: result.CatatanTutup })
                    } else {
                        this.setState({ activeInfo: false, info: '' })
                    }
                }
                else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                }
                else {
                    this.setState({ datauser: {} })
                }

                if (result.JumlahCartItem == 0) {
                    this.setState({ badgeShow: false })
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    async fetchImages() {
        const url = 'https://app.brewery-id.com/buyer/sandy.asp'
        fetch(url, {
            method: 'GET',
        })
            .then((response) => response.json())
            .then((hasil) => {
                // console.log(hasil)
                this.setState({ images: hasil.Image })
            })
            .catch((error) => {
                console.log(error)
            });
    }


    onRefresh() {
        this.setState({ data: [], datauser: {}, active: 0, itemToRender: 10, search: '' });
        // this.fetchDataBarang();
        this.fetchDataPaket();
        this.fetchUser();
        this.fetchRenderKategori();
        this.fetchImages()
    }

    async fetchDataBarang() {
        const data = { aksi: 100, idbuyer: this.state.idbuyer, authkey: this.state.auth, idcabang: this.state.idcabang }
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    if (result.Data.length != 0) {
                        this.setState({ data: result.Data, refreshing: false, })
                    } else {
                        this.setState({ data: result.Data, refreshing: false, search: 'empty' })
                    }
                }
                else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                }
                else if (result.ErrorCode == '2.2.3') {
                    this.props.navigation.replace('Login')
                }
                else {
                    this.setState({ data: [], refreshing: false, search: 'empty' })
                }
            })
            .catch((error) => {
                console.log(error);
                this.setState({ refreshing: false });
                serverError(this.props.navigation)
            })
    }

    async fetchDataPaket() {
        const data = { aksi: 136, authkey: this.state.auth, idbuyer: this.state.idbuyer, idcabang: this.state.idcabang }
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    this.setState({ datapaket: result.Data, refreshing: false, search: 'empty' })
                }
                else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                }
                else {
                    this.setState({ datapaket: [], refreshing: false, search: 'empty' })
                }
            })
            .catch((error) => {
                console.log(error);
                serverError(this.props.navigation)
            })
    }

    async fetchRenderKategori() {
        const data = { aksi: 101, authkey: this.state.auth, idbuyer: this.state.idbuyer, idcabang: this.state.idcabang }
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    this.setState({ kategori: result.Data })
                }
                else if (result.ErrorCode == '2.1') {
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
                    this.setState({ kategori: [] })
                }
            })
            .catch((error) => {
                console.log(error);
                serverError(this.props.navigation)
            })
    }

    async onPressCat(id, nama) {
        this.props.navigation.navigate('ListItem', { id, namakategori: nama })
        this.setState({ active: id, search: '' })
    }

    search = async () => {
        this.setState({ active: 0, search: '', modalVisible: false })
        const data = {
            aksi: 117,
            katakunci: this.state.searchItem,
            idbuyer: this.state.idbuyer,
            authkey: this.state.auth,
            idcabang: this.state.idcabang
        }
        if (this.state.searchItem.length >= 1) {
            this.setState({ data: [], })
            await API.Fetch(data)
                .then((result) => {
                    if (result.ErrorCode == '0') {
                        this.setState({ data: result.Data, search: result.Data.length == 0 ? 'empty' : '', searchItem: '' })
                    } else {
                        this.setState({ data: [], search: 'empty', searchItem: '' })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    }

    tombolSearch() {
        this.props.navigation.navigate('SearchItem')
    }

    modalShow = () => {
        this.setState({ modalVisible: true })
    }

    async getJumlahCart() {
        const key = Base64.decode(this.state.auth)
        const data = { aksi: 113, idbuyer: this.state.idbuyer }
        await API.Fetch(key, data)
            .then((result) => {
                if (result > 0) {
                    this.setState({ badgeShow: true, jumlahcart: result })
                } else {
                    this.setState({ badgeShow: false })
                }
            })
            .catch((error) => {
                console.log(error);
            })
    }

    renderCategory() {
        const { catActive, catInactive, kategori } = this.state
        return kategori.map((item, index) => {
            const { active } = this.state
            return (
                <TouchableOpacity key={item.IDKategori} style={[styles.categoryButton, item.Nama.length > 7 ?{width:115}:{width:85}]}
                    onPress={() => this.onPressCat(item.IDKategori, item.Nama)}
                >
                    <Text numberOfLines={1} style={{ fontSize: 16, color: colors.default, textAlign: 'center', fontWeight: '600' }}>{item.Nama.toUpperCase()}</Text>
                    <View style={{ width: 30, height: 3, backgroundColor: colors.bgheader, marginTop: 2, }} />
                </TouchableOpacity>
            )


        })
    }

    renderPaket() {
        const { datapaket } = this.state
        return datapaket.map((item, index) => {
            return (
                <View key={item.ID} style={styles.contentItem}>
                    <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => this.detailPaket(item.ID)}
                    >
                        <View style={{ height: 210, width: '100%', }}>
                            <Image source={{ uri: url_img_paket + item.Gambar }} style={{ height: '100%', width: '100%', resizeMode: 'stretch', borderTopLeftRadius: 1.5, borderTopRightRadius: 1.5, }} />
                        </View>
                    </TouchableOpacity>
                    <View style={{ marginTop: 3, paddingHorizontal: 4, }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 5 }}>
                            <View style={{ width: '65%', paddingRight: 10, }}>
                                <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>{item.Nama}</Text>
                            </View>
                            <View style={{ width: '35%', }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'right' }}>Rp {currencyFormat(item.Harga)}</Text>
                            </View>
                        </View>
                        {/* <Text style={{ fontSize: 17, fontWeight: '900', color: '#c90000', textDecorationLine: 'line-through' }}>Rp {currencyFormat(item.HargaCoret)}</Text> */}
                    </View>
                </View >
            )
        })
    }


    renderItems() {
        const { data } = this.state
        return data.map((item, index) => {
            if (index + 1 <= this.state.itemToRender) {
                return (
                    <View key={index} style={[styles.contentItem, item.Stok < 1 ? { backgroundColor: '#d1d1d1', marginRight: 5, } : null]}>
                        <TouchableOpacity style={styles.favoritIcon}
                            onPress={() => {
                                this.addFavorite(item.ID, item.IsFavourite)
                            }}
                        >
                            <Iconku id={index} name="favorite" size={25} color={item.IsFavourite == 1 ? "#9e0207" : "gray"} />
                            {/* <IconFavorit name="favorite" size={25} color={item.IsFavourite == 1 ? "red" : "gray"} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }}
                            onPress={item.Stok > 0 ? () => this.detailItem(item.ID) : null}
                        >
                            <View style={{ height: 200, width: '100%', }}>
                                <Image source={{ uri: url_img + item.Gambar }} style={{ height: '100%', width: '100%', resizeMode: 'stretch' }} />
                            </View>
                            <Text style={[styles.txtNotAvailable, item.Stok < 1 ? null : { display: 'none' }]}>Stock kosong</Text>
                        </TouchableOpacity>
                        <View style={{ marginLeft: 5, marginTop: 3, paddingHorizontal: 3, }}>
                            <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '900', color: 'black' }}>{item.Nama}</Text>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#c90000' }}>Rp {currencyFormat(Number(item.Harga))}</Text>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textGray }}>{item.Satuan}</Text>
                        </View>
                    </View >
                )
            }
        })

    }

    render() {
        const { catActive, catInactive, activeSearch, modalVisible, images, chatMe } = this.state
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    {
                        this.state.images.length == 0 ?
                            <Image source={require('../icon/PosterDefault.png')} style={{ height: '100%', width: screenWidth, resizeMode: 'stretch' }} />
                            :
                            <BackgroundSlide images={images} />
                    }
                    {/* <View style={[styles.actionHeader, { position: 'absolute', top: 5, height: 40, alignItems: 'center', }]}>
                        <TextInput
                            ref='search'
                            placeholder="Search item.."
                            placeholderTextColor='gray'
                            style={[styles.textInputSearch, { height: 40 }]}
                            onChangeText={(value) => this.search(value)}
                        />
                    </View> */}
                </View>
                <View style={styles.contentSaldo}>
                    <View style={[styles.saldo, { width: '30%' }]}>
                        <TouchableOpacity
                            style={{ height: 45, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => this.pilihCabang()}
                        >

                            <Text numberOfLines={1} style={{ color: colors.textGray, fontWeight:'400', fontSize: 14 }}>Pilih Cabang</Text>
                            <Text style={{ color: colors.bgheader, fontWeight: 'bold', fontSize: 20 }}>{this.state.kodecabang}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: 1, height: '80%', backgroundColor: 'gray' }} />
                    <View style={[styles.saldo, { width: '45%' }]}>
                        <View style={{ width: 40, justifyContent: 'center', alignItems: 'center' }}>
                            <IconWallet name="wallet-outline" size={30} color={colors.bgheader} />
                        </View>
                        <TouchableOpacity style={{ width: '75%', }}
                            onPress={this.topup}
                        >
                            <Text style={{ fontWeight: 'bold', fontSize: 15, color: colors.textGray }}>Rp {this.state.datauser.SaldoRupiah == null ? 0 : currencyFormat(Number(this.state.datauser.SaldoRupiah))}</Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 12, color: colors.textGray, }}>Top Up Saldo</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: 1, height: '70%', backgroundColor: 'gray' }} />
                    <View style={[styles.point, { width: '23%' }]}>
                        <TouchableOpacity
                            // style={styles.btnCart}
                            onPress={() => this.cart()}
                        >
                            <View >
                                <IconAnt name="shoppingcart" size={35} color={colors.bgheader} />
                                {
                                    this.state.badgeShow ? <BadgeChart qty={this.state.datauser.JumlahCartItem} /> : null
                                }
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.contentInfo, this.state.activeInfo ? null : { display: 'none' }]}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', }}>
                        <IconFavorit name="info-outline" size={30} color={colors.bgheader} style={{ marginRight: 3, }} />
                    </View>
                    <View style={{ backgroundColor: 'white', paddingHorizontal: 5, paddingVertical: 5, }}>
                        <Text style={{ fontSize: 15, color: 'red', textAlign: 'center' }}>{this.state.info}</Text>
                    </View>
                </View>
                <View style={styles.buttonSearch}>
                    <TouchableOpacity onPress={() => this.tombolSearch()}>
                        <Icon name="search-plus" size={35} color="white" style={modalVisible ? { display: 'none' } : null} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            //refresh control used for the Pull to Refresh
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh.bind(this)}
                        />
                    }

                    onMomentumScrollEnd={(e) => {
                        const scrollPosition = e.nativeEvent.contentOffset.y;
                        const scrolViewHeight = e.nativeEvent.layoutMeasurement.height;
                        const contentHeight = e.nativeEvent.contentSize.height;
                        const isScrolledToBottom = scrolViewHeight + scrollPosition
                        //check if scrollView is scrolled to bottom and limit itemToRender to data length
                        if (isScrolledToBottom >= (contentHeight - 50) && this.state.itemToRender <= 1000) {
                            this.setState({ activity: true })
                            setTimeout(() => {
                                this.setState({ itemToRender: this.state.itemToRender + 20, activity: false })
                            }, 500);
                        }
                    }}
                >

                    <View style={styles.category}>
                        {/* <Text style={styles.txtCategory}>Pilih category</Text> */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.categoryView}>
                                {/* <TouchableOpacity style={[styles.categoryButton, this.state.active == -1 ? catActive[0].border : catInactive[0].border]}
                                    onPress={() => this.onPressCat(-1)}
                                >
                                    <Text style={[{ fontSize: 14, color: colors.default, textAlign: 'center' }, this.state.active == -1 ? catActive[0].text : catInactive[0].text]}>All</Text>
                                </TouchableOpacity> */}
                                {this.state.kategori.length == 0 ?
                                    <View style={[styles.categoryButton, { width: 90 }]}
                                    >
                                        <Shimmer autoRun={true} visible={this.state.visible} style={{ fontSize: 14, color: colors.default, textAlign: 'center', width: '90%', }}></Shimmer>
                                    </View>
                                    :
                                    this.renderCategory()}
                            </View>
                        </ScrollView>
                    </View>
                    <View style={styles.content}>
                        {this.state.datapaket.length == 0 ?
                            this.state.search == 'empty' ?
                                <View >
                                    <Text style={{ color: colors.bgheader, fontSize: 20, fontWeight: '800' }}>Item tidak di temukan</Text>
                                </View > :
                                <>
                                    <View style={styles.contentItem}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 190, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                    <View style={styles.contentItem}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 190, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                    <View style={styles.contentItem}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 190, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                    <View style={styles.contentItem}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 210, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                </>
                            :
                            this.renderPaket()
                        }
                        {/* <View style={styles.contentItem}>
                            <View style={styles.favoritIcon}>
                                <Iconku name="favorite" size={25} color={"gray"} />
                            </View>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ height: 170, width: '100%', }}>
                                    <Image source={require('../icon/brewery.jpeg')} style={{ height: '100%', width: '100%', resizeMode: 'stretch' }} />
                                </View>
                            </View>
                            <View style={{ marginLeft: 5, marginTop: 3, paddingHorizontal: 3, }}>
                                <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: '900', color: 'black' }}>Paket 1</Text>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: '#c90000' }}>Rp 200.000</Text>
                            </View>
                        </View > */}
                    </View>
                    <ActivityIndicator size="small" animating={this.state.activity} color="#7d2704" />
                </ScrollView>
                <View style={styles.contentChatMe}>
                    <Image source={require('../icon/ChatMe.png')} style={{ width: 90, height: 60, resizeMode: 'stretch', display: chatMe ? 'flex' : 'none' }} />
                </View>
                <View style={styles.contentWa}>
                    <TouchableOpacity
                        onPress={() => this.whatsapp()}
                    >
                        <IconIonicons name="logo-whatsapp" size={45} color="#0DC143" />
                    </TouchableOpacity>
                </View>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                // onRequestClose={() => {
                //     Alert.alert("Modal has been closed.");
                // }}
                >
                    <TouchableOpacity style={styles.centeredView} onPress={() => this.setState({ modalVisible: false })}>
                        <View style={styles.modalView}>
                            <View style={styles.contentReview}>
                                <View style={styles.contentText}>
                                    <TextInput
                                        style={styles.textInput2}
                                        placeholder="Search..."
                                        placeholderTextColor='gray'
                                        multiline={false}
                                        numberOfLines={1}
                                        autoFocus={modalVisible}
                                        onSubmitEditing={Keyboard.dismiss}
                                        onChangeText={(value) => this.setState({ searchItem: value })}
                                    />
                                    <TouchableOpacity style={styles.btnSubmit}
                                        onPress={() => this.search()}
                                    >
                                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'white' }}>SEARCH</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
                <CustomToast ref="defaultToastBottom" position="bottom" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        backgroundColor: colors.defaultBackGround,
    },
    header: {
        height: 150,
        width: '100%',
        marginBottom: 5,
    },
    actionHeader: {
        height: 40,
        width: '100%',
    },
    search: {
        height: 40,
        width: '98%',
        alignItems: 'flex-end',
        paddingRight: 10,
    },
    textInputSearch: {
        height: 47,
        width: '85%',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 3,
        fontSize: 15,
        backgroundColor: 'white',
    },
    buttonSearch: {
        height: 40,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingRight: 15,
        position: 'absolute',
        top: 26
    },
    btnCart: {
        justifyContent: 'center'
    },
    cart: {
        width: 45,
        height: 42,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    contentSaldo: {
        height: 50,
        width: '95%',
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 4,
        paddingHorizontal: 6,
        marginVertical: 3,
        shadowColor: "#eee",
        shadowOffset: {
            width: 5,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 7,
    },
    saldo: {
        width: '50%',
        height: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    point: {
        width: '50%',
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 5,
        justifyContent: 'center'
    },
    contentInfo: {
        width: '100%',
        paddingHorizontal: 10,
    },
    category: {
        width: '100%',
        paddingHorizontal: 5,
        marginTop: 8,
    },
    txtCategory: {
        fontWeight: '500',
        fontSize: 15,
        color: colors.default,
        paddingBottom: 2,
        marginLeft: 4,
        marginBottom: 2,
    },
    categoryView: {
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    categoryButton: {
        height: 50,
        //width: screenWidth / 4 - 10,
        borderRadius: 5,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginRight: 3,
        marginBottom: 3,
        paddingHorizontal: 10,
        borderWidth: 0.5,
        borderColor: colors.bgheader
    },
    contentPaket: {
        width: '100%',
        marginVertical: 3,
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        paddingHorizontal: 5,
        paddingVertical: 7,
    },
    contentItemPaket: {
        height: 180,
        width: screenWidth / 2 - 10,
        borderRadius: 4,
        backgroundColor: '#fafafa',
        paddingBottom: 10,
        marginRight: 5,
        marginTop: 4,
        shadowColor: "#eee",
        shadowOffset: {
            width: 5,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 7,
    },
    content: {
        height: '100%',
        width: '100%',
        marginVertical: 2,
        alignItems: 'flex-start',
        justifyContent: 'space-evenly',
        flexWrap: 'wrap',
        flexDirection: 'row',
        paddingVertical: 7,
    },
    contentItem: {
        height: 270,
        width: screenWidth - 15,
        borderRadius: 4,
        backgroundColor: '#fafafa',
        marginTop: 8,
        shadowColor: "#eee",
        shadowOffset: {
            width: 5,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 7,
        paddingBottom: 6,
        marginRight: 3,
    },
    favoritIcon: {
        position: 'absolute',
        top: 3,
        left: '81%',
        zIndex: 99999
    },
    rate: {
        flexDirection: 'row',
        height: 30,
        width: '100%',
        marginTop: 5,
        justifyContent: 'flex-end',
        paddingRight: 5,
    },
    txtNotAvailable: {
        color: 'red',
        fontSize: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: "center",
        backgroundColor: 'rgba(201, 201, 201, 0.1)'
    },
    modalView: {
        alignItems: "center",
        paddingHorizontal: 10,
        height: 60,
        width: '100%',
        backgroundColor: 'rgba(201, 201, 201, 0.1)'
    },
    contentReview: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    contentText: {
        width: '97%',
        height: 40,
        marginTop: 17,
        flexDirection: 'row',
    },
    textInput2: {
        color: colors.default,
        fontSize: 17,
        width: '80%',
        height: 40,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderBottomLeftRadius: 3,
        borderTopLeftRadius: 3
    },
    btnSubmit: {
        height: 40,
        width: 65,
        backgroundColor: colors.bgheader,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3
    },
    contentWa: {
        height: 50,
        position: 'absolute',
        bottom: 15,
        right: 15,
    },
    contentChatMe: {
        // backgroundColor: 'gray',
        position: 'absolute',
        bottom: 60,
        right: 15,
        // backgroundColor: 'rgba(201, 201, 201, 0)'
    }
});

