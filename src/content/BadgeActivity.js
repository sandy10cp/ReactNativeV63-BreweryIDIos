import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../utils';

const BadgeActivity = (props) => {

    const {
        qty,
        active,
        icon,
    } = props;


    return (
        <View style={styles.container}>
            {active ?
                <Icon name={icon} size={22} color={colors.bgheader} />
                :
                <Icon name={icon} size={20} color="gray" />
            }
            {
                qty != 0 ?
                    <View style={styles.content}>
                        <Text style={styles.txtBadge}>{qty}</Text>
                    </View>
                    : null
            }
        </View>
    )
}

export default BadgeActivity;

const styles = StyleSheet.create({
    container: {

    },
    content: {
        position: 'absolute',
        width: 17,
        height: 17,
        backgroundColor: 'red',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        top: -6,
        left: 10
    },
    txtBadge: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 10,
    }
});