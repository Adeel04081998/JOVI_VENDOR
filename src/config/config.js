import { Alert, Dimensions, Platform, StatusBar } from 'react-native';
import CustomToast from "../components/toast/CustomToast";
import Config from 'react-native-config';
import RNFS from "react-native-fs";
import commonSvgIcons from '../assets/svgIcons/common/common';

export const MODES = {
    CUSTOMER: Config["com_jovivendors"],
    RIDER: Config["com_jovirider"]
};

// For Release Build (Proper APP_MODE will be identified)
let APP_MODE = MODES.CUSTOMER;

let SENDING_LOCATIONS_ENABLED = true;

if (Platform.OS === "android" && Config.BUILD_TYPE === "debug") {
    // For Development Build (Change the APP_MODE here if needed, changing APP_MODE here will not affect Release Build)
    // APP_MODE = MODES.CUSTOMER;
    APP_MODE = MODES.CUSTOMER;

    // APP_MODE = (Platform.Version === 29 /* || Dimensions.get("window").height < 767 */) ? MODES.RIDER : MODES.CUSTOMER;
    // APP_MODE = (Platform.Version === 28 || Dimensions.get("window").height < 767) ? MODES.RIDER : MODES.CUSTOMER;

    // SENDING_LOCATIONS_ENABLED = false;

    // Mudassir
    // APP_MODE = Dimensions.get("screen").height === 740 ? MODES.CUSTOMER : MODES.RIDER;
    // console.log(Dimensions.get("screen").height)
}

export { APP_MODE, SENDING_LOCATIONS_ENABLED };

export const isJoviCustomerApp =true;

export const CONSTANTLATDELTA = 0.0122;
export const CONSTANTLONGDELTA = (Dimensions.get("window").width / Dimensions.get("window").height) * 0.0122;

export const GOOGLE_API_KEY = "AIzaSyBKJWO9UCRwJUDjUhRl9pEZgYnzayeARAg";

export let BASE_URL = "https://jovi-api-staging.cibak.pk";
// export let BASE_URL = "https://jovi-api-dev.cibak.pk";

// export let BASE_URL = "https://192.168.100.28:5000";

// export let BASE_URL = "https://cibak.ddns.net";
// export let BASE_URL = "https://cibak.hopto.org:86";
// export let BASE_URL = "115.186.129.133";

export let isBaseURLReconfigured = false;

export const EMPTY_PROFILE_URL = "https://www.pngfind.com/pngs/m/110-1102775_download-empty-profile-hd-png-download.png";
export const IMAGE_NOT_AVAILABLE_URL = "https://www.dia.org/sites/default/files/No_Img_Avail.jpg";
export const HAS_NOTCH = StatusBar.currentHeight > 24 ? true : false;
export const CONTACT_EMAIL = "jovi@cibaksolutions.com";
export const CONTACT_NUMBER = "03455108590";
export const DATE_FORMATE = "DD/MM/YYYY";

// Device info
export const DEVICE_WIN_WIDTH = Dimensions.get('window').width;
export const DEVICE_WIN_HEIGHT = Dimensions.get('window').height;
export const DEVICE_SCREEN_WIDTH = Dimensions.get('screen').width;
export const DEVICE_SCREEN_HEIGHT = Dimensions.get('screen').height;


export const extractBaseURLFromExternalConfigFile = async () => {
    const filePath = RNFS.ExternalDirectoryPath + '/jovi_conf.txt';
    try {
        const fileContent = await RNFS.readFile(filePath, 'utf8');
        console.log("External Config file found here:", '"' + filePath + '"');

        if (fileContent) {
            const lines = fileContent.split("\n");

            const extractedBaseUrl = (lines[0]) ? lines[0].trim().replace(/\r|\n/gi, "") : "";
            if (extractedBaseUrl) {
                BASE_URL = extractedBaseUrl;
                isBaseURLReconfigured = true;
                CustomToast.success(`Got Base URL from "jovi_conf.txt" as "${extractedBaseUrl}"`, "bottom", "long");
                console.log("Base URL is now updated, its value is the 1st line in the file:", '"' + extractedBaseUrl + '"');
            }
            else {
                isBaseURLReconfigured = false;
                console.log("The file found has no readable 1st line in it!");
            }
        }
        else {
            isBaseURLReconfigured = false;
            console.log("The file found has no readable content in it!");
        }
    }
    catch (e) {
        isBaseURLReconfigured = false;
        console.log("No External Config file found here:", '"' + filePath + '"');
        console.log("Creating 'jovi_conf.txt' file...");

        RNFS.writeFile(filePath, "", "utf8")
            .then((success) => {
                console.log("Created 'jovi_conf.txt' file!");
            })
            .catch((err) => {
                console.log(err.message);
            });
    }
};
extractBaseURLFromExternalConfigFile();

export const BOTTOM_TABS = [
    {
        title: "Add Brand",
        description: "Add new brand in supermart",
        pitstopOrCheckOutItemType: 1,
        icon: color => commonSvgIcons.footerSuperMarket(color),
        
    },
    // {
    //     title: "Products",
    //     description: "Resturants",
    //     pitstopOrCheckOutItemType: 2,
    //     icon: color => commonSvgIcons.footerResturants(color),
    //     route: {
    //         container: "super_market_home",
    //         screen: "dashboard"
    //     }
    // },
    {
        title: "Orders",
        description: "Orders",
        pitstopOrCheckOutItemType: 3,
        icon: color => commonSvgIcons.footerCart(color),
        route: {
            container: "super_market_home",
            screen: "dashboard"
        }
    }]
// Bottom Tabs
// export const BOTTOM_TABS = [
//     {
//         title: "Supermarket",
//         description: "Groceries",
//         pitstopOrCheckOutItemType: 1,
//         icon: color => commonSvgIcons.footerSuperMarket(color),
//         route: {
//             container: "super_market_home",
//             screen: "dashboard"
//         }
//     },
//     {
//         title: "Resturants",
//         description: "Resturants",
//         pitstopOrCheckOutItemType: 2,
//         icon: color => commonSvgIcons.footerResturants(color),
//         route: {
//             container: "super_market_home",
//             screen: "dashboard"
//         }
//     },
//     {
//         title: "Pharmacy",
//         description: "Medicine",
//         pitstopOrCheckOutItemType: 3,
//         icon: color => commonSvgIcons.pills(color),
//         route: {
//             container: "super_market_home",
//             screen: "dashboard"
//         }
//     },
//     {
//         title: "Cart",
//         description: "Cart",
//         pitstopOrCheckOutItemType: 0,
//         icon: color => commonSvgIcons.footerCart(color),
//         route: {
//             container: "customer_cart_home",
//             screen: "customer_cart"
//         }
//     }]

