const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const monthFullName = (d) => {
    const t = new Date(d);
    return t.getDate() + ' ' + monthNames[t.getMonth()] + ', ' + t.getFullYear();
}

const monthShortName = (d) => {
    const t = new Date(d);
    return t.getDate() + ' ' + monthShortNames[t.getMonth()] + ', ' + t.getFullYear();
}

const formatDate = {
    monthFullName,
    monthShortName
}

export default formatDate