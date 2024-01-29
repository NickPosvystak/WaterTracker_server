const totalToday = async (dailyList) => {
    const total = await dailyList.reduce((accumulator, { amount }) => (accumulator += amount), 0);

    return total;

}

module.exports = totalToday;