console.log("cargando el apinasa.js");

const URL = "https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=ver9CqsLZRoBjd32Kep7nhrgdVowfKBZG2KZzKMB";

// Variable global para almacenar los datos de asteroides
let asteroidsData = [];

// Función para actualizar el estado global de la simulación
function updateSimulationState(asteroid) {
    if (typeof state !== 'undefined') {
        // Calcular diámetro promedio del asteroide seleccionado
        const minDiameter = asteroid.estimated_diameter.meters.estimated_diameter_min;
        const maxDiameter = asteroid.estimated_diameter.meters.estimated_diameter_max;
        const avgDiameter = (minDiameter + maxDiameter) / 2;
        
        // Obtener velocidad relativa del primer close approach
        const velocity = parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_second);
        
        // Actualizar estado global
        state.diameter = avgDiameter;
        state.velocity = velocity;
        state.selectedAsteroidId = asteroid.id;
        
        console.log('Estado actualizado:', {
            diameter: state.diameter,
            velocity: state.velocity,
            asteroidId: state.selectedAsteroidId
        });
    }
}

fetch(URL)
    .then(response => response.json())
    .then(data => {
        console.log("Datos recibidos de NASA API:", data);

        const asteroids = data.near_earth_objects;
        asteroidsData = asteroids; // Guardar globalmente
        console.log(`${asteroids.length} asteroides cargados`);

        const select = document.getElementById('asteroid-select');

        // Limpiar opciones iniciales
        select.innerHTML = "";

        // Crear una opción por cada asteroide
        asteroids.forEach(asteroid => {
            const option = document.createElement('option');
            option.value = asteroid.id;
            option.textContent = `${asteroid.name} (${asteroid.id})`;
            select.appendChild(option);
        });

        // Función para actualizar todos los campos cuando cambia el asteroide seleccionado
        function updateAllFields() {
            const selectedAsteroid = asteroids.find(asteroid => asteroid.id === select.value);
            if (!selectedAsteroid) return;

            console.log("Asteroide seleccionado:", selectedAsteroid.name);

            // Actualizar estado global de simulación
            updateSimulationState(selectedAsteroid);

            // 1. POTENCIALMENTE PELIGROSO
            const isHazardousInput = document.getElementById('is_potentially_hazardous_asteroid');
            if (isHazardousInput) {
                isHazardousInput.value = selectedAsteroid.is_potentially_hazardous_asteroid ? "Sí" : "No";
            }

            // 2. DIÁMETRO
            const diameterInput = document.getElementById('asteroid-diameter');
            const minDiameter = selectedAsteroid.estimated_diameter.meters.estimated_diameter_min;
            const maxDiameter = selectedAsteroid.estimated_diameter.meters.estimated_diameter_max;
            const avgDiameter = (minDiameter + maxDiameter) / 2;

            if (diameterInput) {
                diameterInput.innerHTML = `
                    <li>Min: ${minDiameter.toFixed(2)} m</li>
                    <li>Max: ${maxDiameter.toFixed(2)} m</li>
                    <li>Promedio: ${avgDiameter.toFixed(2)} m</li>
                `;
            }

            const diameterRangeInput = document.getElementById('diameter');
            if (diameterRangeInput) {
                diameterRangeInput.min = minDiameter.toFixed(2);
                diameterRangeInput.max = maxDiameter.toFixed(2);
                diameterRangeInput.value = avgDiameter.toFixed(2);
                diameterRangeInput.step = ((maxDiameter - minDiameter) / 100).toFixed(2);
                
                const diameterValueSpan = diameterRangeInput.nextElementSibling;
                if (diameterValueSpan) {
                    diameterValueSpan.textContent = avgDiameter.toFixed(2) + ' m';
                }
            }

            // 3. VELOCIDAD RELATIVA
            const velocityInput = document.getElementById('asteroid-velocity');
            const velocityKmS = parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second);

            if (velocityInput) {
                velocityInput.innerHTML = `
                    <li>Velocidad: ${velocityKmS.toFixed(3)} km/s</li>
                    <li>Velocidad: ${(velocityKmS * 3600).toFixed(0)} km/h</li>
                `;
            }

            const velocityRangeInput = document.getElementById('velocity');
            if (velocityRangeInput) {
                velocityRangeInput.min = (velocityKmS * 0.5).toFixed(3);
                velocityRangeInput.max = (velocityKmS * 1.5).toFixed(3);
                velocityRangeInput.value = velocityKmS.toFixed(3);
                velocityRangeInput.step = (velocityKmS * 0.01).toFixed(3);
                
                const velocityValueSpan = velocityRangeInput.nextElementSibling;
                if (velocityValueSpan) {
                    velocityValueSpan.textContent = velocityKmS.toFixed(3) + ' km/s';
                }
            }

            // 4. SEMI-EJE MAYOR
            const semiMajorInput = document.getElementById('asteroid-semi_major');
            const semiMajorValue = parseFloat(selectedAsteroid.orbital_data.semi_major_axis);

            if (semiMajorInput) {
                semiMajorInput.innerHTML = `<li>Valor: ${semiMajorValue.toFixed(4)} AU</li>`;
            }

            const semiMajorRangeInput = document.getElementById('semi_major');
            if (semiMajorRangeInput) {
                semiMajorRangeInput.min = (semiMajorValue * 0.5).toFixed(4);
                semiMajorRangeInput.max = (semiMajorValue * 1.5).toFixed(4);
                semiMajorRangeInput.value = semiMajorValue.toFixed(4);
                semiMajorRangeInput.step = (semiMajorValue * 0.001).toFixed(6);
                
                const semiMajorValueSpan = semiMajorRangeInput.nextElementSibling;
                if (semiMajorValueSpan) {
                    semiMajorValueSpan.textContent = semiMajorValue.toFixed(4) + ' AU';
                }
            }

            // 5. EXCENTRICIDAD
            const excentricidadInput = document.getElementById('asteroid-eccentricity');
            const excentricidad = parseFloat(selectedAsteroid.orbital_data.eccentricity);

            if (excentricidadInput) {
                excentricidadInput.innerHTML = `<li>Valor: ${excentricidad.toFixed(6)}</li>`;
            }

            const eccentricityRangeInput = document.getElementById('excentricidad');
            if (eccentricityRangeInput) {
                eccentricityRangeInput.min = Math.max(0, excentricidad * 0.5).toFixed(6);
                eccentricityRangeInput.max = Math.min(0.99, excentricidad * 1.5).toFixed(6);
                eccentricityRangeInput.value = excentricidad.toFixed(6);
                eccentricityRangeInput.step = "0.000001";
                
                const eccentricityValueSpan = eccentricityRangeInput.nextElementSibling;
                if (eccentricityValueSpan) {
                    eccentricityValueSpan.textContent = excentricidad.toFixed(6);
                }
            }

            // 6. INCLINACIÓN ORBITAL
            const inclinacionInput = document.getElementById('asteroid-inclination');
            const inclinacion = parseFloat(selectedAsteroid.orbital_data.inclination);

            if (inclinacionInput) {
                inclinacionInput.innerHTML = `<li>Valor: ${inclinacion.toFixed(4)}°</li>`;
            }

            const inclinationRangeInput = document.getElementById('inclinacion');
            if (inclinationRangeInput) {
                inclinationRangeInput.min = Math.max(0, inclinacion * 0.5).toFixed(4);
                inclinationRangeInput.max = Math.min(180, inclinacion * 1.5).toFixed(4);
                inclinationRangeInput.value = inclinacion.toFixed(4);
                inclinationRangeInput.step = "0.01";
                
                const inclinationValueSpan = inclinationRangeInput.nextElementSibling;
                if (inclinationValueSpan) {
                    inclinationValueSpan.textContent = inclinacion.toFixed(4) + '°';
                }
            }

            // 7. LONGITUD DEL NODO ASCENDENTE
            const ascNodeInput = document.getElementById('asteroid-ascending-node');
            const ascNodeLongitude = parseFloat(selectedAsteroid.orbital_data.ascending_node_longitude);

            if (ascNodeInput) {
                ascNodeInput.innerHTML = `<li>Valor: ${ascNodeLongitude.toFixed(4)}°</li>`;
            }

            const ascNodeRangeInput = document.getElementById('ascending_node_longitude');
            if (ascNodeRangeInput) {
                ascNodeRangeInput.min = "0";
                ascNodeRangeInput.max = "360";
                ascNodeRangeInput.value = ascNodeLongitude.toFixed(4);
                ascNodeRangeInput.step = "0.01";
                
                const ascNodeValueSpan = ascNodeRangeInput.nextElementSibling;
                if (ascNodeValueSpan) {
                    ascNodeValueSpan.textContent = ascNodeLongitude.toFixed(4) + '°';
                }
            }

            // 8. RAAN
            const raanInput = document.getElementById('asteroid-raan');
            if (raanInput) {
                raanInput.innerHTML = `<li>Valor: ${ascNodeLongitude.toFixed(4)}°</li>`;
            }

            const raanRangeInput = document.getElementById('raan');
            if (raanRangeInput) {
                raanRangeInput.min = "0";
                raanRangeInput.max = "360";
                raanRangeInput.value = ascNodeLongitude.toFixed(4);
                raanRangeInput.step = "0.01";
                
                const raanValueSpan = raanRangeInput.nextElementSibling;
                if (raanValueSpan) {
                    raanValueSpan.textContent = ascNodeLongitude.toFixed(4) + '°';
                }
            }

            // 9. PERIODO ORBITAL
            const orbitalPeriodInput = document.getElementById('periodo-orbital');
            const orbitalPeriod = parseFloat(selectedAsteroid.orbital_data.orbital_period);

            if (orbitalPeriodInput) {
                orbitalPeriodInput.innerHTML = `<li>Valor: ${orbitalPeriod.toFixed(2)} días</li>`;
            }

            const orbitalPeriodRangeInput = document.getElementById('orbital_period');
            if (orbitalPeriodRangeInput) {
                orbitalPeriodRangeInput.min = (orbitalPeriod * 0.5).toFixed(2);
                orbitalPeriodRangeInput.max = (orbitalPeriod * 1.5).toFixed(2);
                orbitalPeriodRangeInput.value = orbitalPeriod.toFixed(2);
                orbitalPeriodRangeInput.step = (orbitalPeriod * 0.001).toFixed(2);
                
                const orbitalPeriodValueSpan = orbitalPeriodRangeInput.nextElementSibling;
                if (orbitalPeriodValueSpan) {
                    orbitalPeriodValueSpan.textContent = orbitalPeriod.toFixed(2) + ' días';
                }
            }

            // 10. MOVIMIENTO MEDIO
            const meanMotionInput = document.getElementById('Movimiento-medio');
            const meanMotion = parseFloat(selectedAsteroid.orbital_data.mean_motion);

            if (meanMotionInput) {
                meanMotionInput.innerHTML = `<li>Valor: ${meanMotion.toFixed(6)}°/día</li>`;
            }

            const meanMotionRangeInput = document.getElementById('mean_motion');
            if (meanMotionRangeInput) {
                meanMotionRangeInput.min = (meanMotion * 0.5).toFixed(6);
                meanMotionRangeInput.max = (meanMotion * 1.5).toFixed(6);
                meanMotionRangeInput.value = meanMotion.toFixed(6);
                meanMotionRangeInput.step = "0.000001";
                
                const meanMotionValueSpan = meanMotionRangeInput.nextElementSibling;
                if (meanMotionValueSpan) {
                    meanMotionValueSpan.textContent = meanMotion.toFixed(6) + '°/día';
                }
            }

            // 11. TIEMPO DE PASO POR EL PERIHELIO
            const perihelionTimeInput = document.getElementById('tiempo-perihelion');
            const perihelionTime = parseFloat(selectedAsteroid.orbital_data.perihelion_time);

            if (perihelionTimeInput) {
                const perihelionDate = new Date((perihelionTime - 2440587.5) * 86400000);
                perihelionTimeInput.innerHTML = `
                    <li>JD: ${perihelionTime.toFixed(2)}</li>
                    <li>Fecha: ${perihelionDate.toLocaleDateString()}</li>
                `;
            }

            const perihelionTimeRangeInput = document.getElementById('perihelion_time');
            if (perihelionTimeRangeInput) {
                perihelionTimeRangeInput.min = (perihelionTime * 0.9999).toFixed(2);
                perihelionTimeRangeInput.max = (perihelionTime * 1.0001).toFixed(2);
                perihelionTimeRangeInput.value = perihelionTime.toFixed(2);
                perihelionTimeRangeInput.step = "0.01";
                
                const perihelionTimeValueSpan = perihelionTimeRangeInput.nextElementSibling;
                if (perihelionTimeValueSpan) {
                    perihelionTimeValueSpan.textContent = perihelionTime.toFixed(2);
                }
            }

            console.log("Campos actualizados para asteroide:", selectedAsteroid.name);
        }

        // Actualizar campos con el primer asteroide
        updateAllFields();

        // Event listener para cambio de selección
        select.addEventListener('change', updateAllFields);

        // Event listeners para los sliders que actualicen el estado global
        document.getElementById('diameter')?.addEventListener('input', (e) => {
            if (typeof state !== 'undefined') {
                state.diameter = parseFloat(e.target.value);
            }
            const span = e.target.nextElementSibling;
            if (span) span.textContent = parseFloat(e.target.value).toFixed(2) + ' m';
        });

        document.getElementById('velocity')?.addEventListener('input', (e) => {
            if (typeof state !== 'undefined') {
                state.velocity = parseFloat(e.target.value);
            }
            const span = e.target.nextElementSibling;
            if (span) span.textContent = parseFloat(e.target.value).toFixed(3) + ' km/s';
        });

        console.log("Integración con NASA API completada");
    })
    .catch(error => {
        console.error('Error al obtener datos de NASA API:', error);
        const select = document.getElementById('asteroid-select');
        if (select) {
            select.innerHTML = '<option value="">Error al cargar asteroides</option>';
        }
    });