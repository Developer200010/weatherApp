const API_KEY = "b5610219b4adb8c54d0892c5557c0e9e";

async function getWeather(city){
    try {
const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

if(!res.ok) throw new Error("City not found");
const data = await res.json();
console.log(res)

} catch (error) {
        alert(error.message)
    }
}