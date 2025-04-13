/**
 * Calculate BMI and determine appropriate category
 * @param {number} weight - User's weight in kg
 * @param {number} height - User's height in cm
 * @param {string} goal - User's goal: "Lose Weight", "Gain Weight", or "Stay Fit"
 * @returns {Object} - BMI value and appropriate category
 */
export const calculateBMIAndCategory = (weight, height, goal) => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    // Format BMI to 1 decimal place
    const formattedBMI = Math.round(bmi * 10) / 10;

    let category = goal.toLowerCase().replace(" ", "_");

    // Override category based on BMI if needed
    if (bmi > 25 && category !== "lose_weight") {
        category = "lose_weight";
    } else if (bmi < 18.5 && category !== "gain_weight") {
        category = "gain_weight";
    } else if (bmi >= 18.5 && bmi <= 25 && category !== "stay_fit") {
        category = "stay_fit";
    }

    return {
        bmi: formattedBMI,
        category,
        isGoalMismatched: category !== goal.toLowerCase().replace(" ", "_"),
    };
};
