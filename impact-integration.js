// Integration code for Impact Probability Analysis
// Add this to your Apinasa.js file after the ImpactProbabilityCalculator is loaded

// Initialize the calculator
let impactCalculator = new ImpactProbabilityCalculator();
let currentImpactAnalysis = null;

/**
 * Update impact analysis based on current simulator parameters
 */
function updateImpactAnalysis() {
    if (!simulator) return;

    // Get current orbital parameters from simulator
    const orbitalParams = {
        a: simulator.a,
        e: simulator.e,
        inclination: simulator.inclination,
        omega: simulator.omega,
        raan: simulator.raan,
        velocity: parseFloat(document.getElementById('velocity').value),
        diameter: parseFloat(document.getElementById('diameter').value)
    };

    // Calculate impact probability
    currentImpactAnalysis = impactCalculator.calculateImpactProbability(orbitalParams);

    // Display results
    displayImpactAnalysis(currentImpactAnalysis);

    // Update color coding based on risk
    updateRiskIndicators(currentImpactAnalysis.riskLevel);
}

/**
 * Display impact analysis results in the UI
 */
function displayImpactAnalysis(results) {
    // Get or create the impact analysis container
    let container = document.getElementById('impact-analysis-container');
    
    if (!container) {
        // Create container if it doesn't exist
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            container = document.createElement('div');
            container.id = 'impact-analysis-container';
            container.className = 'impact-analysis-wrapper';
            resultsSection.style.display = 'block';
            resultsSection.insertBefore(container, resultsSection.firstChild);
        } else {
            console.error('Results section not found');
            return;
        }
    }

    // Format and display results
    container.innerHTML = impactCalculator.formatResults(results);

    // Add detailed breakdown
    addDetailedBreakdown(container, results);
}

/**
 * Add detailed probability factor breakdown
 */
function addDetailedBreakdown(container, results) {
    if (!results.factors) return;

    const breakdownDiv = document.createElement('div');
    breakdownDiv.className = 'probability-breakdown';
    breakdownDiv.innerHTML = `
        <h4>Probability Factors Breakdown</h4>
        <div class="factor-grid">
            <div class="factor-item">
                <span class="factor-label">MOID Factor:</span>
                <span class="factor-value">${(results.factors.moidFactor * 100).toFixed(4)}%</span>
            </div>
            <div class="factor-item">
                <span class="factor-label">Inclination Factor:</span>
                <span class="factor-value">${results.factors.inclinationFactor.toFixed(4)}</span>
            </div>
            <div class="factor-item">
                <span class="factor-label">Eccentricity Factor:</span>
                <span class="factor-value">${results.factors.eccentricityFactor.toFixed(4)}</span>
            </div>
            <div class="factor-item">
                <span class="factor-label">Resonance Factor:</span>
                <span class="factor-value">${results.factors.resonanceFactor.toFixed(4)}</span>
            </div>
        </div>
        <div class="factor-explanation">
            <p><strong>How factors affect probability:</strong></p>
            <ul>
                <li><strong>MOID:</strong> Minimum Orbit Intersection Distance - closer means higher risk</li>
                <li><strong>Inclination:</strong> Lower orbital inclination increases encounter probability</li>
                <li><strong>Eccentricity:</strong> Higher eccentricity can lead to unpredictable trajectories</li>
                <li><strong>Resonance:</strong> Orbital resonance with Earth increases encounter frequency</li>
            </ul>
        </div>
    `;

    container.appendChild(breakdownDiv);
}

/**
 * Update visual risk indicators
 */
function updateRiskIndicators(riskLevel) {
    const colors = {
        'NO_RISK': '#00ff00',
        'MINIMAL': '#7fff00',
        'LOW': '#ffff00',
        'MODERATE': '#ffa500',
        'HIGH': '#ff4500',
        'CRITICAL': '#ff0000'
    };

    const color = colors[riskLevel] || '#ffffff';

    // Update the scene if possible
    if (simulator && simulator.satellite) {
        simulator.satellite.material.color.setHex(parseInt(color.replace('#', '0x')));
    }

    // Update orbit line color
    if (simulator && simulator.orbitLine) {
        const intensity = {
            'NO_RISK': 0.2,
            'MINIMAL': 0.3,
            'LOW': 0.5,
            'MODERATE': 0.7,
            'HIGH': 0.9,
            'CRITICAL': 1.0
        }[riskLevel] || 0.5;

        simulator.orbitLine.material.color.setHex(parseInt(color.replace('#', '0x')));
        simulator.orbitLine.material.opacity = intensity;
    }
}

/**
 * Compare current parameters with original NASA data
 */
function compareWithOriginal(originalData) {
    if (!originalData || !currentImpactAnalysis) return;

    // Calculate original impact probability
    const originalParams = {
        a: parseFloat(originalData.orbital_data.semi_major_axis),
        e: parseFloat(originalData.orbital_data.eccentricity),
        inclination: THREE.MathUtils.degToRad(parseFloat(originalData.orbital_data.inclination)),
        omega: THREE.MathUtils.degToRad(parseFloat(originalData.orbital_data.ascending_node_longitude)),
        raan: THREE.MathUtils.degToRad(parseFloat(originalData.orbital_data.ascending_node_longitude)),
        velocity: parseFloat(originalData.close_approach_data[0]?.relative_velocity?.kilometers_per_second || 10),
        diameter: (parseFloat(originalData.estimated_diameter.meters.estimated_diameter_min) + 
                   parseFloat(originalData.estimated_diameter.meters.estimated_diameter_max)) / 2
    };

    const originalAnalysis = impactCalculator.calculateImpactProbability(originalParams);

    // Display comparison
    displayComparison(originalAnalysis, currentImpactAnalysis);
}

/**
 * Display comparison between original and modified parameters
 */
function displayComparison(original, current) {
    const comparisonDiv = document.createElement('div');
    comparisonDiv.className = 'impact-comparison';
    
    const probabilityChange = ((current.probability - original.probability) / original.probability * 100);
    const changeDirection = probabilityChange > 0 ? 'increased' : 'decreased';
    const changeColor = probabilityChange > 0 ? '#ff4500' : '#00ff00';

    comparisonDiv.innerHTML = `
        <h4>Parameter Modification Impact</h4>
        <div class="comparison-grid">
            <div class="comparison-item">
                <div class="comparison-label">Original Probability:</div>
                <div class="comparison-value">${(original.probability * 100).toFixed(6)}%</div>
            </div>
            <div class="comparison-item">
                <div class="comparison-label">Current Probability:</div>
                <div class="comparison-value">${(current.probability * 100).toFixed(6)}%</div>
            </div>
            <div class="comparison-item highlight">
                <div class="comparison-label">Change:</div>
                <div class="comparison-value" style="color: ${changeColor}">
                    ${probabilityChange > 0 ? '+' : ''}${probabilityChange.toFixed(2)}%
                    (${changeDirection})
                </div>
            </div>
            <div class="comparison-item">
                <div class="comparison-label">Original Risk Level:</div>
                <div class="comparison-value risk-${original.riskLevel.toLowerCase()}">${original.riskLevel}</div>
            </div>
            <div class="comparison-item">
                <div class="comparison-label">Current Risk Level:</div>
                <div class="comparison-value risk-${current.riskLevel.toLowerCase()}">${current.riskLevel}</div>
            </div>
        </div>
        <div class="modification-note">
            <p><strong>Note:</strong> Your modifications have ${changeDirection} the impact probability. 
            ${probabilityChange > 0 ? 'Consider adjusting parameters to reduce risk.' : 'Good! The modifications reduce collision risk.'}</p>
        </div>
    `;

    const container = document.getElementById('impact-analysis-container');
    if (container) {
        container.appendChild(comparisonDiv);
    }
}

// Modify the existing updateSimulator function to include impact analysis
const originalUpdateSimulator = updateSimulator;
updateSimulator = function(asteroid) {
    originalUpdateSimulator(asteroid);
    
    // Wait a moment for simulator to initialize, then calculate impact
    setTimeout(() => {
        updateImpactAnalysis();
        compareWithOriginal(asteroid);
    }, 100);
};

// Add event listeners to all parameter inputs
document.addEventListener('DOMContentLoaded', () => {
    const parameterInputs = [
        'diameter', 'semi_major', 'excentricidad', 'inclinacion',
        'ascending_node_longitude', 'raan', 'orbital_period',
        'mean_motion', 'perihelion_time', 'velocity'
    ];

    parameterInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                // Debounce the update to avoid too many calculations
                clearTimeout(window.impactUpdateTimer);
                window.impactUpdateTimer = setTimeout(() => {
                    updateImpactAnalysis();
                }, 300);
            });
        }
    });
});

// Add CSS styles for the impact analysis display
const style = document.createElement('style');
style.textContent = `
    .impact-analysis-wrapper {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 15px;
        padding: 25px;
        margin: 20px 0;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        border: 2px solid rgba(255, 255, 255, 0.1);
    }

    .impact-analysis h3 {
        color: #00d9ff;
        font-size: 24px;
        margin-bottom: 20px;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    .risk-level {
        padding: 15px;
        border-radius: 10px;
        margin: 15px 0;
        font-size: 18px;
        text-align: center;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .risk-critical {
        background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
        color: white;
        animation: pulse 1s infinite;
    }

    .risk-high {
        background: linear-gradient(135deg, #ff4500 0%, #ff6347 100%);
        color: white;
    }

    .risk-moderate {
        background: linear-gradient(135deg, #ffa500 0%, #ffb347 100%);
        color: #000;
    }

    .risk-low {
        background: linear-gradient(135deg, #ffff00 0%, #ffff66 100%);
        color: #000;
    }

    .risk-minimal {
        background: linear-gradient(135deg, #7fff00 0%, #90ff20 100%);
        color: #000;
    }

    .risk-no_risk {
        background: linear-gradient(135deg, #00ff00 0%, #00cc00 100%);
        color: #000;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }

    .probability-value {
        font-size: 32px;
        color: #00d9ff;
        text-align: center;
        margin: 20px 0;
        font-weight: bold;
    }

    .probability-ratio {
        display: block;
        font-size: 16px;
        color: #a0a0a0;
        margin-top: 5px;
    }

    .impact-timing, .closest-approach, .risk-message {
        background: rgba(255, 255, 255, 0.05);
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        color: #e0e0e0;
        line-height: 1.6;
    }

    .earth-radii {
        color: #a0a0a0;
        font-size: 0.9em;
    }

    .technical-details {
        background: rgba(0, 217, 255, 0.1);
        padding: 10px;
        border-radius: 5px;
        margin-top: 15px;
        font-family: monospace;
        color: #00d9ff;
    }

    .probability-breakdown {
        background: rgba(255, 255, 255, 0.03);
        padding: 20px;
        border-radius: 10px;
        margin-top: 20px;
    }

    .probability-breakdown h4 {
        color: #00d9ff;
        margin-bottom: 15px;
    }

    .factor-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }

    .factor-item {
        background: rgba(255, 255, 255, 0.05);
        padding: 12px;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .factor-label {
        color: #a0a0a0;
        font-size: 14px;
    }

    .factor-value {
        color: #00d9ff;
        font-weight: bold;
        font-size: 16px;
    }

    .factor-explanation {
        background: rgba(0, 217, 255, 0.05);
        padding: 15px;
        border-radius: 8px;
        color: #e0e0e0;
    }

    .factor-explanation ul {
        margin: 10px 0 0 20px;
    }

    .factor-explanation li {
        margin: 8px 0;
        line-height: 1.4;
    }

    .impact-comparison {
        background: rgba(255, 255, 255, 0.03);
        padding: 20px;
        border-radius: 10px;
        margin-top: 20px;
        border-left: 4px solid #00d9ff;
    }

    .impact-comparison h4 {
        color: #00d9ff;
        margin-bottom: 15px;
    }

    .comparison-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
        margin-bottom: 15px;
    }

    .comparison-item {
        background: rgba(255, 255, 255, 0.05);
        padding: 12px;
        border-radius: 8px;
    }

    .comparison-item.highlight {
        background: rgba(0, 217, 255, 0.1);
        border: 2px solid rgba(0, 217, 255, 0.3);
    }

    .comparison-label {
        color: #a0a0a0;
        font-size: 13px;
        margin-bottom: 5px;
    }

    .comparison-value {
        color: #ffffff;
        font-weight: bold;
        font-size: 18px;
    }

    .modification-note {
        background: rgba(255, 165, 0, 0.1);
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #ffa500;
        color: #ffa500;
        margin-top: 15px;
    }
`;

document.head.appendChild(style);