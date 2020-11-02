import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import IconFavorit from 'react-native-vector-icons/MaterialIcons';

const Iconku = (props, navigation) => {
    const {
        name,
        size,
        color,
        id,
        ...attributes
    } = props;

    return (
        <IconFavorit name={name} size={size} color={color} />
    )
}

export default Iconku

const styles = StyleSheet.create({})
