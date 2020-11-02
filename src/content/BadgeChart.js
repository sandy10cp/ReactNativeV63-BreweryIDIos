import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils';

const BadgeChart = (props) => {
    const {
        qty,
    } = props;
    return (
        <View style={styles.content}>
            <Text style={styles.txtBadge}>{qty}</Text>
        </View>
    )
}

export default BadgeChart;

const styles = StyleSheet.create({
    content: {
        position: 'absolute',
        width: 20,
        height: 20,
        backgroundColor: '#dedede',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        left: 12,
        top: -6,
    },
    txtBadge: {
        fontWeight: 'bold',
        color: 'red',
        fontSize: 13,
    }
});