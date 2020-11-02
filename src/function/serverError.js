import React from 'react';
import { ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { RNToasty } from 'react-native-toasty';

function setLocalStorage(data) {
    AsyncStorage.setItem('user', JSON.stringify(data))
        .then(() => {
            //console.log('It was saved successfully')
        })
        .catch(() => {
            console.log('There was an error saving the product')
        })
}

const serverError = (props) => {
    // Ke halaman Login
    props.navigate('Login')
    const user = {
        id: 0,
        IsActive: 0,
        IsLogin: 0,
        authkey: '',
        idcabang: 0,
        kodecabang: ''
    }
    setLocalStorage(user)
    RNToasty.Normal({ title: 'Network request failed', duration: 0 })
}

export default serverError;