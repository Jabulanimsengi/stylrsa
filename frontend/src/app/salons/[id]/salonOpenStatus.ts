export function getSalonOpenStatus(
  hoursRecord: Record<string, string> | null,
  todayLabel: string,
): { isOpen: boolean; statusText: string } {
  if (!hoursRecord) {
    return { isOpen: false, statusText: 'Hours not available' };
  }

  const todayHours = hoursRecord[todayLabel];
  if (!todayHours || todayHours.toLowerCase() === 'closed') {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const todayIndex = days.indexOf(todayLabel);

    for (let i = 1; i <= 7; i += 1) {
      const nextDay = days[(todayIndex + i) % 7];
      const nextHours = hoursRecord[nextDay];

      if (nextHours && nextHours.toLowerCase() !== 'closed') {
        return {
          isOpen: false,
          statusText: `Opens ${nextDay} at ${nextHours.split('-')[0]?.trim() || '09:00'}`,
        };
      }
    }

    return { isOpen: false, statusText: 'Closed' };
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openTime, closeTime] = todayHours.split('-').map((value) => value.trim());

  if (openTime && closeTime) {
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    const openMinutes = (openHour || 0) * 60 + (openMinute || 0);
    const closeMinutes = (closeHour || 0) * 60 + (closeMinute || 0);

    if (currentTime >= openMinutes && currentTime < closeMinutes) {
      return { isOpen: true, statusText: `Open until ${closeTime}` };
    }

    if (currentTime < openMinutes) {
      return { isOpen: false, statusText: `Opens at ${openTime}` };
    }

    return { isOpen: false, statusText: 'Closed - Opens tomorrow' };
  }

  return { isOpen: false, statusText: todayHours };
}
