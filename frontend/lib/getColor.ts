// Configuration Constants
const MAX_COLORS = 4;          // Number of colors available for assignment (excluding the reserved color)
const START_COLOR_INDEX = 2;    // Starting index for color assignment
const END_COLOR_INDEX = 5;      // Ending index for color assignment (inclusive)

/**
 * Creates a color generator function that cycles through color indices 2 to 5.
 * The first color (index 1) is reserved for the user.
 *
 * @returns {Function} A function that returns the next available color index.
 */
const createColorGenerator = (start = START_COLOR_INDEX, end = END_COLOR_INDEX, max = MAX_COLORS) => {
    const usedColors = new Set();
    let colorIndex = start;

    return () => {
        // Reset used colors and colorIndex if all colors have been used
        if (usedColors.size === max) {
            usedColors.clear();
            colorIndex = start;
        }

        // Find the next available color index
        while (usedColors.has(colorIndex)) {
            colorIndex += 1;
            if (colorIndex > end) {
                colorIndex = start;
            }
        }

        // Assign the color and update the tracking set
        usedColors.add(colorIndex);
        return colorIndex;
    };
};

// Initialize the color generator
export const getColor = createColorGenerator();