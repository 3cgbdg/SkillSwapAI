export const getDates = (): { day: number; weekDay: string }[] => {
  const result = [];
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < lastDay.getDate(); i++) {
    const date = new Date(firstDay);
    date.setDate(date.getDate() + i);
    result.push({
      day: date.getDate(),
      weekDay: weekDays[date.getDay()],
    });
  }
  return result;
};

export const formatDate = (d: Date) => d.toISOString().split("T")[0];
