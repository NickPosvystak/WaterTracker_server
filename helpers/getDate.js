const getDate = (date) => {
  const inputDate = new Date(date);

  const day = inputDate.getUTCDate();
  const month = inputDate.getMonth();
  const year = inputDate.getFullYear();

  return { day, month: month + 1, year };
};
module.exports = getDate;
