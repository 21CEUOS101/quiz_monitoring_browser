const { logEvent } = require('./utils');
const axios = require('axios');

// Function to generate a random student ID
const generateRandomID = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Fetch and store user's IP information
const fetchAndStoreIP = () => {
    axios.get('https://ipinfo.io/json')
        .then(response => {
            const ipData = response.data;
            const user = {
                studentID: generateRandomID(),
                ip: ipData.ip,
                city: ipData.city,
                region: ipData.region,
                country: ipData.country,
                location: ipData.loc,
                postal: ipData.postal,
            };

            logEvent("Student joined in with " + JSON.stringify(user));

            return axios.post('http://localhost:8000/', user);
        })
        .then(() => {
            console.log("Data stored successfully");
        })
        .catch(error => {
            console.error('Error fetching and storing data:', error);
        });
};

module.exports = { fetchAndStoreIP };