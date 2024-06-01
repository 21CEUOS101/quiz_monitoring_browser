const { logEvent } = require('./utils');
const axios = require('axios');

// Function to generate a random student ID
const generateRandomID = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Function to check for potential VPN or proxy use
const detectVPNOrProxy = (ipData , studentId) => {
    return axios.get(`https://ipapi.co/${ipData.ip}/vpn/`)
        .then(response => {
            if (response.data.vpn) {
                logEvent("VPN/Proxy detected" + JSON.stringify(ipData) + "Of Student"+ studentId);
                throw new Error("VPN/Proxy detected");
            }
        });
};

// Fetch and store user's IP information with additional network checks
const fetchAndStoreIP = () => {
    let userData = {};

    axios.get('https://ipinfo.io/json')
        .then(response => {
            const ipData = response.data;
            userData = {
                studentID: generateRandomID(),
                ip: ipData.ip,
                city: ipData.city,
                region: ipData.region,
                country: ipData.country,
                location: ipData.loc,
                postal: ipData.postal,
            };

            // Check for VPN or proxy
            return detectVPNOrProxy(ipData , userData?.studentID);
        })
        .then(() => {
            logEvent("Student joined in with " + JSON.stringify(userData));

            // Store data only if no VPN/Proxy detected
            return axios.post('http://localhost:8000/', userData);
        })
        .then(() => {
            console.log("Data stored successfully");
        })
        .catch(error => {
            logEvent('Error in network integrity check or data storage:', error);
            console.error('Error fetching and storing data:', error);
        });
};

module.exports = { fetchAndStoreIP };
