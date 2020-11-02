import React, { Component, createRef } from 'react'
import { Text, View, StyleSheet, Dimensions, Image, ScrollView } from 'react-native'
import { url_img_poster } from '../Url';

const screenWidth = Math.round(Dimensions.get('window').width);

export class BackgroundSlide extends Component {
    scrollRef = createRef()
    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: 0
        }
    }

    componentDidMount = () => {
        setInterval(() => {
            this.setState(prev => ({ selectedIndex: prev.selectedIndex == this.props.images.length - 1 ? 0 : prev.selectedIndex + 1 }),
                () => {
                    this.scrollRef.current.scrollTo({
                        animated: true,
                        y: 0,
                        x: screenWidth * this.state.selectedIndex
                    })
                })
        }, 3500)
    }

    setSelectedInde = event => {
        // Get view width
        const viewSize = event.nativeEvent.layoutMeasurement.width;
        // Get current position of the scroll
        const contentOffset = event.nativeEvent.contentOffset.x

        const selectedIndex = Math.floor(contentOffset / viewSize)
        this.setState({ selectedIndex })
    }

    render() {
        const { images } = this.props
        const { selectedIndex } = this.state
        return (
            <View style={{ height: '100%', width: '100%' }}>
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    pagingEnabled
                    onMomentumScrollEnd={this.setSelectedInde}
                    ref={this.scrollRef}
                >
                    {images.map(image => (
                        <Image key={image} source={{ uri: url_img_poster + image }} style={styles.imageStyle} />
                    ))}
                </ScrollView>
                <View style={styles.circleContent}>
                    {images.map((image, index) => (
                        <View
                            key={image}
                            style={[styles.whiteCircle, { opacity: index == selectedIndex ? 0.5 : 1 }]}
                        />
                    ))}
                </View>
            </View>
        )
    }
}

export default BackgroundSlide

const styles = StyleSheet.create({
    imageStyle: {
        height: '100%',
        width: screenWidth,
        resizeMode: 'stretch'
    },
    circleContent: {
        position: 'absolute',
        bottom: 4,
        height: 10,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    whiteCircle: {
        width: 6,
        height: 6,
        borderRadius: 3,
        margin: 5,
        backgroundColor: '#fff'
    },
})



