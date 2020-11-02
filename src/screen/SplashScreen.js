import React, { PureComponent } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';


export default class SplashScreen extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            regis: true,
            login: false,
            user: {}
        };
    }

    componentDidMount() {
        this.getUser()
    }

    checkUser(user) {
        if (user.IsLogin == '1') {
            if (user.IsActive == '0') {
                this.props.navigation.replace('Registrasi', { formRegis: false })
            } else {
                this.setState({ login: true })
                this.cekScreenRegisAndLogin()
            }
        } else {
            this.setState({ login: false })
            this.cekScreenRegisAndLogin()
        }
    }

    getUser() {
        AsyncStorage.getItem('user', (error, result) => {
            const d = JSON.parse(result)
            console.log(d)
            this.setState({

            })
            if (d == null) {
                this.cekScreenRegisAndLogin()
            } else {
                this.checkUser(d)
            }
        });
    }

    cekScreenRegisAndLogin() {
        if (this.state.login) {
            this.goToHome()
        } else {
            this.goToLogin()
        }
    }


    goToRegis() {
        setTimeout(() => {
            this.props.navigation.replace('Registrasi', { formRegis: true })
        }, 2000);
    }

    goToHome() {
        setTimeout(() => {
            this.props.navigation.replace('BottomTabs', { initialRoute: 'Home' })
        }, 1);
    }

    goToLogin() {
        setTimeout(() => {
            this.props.navigation.replace('Login')
        }, 2000);
    }

    render() {
        return (
            <View style={styles.container}>
                <Image source={require('../icon/brewery.jpeg')} style={{ height: 190, width: 190 }} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    txtFantastic: {
        fontSize: 30,
        fontWeight: "bold",
        color: '#935C00'
    }
})
