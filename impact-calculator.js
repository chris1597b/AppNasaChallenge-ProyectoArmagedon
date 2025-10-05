// Impact Probability Calculator Module
// Add this to your existing code

class ImpactProbabilityCalculator {
    constructor() {
        this.earthRadius = 6371; // km
        this.earthOrbitRadius = 1.0; // AU
        this.AU_TO_KM = 149597870.7; // km per AU
    }

    /**
     * Calculate impact probability based on orbital parameters
     * @param {Object} orbitalParams - Orbital parameters from simulator
     * @returns {Object} Impact analysis results
     */
    calculateImpactProbability(orbitalParams) {
        const { a, e, inclination, omega, raan, velocity } = orbitalParams;

        // Calculate perihelion and aphelion distances
        const perihelion = a * (1 - e); // AU
        const aphelion = a * (1 + e); // AU

        // Check if orbit crosses Earth's orbit
        const crossesEarthOrbit = perihelion < this.earthOrbitRadius && aphelion > this.earthOrbitRadius;

        if (!crossesEarthOrbit) {
            return {
                probability: 0,
                impactDate: null,
                daysUntilImpact: null,
                yearsUntilImpact: null,
                riskLevel: 'NO_RISK',
                message: 'The orbit does not cross Earth\'s orbital path.',
                closestApproach: this.calculateClosestApproach(perihelion, aphelion)
            };
        }

        // Calculate MOID (Minimum Orbit Intersection Distance)
        const moid = this.calculateMOID(a, e, inclination, omega, raan);

        // Calculate impact probability based on multiple factors
        const probabilityFactors = this.calculateProbabilityFactors(
            moid, inclination, e, velocity, a
        );

        // Estimate time to potential impact
        const timeToImpact = this.estimateTimeToImpact(a, e, probabilityFactors.baseProbability);

        // Determine risk level
        const riskLevel = this.determineRiskLevel(probabilityFactors.totalProbability);

        return {
            probability: probabilityFactors.totalProbability,
            impactDate: timeToImpact.date,
            daysUntilImpact: timeToImpact.days,
            yearsUntilImpact: timeToImpact.years,
            riskLevel: riskLevel,
            message: this.getRiskMessage(riskLevel, probabilityFactors.totalProbability),
            moid: moid,
            closestApproach: moid * this.AU_TO_KM,
            factors: probabilityFactors.breakdown
        };
    }

    /**
     * Calculate Minimum Orbit Intersection Distance (MOID)
     */
    calculateMOID(a, e, inclination, omega, raan) {
        // Simplified MOID calculation
        // In reality, this requires solving complex geometric equations
        
        const b = a * Math.sqrt(1 - e * e); // semi-minor axis
        
        // Distance from Earth's orbit considering inclination
        const inclinationFactor = Math.abs(Math.sin(inclination));
        const nodeFactor = Math.abs(Math.sin(omega - raan));
        
        // Calculate minimum distance considering orbital geometry
        const earthOrbitDist = this.earthOrbitRadius;
        const asteroidMinDist = a - (a * e);
        const asteroidMaxDist = a + (a * e);
        
        let moid;
        if (asteroidMinDist > earthOrbitDist) {
            moid = asteroidMinDist - earthOrbitDist;
        } else if (asteroidMaxDist < earthOrbitDist) {
            moid = earthOrbitDist - asteroidMaxDist;
        } else {
            // Orbit crosses Earth's orbit
            // Factor in inclination and nodes
            const baseDistance = 0.01; // Minimum separation at crossing
            moid = baseDistance * (1 + inclinationFactor) * (1 + nodeFactor * 0.5);
        }
        
        return Math.max(moid, 0.0001); // AU, minimum threshold
    }

    /**
     * Calculate probability factors
     */
    calculateProbabilityFactors(moid, inclination, e, velocity, a) {
        // Convert MOID to Earth radii
        const moidInEarthRadii = (moid * this.AU_TO_KM) / this.earthRadius;
        
        // Base probability from MOID (closer = higher probability)
        let baseProbability = 0;
        if (moidInEarthRadii < 1) {
            baseProbability = 0.95; // Very high risk
        } else if (moidInEarthRadii < 10) {
            baseProbability = 0.5 / moidInEarthRadii;
        } else if (moidInEarthRadii < 100) {
            baseProbability = 0.1 / moidInEarthRadii;
        } else {
            baseProbability = 0.001 / moidInEarthRadii;
        }

        // Inclination factor (lower inclination = higher risk)
        const inclinationDegrees = Math.abs(inclination * 180 / Math.PI);
        const inclinationFactor = Math.exp(-inclinationDegrees / 30);

        // Eccentricity factor (higher eccentricity can mean more unpredictable)
        const eccentricityFactor = 1 + (e * 0.5);

        // Velocity factor (higher velocity = more impact energy but harder to intercept)
        const velocityFactor = 1 + Math.min(velocity / 50, 0.3);

        // Orbital resonance factor
        const resonanceFactor = this.calculateResonanceFactor(a);

        // Calculate total probability
        const totalProbability = Math.min(
            baseProbability * inclinationFactor * eccentricityFactor * resonanceFactor,
            1.0
        );

        return {
            baseProbability,
            totalProbability,
            breakdown: {
                moidFactor: baseProbability,
                inclinationFactor,
                eccentricityFactor,
                velocityFactor,
                resonanceFactor
            }
        };
    }

    /**
     * Calculate orbital resonance factor with Earth
     */
    calculateResonanceFactor(a) {
        // Earth's orbital period is 1 year
        // Check for resonances that increase encounter probability
        const orbitalPeriod = Math.sqrt(Math.pow(a, 3)); // Kepler's 3rd law (simplified)
        
        // Common resonances: 1:1, 2:1, 3:2, 5:2, etc.
        const resonances = [1, 0.5, 1.5, 0.667, 2.5];
        let minDiff = Infinity;
        
        for (const res of resonances) {
            const diff = Math.abs(orbitalPeriod - res);
            minDiff = Math.min(minDiff, diff);
        }
        
        // Closer to resonance = higher factor
        return 1 + Math.exp(-minDiff * 2) * 0.3;
    }

    /**
     * Estimate time until potential impact
     */
    estimateTimeToImpact(a, e, probability) {
        if (probability < 0.001) {
            return { days: null, years: null, date: null };
        }

        // Orbital period in years
        const orbitalPeriod = Math.sqrt(Math.pow(a, 3));
        
        // Number of orbits needed for high probability encounter
        const orbitsNeeded = Math.ceil(1 / probability);
        
        // Time in years
        const yearsUntilImpact = orbitalPeriod * orbitsNeeded;
        const daysUntilImpact = yearsUntilImpact * 365.25;
        
        // Calculate estimated date
        const currentDate = new Date();
        const impactDate = new Date(currentDate.getTime() + (daysUntilImpact * 24 * 60 * 60 * 1000));
        
        return {
            days: Math.round(daysUntilImpact),
            years: parseFloat(yearsUntilImpact.toFixed(2)),
            date: impactDate
        };
    }

    /**
     * Determine risk level based on probability
     */
    determineRiskLevel(probability) {
        if (probability >= 0.1) return 'CRITICAL';
        if (probability >= 0.01) return 'HIGH';
        if (probability >= 0.001) return 'MODERATE';
        if (probability >= 0.0001) return 'LOW';
        return 'MINIMAL';
    }

    /**
     * Get risk message based on level
     */
    getRiskMessage(riskLevel, probability) {
        const messages = {
            'NO_RISK': 'No collision risk detected. The orbit does not intersect Earth\'s path.',
            'MINIMAL': 'Minimal risk. Probability is extremely low based on current orbital parameters.',
            'LOW': 'Low risk. Continuous monitoring recommended.',
            'MODERATE': 'Moderate risk. Close observation and trajectory refinement needed.',
            'HIGH': 'High risk. Immediate attention required. Consider deflection strategies.',
            'CRITICAL': 'CRITICAL RISK! High probability of impact. Urgent action required!'
        };
        return messages[riskLevel] || 'Risk assessment in progress.';
    }

    /**
     * Calculate closest approach distance
     */
    calculateClosestApproach(perihelion, aphelion) {
        const earthOrbit = this.earthOrbitRadius;
        if (perihelion > earthOrbit) {
            return (perihelion - earthOrbit) * this.AU_TO_KM;
        } else if (aphelion < earthOrbit) {
            return (earthOrbit - aphelion) * this.AU_TO_KM;
        }
        return 0; // Orbits intersect
    }

    /**
     * Format results for display
     */
    formatResults(results) {
        const probabilityPercent = (results.probability * 100).toFixed(6);
        
        let html = `
            <div class="impact-analysis">
                <h3>Impact Probability Analysis</h3>
                
                <div class="risk-level risk-${results.riskLevel.toLowerCase()}">
                    <strong>Risk Level:</strong> ${results.riskLevel}
                </div>
                
                <div class="probability-value">
                    <strong>Impact Probability:</strong> ${probabilityPercent}%
                    <span class="probability-ratio">(1 in ${Math.round(1/results.probability).toLocaleString()})</span>
                </div>
                
                <div class="impact-timing">
                    ${results.yearsUntilImpact !== null ? `
                        <strong>Estimated Time to Potential Impact:</strong><br>
                        ${results.yearsUntilImpact} years (${results.daysUntilImpact?.toLocaleString()} days)<br>
                        <strong>Estimated Date:</strong> ${results.impactDate?.toLocaleDateString() || 'N/A'}
                    ` : '<strong>No imminent impact predicted</strong>'}
                </div>
                
                <div class="closest-approach">
                    <strong>Closest Approach:</strong> ${results.closestApproach.toLocaleString()} km
                    <span class="earth-radii">(${(results.closestApproach / this.earthRadius).toFixed(2)} Earth radii)</span>
                </div>
                
                <div class="risk-message">
                    ${results.message}
                </div>
                
                ${results.moid !== undefined ? `
                    <div class="technical-details">
                        <strong>MOID:</strong> ${results.moid.toFixed(6)} AU
                    </div>
                ` : ''}
            </div>
        `;
        
        return html;
    }
}

// Export for use in your main code
window.ImpactProbabilityCalculator = ImpactProbabilityCalculator;