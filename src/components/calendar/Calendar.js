import React from 'react';
import { View, Modal, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Calendar, CalendarList } from 'react-native-calendars';


function CustomCalendar({ activeTheme, onSelectDateHandler, toggleModal, visible }) {
    let calenderTheme = {
        backgroundColor: '#ffffff',
        calendarBackground: '#ffffff',
        textSectionTitleColor: '#b6c1cd',
        textSectionTitleDisabledColor: '#d9e1e8',
        selectedDayBackgroundColor: activeTheme.default,
        selectedDayTextColor: '#ffffff',
        todayTextColor: activeTheme.default,
        dayTextColor: '#2d4150',
        textDisabledColor: '#d9e1e8',
        dotColor: '#00adf5',
        selectedDotColor: '#ffffff',
        arrowColor: activeTheme.default,
        disabledArrowColor: '#d9e1e8',
        monthTextColor: activeTheme.default,
        indicatorColor: activeTheme.default,
        textDayFontFamily: 'Proxima Nova Bold',
        textMonthFontFamily: 'Proxima Nova Bold',
        textDayHeaderFontFamily: 'Proxima Nova Bold',
        textDayFontWeight: '300',
        textMonthFontWeight: 'bold',
        textDayHeaderFontWeight: '300',
        textDayFontSize: 16,
        textMonthFontSize: 16,
        textDayHeaderFontSize: 16
    }
    return (
        <View style={{ flex: 1 }}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={toggleModal}
            >
                <View style={styles.fadeAreaView}>
                    <TouchableOpacity style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height / 2, }} onPress={toggleModal} />
                    <View style={styles.modalView}>
                        <Calendar
                            current={'1990-01-01'}
                            theme={calenderTheme}
                            showWeekNumbers
                            onDayPress={date => onSelectDateHandler(date)}
                            onMonthChange={month => console.log('Month :', month)}
                            onDayLongPress={day => console.log('Day long press :', day)}
                        // renderHeader={['1990-01-01', '1991-01-01'].map((d, i) => <View><Text>{d}</Text></View>)}
                        />
                    </View>

                </View>
            </Modal>
        </View>
    )

};

const styles = StyleSheet.create({
    fadeAreaView: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: "flex-end",
        alignItems: 'center',
    },
    modalView: {
        width: Dimensions.get('window').width,
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 35,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
});

export default CustomCalendar;



// Basic parameters
// <Calendar
//   // Initially visible month. Default = Date()
//   current={'2012-03-01'}
//   // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
//   minDate={'2012-05-10'}
//   // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
//   maxDate={'2012-05-30'}
//   // Handler which gets executed on day press. Default = undefined
//   onDayPress={(day) => {console.log('selected day', day)}}
//   // Handler which gets executed on day long press. Default = undefined
//   onDayLongPress={(day) => {console.log('selected day', day)}}
//   // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
//   monthFormat={'yyyy MM'}
//   // Handler which gets executed when visible month changes in calendar. Default = undefined
//   onMonthChange={(month) => {console.log('month changed', month)}}
//   // Hide month navigation arrows. Default = false
//   hideArrows={true}
//   // Replace default arrows with custom ones (direction can be 'left' or 'right')
//   renderArrow={(direction) => (<Arrow/>)}
//   // Do not show days of other months in month page. Default = false
//   hideExtraDays={true}
//   // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
//   // day from another month that is visible in calendar page. Default = false
//   disableMonthChange={true}
//   // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
//   firstDay={1}
//   // Hide day names. Default = false
//   hideDayNames={true}
//   // Show week numbers to the left. Default = false
//   showWeekNumbers={true}
//   // Handler which gets executed when press arrow icon left. It receive a callback can go back month
//   onPressArrowLeft={subtractMonth => subtractMonth()}
//   // Handler which gets executed when press arrow icon right. It receive a callback can go next month
//   onPressArrowRight={addMonth => addMonth()}
//   // Disable left arrow. Default = false
//   disableArrowLeft={true}
//   // Disable right arrow. Default = false
//   disableArrowRight={true}
//   // Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
//   disableAllTouchEventsForDisabledDays={true}
//   /** Replace default month and year title with custom one. the function receive a date as parameter. */
//   renderHeader={(date) => {/*Return JSX*/}}
// />