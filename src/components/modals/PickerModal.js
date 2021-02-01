import React, { useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import commonIcons from '../../assets/svgIcons/common/common';
import { Calendar } from 'react-native-calendars';
import { closeModalAction } from '../../redux/actions/modal';
import commonStyles from '../../styles/styles';

export default function PickerModal({ title, pickerList, activeTheme, dispatch }) {
    const { width } = Dimensions.get('window');
    let initState = {
        dropDownOpen: false,
        calanderOpened: false,
        startDate: "",
        endDate: "",
        selectedCategory: "",
    }
    const [state, setState] = useState(initState);
    const { dropDownOpen, calanderOpened, startDate, endDate, selectedCategory } = state;
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
    const toggleDropDownHandler = () => {
        setState({ ...state, dropDownOpen: !dropDownOpen, calanderOpened: false })
    };
    const openCalenderHandler = key => {
        setState({ ...state, [key]: true, calanderOpened: true })
    };
    const onSelectDateHandler = date => {
        setState(prevState => {
            if (state.startDateClicked) {
                return {
                    ...prevState,
                    startDate: date.dateString,
                    startDateClicked: false,
                    calanderOpened: false
                }
            } else if (state.endDateClicked) {
                return {
                    ...prevState,
                    endDate: date.dateString,
                    calanderOpened: false,
                    endDateClicked: false
                }
            } else {
                return {
                    ...prevState
                }
            }
        })
    };
    const selectCategoryHandler = categoryName => {
        setState({ ...state, selectedCategory: categoryName, dropDownOpen: false })
    };
    const onApplyClickHandler = () => {
        dispatch(closeModalAction());
    }
    const clearStateHandler = () => setState(initState);
    // console.log('state', state)
    return (
        <View style={pickerModalStyles.mainContainer(activeTheme, width)}>
            <Text style={pickerModalStyles.title(activeTheme)}>{title}</Text>
            <View style={pickerModalStyles.dropDownContainer(activeTheme)}>
                <TouchableOpacity style={{ flex: 2 }} onPress={toggleDropDownHandler}>
                    <Text style={{ left: 10, ...commonStyles.fontStyles(14, activeTheme.black, 3) }}>{selectedCategory ? selectedCategory : 'Select Category'}</Text>
                </TouchableOpacity>
                <View style={pickerModalStyles.dropIconView(activeTheme)}>
                    <TouchableOpacity>
                        <SvgXml xml={commonIcons.calenderIcon(activeTheme, "#fff")} height={25} width={25} />
                    </TouchableOpacity>
                </View>

            </View>
            {
                dropDownOpen &&
                <View style={pickerModalStyles.dropdownListContainer(activeTheme)}>
                    {
                        pickerList.map((listItem, i) => (
                            <TouchableOpacity key={i} onPress={() => selectCategoryHandler(listItem)}>
                                <View style={pickerModalStyles.listView(activeTheme)}>
                                    <View style={pickerModalStyles.listLeftTextView(activeTheme)}>
                                        <Text>{listItem}</Text>
                                    </View>
                                    {
                                        i < 3 &&
                                        <View style={{ width: '100%', borderBottomWidth: 0.2 }} />
                                    }
                                </View>
                            </TouchableOpacity>
                        ))
                    }
                </View>
            }
            {
                !dropDownOpen &&
                <View style={pickerModalStyles.dateContainer(activeTheme)}>
                    <View style={{ flex: 1, left: 10 }}>
                        <TouchableOpacity onPress={() => openCalenderHandler('startDateClicked')}>
                            <Text style={{ ...commonStyles.fontStyles(14, activeTheme.grey, 3) }}>Start</Text>
                            <Text style={{ ...commonStyles.fontStyles(14, activeTheme.black, 4), top: 3 }}>{startDate}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, }}>
                        <TouchableOpacity onPress={() => openCalenderHandler('endDateClicked')} disabled={state.startDateClicked !== undefined && state.startDateClicked ? state.startDateClicked : false}>
                            <Text style={{ alignSelf: 'flex-start', ...commonStyles.fontStyles(14, activeTheme.grey, 3) }}>End</Text>
                            <Text style={{ ...commonStyles.fontStyles(14, activeTheme.black, 4), top: 3 }}>{endDate}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
            <View style={{ flex: 2, top: 50 }}>
                {
                    calanderOpened &&
                    <Calendar
                        theme={calenderTheme}
                        onDayPress={date => onSelectDateHandler(date)}
                        onMonthChange={month => console.log('Month :', month)}
                        onDayLongPress={day => console.log('Day long press :', day)}

                    />

                }
            </View>
            <View style={pickerModalStyles.footerContainer(activeTheme)}>
                {['Clear', 'Today', 'Apply'].map((btnTitle, i) => (
                    i === 1 && !calanderOpened ? null :
                        <TouchableOpacity onPress={i === 0 ? clearStateHandler : i === 1 ? () => openCalenderHandler('todayBtnClicke') : onApplyClickHandler} key={i} style={pickerModalStyles.footerBtn(activeTheme, i)}>
                            <Text style={{ color: i > 0 ? activeTheme.white : activeTheme.black }}>{btnTitle}</Text>
                        </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const pickerModalStyles = StyleSheet.create({
    "mainContainer": (activeTheme, winWidth) => ({
        flex: 1, width: winWidth - 80, justifyContent: 'space-evenly'
    }),
    "title": (activeTheme) => ({
        ...commonStyles.fontStyles(15, activeTheme.black, 1)
    }),
    "dropDownContainer": (activeTheme) => ({
        height: 50, borderRadius: 5, borderWidth: 0.2, top: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    }),
    "dropIconView": (activeTheme) => ({
        height: 40, backgroundColor: activeTheme.default, borderRadius: 5, borderWidth: 0.2, width: 40, right: 5, justifyContent: 'center', alignItems: 'center'
    }),
    "dropdownListContainer": (activeTheme) => ({
        flex: 1.5, elevation: 1.5, top: 10, borderBottomRightRadius: 5, borderBottomLeftRadius: 5
    }),
    "listView": (activeTheme) => ({
        alignItems: 'flex-start', justifyContent: 'center',
    }),
    "listLeftTextView": (activeTheme) => ({
        height: 50, justifyContent: 'center', flexDirection: 'column', alignItems: 'center', left: 10
    }),
    "dateContainer": (activeTheme) => ({
        top: 15, flex: 0.3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1, borderRadius: 5, shadowOpacity: 100, shadowColor: '#000', shadowOffset: { width: 1, height: 1 }
    }),
    "footerContainer": (activeTheme) => ({
        flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'flex-end'
    }),
    "footerBtn": (activeTheme, i) => ({
        height: 40, width: 70, top: 20, backgroundColor: i > 0 ? activeTheme.default : activeTheme.white, margin: 5, justifyContent: 'center', alignItems: 'center', elevation: 1.5, borderRadius: 5
    }),



})
