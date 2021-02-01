import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import styles from './UserRegisterStyles';
import CustomInput from '../../components/input/Input';
import commonStyles from '../../styles/styles';
import SubmitBtn from '../../components/buttons/SubmitBtn';

export default function ForgotPassword(props) {
    // console.log('ForgotPassword Props :', props);
    const { toggleModal, activeTheme, signInContainerState, onValidation, onChangeHandler, onFocus } = props;
    const { email, isValid, focusedField } = signInContainerState;
    const errorMessageUi = (value, fieldName, errorMessage) => {
        if (value.length > 0 && focusedField === fieldName && !isValid)
            return <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 2, left: 10 }}>
                <Text style={{ alignSelf: 'center', color: activeTheme.validationRed }}>{errorMessage}</Text>
            </View>
    };
    return (
        <>
            <View style={styles.regWrap}>
                <Text style={styles.Inputcatpion(activeTheme), { ...commonStyles.fontStyles(16, activeTheme.default, 3), paddingVertical: 10 }}>
                    Code will be sent to your email
    </Text>
                <View style={{ paddingVertical: 10 }}>
                    <CustomInput
                        onValidation={onValidation}
                        name="email"
                        placeholder='Email'
                        style={email.length > 0 ? styles.regInputArea(activeTheme, isValid, focusedField, 'email') : { ...styles.defaultInputArea(activeTheme), borderColor: focusedField === 'email' ? activeTheme.default : activeTheme.borderColor }}
                        value={email}
                        onChangeHandler={value => onChangeHandler('email', value.trim())}
                        datavalue={email}
                        pattern={"email"}
                        parentState={signInContainerState}
                        keyboardType="email-address"
                        allFieldsValid={isValid}
                        onFocus={() => onFocus('email')}
                    // autoFocus={true}
                    />
                    {errorMessageUi(email, 'email', 'invalid email')}
                </View>
            </View>
            <SubmitBtn
                title="Submit"
                activeTheme={activeTheme}
                onPress={toggleModal}
                disabled={isValid ? false : true}
                style={styles.appButtonContainer(activeTheme, isValid)}
            />
        </>
    )
}
