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
        (printer) => {
            setPrinter(printer);
        },
        error => console.warn(error))
}
export const searchConnectPrinter = () => {
    bluetoothPrinterHandler.init().then(async () => {
        // let value = bluetoothPrinterHandler.getDeviceList();
        // console.log('Devices:', (await bluetoothPrinterHandler.getDeviceList()).length,value)
        let printers = (await bluetoothPrinterHandler.getDeviceList()).length;
        bluetoothPrinterHandler.getDeviceList().then((printers) => {
            // debugger;
            Alert.alert('Select Printer', 'Please select any available printer. (Please make sure that bluetooth is enabled and printer is connected.)',
                printers.length < 1 ?
                    [{ text: "No Printers Found", onPress: () => { } }]
                    : printers.map(item => {
                        return {
                            text: item.device_name, onPress: () => _connectPrinter(item)
                        }
                    }),
                {
                    cancelable: true
                }
            );
        });
    }).catch(err => {
        // console.log(err)
        // if(err.toString().contains('n'))
        if (err === 'No Device Found') {
            err = err + '. Please make sure printer(s) are paired with the device.'
        }
        Alert.alert('Error', err, [], { cancelable: true });
    });
}
const setPrinter = (printer) => {
    store.dispatch({
        type: SET_PRINTER,
        payload: printer
    });
}
export const printTextTest = () => {
    store.getState().printerReducer && bluetoothPrinterHandler.printText("<C>sample text</C>\n");
}

export const printBillTest = () => {
    store.getState().printerReducer && bluetoothPrinterHandler.printBill("<C>sample bill</C>");
}

// export const printReceipt = async (orderDetails, orderInfo, dispatch) => {
//     dispatch(showHideLoader(true, 'Please wait...'));
//     RNXprinter.pushText("Jovi                            " + orderInfo?.orderCreationTime, 0.9);
//     RNXprinter.pushText("Order No:" + orderInfo?.orderNo, 0.8);
//     RNXprinter.pushText("------------------------", 1);
//     orderDetails.map((item, i) => {
//         let index = i + 1;
//         RNXprinter.pushText(index + ". " + item.jobItemName + "  x  " + item.quantity, 0.6);
//         // RNXprinter.pushText(index + ". " + item.quantity + " x " + item.jobItemName, 0.6);
//         if (item.jobItemOptionList && item.jobItemOptionList.length > 0) {
//             item.jobItemOptionList.map((attr, j) => {
//                 RNXprinter.pushText("------ " + attr.productAttributeName, 0.5);
//                 // RNXprinter.pushText("------ " + index + "." + (j + 1) + " " + attr.productAttributeName, 0.5);
//             });
//         }
//         if (item.jobDealOptionList && item.jobDealOptionList.length > 0) {
//             item.jobDealOptionList.map((attr, j) => {
//                 RNXprinter.pushText("------ " + attr.itemName, 0.5);
//             });
//         }
//         RNXprinter.pushText("   ", 0.3);
//     });
//     RNXprinter.pushText("   ", 0.7);
//     RNXprinter.pushText("************************", 1);
//     RNXprinter.pushText("   ", 0.7);
//     RNXprinter.pushCutPaper();
//     await RNXprinter.print();
//     dispatch(showHideLoader(false, ''));
// }
export const printReceipt = (orderDetails, orderInfo, userInfo) => {
    let jobItems = ''
    orderDetails.map((item, i) => {
        let orderItem = '';
        let index = i + 1;
        if (item.jobItemStatus !== 1) {
            if (i === 0) {
                orderItem = (index + ". " + (userInfo?.pitstopType === 4 ? item.jobItemName : item.brandName + " " + item.jobItemName) + "  x  " + item.quantity + "\n    ");
            } else {
                orderItem = ("    " + index + ". " + (userInfo?.pitstopType === 4 ? item.jobItemName : item.brandName + " " + item.jobItemName) + "  x  " + item.quantity + "\n    ");
            }
            if (item.jobItemOptionList && item.jobItemOptionList.length > 0) {
                item.jobItemOptionList.map((attr, j) => {
                    orderItem = orderItem + ("------ " + attr.productAttributeName + "\n    ");
                });
            }
            if (item.jobDealOptionList && item.jobDealOptionList.length > 0) {
                item.jobDealOptionList.map((attr, j) => {
                    orderItem = orderItem + ("------ " + attr.itemName + "\n    ");
                });
            }
            jobItems = jobItems + orderItem + '\n';
        }
    });
    let bill = `<C><D>Jovi</D></C>\n
    <C>${userInfo?.pitstopName}</C>\n
    Order No: ${orderInfo?.orderNo}       ${orderInfo?.orderCreationTime}\n
    <D>----------------------</D>\n
    ${jobItems}
         <D>**************</D>\n
    `;
    store.getState().printerReducer && bluetoothPrinterHandler.printBill(bill);
}