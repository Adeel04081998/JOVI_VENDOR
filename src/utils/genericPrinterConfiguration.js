import { Alert } from "react-native";
import {
    BLEPrinter,
} from "react-native-thermal-receipt-printer";
import { SET_PRINTER } from "../redux/actions/types";
import store from '../redux/store';
let bluetoothPrinterHandler = BLEPrinter;
const _connectPrinter = (printer) => {
    //connect printer
    bluetoothPrinterHandler.connectPrinter(printer.inner_mac_address).then(
        (printer)=>{
            setPrinter(printer);
        },
        error => console.warn(error))
}
export const searchConnectPrinter = () => {
    bluetoothPrinterHandler.init().then(() => {
        console.log('Devices:', bluetoothPrinterHandler.getDeviceList())
        bluetoothPrinterHandler.getDeviceList().then((printers)=>{
            Alert.alert('Select Printer','Please select any available printer',
            printers.length<1?
            [ { text: "No Printers Found", onPress: () => {} }]
            :printers.map(item=>{
                return {
                    text: item.device_name, onPress: () => _connectPrinter(item)
                }
            }),
            {
                cancelable:true
            }
            );
        });
    });
}
const setPrinter = (printer) => {
    store.dispatch({
        type:SET_PRINTER,
        payload:printer
    });
} 
export const printTextTest = () => {
    store.getState().printerReducer && bluetoothPrinterHandler.printText("<C>sample text</C>\n");
}

export const printBillTest = () => {
    store.getState().printerReducer && bluetoothPrinterHandler.printBill("<C>sample bill</C>");
}