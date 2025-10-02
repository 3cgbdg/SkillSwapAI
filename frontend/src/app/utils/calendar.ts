export const getDates = () => {
    let result = []
    const currentDay = new Date().getDay();
    const weekDiff = currentDay == 0 ? -6 : 1 - currentDay;
    const monday = new Date(currentDay);
    monday.setDate(new Date().getDate() + weekDiff);
    const weekDays = ['Mon', "Tue", "Wed", "Thu", "Fri", "Sat", 'Sun'];
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(date.getDate() + i);
        result.push({
            day: date.getDate(),
            weekDay: weekDays[i]
        })
    }
    return result;
}

