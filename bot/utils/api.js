const axios = require('axios');

module.exports = {
    async getRandomCat() {
        const res = await axios.get('https://api.thecatapi.com/v1/images/search');
        return res.data[0].url;
    },
    async getRandomDog() {
        const res = await axios.get('https://dog.ceo/api/breeds/image/random');
        return res.message;
    },
    async getRandomPanda() {
        const res = await axios.get('https://some-random-api.com/animal/panda');
        return res.data;
    },
    async getRandomJoke() {
        const res = await axios.get('https://official-joke-api.appspot.com/random_joke');
        return res.data;
    },
    async getRandomQuote() {
        const res = await axios.get('https://zenquotes.io/api/random');
        return res.data[0];
    }
};
