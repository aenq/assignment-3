const axios = require('axios')


axios({
    method: 'get',
    url: 'http://localhost:3000/photos'
})
    .then(({status, data}) => {
        console.log(status, data)
    })
    .catch((error) => {
        console.log(error)
    })