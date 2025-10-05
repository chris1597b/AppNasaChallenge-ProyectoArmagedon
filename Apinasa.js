console.log("cargando el apinasa.js");

let simulator;

const URL = "https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=ver9CqsLZRoBjd32Kep7nhrgdVowfKBZG2KZzKMB";

// Función para actualizar el simulador con los datos del asteroide
function updateSimulator(asteroid) {
    if (!simulator) return;

    const orbitalData = asteroid.orbital_data;

    // Actualizar parámetros orbitales en el simulador
    simulator.a = parseFloat(orbitalData.semi_major_axis);
    simulator.e = parseFloat(orbitalData.eccentricity);
    simulator.inclination = THREE.MathUtils.degToRad(parseFloat(orbitalData.inclination));
    simulator.omega = THREE.MathUtils.degToRad(parseFloat(orbitalData.ascending_node_longitude));
    simulator.raan = THREE.MathUtils.degToRad(parseFloat(orbitalData.ascending_node_longitude));
    simulator.M0 = THREE.MathUtils.degToRad(parseFloat(orbitalData.mean_anomaly));
    simulator.epoch = new Date(orbitalData.epoch_osculation).getTime() / 1000;
    simulator.mu = 1.32712440018e11; // Constante gravitacional del Sol en km^3/s^2

    // Actualizar parámetros adicionales
    const diameterRangeInput = document.getElementById('diameter');
    simulator.diameter = parseFloat(diameterRangeInput.value);
    const velocityRangeInput = document.getElementById('velocity');
    simulator.velocity = parseFloat(velocityRangeInput.value);
    const orbitalPeriodRangeInput = document.getElementById('orbital_period');
    simulator.orbitalPeriod = parseFloat(orbitalPeriodRangeInput.value);
    const semiMajorRangeInput = document.getElementById('semi_major');
    simulator.a = parseFloat(semiMajorRangeInput.value);
    const eccentricityRangeInput = document.getElementById('excentricidad');
    simulator.e = parseFloat(eccentricityRangeInput.value);
    const inclinationRangeInput = document.getElementById('inclinacion');
    simulator.inclination = THREE.MathUtils.degToRad(parseFloat(inclinationRangeInput.value));
    const ascNodeRangeInput = document.getElementById('ascending_node_longitude');
    simulator.omega = THREE.MathUtils.degToRad(parseFloat(ascNodeRangeInput.value));
    const raanRangeInput = document.getElementById('raan');
    simulator.raan = THREE.MathUtils.degToRad(parseFloat(raanRangeInput.value));
    const meanMotionRangeInput = document.getElementById('mean_motion');
    simulator.meanMotion = parseFloat(meanMotionRangeInput.value);
    const perihelionTimeRangeInput = document.getElementById('perihelion_time');
    simulator.perihelionTime = parseFloat(perihelionTimeRangeInput.value);
    
    // Recrear la órbita con los nuevos parámetros
    simulator.createOrbit();
    simulator.updateInfo();
}

// Inicializar el simulador cuando se cargue la página
window.addEventListener('load', () => {
    simulator = new OrbitSimulator();
}); // usa DEMO_KEY si tu API falla

fetch(URL)
    .then(response => response.json())
    .then(data => {
        console.log(data);

        const asteroids = data.near_earth_objects;
        console.log(asteroids);

        const select = document.getElementById('asteroid-select');

        // Limpiar opciones iniciales
        select.innerHTML = "";

        // Crear una opción por cada asteroide
        asteroids.forEach(asteroid => {
            const option = document.createElement('option');
            option.value = asteroid.id; // ID como valor y guardarlo en una variable
            option.textContent = `${asteroid.name}-${asteroid.id}`;
            select.appendChild(option);
            //guardar el id seleccionado en una variable
            let selectedAsteroidId = select.value;
            console.log(selectedAsteroidId);
        });

        // potencialmente peligroso

        //del id seleccionado sacar is_potentially_hazardous_asteroid y mostrarlo en el input id="is_potentially_hazardous_asteroid"
        const isHazardousInput = document.getElementById('is_potentially_hazardous_asteroid');
        isHazardousInput.value = asteroids.find(asteroid => asteroid.id === select.value).is_potentially_hazardous_asteroid ? "Si" : "No";
        //debe actualizarse al cambiar el select
        select.addEventListener('change', () => {
            isHazardousInput.value = asteroids.find(asteroid => asteroid.id === select.value).is_potentially_hazardous_asteroid ? "Si" : "No";
        });

        //Diametro maximo y minimo
        //selecionamos el id de ul
        const diameterInput = document.getElementById('asteroid-diameter');
        diameterInput.innerHTML = "";
        //del id seleccionado sar el diametro maximo y minimo
        const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
        const minDiameter = selectedAsteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(2);
        const maxDiameter = selectedAsteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(2);
        console.log(minDiameter);
        console.log(maxDiameter);
        //crear dos li con el diametro maximo y minimo
        const liMin = document.createElement('li');
        liMin.textContent = `Min: ${minDiameter} m`;
        diameterInput.appendChild(liMin);
        const liMax = document.createElement('li');
        liMax.textContent = `Max: ${maxDiameter} m`;
        diameterInput.appendChild(liMax);
        //debeeria actualizarse al cambiar el select
        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const minDiameter = selectedAsteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(2);
            const maxDiameter = selectedAsteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(2);
            console.log(minDiameter);
            console.log(maxDiameter);
            diameterInput.innerHTML = "";
            const liMin = document.createElement('li');
            liMin.textContent = `Min: ${minDiameter} m`;
            diameterInput.appendChild(liMin);
            const liMax = document.createElement('li');
            liMax.textContent = `Max: ${maxDiameter} m`;
            diameterInput.appendChild(liMax);
        });
        // de la etiqueta input range debemos de jugar con su diametro maximo y minimo
        /*
        <input type="range" id="diameter"  value="100">
                <span class="parameter-value">100</span>
        */
        const diameterRangeInput = document.getElementById('diameter');
        diameterRangeInput.min = minDiameter;
        diameterRangeInput.max = maxDiameter;
        diameterRangeInput.value = ((parseFloat(minDiameter) + parseFloat(maxDiameter)) / 2).toFixed(2);
        //en el span mostrar el valor del input range, <span class="parameter-value"><span>
        const diameterValueSpan = diameterRangeInput.nextElementSibling;
        diameterValueSpan.textContent = diameterRangeInput.value;

        //debe actualizarse al cambiar el select
        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const minDiameter = selectedAsteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(2);
            const maxDiameter = selectedAsteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(2);
            console.log(minDiameter);
            console.log(maxDiameter);
            diameterRangeInput.min = minDiameter;
            diameterRangeInput.max = maxDiameter;
            diameterRangeInput.value = ((parseFloat(minDiameter) + parseFloat(maxDiameter)) / 2).toFixed(2);
            diameterValueSpan.textContent = diameterRangeInput.value;
        });
        //debe actualizarse al cambiar el input range
        diameterRangeInput.addEventListener('input', () => {
            diameterValueSpan.textContent = diameterRangeInput.value;
        });



        //semi eje mayor
        const semiMajorInput = document.getElementById('asteroid-semi_major');
        semiMajorInput.innerHTML = "";
        const semiMajorValue = selectedAsteroid.orbital_data.semi_major_axis;
        console.log("Semieje mayor:", semiMajorValue);
        const liSemiMajor = document.createElement('li');
        liSemiMajor.textContent = `Value: ${parseFloat(semiMajorValue).toFixed(4)} AU`;
        semiMajorInput.appendChild(liSemiMajor);

        // Configurar el input range para el semieje mayor
        const semiMajorRangeInput = document.getElementById('semi_major');
        const maxSemiMajor = parseFloat(semiMajorValue) * 1.5; // 150% del valor actual como máximo
        const minSemiMajor = parseFloat(semiMajorValue) * 0.5; // 50% del valor actual como mínimo

        semiMajorRangeInput.min = minSemiMajor;
        semiMajorRangeInput.max = maxSemiMajor;
        semiMajorRangeInput.value = semiMajorValue;

        // Mostrar el valor en el span
        const semiMajorValueSpan = semiMajorRangeInput.nextElementSibling;
        semiMajorValueSpan.textContent = parseFloat(semiMajorValue).toFixed(4);

        // Actualizar al cambiar el select
        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const semiMajorValue = selectedAsteroid.orbital_data.semi_major_axis;

            // Actualizar la lista
            semiMajorInput.innerHTML = "";
            const liSemiMajor = document.createElement('li');
            liSemiMajor.textContent = `Value: ${parseFloat(semiMajorValue).toFixed(4)} AU`;
            semiMajorInput.appendChild(liSemiMajor);

            // Actualizar el input range
            const maxSemiMajor = parseFloat(semiMajorValue) * 1.5;
            const minSemiMajor = parseFloat(semiMajorValue) * 0.5;

            semiMajorRangeInput.min = minSemiMajor;
            semiMajorRangeInput.max = maxSemiMajor;
            semiMajorRangeInput.value = semiMajorValue;
            semiMajorValueSpan.textContent = parseFloat(semiMajorValue).toFixed(4);
        });

        // Actualizar cuando se mueva el input range
        semiMajorRangeInput.addEventListener('input', () => {
            semiMajorValueSpan.textContent = parseFloat(semiMajorRangeInput.value).toFixed(4);
        });

        //excentricidad
        const excentricidadInput = document.getElementById('asteroid-eccentricity');
        excentricidadInput.innerHTML = "";
        const excentricidad = selectedAsteroid.orbital_data.eccentricity;
        const liEccentricity = document.createElement('li');
        liEccentricity.textContent = `Value: ${parseFloat(excentricidad).toFixed(6)}`;
        excentricidadInput.appendChild(liEccentricity);

        const eccentricityRangeInput = document.getElementById('excentricidad');
        const maxEccentricity = Math.min(parseFloat(excentricidad) * 1.5, 1);
        const minEccentricity = Math.max(parseFloat(excentricidad) * 0.5, 0);

        eccentricityRangeInput.min = minEccentricity;
        eccentricityRangeInput.max = maxEccentricity;
        eccentricityRangeInput.value = excentricidad;

        const eccentricityValueSpan = eccentricityRangeInput.nextElementSibling;
        eccentricityValueSpan.textContent = parseFloat(excentricidad).toFixed(6);

        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const excentricidad = selectedAsteroid.orbital_data.eccentricity;

            excentricidadInput.innerHTML = "";
            const liEccentricity = document.createElement('li');
            liEccentricity.textContent = `Value: ${parseFloat(excentricidad).toFixed(6)}`;
            excentricidadInput.appendChild(liEccentricity);

            const maxEccentricity = Math.min(parseFloat(excentricidad) * 1.5, 1);
            const minEccentricity = Math.max(parseFloat(excentricidad) * 0.5, 0);

            eccentricityRangeInput.min = minEccentricity;
            eccentricityRangeInput.max = maxEccentricity;
            eccentricityRangeInput.value = excentricidad;
            eccentricityValueSpan.textContent = parseFloat(excentricidad).toFixed(6);
        });

        eccentricityRangeInput.addEventListener('input', () => {
            eccentricityValueSpan.textContent = parseFloat(eccentricityRangeInput.value).toFixed(6);
        });

        //inclinacion orbital
        const inclinacionInput = document.getElementById('asteroid-inclination');
        inclinacionInput.innerHTML = "";
        const inclinacion = selectedAsteroid.orbital_data.inclination;
        const liInclination = document.createElement('li');
        liInclination.textContent = `Value: ${parseFloat(inclinacion).toFixed(4)}°`;
        inclinacionInput.appendChild(liInclination);

        const inclinationRangeInput = document.getElementById('inclinacion');
        const maxInclination = Math.min(parseFloat(inclinacion) * 1.5, 180);
        const minInclination = Math.max(parseFloat(inclinacion) * 0.5, 0);

        inclinationRangeInput.min = minInclination;
        inclinationRangeInput.max = maxInclination;
        inclinationRangeInput.value = inclinacion;

        const inclinationValueSpan = inclinationRangeInput.nextElementSibling;
        inclinationValueSpan.textContent = parseFloat(inclinacion).toFixed(4) + '°';

        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const inclinacion = selectedAsteroid.orbital_data.inclination;

            inclinacionInput.innerHTML = "";
            const liInclination = document.createElement('li');
            liInclination.textContent = `Value: ${parseFloat(inclinacion).toFixed(4)}°`;
            inclinacionInput.appendChild(liInclination);

            const maxInclination = Math.min(parseFloat(inclinacion) * 1.5, 180);
            const minInclination = Math.max(parseFloat(inclinacion) * 0.5, 0);

            inclinationRangeInput.min = minInclination;
            inclinationRangeInput.max = maxInclination;
            inclinationRangeInput.value = inclinacion;
            inclinationValueSpan.textContent = parseFloat(inclinacion).toFixed(4) + '°';
        });

        inclinationRangeInput.addEventListener('input', () => {
            inclinationValueSpan.textContent = parseFloat(inclinationRangeInput.value).toFixed(4) + '°';
        });
        //longitude of ascending node
        const ascNodeInput = document.getElementById('asteroid-ascending-node');
        ascNodeInput.innerHTML = "";
        const ascNodeLongitude = selectedAsteroid.orbital_data.ascending_node_longitude;
        const liAscNode = document.createElement('li');
        liAscNode.textContent = `Value: ${parseFloat(ascNodeLongitude).toFixed(4)}°`;
        ascNodeInput.appendChild(liAscNode);

        const ascNodeRangeInput = document.getElementById('ascending_node_longitude');
        ascNodeRangeInput.min = 0;
        ascNodeRangeInput.max = 360;
        ascNodeRangeInput.value = ascNodeLongitude;

        const ascNodeValueSpan = ascNodeRangeInput.nextElementSibling;
        ascNodeValueSpan.textContent = parseFloat(ascNodeLongitude).toFixed(4) + '°';

        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const ascNodeLongitude = selectedAsteroid.orbital_data.ascending_node_longitude;

            ascNodeInput.innerHTML = "";
            const liAscNode = document.createElement('li');
            liAscNode.textContent = `Value: ${parseFloat(ascNodeLongitude).toFixed(4)}°`;
            ascNodeInput.appendChild(liAscNode);

            ascNodeRangeInput.value = ascNodeLongitude;
            ascNodeValueSpan.textContent = parseFloat(ascNodeLongitude).toFixed(4) + '°';
        });

        ascNodeRangeInput.addEventListener('input', () => {
            ascNodeValueSpan.textContent = parseFloat(ascNodeRangeInput.value).toFixed(4) + '°';
        });

        // RAAN (Right Ascension of the Ascending Node)
        const raanInput = document.getElementById('asteroid-raan');
        raanInput.innerHTML = "";
        const raan = selectedAsteroid.orbital_data.ascending_node_longitude; // RAAN es el mismo que ascending_node_longitude
        const liRaan = document.createElement('li');
        liRaan.textContent = `Value: ${parseFloat(raan).toFixed(4)}°`;
        raanInput.appendChild(liRaan);

        const raanRangeInput = document.getElementById('raan');
        raanRangeInput.min = 0;
        raanRangeInput.max = 360;
        raanRangeInput.value = raan;

        const raanValueSpan = raanRangeInput.nextElementSibling;
        raanValueSpan.textContent = parseFloat(raan).toFixed(4) + '°';

        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const raan = selectedAsteroid.orbital_data.ascending_node_longitude;

            raanInput.innerHTML = "";
            const liRaan = document.createElement('li');
            liRaan.textContent = `Value: ${parseFloat(raan).toFixed(4)}°`;
            raanInput.appendChild(liRaan);

            raanRangeInput.value = raan;
            raanValueSpan.textContent = parseFloat(raan).toFixed(4) + '°';
        });

        raanRangeInput.addEventListener('input', () => {
            raanValueSpan.textContent = parseFloat(raanRangeInput.value).toFixed(4) + '°';
        });


        //velocidad maxima

        //del id selecionado sacar su velocidad maxima en km/s y mostrarla en el ul id="asteroid-velocity"
        const velocityInput = document.getElementById('asteroid-velocity');
        velocityInput.innerHTML = "";
        const maxVelocity = selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second;
        console.log(maxVelocity);
        const liVelocity = document.createElement('li');
        liVelocity.textContent = `Max: ${parseFloat(maxVelocity).toFixed(2)} km/s`;
        velocityInput.appendChild(liVelocity);
        //debe actualizarse al cambiar el select
        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const maxVelocity = selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second;
            console.log(maxVelocity);
            velocityInput.innerHTML = "";
            const liVelocity = document.createElement('li');
            liVelocity.textContent = `Max: ${parseFloat(maxVelocity).toFixed(2)} km/s`;
            velocityInput.appendChild(liVelocity);
        });

        //de la etiqueta input range debemos de jugar con su velocidad maxima
        /*        <input type="range" id="velocity" min="1" max="50" >
                        <span class="parameter-value"></span>
        */
        const velocityRangeInput = document.getElementById('velocity');
        velocityRangeInput.min = 0;
        velocityRangeInput.max = parseFloat(maxVelocity).toFixed(2);
        velocityRangeInput.value = (parseFloat(maxVelocity).toFixed(2) / 2).toFixed(2);
        //en el span mostrar el valor del input range, <span class="parameter-value"></span>
        const velocityValueSpan = velocityRangeInput.nextElementSibling;
        velocityValueSpan.textContent = velocityRangeInput.value;

        //debe actualizarse al cambiar el select
        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const maxVelocity = selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second;
            console.log(maxVelocity);
            velocityRangeInput.min = 0;
            velocityRangeInput.max = parseFloat(maxVelocity).toFixed(2);
            velocityRangeInput.value = (parseFloat(maxVelocity).toFixed(2) / 2).toFixed(2);
            velocityValueSpan.textContent = velocityRangeInput.value;
        });
        // debe actualizarse al cambiar el input range
        velocityRangeInput.addEventListener('input', () => {
            velocityValueSpan.textContent = velocityRangeInput.value;
        });

        //Periodo orbital 

        // que esta en dias muestralo con id del asteroide

        const orbitalPeriodInput = document.getElementById('periodo-orbital');
        orbitalPeriodInput.innerHTML = "";
        const orbitalPeriod = selectedAsteroid.orbital_data.orbital_period;
        console.log(orbitalPeriod);
        const liOrbitalPeriod = document.createElement('li');
        liOrbitalPeriod.textContent = `Value: ${parseFloat(orbitalPeriod).toFixed(4)} days`;
        orbitalPeriodInput.appendChild(liOrbitalPeriod);
        //debe actualizarse al cambiar el select
        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const orbitalPeriod = selectedAsteroid.orbital_data.orbital_period;
            console.log(orbitalPeriod);
            orbitalPeriodInput.innerHTML = "";
            const liOrbitalPeriod = document.createElement('li');
            liOrbitalPeriod.textContent = `Value: ${parseFloat(orbitalPeriod).toFixed(4)} días`;
            orbitalPeriodInput.appendChild(liOrbitalPeriod);
        });

        //de la etiqueta input range debemos de jugar con su periodo orbital
        const orbitalPeriodRangeInput = document.getElementById('orbital_period');
        const maxOrbitalPeriod = parseFloat(orbitalPeriod) * 1.5;
        const minOrbitalPeriod = parseFloat(orbitalPeriod) * 0.5;
        orbitalPeriodRangeInput.min = minOrbitalPeriod;
        orbitalPeriodRangeInput.max = maxOrbitalPeriod;
        orbitalPeriodRangeInput.value = orbitalPeriod;
        //en el span mostrar el valor del input range, <span class="parameter-value"></span>
        const orbitalPeriodValueSpan = orbitalPeriodRangeInput.nextElementSibling;
        orbitalPeriodValueSpan.textContent = parseFloat(orbitalPeriod).toFixed(4);
        //debe actualizarse al cambiar el select
        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const orbitalPeriod = selectedAsteroid.orbital_data.orbital_period;
            console.log(orbitalPeriod);
            const maxOrbitalPeriod = parseFloat(orbitalPeriod) * 1.5;
            const minOrbitalPeriod = parseFloat(orbitalPeriod) * 0.5;
            orbitalPeriodRangeInput.min = minOrbitalPeriod;
            orbitalPeriodRangeInput.max = maxOrbitalPeriod;
            orbitalPeriodRangeInput.value = orbitalPeriod;
            orbitalPeriodValueSpan.textContent = parseFloat(orbitalPeriod).toFixed(4);
        });
        //debe actualizarse al cambiar el input range
        orbitalPeriodRangeInput.addEventListener('input', () => {
            orbitalPeriodValueSpan.textContent = parseFloat(orbitalPeriodRangeInput.value).toFixed(4);
        });


        // movimiento medio del asteroide
        /*
        <!--Movimiento medio-->
        <div class="parameter-group">
            <label for="mean_motion">Movimiento-medio</label>
            <ul id="Movimiento-medio"></ul>
            <input type="range" id="mean_motion" step="0.001">
            <span class="parameter-value"></span>
        </div>
        */
        const meanMotionInput = document.getElementById('Movimiento-medio');
        meanMotionInput.innerHTML = "";
        const meanMotion = selectedAsteroid.orbital_data.mean_motion;
        console.log(meanMotion);
        const liMeanMotion = document.createElement('li');
        liMeanMotion.textContent = `Value: ${parseFloat(meanMotion).toFixed(6)}°/día`;
        meanMotionInput.appendChild(liMeanMotion);
        //debe actualizarse al cambiar el select
        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const meanMotion = selectedAsteroid.orbital_data.mean_motion;
            console.log(meanMotion);
            meanMotionInput.innerHTML = "";
            const liMeanMotion = document.createElement('li');
            liMeanMotion.textContent = `Value: ${parseFloat(meanMotion).toFixed(6)}°/día`;
            meanMotionInput.appendChild(liMeanMotion);
        });
        //de la etiqueta input range debemos de jugar con su movimiento medio
        const meanMotionRangeInput = document.getElementById('mean_motion');
        const maxMeanMotion = parseFloat(meanMotion) * 1.5;
        const minMeanMotion = parseFloat(meanMotion) * 0.5;
        meanMotionRangeInput.min = minMeanMotion;
        meanMotionRangeInput.max = maxMeanMotion;
        meanMotionRangeInput.value = meanMotion;
        //en el span mostrar el valor del input range, <span class="parameter-value"></span>
        const meanMotionValueSpan = meanMotionRangeInput.nextElementSibling;
        meanMotionValueSpan.textContent = parseFloat(meanMotion).toFixed(6);
        //debe actualizarse al cambiar el select
        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const meanMotion = selectedAsteroid.orbital_data.mean_motion;
            console.log(meanMotion);
            const maxMeanMotion = parseFloat(meanMotion) * 1.5;
            const minMeanMotion = parseFloat(meanMotion) * 0.5;
            meanMotionRangeInput.min = minMeanMotion;
            meanMotionRangeInput.max = maxMeanMotion;
            meanMotionRangeInput.value = meanMotion;
            meanMotionValueSpan.textContent = parseFloat(meanMotion).toFixed(6);
        }
        );
        //debe actualizarse al cambiar el input range
        meanMotionRangeInput.addEventListener('input', () => {
            meanMotionValueSpan.textContent = parseFloat(meanMotionRangeInput.value).toFixed(6);
        });

        // tiempo de paso perihelio
        /*
         <!--Tiempo de paso por el pericentro-->
        <div class="parameter-group">
            <label for="perihelion_time">Tiempo de paso por el pericentro</label>
            <ul id="tiempo-perihelion"></ul>
            <input type="range" id="perihelion_time" step="0.001">
            <span class="parameter-value"></span>
        </div>
        */
        const perihelionTimeInput = document.getElementById('tiempo-perihelion');
        perihelionTimeInput.innerHTML = "";
        const perihelionTime = selectedAsteroid.orbital_data.perihelion_time;
        console.log(perihelionTime);
        const liPerihelionTime = document.createElement('li');
        liPerihelionTime.textContent = `Value: ${parseFloat(perihelionTime).toFixed(4)} días`;
        perihelionTimeInput.appendChild(liPerihelionTime);
        //debe actualizarse al cambiar el select
        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const perihelionTime = selectedAsteroid.orbital_data.perihelion_time;
            console.log(perihelionTime);
            perihelionTimeInput.innerHTML = "";
            const liPerihelionTime = document.createElement('li');
            liPerihelionTime.textContent = `Value: ${parseFloat(perihelionTime).toFixed(4)} días`;
            perihelionTimeInput.appendChild(liPerihelionTime);
        });
        //de la etiqueta input range debemos de jugar con su tiempo de paso por el pericentro
        const perihelionTimeRangeInput = document.getElementById('perihelion_time');
        const maxPerihelionTime = parseFloat(perihelionTime) * 1.5;
        const minPerihelionTime = parseFloat(perihelionTime) * 0.5;
        perihelionTimeRangeInput.min = minPerihelionTime;
        perihelionTimeRangeInput.max = maxPerihelionTime;
        perihelionTimeRangeInput.value = perihelionTime;
        //en el span mostrar el valor del input range, <span class="parameter-value"></span>
        const perihelionTimeValueSpan = perihelionTimeRangeInput.nextElementSibling;
        perihelionTimeValueSpan.textContent = parseFloat(perihelionTime).toFixed(4);
        //debe actualizarse al cambiar el select
        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            const perihelionTime = selectedAsteroid.orbital_data.perihelion_time;
            console.log(perihelionTime);
            const maxPerihelionTime = parseFloat(perihelionTime) * 1.5;
            const minPerihelionTime = parseFloat(perihelionTime) * 0.5;
            perihelionTimeRangeInput.min = minPerihelionTime;
            perihelionTimeRangeInput.max = maxPerihelionTime;
            perihelionTimeRangeInput.value = perihelionTime;
            perihelionTimeValueSpan.textContent = parseFloat(perihelionTime).toFixed(4);
        });
        //debe actualizarse al cambiar el input range
        perihelionTimeRangeInput.addEventListener('input', () => {
            perihelionTimeValueSpan.textContent = parseFloat(perihelionTimeRangeInput.value).toFixed(4);
        });
        // Actualizar el simulador con los datos del asteroide seleccionado
        updateSimulator(selectedAsteroid);
        select.addEventListener('change', () => {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            updateSimulator(selectedAsteroid);
        });

        
    
        //mostrar en consola el asteroide seleccionado
        console.log(selectedAsteroid);
    })
    .catch(error => console.error('Error fetching data:', error));
