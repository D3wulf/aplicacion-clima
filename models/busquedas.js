const fs = require('fs');

//el modelo o bbdd
//axios es para buscar https , lo metemos en el modelo que se encargara de hacer las 
//busquedas
const axios = require('axios')

class Busquedas {

    historial = [];
    //el path al archivo que se salvara

    dbPath = './db/database.json';

    constructor() {


            //leer db si existe
            this.leerDB();
        }
        //para poner cada palabra en mayusculas.
    get historialCapitalizado() {
        return this.historial.map(lugar => {

            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ')

        })
    }

    //esto perfectamente podria ir dentro de params, bajo la base url
    get paramsMapbox() {
            return {
                'access_token': process.env.MAPBOX_KEY,
                'limit': 5,
                'language': 'es'
            }
        }
        //para que lo que nos retorne este en celsius y en españolo
    get paramsWeather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }

    // esto seria como un get gatos de url
    async ciudad(lugar = '') {

            try {

                //peticion http se coge toda la direccion y se va troceando
                const dato = axios.create({
                    baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                    params: this.paramsMapbox

                });

                const resp = await dato.get();
                //dentro de lo que va a responder esta la data y dentro de la data las features
                //tenemos que acceder a objetos de objetos mediante el .
                //console.log(resp.data.features);
                //sabiendo que hay resultados, vamos a recorrerlos con un map
                return resp.data.features.map(lugar => ({
                    id: lugar.id,
                    nombre: lugar.place_name,
                    lng: lugar.center[0],
                    lat: lugar.center[1],

                }));

                //console.log(' ciudad ', lugar);
                //Usamos axios para coger datos de api
                //const resp = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/MARBELLA.json?access_token=pk.eyJ1IjoiZDN3dWxmIiwiYSI6ImNrbDUxbnp5eTBqc2wyb24xdjdxdDRhd3YifQ.v_aqKys3xYb8RUReakexmA&limit=5&language=es');
                //dentro de la respuesta hay varias propiedades, solo queremos ver lo que pone en la data asi que la elegimos
                //console.log(resp.data);


            } catch (error) {

                return [];

            }

        }
        //Aqui va a usar la lat y la lon de la ciudad como metodo de busqueda

    async climaLugar(lat, lon) {

        try {
            //creamos la instance
            const instance = axios.create({
                    baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                    params: {...this.paramsWeather, lat, lon }
                })
                //creamos la respuesta  con lo que cojamos de instance
            const resp = await instance.get();
            //destructuramos el objeto de respuesta en lo que queremos mostrar
            const { weather, main } = resp.data;
            //devolvemos... weather, main... son parte de la api, nosotros
            //solo cogemos los datos que queremos

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log(error);
        }

    }
    agregarHistorial(lugar = '') {

        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        }
        this.historial = this.historial.splice(0, 5);

        this.historial.unshift(lugar.toLocaleLowerCase());

        // Grabar en DB
        this.guardarDB();
    }

    guardarDB() {

        const payload = {
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));

    }

    leerDB() {

        if (!fs.existsSync(this.dbPath)) return;

        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
        const data = JSON.parse(info);

        this.historial = data.historial;


    }

}



module.exports = Busquedas;