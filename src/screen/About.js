import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Image, Linking, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../utils';
import AsyncStorage from '@react-native-community/async-storage';
import API from '../service';
import versiApk from '../function/version';

const About = () => {

    const [state, setState] = useState({
        activityLoad: true,
        versiApp: versiApk,
    })

    const [buyer, setBuyer] = useState({})

    useEffect(() => {
        async function readItem() {
            await AsyncStorage.getItem('user').then((data) => {
                if (data) {
                    const d = JSON.parse(data)
                    setBuyer({
                        idbuyer: d.id,
                        auth: d.authkey
                    });
                }
            });
        }
        readItem()
    }, [buyer.idbuyer, buyer.auth])

    const [versi, setVersi] = useState('')
    const [url, setUrl] = useState('')
    useEffect(() => {
        function fetchVersi() {
            const url = 'https://app.brewery-id.com/buyer/getver.asp'
            fetch(url, {
                method: 'GET',
            })
                .then((resp) => resp.json())
                .then((data) => {
                    // console.log(data)
                    setVersi(data.version)
                    setUrl(data.url)
                })
                .catch((error) => {
                    console.log(error)
                });
        }
        fetchVersi()
    }, [])

    const updateApp = () => {
        const download = url
        if (versi != state.versiApp) {
            Linking.openURL(download)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.aboutApp}>
                <Image source={require('../icon/brewery3.png')} style={{ width: 180, height: 180, marginBottom: 7 }} />
            </View>
            <View>
                <TouchableOpacity style={[styles.btnUpdate, versi == state.versiApp ? { display: 'none' } : null]}
                    onPress={() => updateApp()}
                >
                    <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>Update App</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.versiApp}>
                <Text style={{ fontSize: 20 }}>Versi {state.versiApp}</Text>
                <Text style={{ marginBottom: 15, fontSize: 12 }}>Copyright © 2020 Brewery ID</Text>
            </View>
        </View>
    )
}

export default About

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.defaultBackGround
    },
    aboutApp: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    versiApp: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    btnUpdate: {
        width: 100,
        height: 40,
        backgroundColor: colors.bgheader,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
