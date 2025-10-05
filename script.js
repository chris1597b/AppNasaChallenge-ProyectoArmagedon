document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos DOM
    const diameterInput = document.getElementById('diameter');
    const velocityInput = document.getElementById('velocity');
    const angleInput = document.getElementById('angle');
    const simulateBtn = document.getElementById('simulate-btn');
    const asteroid = document.querySelector('.asteroid');

    // Actualizar valores de los parámetros
    const updateParameterValue = (input) => {
        const valueDisplay = input.nextElementSibling;
        valueDisplay.textContent = input.value;
    };

    [diameterInput, velocityInput, angleInput].forEach(input => {
        input.addEventListener('input', () => updateParameterValue(input));
    });

    // Calcular resultados del impacto
    const calculateImpact = () => {
        const diameter = parseFloat(diameterInput.value);
        const velocity = parseFloat(velocityInput.value);
        const angle = parseFloat(angleInput.value);
        const density = document.getElementById('density').value;

        // Cálculos simplificados para la demostración
        const energy = calculateKineticEnergy(diameter, velocity, density);
        const craterSize = calculateCraterSize(energy, angle);
        const tsunamiHeight = calculateTsunamiHeight(energy, angle);
        const magnitude = calculateSeismicMagnitude(energy);

        updateResults(energy, craterSize, tsunamiHeight, magnitude);
        animateImpact(angle);
    };

    // Funciones de cálculo
    const calculateKineticEnergy = (diameter, velocity, density) => {
        const densityFactor = density === 'rocky' ? 1 : (density === 'metallic' ? 1.5 : 0.5);
        return (Math.PI * Math.pow(diameter, 3) * densityFactor * Math.pow(velocity, 2) / 12).toExponential(2);
    };

    const calculateCraterSize = (energy, angle) => {
        return (Math.pow(parseFloat(energy), 1 / 3) * Math.sin(angle * Math.PI / 180)).toFixed(2);
    };

    const calculateTsunamiHeight = (energy, angle) => {
        return (Math.pow(parseFloat(energy), 1 / 4) * Math.sin(angle * Math.PI / 180) / 100).toFixed(1);
    };

    const calculateSeismicMagnitude = (energy) => {
        return (Math.log10(parseFloat(energy)) / 2).toFixed(1);
    };

    // Actualizar resultados en la interfaz
    const updateResults = (energy, craterSize, tsunamiHeight, magnitude) => {
        document.getElementById('energy-value').textContent = energy;
        document.getElementById('crater-value').textContent = craterSize;
        document.getElementById('tsunami-value').textContent = tsunamiHeight;
        document.getElementById('magnitude-value').textContent = magnitude;
    };

    // Animación del impacto
    const animateImpact = (angle) => {
        asteroid.style.display = 'block';
        asteroid.style.transition = 'none';

        // Posición inicial del asteroide
        const radius = 200;
        const startX = radius * Math.cos((angle - 90) * Math.PI / 180);
        const startY = radius * Math.sin((angle - 90) * Math.PI / 180);

        asteroid.style.transform = `translate(${startX}px, ${startY}px)`;

        // Forzar reflow
        asteroid.offsetHeight;

        // Animación de impacto
        asteroid.style.transition = 'transform 2s ease-in';
        asteroid.style.transform = 'translate(0, 0)';

        // Reiniciar animación después de completarse
        setTimeout(() => {
            asteroid.style.display = 'none';
        }, 2000);
    };

    // Evento del botón de simulación
    simulateBtn.addEventListener('click', calculateImpact);

    // Inicializar valores
    [diameterInput, velocityInput, angleInput].forEach(updateParameterValue);
});