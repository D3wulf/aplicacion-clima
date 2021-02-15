require('dotenv').config()

require('colors');
// aqui cogeremos las cosas del helper inquire
//cogemos primero el leerInput pues es lo que se creo para leer lo que escribe el usuario
const { leerInput, inMenu, pausa, listarLugares } = require('./helpers/inquirer');
//importamos lo que ira en la base de datos
const Busquedas = require('./models/busquedas');
//uso de la variable de entorno
//tenemos el argv y el .env. Son globales

//renombramos el archivo txt a un archivo env para que process.env lo meta como 
//variable de entorno y poder acceder a el de forma comoda y segura
console.log(process.env.MAPBOX_KEY)

//empezamos con el main

const main = async() => {

    //instanciamos busquedas
    const busquedas = new Busquedas();

    let opt = '';


    do {
        // Imprimir el menú y que espere respuesta
        opt = await inMenu();

        //para comprobar fucionamiento se puede poner console.log({opt})

        switch (opt) {
            case '1':
                // crear opcion
                const terminodeBusq = await leerInput('Ciudad:'.yellow);
                //lo que metamos en el input ira a la funcion ciudad del modelo
                //Esto sería el bloque de buscar lugares
                const lugares = await busquedas.ciudad(terminodeBusq);
                //mete toda la info en un array y reduce a lo que queremos el mapeo
                //aqui selecciona el lugar en un menu
                const id = await listarLugares(lugares);
                if (id === '0') continue;
                const lugarSel = lugares.find(l => l.id === id);

                // Guardar en DB
                busquedas.agregarHistorial(lugarSel.nombre);

                // Clima desde aqui enviamos los datos que requiere la funcion
                const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);

                console.log({ id });
                // Mostrar resultados
                console.clear();
                console.log('\nInformación de la ciudad\n'.yellow);
                console.log('Ciudad:', lugarSel.nombre.yellow);
                console.log('Lat:', lugarSel.lat);
                console.log('Lng:', lugarSel.lng);
                console.log('Temperatura:', clima.temp);
                console.log('Mínima:', clima.min);
                console.log('Máxima:', clima.max);
                console.log('Como está el clima:', clima.desc.yellow);
                break;

            case '2':
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    //los i + idx son indices, motivos esteticos
                    const idx = `${ i + 1 }.`.yellow;
                    console.log(`${ idx } ${ lugar } `);
                })
                break;

        }

        if (opt !== 0) await pausa();

    } while (opt !== '0');


    // pausa();









}

main();