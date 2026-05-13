module.exports.getWeather = async (city) => {
    try {
        const apiKey = process.env.WEATHER_API_KEY;
        const baseUrl = process.env.WEATHER_API_BASE_URL;
        const url = `${baseUrl}/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch weather data: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in getWeather service:', error);
        throw error;
    }
};