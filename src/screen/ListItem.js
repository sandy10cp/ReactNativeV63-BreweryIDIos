import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Dimensions, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import serverError from '../function/serverError';
import API from '../service';
import Shimmer from '../content/Shimmer';
import { url_img } from '../Url';
import currencyFormat from '../function/currencyFormat';
import Iconku from './atom/Iconku';
import { colors } from '../utils';
import Header from './atom/Header'
import CustomToast from '../LoaderAlert/CustomToast';


const screenWidth = Math.round(Dimensions.get('window').width);

class ListItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idbuyer: '',
            auth: '',
            idcabang: '',
            idkategori: props.route.params.id,
            data: [],
            search: '',
            visible: false,
            itemToRender: 20,
            activity: false,
            datauser: [],
            refreshing: false
        };
    }

    async componentDidMount() {
        await this.getUser()
        this.fetchItem()
        this.fetchUser()
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

    fetchItem() {
        this.setState({ data: [] })
        const data = { aksi: 102, idkategori: this.state.idkategori, authkey: this.state.auth, idbuyer: this.state.idbuyer, idcabang: this.state.idcabang }
        API.Fetch(data)
            .then((result) => {
                // console.log(result)
                if (result.ErrorCode == '0') {
                    this.setState({ data: result.Data, refreshing: false, })
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
                    this.setState({ data: [], search: 'empty', refreshing: false, })
                }
            })
            .catch((error) => {
                console.log(error);
            })
    }

    async fetchUser() {
        // console.warn('mounting')
        const { auth, idbuyer, idcabang } = this.state
        const data = { aksi: 105, idbuyer, authkey: auth, idcabang: idcabang }
        await API.Fetch(data)
            .then((result) => {
                // console.log(result)
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
                } else if (result.ErrorCode == '2.120.1') {
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                } else if (result.ErrorCode == '2.120.2') {
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
                }
                else {
                    this.refs.defaultToastBottom.ShowToastFunction(result.ErrorDesc);
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

    onRefresh() {
        this.setState({ data: [], itemToRender: 10, search: '' });
        this.fetchItem();
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
                <Header title={this.props.route.params.namakategori.toUpperCase()} />
                <ScrollView
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
                    <View style={styles.content}>
                        {this.state.data.length == 0 ?
                            this.state.search == 'empty' ?
                                <View >
                                    <Text style={{ color: colors.bgheader, fontSize: 20, fontWeight: '800' }}>Item tidak di temukan</Text>
                                </View > :
                                <>
                                    <View style={styles.contentItem}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 180, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                    <View style={styles.contentItem}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 180, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                    <View style={styles.contentItem}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 180, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                    <View style={styles.contentItem}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 180, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                    <View style={styles.contentItem}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 180, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                    <View style={styles.contentItem}>
                                        <View style={{ marginLeft: 5 }}>
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '97%', height: 180, marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                            <Shimmer autoRun={true} visible={this.state.visible} style={{ width: '60%', marginTop: 5 }} />
                                        </View>
                                    </View >
                                </>
                            :
                            this.renderItems()}
                    </View>
                </ScrollView>
                <ActivityIndicator size="small" animating={this.state.activity} color={colors.bgheader} />
                <CustomToast ref="defaultToastBottom" position="bottom" />
            </View>
        );
    }
}

export default ListItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
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
