
import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Modal,
    Image,
    Text
} from 'react-native';


const Loader = props => {
    const {
        loading,
        message,
        status,
        ...attributes
    } = props;

    return (
        <Modal
            transparent={true}
            animationType={'none'}
            visible={loading}
            onRequestClose={() => { console.log('close modal') }}>
            <View style={styles.modalBackground}>
                <View style={styles.activityIndicatorWrapper}>
                    {
                        status ?
                            <Image source={require('../icon/success.png')} style={{ width: 70, height: 70, marginBottom: 1 }} />
                            :
                            <Image source={require('../icon/error.png')} style={{ width: 70, height: 70, marginBottom: 1 }} />
                    }
                    <Text style={{ textAlign: 'center' }}>{message}</Text>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#00000040'
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        width: 125,
        borderRadius: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        paddingHorizontal: 5
    }
});

export default Loader;