import {
    BLEPrinter,
} from "react-native-thermal-receipt-printer";
const _connectPrinter = (printer) => {
    //connect printer
    BLEPrinter.connectPrinter(printer.inner_mac_address).then(
        setCurrentPrinter,
        error => console.warn(error))
}
const searchConnectPrinter = () => {
    BLEPrinter.init().then(() => {
        console.log('Devices:', BLEPrinter.getDeviceList())
        BLEPrinter.getDeviceList().then(
            
        );
    });
}
const printTextTest = () => {
    currentPrinter && BLEPrinter.printText("<C>sample text</C>\n");
}

const printBillTest = () => {
    currentPrinter && BLEPrinter.printBill("<C>sample bill</C>");
}