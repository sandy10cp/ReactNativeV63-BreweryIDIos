import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons'
import SplashScreen from './src/screen/SplashScreen';
import Login from './src/screen/Login';
import Registrasi from './src/screen/Registrasi';
import ForgotPassword from './src/screen/ForgotPassword';
import BottomTabs from './src/screen/BottomTabs';
import ListItem from './src/screen/ListItem';
import DetailItem from './src/screen/DetailItem';
import DetailPaket from './src/screen/DetailPaket';
import SearchItem from './src/screen/SearchItem';
import Cart from './src/screen/Cart';
import TopUpTabs from './src/screen/TopUpTabs';
import TopUp from './src/screen/TopUp';
import PilihCabang from './src/screen/PilihCabang';
import TopUpUploadBukti from './src/screen/TopUpUploadBukti';
import CekAlamat from './src/screen/CekAlamat';
import DetailOrder from './src/screen/DetailOrder';
import Payment from './src/screen/Payment';
import Invoice from './src/screen/Invoice';
import UploadBukti from './src/screen/UploadBukti';
import EditAccount from './src/screen/EditAccount';
import CashTabs from './src/screen/CashTabs';
// import Message from './src/screen/Message';



const Stack = createStackNavigator();

function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SplashScreen">
          <Stack.Screen name="SplashScreen" component={SplashScreen} options={{
            title: '',
            headerTransparent: true,
            headerLeft: false
          }} />
          <Stack.Screen name="Login" component={Login} options={{
            title: '',
            headerTransparent: true,
            headerLeft: false
          }} />
          <Stack.Screen name="Registrasi" component={Registrasi} options={{
            title: '',
            headerTransparent: true,
            headerLeft: false
          }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{
            title: '',
            headerTransparent: true,
            headerLeft: false
          }} />
          <Stack.Screen name="BottomTabs" component={BottomTabs} options={{
            title: '',
            headerTransparent: true,
            headerLeft: false
          }} />
          <Stack.Screen name="ListItem" component={ListItem}
            options={{
              title: '',
              headerBackTitleVisible: false,
              headerTransparent: true,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="DetailItem" component={DetailItem}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="DetailPaket" component={DetailPaket}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="SearchItem" component={SearchItem}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="Cart" component={Cart}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="TopUpTabs" component={TopUpTabs}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="TopUp" component={TopUp}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="PilihCabang" component={PilihCabang}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="TopUpUploadBukti" component={TopUpUploadBukti}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="CekAlamat" component={CekAlamat}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="DetailOrder" component={DetailOrder}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="Payment" component={Payment}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="Invoice" component={Invoice}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="UploadBukti" component={UploadBukti}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="EditAccount" component={EditAccount}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible:false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          <Stack.Screen name="CashTabs" component={CashTabs}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          />
          {/* <Stack.Screen name="Message" component={Message}
            options={{
              title: '',
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerBackImage: () => (<Icon name="arrow-back" size={35} color="white" />),
            }}
          /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default App;