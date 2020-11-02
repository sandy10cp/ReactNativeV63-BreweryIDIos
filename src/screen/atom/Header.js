import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { colors } from '../../utils'

const Header = ({ title }) => {
    return (
        <View style={styles.header}>
            <Text numberOfLines={1} style={styles.txtHeader}>{title}</Text>
        </View>
    )
}

export default Header;

const styles = StyleSheet.create({
    header: {
        height: 82,
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: colors.bgheader
    },
    txtHeader: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 5,
    },
})