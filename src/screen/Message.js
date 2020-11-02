import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview';
import { colors } from '../utils';
import Header from './atom/Header';

const Message = ({ route }) => {

    const [state, setState] = useState({
        visible: false,
        idbuyer: route.params.idbuyer,
        authkey: route.params.authkey,
        idcabang: route.params.idcabang,
        idorders: route.params.idorders,
        url: `https://app.brewery-id.com/buyer/OrdersChat.asp?idbuyer=${route.params.idbuyer}&authkey=${route.params.authkey}&idcabang=${route.params.idcabang}&idorders=${route.params.idorders}`,
        urlFetch: `https://app.brewery-id.com/buyer/OrdersChat.asp`
    })

    useEffect(() => {
        const formData = new FormData();
        formData.append('idbuyer', state.idbuyer);
        formData.append('authkey', state.authkey);
        formData.append('idcabang', state.idcabang);
        formData.append('idorders', state.idorders);

        // console.log(JSON.stringify(formData))
        function fetchMessaga() {
            fetch(state.urlFetch, {
                method: 'POST',
                body: formData
            })
                .then((resp) => resp.json())
                .then((data) => {
                    console.log(data)
                    setState({ ...state, visible: false })
                })
                .catch((error) => {
                    console.log(error)
                    setState({ ...state, visible: false })
                });
        }
        fetchMessaga()

    }, [])

    const showSpinner = () => {
        setState({ ...state, visible: true });
    }

    const hideSpinner = () => {
        setState({ ...state, visible: false });
    }

    return (
        <View style={styles.container}>
            <Header title="CHAT" />
            <View style={state.visible === true ? styles.stylOld : styles.styleNew}>
                {state.visible ? (
                    <ActivityIndicator
                        color="#323232"
                        size="large"
                        style={styles.ActivityIndicatorStyle}
                    />
                ) : null}
                <WebView
                    source={{ uri: state.url }}
                    style={{ marginTop: 0 }}
                    startInLoadingState={true}
                // onLoadStart={() => showSpinner()}
                // onLoad={() => hideSpinner()}
                />
            </View>
            {/* <View style={styles.stylOld}>
                <WebView
                    source={{ uri: state.urlFetch }}
                    style={{ marginTop: 0, }}
                    startInLoadingState={true}
                />
            </View> */}
        </View>
    )
}

export default Message

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
    },
    stylOld: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    styleNew: {
        width: '100%',
        flex: 1,
    },

})