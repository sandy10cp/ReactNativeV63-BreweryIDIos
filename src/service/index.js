import { url_buyer, url_login, url_regis, url_verify, url_upload, url_forgot, url_forgot_verify } from '../Url';

const FetchData = (url, data) => {
    const promise = new Promise((result, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((resp) => resp.json())
            .then((data) => {
                result(data);
            })
            .catch((error) => {
                reject(error)
            });
    })

    return promise;
}


// Fetch untuk Login ke app
const FetchDataLogin = (url, data) => {
    const promise = new Promise((result, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((resp) => resp.json())
            .then((data) => {
                result(data);
            })
            .catch((error) => {
                reject(error)
            });
    })

    return promise;
}


// Fetch untuk registrasi
const FetchDataRegis = (url, data) => {
    const promise = new Promise((result, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((resp) => resp.json())
            .then((data) => {
                result(data);
            })
            .catch((error) => {
                reject(error)
            });
    })

    return promise;
}

// Fetch untuk verify email
const FetchDataVerify = (url, data) => {
    const promise = new Promise((result, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((resp) => resp.json())
            .then((data) => {
                result(data);
            })
            .catch((error) => {
                reject(error)
            });
    })

    return promise;
}

// Fetch untk upload image tanpa JSON.stringify
const Upload = (url, data) => {
    const promise = new Promise((result, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': "text/plain",
                'Content-Type': 'multipart/form-data',
                'daus1': '100'
            },
            body: data
        })
            .then((response) => response.json())
            .then((hasil) => {
                result(hasil);
            })
            .catch((error) => {
                reject(error)
            });
    })

    return promise;
}


// Fetch untuk forgot password
const Forgot = (url, data) => {
    const promise = new Promise((result, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((resp) => resp.json())
            .then((data) => {
                result(data);
            })
            .catch((error) => {
                reject(error)
            });
    })

    return promise;
}

// Fetch untuk verify email forgot
const VerifyForgotEmail = (url, data) => {
    const promise = new Promise((result, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((resp) => resp.json())
            .then((data) => {
                result(data);
            })
            .catch((error) => {
                reject(error)
            });
    })

    return promise;
}


const Fetch = (data) => FetchData(url_buyer, data);
const FetchLogin = (data) => FetchDataLogin(url_login, data);
const FetchRegis = (data) => FetchDataRegis(url_regis, data);
const FetchVerify = (data) => FetchDataVerify(url_verify, data);
const UploadImage = (data) => Upload(url_upload, data);
const FetchForgot = (data) => Forgot(url_forgot, data);
const FetchForgotVerify = (data) => VerifyForgotEmail(url_forgot_verify, data);

const API = {
    Fetch,
    FetchLogin,
    FetchRegis,
    FetchVerify,
    UploadImage,
    FetchForgot,
    FetchForgotVerify
}

export default API
