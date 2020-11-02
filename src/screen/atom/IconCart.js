import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import IconFavorit from 'react-native-vector-icons/MaterialIcons';

const IconCart = (props, navigation) => {
    const {
        name,
        size,
        color,
        id,
        onPressCart,
        ...attributes
    } = props;

    return (
        <TouchableOpacity onPress={onPressCart} >
            <IconFavorit name={name} size={size} color={color} id={id} />
        </TouchableOpacity>
    )
}

export default IconCart

const styles = StyleSheet.create({
    btnCart: {
        position: 'absolute',
        top: 20,
        right: 30
    },
})
