const normalizeDate = () => {
    const date = new Date();
    console.log(date);
    date.setHours(0, 0, 0, 0);
    console.log(date);
    return date;
};

normalizeDate();

