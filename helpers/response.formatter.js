// const { response } = require("express");

module.exports = {
    // response: nama key object yg akan di panggil pas export /required di file lain
    response : (status, message, data) => {
        if (data) {
            //
            return {
                status,
                message: message,
                data: data,
            }
        } else {
            //kalau response gaada data (relasi error ) hasil di postmannya jang kirim key data di jsonnya 
            return {
                status: status,
                message: message
            }
        }
    }

}
