import React, { Component } from 'react';
import { View, Text, StyleSheet, Keyboard, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions, Image, ToastAndroid } from 'react-native';
import { colors } from '../utils';
import serverError from '../function/serverError';
import AsyncStorage from '@react-native-community/async-storage';
import API from '../service';
import Icon from 'react-native-vector-icons/FontAwesome';
import Shimmer from '../content/Shimmer';
import currencyFormat from '../function/currencyFormat';
import Iconku from './atom/Iconku';
import { url_img } from '../Url';
import Header from './atom/Header';

const screenWidth = Math.round(Dimensions.get('window').width);

class SearchItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idbuyer: '',
            auth: '',
            idcabang: '',
            searchItem: '',
            search: '',
            data: [],
            visible: true,
            itemToRender: 20,
            activity: false,
            datauser: {}

        };
    }

    async componentDidMount() {
        await this.getUser()
        this.fetchUser()

        Keyboard.addListener("keyboardDidHide", this._keyboardDidHide.bind(this))
    }

    componentWillUnmount() {

        Keyboard.removeListener("keyboardDidHide", this._keyboardDidHide);
    }

    _keyboardDidHide() {
        this.search()
    }

    getUser = async () => {
        await AsyncStorage.getItem('user', (error, result) => {
            const d = JSON.parse(result)
            // console.log(d)
            this.setState({
                idbuyer: d.id,
                auth: d.authkey,
                idcabang: d.idcabang,
            })
        });
    }

    search = async () => {
        this.setState({ active: 0, search: '', visible: false })
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
                        this.setState({ data: result.Data, search: result.Data.length == 0 ? 'empty' : '', searchItem: '', visible: true })
                    } else {
                        this.setState({ data: [], search: 'empty', searchItem: '', visible: true })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    }

    async fetchUser() {
        const { auth, idbuyer, idcabang } = this.state
        const data = { aksi: 105, idbuyer, authkey: auth, idcabang: idcabang }
        await API.Fetch(data)
            .then((result) => {
                // console.log(resuaalt)
                if (result.ErrorCode == '0') {
                    this.setState({ datauser: result, })
                }
                else if (result.ErrorCode == '2.1') {
                    this.props.navigation.replace('Login')
                }
                else {
                    this.setState({ datauser: {} })
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    addFavorite = (id, isItemFavorite) => {
        let favorit = this.state.data.find((fav) => fav.ID === id);
        favorit.IsFavourite = favorit.IsFavourite == 1 ? 0 : 1;

        let datacek = this.state.data;
        for (let i = 0; i < datacek.length; i++) {
            if (datacek[i].ID === id) {
                datacek.splice(i, 1, favorit);
            };
        };

        let mode = 0;
        let pesan = '';
        if (favorit.IsFavourite == 0) {
            mode = 2
            pesan = 'Delete Favourite';
            ToastAndroid.showWithGravityAndOffset(pesan, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
        } else {
            mode = 1
            pesan = 'Add Favourite';
            ToastAndroid.showWithGravityAndOffset(pesan, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
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
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.120.1') {
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                } else if (result.ErrorCode == '2.120.2') {
                    ToastAndroid.showWithGravityAndOffset(result.ErrorDesc, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
                }
                else {
                    ToastAndroid.showWithGravityAndOffset('Gagal Add', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 25, 50);
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
                        </TouchableOpacity>
                        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }}
                            onPress={item.Stok > 0 ? () => this.detailItem(item.ID) : null}
                        >
                            <View style={{ height: 200, width: '100%', }}>
                                <Image source={{ uri: url_img + item.Gambar }} style={{ height: '100%', width: '100%', resizeMode: 'stretch', borderTopLeftRadius: 1.5, borderTopRightRadius: 1.5, }} />
                            </View>
                            <Text style={[styles.txtNotAvailable, item.Stok < 1 ? null : { display: 'none' }]}>Sold Out</Text>
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
        return (
            <View style={styles.container}>
                <Header title="SEARCH" />
                <View style={styles.contentText}>
                    <TextInput
                        style={styles.textInput2}
                        placeholder="Search..."
                        placeholderTextColor='gray'
                        multiline={false}
                        numberOfLines={1}
                        autoFocus={true}
                        onSubmitEditing={Keyboard.dismiss}
                        onChangeText={(value) => this.setState({ searchItem: value })}
                    />
                    <TouchableOpacity style={styles.btnSubmit}
                        onPress={() => { this.search() }}
                    >
                        <Icon name="search-plus" size={35} color="white" />
                    </TouchableOpacity>
                </View>
                <ScrollView
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
                    <View style={styles.content}>
                        {this.state.data.length == 0 ?
                            this.state.search == 'empty' ?
                                <View >
                                    <Text style={{ color: colors.bgheader, fontSize: 20, fontWeight: '800' }}>Item tidak di temukan</Text>
                                </View > :
                                <View style={{display:'none'}}>
                                    <View style={[styles.contentItem, this.state.visible ? { display: 'none' } : null]}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 180, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                    <View style={[styles.contentItem, this.state.visible ? { display: 'none' } : null]}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 180, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                    <View style={[styles.contentItem, this.state.visible ? { display: 'none' } : null]}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 180, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                    <View style={[styles.contentItem, this.state.visible ? { display: 'none' } : null]}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 180, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                    <View style={[styles.contentItem, this.state.visible ? { display: 'none' } : null]}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 180, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                </View>
                            :
                            this.renderItems()}
                    </View>
                </ScrollView>
                <ActivityIndicator size="small" animating={this.state.activity} color={colors.bgheader} />
            </View>
        );
    }
}

export default SearchItem;

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
    textInput2: {
        color: colors.default,
        fontSize: 17,
        width: '75%',
        height: 40,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderBottomLeftRadius: 3,
        borderTopLeftRadius: 3,
        shadowColor: "#eee",
        shadowOffset: {
            width: 7,
            height: 7,
        },
        shadowOpacity: 0.5,
        shadowRadius: 6.27,
        elevation: 7,
    },
    contentText: {
        width: '90%',
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,

    },
    btnSubmit: {
        height: 40,
        width: 50,
        backgroundColor: colors.bgheader,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
        shadowColor: "#eee",
        shadowOffset: {
            width: 7,
            height: 7,
        },
        shadowOpacity: 0.5,
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
        height: 294,
        width: screenWidth / 2 - 15,
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
    txtNotAvailable: {
        color: 'red',
        fontSize: 12,
    },

})

